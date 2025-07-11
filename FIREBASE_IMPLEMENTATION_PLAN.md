# 🔥 Firebase Implementation Plan for IVF EMR

## Phase 1: Firebase Project Setup (Week 1)

### 1.1 Firebase Project Creation
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login and create project
firebase login
firebase init
```

### 1.2 Required Firebase Services
- ✅ Firestore Database
- ✅ Authentication
- ✅ Cloud Functions
- ✅ Security Rules
- ✅ Cloud Storage (for medical images)

### 1.3 HIPAA Configuration
```javascript
// firebase.json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "functions": {
    "source": "functions",
    "runtime": "nodejs18"
  },
  "storage": {
    "rules": "storage.rules"
  }
}
```

## Phase 2: Data Migration Strategy (Week 2)

### 2.1 Current Data Structure Analysis
```typescript
// Current localStorage structure
interface CurrentPatient {
  id: string;
  name: string;
  age: number;
  pathway: PathwayStep[];
  // ... existing fields
}

// Target Firestore structure
interface FirestorePatient {
  id: string;
  clinicId: string;
  personalInfo: PersonalInfo;
  medicalHistory: MedicalHistory;
  treatmentCycles: TreatmentCycle[];
  permissions: PatientPermissions;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 2.2 Migration Script
```typescript
// services/migrationService.ts
export class MigrationService {
  async migrateLocalStorageToFirestore() {
    const localPatients = this.getLocalStoragePatients();
    
    for (const patient of localPatients) {
      const firestorePatient = this.transformToFirestoreFormat(patient);
      await this.saveToFirestore(firestorePatient);
    }
  }
  
  private transformToFirestoreFormat(localPatient: any): FirestorePatient {
    return {
      id: localPatient.id,
      clinicId: 'default_clinic', // Set during migration
      personalInfo: {
        name: localPatient.name,
        age: localPatient.age,
        // ... transform other fields
      },
      // ... rest of transformation
    };
  }
}
```

## Phase 3: Authentication Integration (Week 3)

### 3.1 User Management
```typescript
// services/authService.ts
import { Auth, signInWithEmailAndPassword } from 'firebase/auth';

export class AuthService {
  async signIn(email: string, password: string) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const userDoc = await this.getUserProfile(userCredential.user.uid);
    return { user: userCredential.user, profile: userDoc };
  }
  
  async getUserProfile(uid: string) {
    const doc = await getDoc(doc(db, 'users', uid));
    return doc.data() as UserProfile;
  }
}
```

### 3.2 Role-Based Access Control
```typescript
// types/auth.ts
export interface UserProfile {
  uid: string;
  email: string;
  role: 'doctor' | 'nurse' | 'embryologist' | 'admin' | 'receptionist';
  clinicId: string;
  permissions: Permission[];
  isActive: boolean;
}

export interface Permission {
  resource: 'patients' | 'treatments' | 'reports' | 'configuration';
  actions: ('read' | 'write' | 'delete')[];
}
```

## Phase 4: Real-time Data Synchronization (Week 4)

### 4.1 Firestore Integration
```typescript
// services/firestoreService.ts
import { 
  collection, 
  doc, 
  onSnapshot, 
  updateDoc,
  addDoc,
  query,
  where 
} from 'firebase/firestore';

export class FirestoreService {
  // Real-time patient updates
  subscribeToPatients(clinicId: string, callback: (patients: Patient[]) => void) {
    const q = query(
      collection(db, 'patients'),
      where('clinicId', '==', clinicId)
    );
    
    return onSnapshot(q, (snapshot) => {
      const patients = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Patient[];
      callback(patients);
    });
  }
  
  // Update patient data
  async updatePatient(patientId: string, updates: Partial<Patient>) {
    const patientRef = doc(db, 'patients', patientId);
    await updateDoc(patientRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  }
}
```

### 4.2 Offline Support
```typescript
// Enable offline persistence
import { enableNetwork, disableNetwork } from 'firebase/firestore';

export class OfflineService {
  async enableOfflineMode() {
    await disableNetwork(db);
  }
  
  async enableOnlineMode() {
    await enableNetwork(db);
  }
}
```

## Phase 5: Security Implementation (Week 5)

### 5.1 Firestore Security Rules
```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Clinic-based patient access
    match /patients/{patientId} {
      allow read, write: if request.auth != null 
        && isAuthorizedForClinic(request.auth.uid, resource.data.clinicId)
        && hasPermission(request.auth.uid, 'patients', 'read');
    }
    
    // Treatment data access
    match /patients/{patientId}/treatments/{treatmentId} {
      allow read, write: if request.auth != null 
        && isAuthorizedForClinic(request.auth.uid, get(/databases/$(database)/documents/patients/$(patientId)).data.clinicId);
    }
  }
  
  function isAuthorizedForClinic(userId, clinicId) {
    return get(/databases/$(database)/documents/users/$(userId)).data.clinicId == clinicId;
  }
  
  function hasPermission(userId, resource, action) {
    let userDoc = get(/databases/$(database)/documents/users/$(userId));
    return userDoc.data.permissions[resource][action] == true;
  }
}
```

### 5.2 Data Encryption
```typescript
// services/encryptionService.ts
import CryptoJS from 'crypto-js';

export class EncryptionService {
  private encryptionKey = process.env.REACT_APP_ENCRYPTION_KEY;
  
  encryptSensitiveData(data: any): string {
    return CryptoJS.AES.encrypt(JSON.stringify(data), this.encryptionKey).toString();
  }
  
  decryptSensitiveData(encryptedData: string): any {
    const bytes = CryptoJS.AES.decrypt(encryptedData, this.encryptionKey);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  }
}
```

## Phase 6: HIPAA Compliance (Week 6)

### 6.1 Audit Logging
```typescript
// services/auditService.ts
export class AuditService {
  async logAccess(action: string, resource: string, userId: string, details?: any) {
    await addDoc(collection(db, 'audit_logs'), {
      action,
      resource,
      userId,
      timestamp: serverTimestamp(),
      ipAddress: await this.getClientIP(),
      userAgent: navigator.userAgent,
      details: details || {}
    });
  }
}
```

### 6.2 Data Backup Strategy
```typescript
// Cloud Function for automated backups
exports.dailyBackup = functions.pubsub
  .schedule('0 2 * * *') // Daily at 2 AM
  .onRun(async (context) => {
    const backup = await admin.firestore().backup({
      collectionIds: ['patients', 'treatments', 'users'],
      outputUriPrefix: 'gs://your-backup-bucket/daily-backups'
    });
    
    console.log('Backup completed:', backup.name);
  });
```

## Implementation Timeline

| Week | Phase | Deliverables |
|------|-------|-------------|
| 1 | Setup | Firebase project, basic configuration |
| 2 | Migration | Data structure transformation, migration scripts |
| 3 | Auth | User authentication, role-based access |
| 4 | Real-time | Live data sync, offline support |
| 5 | Security | Security rules, encryption |
| 6 | Compliance | Audit logging, HIPAA compliance |

## Cost Estimation

### Firebase Pricing (Monthly)
- **Firestore**: $0.18/100K reads, $0.18/100K writes
- **Authentication**: Free up to 10K users
- **Cloud Functions**: $0.40/million invocations
- **Storage**: $0.026/GB

### Estimated Monthly Cost by Clinic Size
- **Small (1-5 users, 100 patients)**: $10-25/month
- **Medium (5-20 users, 500 patients)**: $50-150/month
- **Large (20+ users, 1000+ patients)**: $200-500/month
