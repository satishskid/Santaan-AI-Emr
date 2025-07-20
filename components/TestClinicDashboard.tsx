import React, { useState, useEffect } from 'react';
import { getTestClinicData, PatientCategory, UserJourneyScenario, TestUser } from '../services/testClinicService';
import { UserRole } from '../types';

interface TestClinicDashboardProps {
  onSelectPatient?: (patientId: string) => void;
  onSwitchUser?: (userId: string, role: UserRole) => void;
}

const TestClinicDashboard: React.FC<TestClinicDashboardProps> = ({ 
  onSelectPatient, 
  onSwitchUser 
}) => {
  const [testData, setTestData] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<PatientCategory | 'all'>('all');
  const [selectedJourney, setSelectedJourney] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'patients' | 'users' | 'journeys'>('overview');

  useEffect(() => {
    const data = getTestClinicData();
    setTestData(data);
    data.enableTestMode();
  }, []);

  if (!testData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading test clinic data...</div>
      </div>
    );
  }

  const getCategoryColor = (category: PatientCategory): string => {
    const colors: Record<PatientCategory, string> = {
      [PatientCategory.FIRST_TIME_IVF]: 'bg-blue-100 text-blue-800',
      [PatientCategory.REPEAT_IVF]: 'bg-purple-100 text-purple-800',
      [PatientCategory.MALE_FACTOR]: 'bg-green-100 text-green-800',
      [PatientCategory.FEMALE_FACTOR]: 'bg-pink-100 text-pink-800',
      [PatientCategory.UNEXPLAINED]: 'bg-gray-100 text-gray-800',
      [PatientCategory.ADVANCED_AGE]: 'bg-orange-100 text-orange-800',
      [PatientCategory.PCOS]: 'bg-yellow-100 text-yellow-800',
      [PatientCategory.ENDOMETRIOSIS]: 'bg-red-100 text-red-800',
      [PatientCategory.LOW_AMH]: 'bg-indigo-100 text-indigo-800',
      [PatientCategory.DONOR_EGG]: 'bg-teal-100 text-teal-800',
      [PatientCategory.FROZEN_TRANSFER]: 'bg-cyan-100 text-cyan-800',
      [PatientCategory.IUI_TO_IVF]: 'bg-emerald-100 text-emerald-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getRoleColor = (role: UserRole): string => {
    const colors: Record<UserRole, string> = {
      [UserRole.Doctor]: 'bg-blue-100 text-blue-800',
      [UserRole.Nurse]: 'bg-green-100 text-green-800',
      [UserRole.Embryologist]: 'bg-purple-100 text-purple-800',
      [UserRole.Counselor]: 'bg-orange-100 text-orange-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const filteredPatients = selectedCategory === 'all' 
    ? testData.archetypes 
    : testData.archetypes.filter((p: any) => p.category === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-50 to-emerald-50 p-8 rounded-xl border border-cyan-200">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">🏥 {testData.config.name}</h1>
          <p className="text-slate-600 mb-4">{testData.config.location} • Established {testData.config.established}</p>
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {testData.config.specialties.map((specialty: string) => (
              <span key={specialty} className="px-3 py-1 bg-cyan-100 text-cyan-800 rounded-full text-sm">
                {specialty}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-white p-3 rounded-lg">
              <div className="text-2xl font-bold text-cyan-600">{testData.users.length}</div>
              <div className="text-sm text-gray-600">Staff Members</div>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <div className="text-2xl font-bold text-emerald-600">{testData.archetypes.length}</div>
              <div className="text-sm text-gray-600">Patient Types</div>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{testData.journeys.length}</div>
              <div className="text-sm text-gray-600">User Journeys</div>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{testData.config.success_rate}</div>
              <div className="text-sm text-gray-600">Success Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'overview', label: '📊 Overview', icon: '📊' },
          { id: 'patients', label: '👥 Patients', icon: '👥' },
          { id: 'users', label: '👨‍⚕️ Staff', icon: '👨‍⚕️' },
          { id: 'journeys', label: '🎯 Journeys', icon: '🎯' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Clinic Information */}
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">🏥 Clinic Information</h3>
            <div className="space-y-2 text-sm">
              <div><strong>Location:</strong> {testData.config.location}</div>
              <div><strong>Staff:</strong> {testData.config.staff_count} members</div>
              <div><strong>Languages:</strong> {testData.config.languages.join(', ')}</div>
              <div><strong>Accreditation:</strong> {testData.config.accreditation.join(', ')}</div>
            </div>
          </div>

          {/* Patient Categories */}
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">👥 Patient Categories</h3>
            <div className="space-y-2">
              {Object.values(PatientCategory).slice(0, 6).map((category) => {
                const count = testData.archetypes.filter((p: any) => p.category === category).length;
                return (
                  <div key={category} className="flex justify-between items-center">
                    <span className="text-sm">{category.replace(/_/g, ' ').toUpperCase()}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(category)}`}>
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Staff Distribution */}
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">👨‍⚕️ Staff Distribution</h3>
            <div className="space-y-2">
              {Object.values(UserRole).map((role) => {
                const count = testData.users.filter((u: TestUser) => u.role === role).length;
                return (
                  <div key={role} className="flex justify-between items-center">
                    <span className="text-sm">{role}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${getRoleColor(role)}`}>
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'patients' && (
        <div className="space-y-6">
          {/* Patient Category Filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1 rounded-full text-sm ${
                selectedCategory === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Patients ({testData.archetypes.length})
            </button>
            {Object.values(PatientCategory).map((category) => {
              const count = testData.archetypes.filter((p: any) => p.category === category).length;
              if (count === 0) return null;
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    selectedCategory === category 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.replace(/_/g, ' ')} ({count})
                </button>
              );
            })}
          </div>

          {/* Patient Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPatients.map((patient: any, index: number) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{patient.name}</h3>
                    <p className="text-gray-600 text-sm">{patient.age} years • {patient.location}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(patient.category)}`}>
                    {patient.category.replace(/_/g, ' ')}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div><strong>Partner:</strong> {patient.partnerName} ({patient.partnerAge})</div>
                  <div><strong>Diagnosis:</strong> {patient.diagnosis}</div>
                  <div><strong>Protocol:</strong> {patient.protocol}</div>
                  <div><strong>Cycle:</strong> #{patient.cycleNumber}</div>
                  <div><strong>Stage:</strong> {patient.journey_stage.replace(/_/g, ' ')}</div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Income: ₹{patient.monthlyIncome.toLocaleString()}/mo</span>
                    <button 
                      onClick={() => onSelectPatient?.(patient.name)}
                      className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testData.users.map((user: TestUser) => (
            <div key={user.id} className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{user.name}</h3>
                  <p className="text-gray-600 text-sm">{user.specialization}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${getRoleColor(user.role)}`}>
                  {user.role}
                </span>
              </div>
              
              <div className="space-y-2 text-sm">
                <div><strong>Experience:</strong> {user.experience_years} years</div>
                <div><strong>Languages:</strong> {user.languages.join(', ')}</div>
                <div><strong>Shift:</strong> {user.shift.replace(/_/g, ' ')}</div>
                <div><strong>Email:</strong> {user.email}</div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <button 
                  onClick={() => onSwitchUser?.(user.id, user.role)}
                  className="w-full px-3 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
                >
                  Switch to {user.name}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'journeys' && (
        <div className="space-y-6">
          {testData.journeys.map((journey: UserJourneyScenario) => (
            <div key={journey.id} className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-xl">{journey.title}</h3>
                  <p className="text-gray-600 mt-1">{journey.description}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${getCategoryColor(journey.patient_category)}`}>
                  {journey.patient_category.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">🎯 Key Milestones ({journey.duration_weeks} weeks)</h4>
                  <ul className="space-y-1 text-sm">
                    {journey.key_milestones.map((milestone, idx) => (
                      <li key={idx} className="flex items-center">
                        <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                        {milestone}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-2">👥 Staff Interactions</h4>
                  <div className="space-y-2">
                    {journey.staff_interactions.map((interaction, idx) => (
                      <div key={idx} className="text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs ${getRoleColor(interaction.role)} mr-2`}>
                          {interaction.role}
                        </span>
                        <span className="text-gray-600">{interaction.tasks.join(', ')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <button 
                  onClick={() => setSelectedJourney(selectedJourney === journey.id ? null : journey.id)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm hover:bg-purple-700"
                >
                  {selectedJourney === journey.id ? 'Hide Details' : 'View Learning Objectives'}
                </button>
                
                {selectedJourney === journey.id && (
                  <div className="mt-4 p-4 bg-purple-50 rounded-lg">
                    <h5 className="font-medium mb-2">📚 Learning Objectives:</h5>
                    <ul className="space-y-1 text-sm">
                      {journey.learning_objectives.map((objective, idx) => (
                        <li key={idx} className="flex items-center">
                          <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
                          {objective}
                        </li>
                      ))}
                    </ul>
                    <h5 className="font-medium mb-2 mt-4">🎯 Expected Outcomes:</h5>
                    <ul className="space-y-1 text-sm">
                      {journey.expected_outcomes.map((outcome, idx) => (
                        <li key={idx} className="flex items-center">
                          <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                          {outcome}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TestClinicDashboard;
