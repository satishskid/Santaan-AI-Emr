// Firebase Integration Service for IVF EMR
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  enableNetwork,
  disableNetwork,
  Timestamp
} from 'firebase/firestore';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Firebase configuration (replace with your config)
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Types for Firebase integration
export interface FirestorePatient {
  id: string;
  clinicId: string;
  personalInfo: {
    name: string;
    age: number;
    partnerName?: string;
    contactInfo: {
      phone: string;
      email: string;
      address: string;
    };
  };
  medicalHistory: {
    conditions: string[];
    allergies: string[];
    previousCycles: number;
    amh?: number;
    bmi?: number;
  };
  currentTreatment: {
    protocol: string;
    cycleStartDate: string;
    status: 'active' | 'completed' | 'cancelled';
    assignedStaff: string[];
  };
  treatmentHistory: TreatmentCycle[];
  permissions: {
    assignedDoctors: string[];
    assignedNurses: string[];
    dataAccessLevel: 'full' | 'limited' | 'view-only';
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isActive: boolean;
}

export interface TreatmentCycle {
  id: string;
  cycleNumber: number;
  protocol: string;
  startDate: string;
  endDate?: string;
  status: 'planning' | 'stimulation' | 'retrieval' | 'lab' | 'transfer' | 'completed';
  medications: Medication[];
  monitoring: MonitoringRecord[];
  outcomes: CycleOutcome;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'doctor' | 'nurse' | 'embryologist' | 'admin' | 'receptionist';
  clinicId: string;
  permissions: {
    patients: { read: boolean; write: boolean; delete: boolean };
    treatments: { read: boolean; write: boolean; delete: boolean };
    reports: { read: boolean; write: boolean };
    configuration: { read: boolean; write: boolean };
  };
  isActive: boolean;
  lastLogin: Timestamp;
  createdAt: Timestamp;
}

// Firebase Service Class
export class FirebaseService {
  private currentUser: User | null = null;
  private userProfile: UserProfile | null = null;

  constructor() {
    // Listen for auth state changes
    onAuthStateChanged(auth, (user) => {
      this.currentUser = user;
      if (user) {
        this.loadUserProfile(user.uid);
      } else {
        this.userProfile = null;
      }
    });
  }

  // Authentication Methods
  async signIn(email: string, password: string): Promise<{ user: User; profile: UserProfile }> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const profile = await this.loadUserProfile(userCredential.user.uid);
      
      // Log access for audit
      await this.logAuditEvent('user_login', 'authentication', userCredential.user.uid);
      
      return { user: userCredential.user, profile };
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }

  async signOut(): Promise<void> {
    if (this.currentUser) {
      await this.logAuditEvent('user_logout', 'authentication', this.currentUser.uid);
    }
    await signOut(auth);
  }

  private async loadUserProfile(uid: string): Promise<UserProfile> {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      this.userProfile = userDoc.data() as UserProfile;
      return this.userProfile;
    }
    throw new Error('User profile not found');
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  getUserProfile(): UserProfile | null {
    return this.userProfile;
  }

  // Patient Data Methods
  async getPatients(): Promise<FirestorePatient[]> {
    if (!this.userProfile) throw new Error('User not authenticated');

    const q = query(
      collection(db, 'patients'),
      where('clinicId', '==', this.userProfile.clinicId),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    const patients = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as FirestorePatient[];

    await this.logAuditEvent('patients_accessed', 'patients', this.currentUser?.uid || '');
    return patients;
  }

  async getPatient(patientId: string): Promise<FirestorePatient | null> {
    const patientDoc = await getDoc(doc(db, 'patients', patientId));
    
    if (patientDoc.exists()) {
      const patient = { id: patientDoc.id, ...patientDoc.data() } as FirestorePatient;
      
      // Check permissions
      if (!this.hasPatientAccess(patient)) {
        throw new Error('Access denied to patient data');
      }

      await this.logAuditEvent('patient_accessed', 'patients', this.currentUser?.uid || '', { patientId });
      return patient;
    }
    
    return null;
  }

  async createPatient(patientData: Omit<FirestorePatient, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    if (!this.userProfile) throw new Error('User not authenticated');

    const newPatient = {
      ...patientData,
      clinicId: this.userProfile.clinicId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isActive: true
    };

    const docRef = await addDoc(collection(db, 'patients'), newPatient);
    
    await this.logAuditEvent('patient_created', 'patients', this.currentUser?.uid || '', { 
      patientId: docRef.id,
      patientName: patientData.personalInfo.name 
    });

    return docRef.id;
  }

  async updatePatient(patientId: string, updates: Partial<FirestorePatient>): Promise<void> {
    const patient = await this.getPatient(patientId);
    if (!patient) throw new Error('Patient not found');

    if (!this.hasPatientWriteAccess(patient)) {
      throw new Error('Write access denied to patient data');
    }

    const updateData = {
      ...updates,
      updatedAt: serverTimestamp()
    };

    await updateDoc(doc(db, 'patients', patientId), updateData);
    
    await this.logAuditEvent('patient_updated', 'patients', this.currentUser?.uid || '', { 
      patientId,
      updatedFields: Object.keys(updates)
    });
  }

  // Real-time subscriptions
  subscribeToPatients(callback: (patients: FirestorePatient[]) => void): () => void {
    if (!this.userProfile) throw new Error('User not authenticated');

    const q = query(
      collection(db, 'patients'),
      where('clinicId', '==', this.userProfile.clinicId),
      where('isActive', '==', true),
      orderBy('updatedAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const patients = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FirestorePatient[];
      
      callback(patients);
    });
  }

  subscribeToPatient(patientId: string, callback: (patient: FirestorePatient | null) => void): () => void {
    return onSnapshot(doc(db, 'patients', patientId), (doc) => {
      if (doc.exists()) {
        const patient = { id: doc.id, ...doc.data() } as FirestorePatient;
        
        if (this.hasPatientAccess(patient)) {
          callback(patient);
        } else {
          callback(null);
        }
      } else {
        callback(null);
      }
    });
  }

  // Treatment Methods
  async addTreatmentRecord(patientId: string, treatmentData: any): Promise<void> {
    const patient = await this.getPatient(patientId);
    if (!patient) throw new Error('Patient not found');

    if (!this.hasPatientWriteAccess(patient)) {
      throw new Error('Write access denied');
    }

    const treatmentRecord = {
      ...treatmentData,
      timestamp: serverTimestamp(),
      recordedBy: this.currentUser?.uid,
      clinicId: this.userProfile?.clinicId
    };

    await addDoc(collection(db, 'patients', patientId, 'treatments'), treatmentRecord);
    
    await this.logAuditEvent('treatment_recorded', 'treatments', this.currentUser?.uid || '', { 
      patientId,
      treatmentType: treatmentData.type
    });
  }

  // Permission checking methods
  private hasPatientAccess(patient: FirestorePatient): boolean {
    if (!this.userProfile) return false;

    // Admin has access to all patients in clinic
    if (this.userProfile.role === 'admin') return true;

    // Check clinic access
    if (patient.clinicId !== this.userProfile.clinicId) return false;

    // Check specific patient permissions
    const { assignedDoctors, assignedNurses } = patient.permissions;
    
    if (this.userProfile.role === 'doctor' && assignedDoctors.includes(this.userProfile.uid)) {
      return true;
    }
    
    if (this.userProfile.role === 'nurse' && assignedNurses.includes(this.userProfile.uid)) {
      return true;
    }

    return false;
  }

  private hasPatientWriteAccess(patient: FirestorePatient): boolean {
    if (!this.hasPatientAccess(patient)) return false;
    if (!this.userProfile) return false;

    // Check write permissions
    return this.userProfile.permissions.patients.write;
  }

  // Audit logging
  private async logAuditEvent(action: string, resource: string, userId: string, details?: any): Promise<void> {
    try {
      await addDoc(collection(db, 'audit_logs'), {
        action,
        resource,
        userId,
        timestamp: serverTimestamp(),
        userAgent: navigator.userAgent,
        details: details || {},
        clinicId: this.userProfile?.clinicId || 'unknown'
      });
    } catch (error) {
      console.error('Audit logging failed:', error);
    }
  }

  // Offline support
  async enableOfflineMode(): Promise<void> {
    await disableNetwork(db);
  }

  async enableOnlineMode(): Promise<void> {
    await enableNetwork(db);
  }

  // Migration from localStorage
  async migrateFromLocalStorage(): Promise<void> {
    if (!this.userProfile) throw new Error('User not authenticated');

    try {
      // Get existing localStorage data
      const localPatients = JSON.parse(localStorage.getItem('ivf_patients') || '[]');
      
      for (const localPatient of localPatients) {
        const firestorePatient = this.transformLocalPatientToFirestore(localPatient);
        await this.createPatient(firestorePatient);
      }

      // Clear localStorage after successful migration
      localStorage.removeItem('ivf_patients');
      
      await this.logAuditEvent('data_migration', 'system', this.currentUser?.uid || '', {
        migratedPatients: localPatients.length
      });

    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }
  }

  private transformLocalPatientToFirestore(localPatient: any): Omit<FirestorePatient, 'id' | 'createdAt' | 'updatedAt'> {
    return {
      clinicId: this.userProfile?.clinicId || 'default',
      personalInfo: {
        name: localPatient.name || '',
        age: localPatient.age || 0,
        partnerName: localPatient.partnerName || '',
        contactInfo: {
          phone: '',
          email: '',
          address: ''
        }
      },
      medicalHistory: {
        conditions: [],
        allergies: [],
        previousCycles: 0
      },
      currentTreatment: {
        protocol: localPatient.protocol || '',
        cycleStartDate: localPatient.cycleStartDate || new Date().toISOString(),
        status: 'active',
        assignedStaff: [this.currentUser?.uid || '']
      },
      treatmentHistory: [],
      permissions: {
        assignedDoctors: [this.currentUser?.uid || ''],
        assignedNurses: [],
        dataAccessLevel: 'full'
      },
      isActive: true
    };
  }
}

// Export singleton instance
export const firebaseService = new FirebaseService();
