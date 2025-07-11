// Clinic Management Component for Admin Module
import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';

interface Clinic {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  license_number: string;
  is_active: boolean;
  created_at: string;
}

interface NewClinic {
  name: string;
  address: string;
  phone: string;
  email: string;
  license_number: string;
}

export const ClinicManagement: React.FC = () => {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newClinic, setNewClinic] = useState<NewClinic>({
    name: '',
    address: '',
    phone: '',
    email: '',
    license_number: ''
  });
  const { profile } = useAuth();

  // Only super admins can manage clinics
  const canManageClinics = profile?.role === 'admin' && profile?.permissions?.configuration?.write;

  useEffect(() => {
    fetchClinics();
  }, []);

  const fetchClinics = async () => {
    try {
      const { data, error } = await supabase
        .from('clinics')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClinics(data || []);
    } catch (error) {
      console.error('Error fetching clinics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClinic = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data, error } = await supabase
        .from('clinics')
        .insert([newClinic])
        .select()
        .single();

      if (error) throw error;

      setClinics(prev => [data, ...prev]);
      setNewClinic({ name: '', address: '', phone: '', email: '', license_number: '' });
      setShowAddForm(false);
      
      alert('Clinic added successfully!');
    } catch (error) {
      console.error('Error adding clinic:', error);
      alert('Failed to add clinic. Please try again.');
    }
  };

  const toggleClinicStatus = async (clinicId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('clinics')
        .update({ is_active: !currentStatus })
        .eq('id', clinicId);

      if (error) throw error;

      setClinics(prev => 
        prev.map(clinic => 
          clinic.id === clinicId 
            ? { ...clinic, is_active: !currentStatus }
            : clinic
        )
      );
    } catch (error) {
      console.error('Error updating clinic status:', error);
      alert('Failed to update clinic status.');
    }
  };

  if (!canManageClinics) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-lg font-semibold text-red-800 mb-2">Access Denied</h3>
        <p className="text-red-600">You don't have permission to manage clinics.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Clinic Management</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
        >
          Add New Clinic
        </button>
      </div>

      {/* Add Clinic Form */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h3 className="text-lg font-semibold mb-4">Add New Clinic</h3>
          <form onSubmit={handleAddClinic} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Clinic Name *
                </label>
                <input
                  type="text"
                  required
                  value={newClinic.name}
                  onChange={(e) => setNewClinic(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter clinic name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={newClinic.email}
                  onChange={(e) => setNewClinic(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="clinic@example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={newClinic.phone}
                  onChange={(e) => setNewClinic(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="+91-98765-43210"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  License Number
                </label>
                <input
                  type="text"
                  value={newClinic.license_number}
                  onChange={(e) => setNewClinic(prev => ({ ...prev, license_number: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Medical license number"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <textarea
                value={newClinic.address}
                onChange={(e) => setNewClinic(prev => ({ ...prev, address: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Full clinic address"
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                Add Clinic
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Clinics List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Clinic Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {clinics.map((clinic) => (
              <tr key={clinic.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{clinic.name}</div>
                    <div className="text-sm text-gray-500">{clinic.address}</div>
                    {clinic.license_number && (
                      <div className="text-xs text-gray-400">License: {clinic.license_number}</div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{clinic.email}</div>
                  <div className="text-sm text-gray-500">{clinic.phone}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    clinic.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {clinic.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => toggleClinicStatus(clinic.id, clinic.is_active)}
                    className={`${
                      clinic.is_active 
                        ? 'text-red-600 hover:text-red-900' 
                        : 'text-green-600 hover:text-green-900'
                    } mr-4`}
                  >
                    {clinic.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {clinics.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No clinics found. Add your first clinic to get started.
        </div>
      )}
    </div>
  );
};

export default ClinicManagement;
