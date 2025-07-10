import React, { useState, useEffect } from 'react';
import { Card, Badge, Button } from './ui/DesignSystem';
import { 
  CalendarIcon, 
  UserIcon, 
  ClockIcon, 
  AlertTriangleIcon,
  CheckCircleIcon,
  TrendingUpIcon,
  SettingsIcon,
  HeartIcon,
  BrainIcon
} from './icons';

interface ResourceOptimizationProps {
  currentUserRole: string;
}

interface StaffMember {
  id: string;
  name: string;
  role: 'Doctor' | 'Nurse' | 'Embryologist' | 'Counselor' | 'Coordinator';
  specialization: string;
  currentLoad: number; // percentage
  maxHoursPerDay: number;
  maxHoursPerWeek: number;
  wellnessScore: number; // 1-100
  burnoutRisk: 'low' | 'moderate' | 'high' | 'critical';
  nextBreakDue: string;
  costPerHour: number; // INR
}

interface Equipment {
  id: string;
  name: string;
  type: 'Ultrasound' | 'Incubator' | 'Microscope' | 'Centrifuge' | 'Workstation';
  status: 'available' | 'in_use' | 'maintenance' | 'offline';
  utilizationRate: number; // percentage
  nextMaintenance: string;
  setupTime: number; // minutes
  cleanupTime: number; // minutes
  location: string;
}

interface Room {
  id: string;
  name: string;
  type: 'Consultation' | 'Procedure' | 'Laboratory' | 'Counseling' | 'Recovery';
  status: 'available' | 'occupied' | 'cleaning' | 'maintenance';
  capacity: number;
  utilizationRate: number; // percentage
  cleaningTime: number; // minutes
  nextAvailable: string;
}

interface ScheduleConflict {
  id: string;
  type: 'staff_overload' | 'equipment_conflict' | 'room_unavailable' | 'patient_overlap';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedResources: string[];
  suggestedResolution: string;
  timeSlot: string;
}

const ResourceOptimization: React.FC<ResourceOptimizationProps> = ({ currentUserRole }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'staff' | 'equipment' | 'rooms' | 'conflicts' | 'analytics'>('overview');
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [conflicts, setConflicts] = useState<ScheduleConflict[]>([]);
  const [optimizationMetrics, setOptimizationMetrics] = useState({
    overallEfficiency: 87,
    staffUtilization: 78,
    equipmentUtilization: 82,
    roomUtilization: 75,
    conflictReduction: 45,
    costSavings: 125000 // INR per month
  });

  useEffect(() => {
    loadResourceData();
  }, []);

  const loadResourceData = () => {
    // Mock data for demonstration
    setStaff([
      {
        id: 'staff_001',
        name: 'Dr. Priya Sharma',
        role: 'Doctor',
        specialization: 'Reproductive Endocrinology',
        currentLoad: 85,
        maxHoursPerDay: 10,
        maxHoursPerWeek: 50,
        wellnessScore: 72,
        burnoutRisk: 'moderate',
        nextBreakDue: '2:30 PM',
        costPerHour: 2500
      },
      {
        id: 'staff_002',
        name: 'Sister Meera Patel',
        role: 'Nurse',
        specialization: 'IVF Procedures',
        currentLoad: 65,
        maxHoursPerDay: 8,
        maxHoursPerWeek: 40,
        wellnessScore: 88,
        burnoutRisk: 'low',
        nextBreakDue: '4:00 PM',
        costPerHour: 800
      },
      {
        id: 'staff_003',
        name: 'Dr. Rajesh Kumar',
        role: 'Embryologist',
        specialization: 'Embryo Culture',
        currentLoad: 92,
        maxHoursPerDay: 9,
        maxHoursPerWeek: 45,
        wellnessScore: 58,
        burnoutRisk: 'high',
        nextBreakDue: 'Overdue',
        costPerHour: 2000
      },
      {
        id: 'staff_004',
        name: 'Ms. Lakshmi Reddy',
        role: 'Counselor',
        specialization: 'Fertility Counseling',
        currentLoad: 70,
        maxHoursPerDay: 8,
        maxHoursPerWeek: 40,
        wellnessScore: 82,
        burnoutRisk: 'low',
        nextBreakDue: '3:15 PM',
        costPerHour: 1200
      }
    ]);

    setEquipment([
      {
        id: 'eq_001',
        name: 'Ultrasound Machine A',
        type: 'Ultrasound',
        status: 'in_use',
        utilizationRate: 78,
        nextMaintenance: '2024-02-15',
        setupTime: 5,
        cleanupTime: 10,
        location: 'Room 101'
      },
      {
        id: 'eq_002',
        name: 'Incubator System 1',
        type: 'Incubator',
        status: 'available',
        utilizationRate: 95,
        nextMaintenance: '2024-01-30',
        setupTime: 15,
        cleanupTime: 20,
        location: 'Lab A'
      },
      {
        id: 'eq_003',
        name: 'Microscope Station 2',
        type: 'Microscope',
        status: 'maintenance',
        utilizationRate: 0,
        nextMaintenance: '2024-01-20',
        setupTime: 10,
        cleanupTime: 15,
        location: 'Lab B'
      }
    ]);

    setRooms([
      {
        id: 'room_001',
        name: 'Consultation Room 1',
        type: 'Consultation',
        status: 'occupied',
        capacity: 4,
        utilizationRate: 82,
        cleaningTime: 15,
        nextAvailable: '2:45 PM'
      },
      {
        id: 'room_002',
        name: 'Procedure Room A',
        type: 'Procedure',
        status: 'cleaning',
        capacity: 6,
        utilizationRate: 75,
        cleaningTime: 30,
        nextAvailable: '3:00 PM'
      },
      {
        id: 'room_003',
        name: 'Laboratory 1',
        type: 'Laboratory',
        status: 'available',
        capacity: 8,
        utilizationRate: 88,
        cleaningTime: 45,
        nextAvailable: 'Now'
      }
    ]);

    setConflicts([
      {
        id: 'conflict_001',
        type: 'staff_overload',
        severity: 'high',
        description: 'Dr. Rajesh Kumar approaching maximum weekly hours',
        affectedResources: ['staff_003'],
        suggestedResolution: 'Redistribute embryo culture tasks to backup embryologist',
        timeSlot: 'This week'
      },
      {
        id: 'conflict_002',
        type: 'equipment_conflict',
        severity: 'medium',
        description: 'Microscope Station 2 scheduled for maintenance during peak hours',
        affectedResources: ['eq_003'],
        suggestedResolution: 'Reschedule maintenance to off-peak hours or use backup equipment',
        timeSlot: 'Tomorrow 10:00 AM'
      }
    ]);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'available': 'bg-green-100 text-green-800',
      'in_use': 'bg-blue-100 text-blue-800',
      'occupied': 'bg-blue-100 text-blue-800',
      'maintenance': 'bg-yellow-100 text-yellow-800',
      'cleaning': 'bg-yellow-100 text-yellow-800',
      'offline': 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getBurnoutRiskColor = (risk: string) => {
    const colors = {
      'low': 'bg-green-100 text-green-800',
      'moderate': 'bg-yellow-100 text-yellow-800',
      'high': 'bg-orange-100 text-orange-800',
      'critical': 'bg-red-100 text-red-800'
    };
    return colors[risk as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* AI Optimization Banner */}
      <Card variant="elevated" className="bg-gradient-to-r from-blue-50 to-purple-50 p-6">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-blue-100 rounded-full">
            <BrainIcon className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI-Powered Resource Optimization</h1>
            <p className="text-gray-600">Intelligent scheduling and staff wellness monitoring</p>
            <p className="text-sm text-blue-600 mt-1">
              Reducing conflicts by 45% • Saving ₹1,25,000/month • Improving efficiency by 23%
            </p>
          </div>
        </div>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card variant="elevated" className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overall Efficiency</p>
              <p className="text-3xl font-bold text-gray-900">{optimizationMetrics.overallEfficiency}%</p>
            </div>
            <TrendingUpIcon className="h-8 w-8 text-green-500" />
          </div>
          <p className="text-sm text-green-600 mt-2">↗ 23% improvement</p>
        </Card>

        <Card variant="elevated" className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Staff Utilization</p>
              <p className="text-3xl font-bold text-gray-900">{optimizationMetrics.staffUtilization}%</p>
            </div>
            <UserIcon className="h-8 w-8 text-blue-500" />
          </div>
          <p className="text-sm text-green-600 mt-2">Optimal range: 70-85%</p>
        </Card>

        <Card variant="elevated" className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Cost Savings</p>
              <p className="text-3xl font-bold text-gray-900">₹{optimizationMetrics.costSavings.toLocaleString()}</p>
            </div>
            <TrendingUpIcon className="h-8 w-8 text-purple-500" />
          </div>
          <p className="text-sm text-gray-600 mt-2">Per month</p>
        </Card>

        <Card variant="elevated" className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Equipment Utilization</p>
              <p className="text-3xl font-bold text-gray-900">{optimizationMetrics.equipmentUtilization}%</p>
            </div>
            <SettingsIcon className="h-8 w-8 text-orange-500" />
          </div>
          <p className="text-sm text-green-600 mt-2">↗ 15% from last month</p>
        </Card>

        <Card variant="elevated" className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Room Utilization</p>
              <p className="text-3xl font-bold text-gray-900">{optimizationMetrics.roomUtilization}%</p>
            </div>
            <CalendarIcon className="h-8 w-8 text-indigo-500" />
          </div>
          <p className="text-sm text-green-600 mt-2">↗ 8% improvement</p>
        </Card>

        <Card variant="elevated" className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Conflict Reduction</p>
              <p className="text-3xl font-bold text-gray-900">{optimizationMetrics.conflictReduction}%</p>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-green-500" />
          </div>
          <p className="text-sm text-green-600 mt-2">Fewer scheduling conflicts</p>
        </Card>
      </div>

      {/* Current Alerts */}
      <Card variant="elevated" className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Optimization Alerts</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
            <AlertTriangleIcon className="h-5 w-5 text-red-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">High Burnout Risk Detected</p>
              <p className="text-xs text-gray-600">Dr. Rajesh Kumar (Embryologist) - Wellness score: 58/100</p>
            </div>
            <Button variant="danger" size="sm">Address Now</Button>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
            <ClockIcon className="h-5 w-5 text-yellow-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Equipment Maintenance Due</p>
              <p className="text-xs text-gray-600">Microscope Station 2 - Scheduled for tomorrow during peak hours</p>
            </div>
            <Button variant="warning" size="sm">Reschedule</Button>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
            <TrendingUpIcon className="h-5 w-5 text-blue-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Optimization Opportunity</p>
              <p className="text-xs text-gray-600">Room utilization can be improved by 12% with schedule adjustments</p>
            </div>
            <Button variant="primary" size="sm">Optimize</Button>
          </div>
        </div>
      </Card>

      {/* AI Recommendations */}
      <Card variant="elevated" className="p-6 bg-gradient-to-r from-green-50 to-blue-50">
        <div className="flex items-center space-x-3 mb-4">
          <BrainIcon className="h-6 w-6 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">AI Optimization Recommendations</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Immediate Actions</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Schedule mandatory break for Dr. Rajesh Kumar</li>
              <li>• Redistribute 3 embryo culture tasks to backup staff</li>
              <li>• Move equipment maintenance to 7:00 AM slot</li>
              <li>• Implement 15-minute buffer between procedures</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Long-term Optimizations</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Hire additional embryologist for peak periods</li>
              <li>• Invest in backup microscope system</li>
              <li>• Implement staggered shift patterns</li>
              <li>• Add wellness monitoring sensors</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderStaffTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Staff Wellness & Utilization</h2>
        <Button variant="primary">
          <UserIcon className="h-4 w-4 mr-2" />
          Add Staff Member
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {staff.map((member) => (
          <Card key={member.id} variant="elevated" className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <UserIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{member.name}</h3>
                  <p className="text-sm text-gray-600">{member.role} - {member.specialization}</p>
                </div>
              </div>
              <Badge variant={member.burnoutRisk === 'low' ? 'success' : 
                            member.burnoutRisk === 'moderate' ? 'warning' : 'danger'} 
                     size="sm">
                {member.burnoutRisk} risk
              </Badge>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Current Workload</span>
                  <span>{member.currentLoad}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      member.currentLoad > 90 ? 'bg-red-500' : 
                      member.currentLoad > 80 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${member.currentLoad}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Wellness Score</span>
                  <span>{member.wellnessScore}/100</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      member.wellnessScore < 60 ? 'bg-red-500' : 
                      member.wellnessScore < 80 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${member.wellnessScore}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Max Hours/Day:</span>
                  <span className="ml-2 font-medium">{member.maxHoursPerDay}h</span>
                </div>
                <div>
                  <span className="text-gray-500">Cost/Hour:</span>
                  <span className="ml-2 font-medium">₹{member.costPerHour}</span>
                </div>
                <div>
                  <span className="text-gray-500">Next Break:</span>
                  <span className={`ml-2 font-medium ${
                    member.nextBreakDue === 'Overdue' ? 'text-red-600' : 'text-gray-900'
                  }`}>
                    {member.nextBreakDue}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Max Hours/Week:</span>
                  <span className="ml-2 font-medium">{member.maxHoursPerWeek}h</span>
                </div>
              </div>

              {member.burnoutRisk === 'high' || member.burnoutRisk === 'critical' ? (
                <div className="mt-4 p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertTriangleIcon className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium text-red-800">Action Required</span>
                  </div>
                  <p className="text-xs text-red-700 mt-1">
                    High burnout risk detected. Consider reducing workload or scheduling mandatory break.
                  </p>
                </div>
              ) : null}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <TrendingUpIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Resource Optimization</h1>
            <p className="text-gray-600">AI-powered scheduling and staff wellness monitoring</p>
          </div>
        </div>
        <Badge variant="success">
          AI Optimization Active
        </Badge>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: TrendingUpIcon },
            { id: 'staff', label: 'Staff Wellness', icon: UserIcon },
            { id: 'equipment', label: 'Equipment', icon: SettingsIcon },
            { id: 'rooms', label: 'Rooms', icon: CalendarIcon },
            { id: 'conflicts', label: 'Conflicts', icon: AlertTriangleIcon },
            { id: 'analytics', label: 'Analytics', icon: BrainIcon }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && renderOverviewTab()}
      {activeTab === 'staff' && renderStaffTab()}
      {activeTab === 'equipment' && (
        <div className="text-center py-12">
          <SettingsIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Equipment Management</h3>
          <p className="text-gray-600">Real-time equipment status, utilization, and maintenance scheduling</p>
        </div>
      )}
      {activeTab === 'rooms' && (
        <div className="text-center py-12">
          <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Room Optimization</h3>
          <p className="text-gray-600">Intelligent room allocation and utilization tracking</p>
        </div>
      )}
      {activeTab === 'conflicts' && (
        <div className="text-center py-12">
          <AlertTriangleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Conflict Resolution</h3>
          <p className="text-gray-600">AI-powered conflict detection and resolution suggestions</p>
        </div>
      )}
      {activeTab === 'analytics' && (
        <div className="text-center py-12">
          <BrainIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Optimization Analytics</h3>
          <p className="text-gray-600">Advanced analytics and AI insights for resource optimization</p>
        </div>
      )}
    </div>
  );
};

export default ResourceOptimization;
