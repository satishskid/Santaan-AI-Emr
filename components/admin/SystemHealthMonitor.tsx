// System Health Monitor for IVF EMR
import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';

interface UsageMetrics {
  totalPatients: number;
  totalUsers: number;
  totalClinics: number;
  totalTreatmentRecords: number;
  totalFileAttachments: number;
  databaseSizeEstimate: number; // in MB
  monthlyActiveUsers: number;
  dailyApiCalls: number;
}

interface HealthStatus {
  database: 'healthy' | 'warning' | 'critical';
  users: 'healthy' | 'warning' | 'critical';
  storage: 'healthy' | 'warning' | 'critical';
  performance: 'healthy' | 'warning' | 'critical';
}

const LIMITS = {
  FREE_TIER: {
    database: 500, // MB
    monthlyActiveUsers: 50000,
    bandwidth: 2000 // MB per month
  },
  PRO_TIER: {
    database: 8000, // MB
    monthlyActiveUsers: 100000,
    bandwidth: 250000 // MB per month
  }
};

export const SystemHealthMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<UsageMetrics | null>(null);
  const [healthStatus, setHealthStatus] = useState<HealthStatus>({
    database: 'healthy',
    users: 'healthy',
    storage: 'healthy',
    performance: 'healthy'
  });
  const [loading, setLoading] = useState(true);
  const [currentTier, setCurrentTier] = useState<'free' | 'pro'>('free');

  useEffect(() => {
    fetchUsageMetrics();
    // Refresh every 5 minutes
    const interval = setInterval(fetchUsageMetrics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchUsageMetrics = async () => {
    try {
      setLoading(true);

      // Get counts from all tables
      const [
        patientsResult,
        usersResult,
        clinicsResult,
        treatmentsResult,
        filesResult
      ] = await Promise.all([
        supabase.from('patients').select('id', { count: 'exact', head: true }),
        supabase.from('user_profiles').select('id', { count: 'exact', head: true }),
        supabase.from('clinics').select('id', { count: 'exact', head: true }),
        supabase.from('treatment_records').select('id', { count: 'exact', head: true }),
        supabase.from('file_attachments').select('file_size', { count: 'exact' })
      ]);

      // Calculate database size estimate
      const avgPatientSize = 50; // KB per patient record
      const avgTreatmentSize = 20; // KB per treatment record
      const avgUserSize = 5; // KB per user
      
      const totalPatients = patientsResult.count || 0;
      const totalUsers = usersResult.count || 0;
      const totalClinics = clinicsResult.count || 0;
      const totalTreatments = treatmentsResult.count || 0;
      const totalFiles = filesResult.count || 0;

      // Estimate database size in MB
      const databaseSizeEstimate = (
        (totalPatients * avgPatientSize) +
        (totalTreatments * avgTreatmentSize) +
        (totalUsers * avgUserSize)
      ) / 1024; // Convert KB to MB

      const newMetrics: UsageMetrics = {
        totalPatients,
        totalUsers,
        totalClinics,
        totalTreatmentRecords: totalTreatments,
        totalFileAttachments: totalFiles,
        databaseSizeEstimate,
        monthlyActiveUsers: totalUsers, // Simplified - in real app, track actual MAU
        dailyApiCalls: totalPatients * 10 // Estimate based on patient interactions
      };

      setMetrics(newMetrics);
      updateHealthStatus(newMetrics);

    } catch (error) {
      console.error('Error fetching usage metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateHealthStatus = (metrics: UsageMetrics) => {
    const limits = currentTier === 'free' ? LIMITS.FREE_TIER : LIMITS.PRO_TIER;
    
    const newStatus: HealthStatus = {
      database: getStatusLevel(metrics.databaseSizeEstimate, limits.database),
      users: getStatusLevel(metrics.monthlyActiveUsers, limits.monthlyActiveUsers),
      storage: getStatusLevel(metrics.databaseSizeEstimate, limits.database),
      performance: metrics.totalPatients > 1000 ? 'warning' : 'healthy'
    };

    setHealthStatus(newStatus);
  };

  const getStatusLevel = (current: number, limit: number): 'healthy' | 'warning' | 'critical' => {
    const percentage = (current / limit) * 100;
    if (percentage >= 90) return 'critical';
    if (percentage >= 70) return 'warning';
    return 'healthy';
  };

  const getStatusColor = (status: 'healthy' | 'warning' | 'critical') => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
    }
  };

  const getUsagePercentage = (current: number, limit: number) => {
    return Math.min((current / limit) * 100, 100);
  };

  const shouldUpgrade = () => {
    if (!metrics) return false;
    const limits = LIMITS.FREE_TIER;
    return (
      metrics.databaseSizeEstimate > limits.database * 0.8 ||
      metrics.monthlyActiveUsers > limits.monthlyActiveUsers * 0.8
    );
  };

  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">System Health Monitor</h2>
        <div className="flex items-center space-x-4">
          <select
            value={currentTier}
            onChange={(e) => setCurrentTier(e.target.value as 'free' | 'pro')}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="free">Free Tier</option>
            <option value="pro">Pro Tier</option>
          </select>
          <button
            onClick={fetchUsageMetrics}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Upgrade Alert */}
      {shouldUpgrade() && currentTier === 'free' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Upgrade Recommended</h3>
              <p className="text-sm text-red-700 mt-1">
                You're approaching free tier limits. Consider upgrading to Pro tier to avoid service interruption.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Current Usage Overview */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Patients</dt>
                  <dd className="text-lg font-medium text-gray-900">{metrics.totalPatients.toLocaleString()}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Clinics</dt>
                  <dd className="text-lg font-medium text-gray-900">{metrics.totalClinics}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Database Size</dt>
                  <dd className="text-lg font-medium text-gray-900">{metrics.databaseSizeEstimate.toFixed(1)} MB</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Users</dt>
                  <dd className="text-lg font-medium text-gray-900">{metrics.totalUsers}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Usage Limits Progress */}
      {metrics && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage vs Limits ({currentTier.toUpperCase()} Tier)</h3>
          <div className="space-y-4">
            {/* Database Usage */}
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Database Storage</span>
                <span>{metrics.databaseSizeEstimate.toFixed(1)} MB / {currentTier === 'free' ? LIMITS.FREE_TIER.database : LIMITS.PRO_TIER.database} MB</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    getUsagePercentage(metrics.databaseSizeEstimate, currentTier === 'free' ? LIMITS.FREE_TIER.database : LIMITS.PRO_TIER.database) > 80 
                      ? 'bg-red-600' 
                      : getUsagePercentage(metrics.databaseSizeEstimate, currentTier === 'free' ? LIMITS.FREE_TIER.database : LIMITS.PRO_TIER.database) > 60 
                        ? 'bg-yellow-600' 
                        : 'bg-green-600'
                  }`}
                  style={{ 
                    width: `${getUsagePercentage(metrics.databaseSizeEstimate, currentTier === 'free' ? LIMITS.FREE_TIER.database : LIMITS.PRO_TIER.database)}%` 
                  }}
                ></div>
              </div>
            </div>

            {/* Users Usage */}
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Monthly Active Users</span>
                <span>{metrics.monthlyActiveUsers} / {currentTier === 'free' ? LIMITS.FREE_TIER.monthlyActiveUsers.toLocaleString() : LIMITS.PRO_TIER.monthlyActiveUsers.toLocaleString()}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    getUsagePercentage(metrics.monthlyActiveUsers, currentTier === 'free' ? LIMITS.FREE_TIER.monthlyActiveUsers : LIMITS.PRO_TIER.monthlyActiveUsers) > 80 
                      ? 'bg-red-600' 
                      : getUsagePercentage(metrics.monthlyActiveUsers, currentTier === 'free' ? LIMITS.FREE_TIER.monthlyActiveUsers : LIMITS.PRO_TIER.monthlyActiveUsers) > 60 
                        ? 'bg-yellow-600' 
                        : 'bg-green-600'
                  }`}
                  style={{ 
                    width: `${getUsagePercentage(metrics.monthlyActiveUsers, currentTier === 'free' ? LIMITS.FREE_TIER.monthlyActiveUsers : LIMITS.PRO_TIER.monthlyActiveUsers)}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Health Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health Status</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(healthStatus).map(([key, status]) => (
            <div key={key} className="text-center">
              <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </div>
              <p className="text-sm text-gray-600 mt-1 capitalize">{key}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h3>
        <div className="space-y-3">
          {metrics && metrics.databaseSizeEstimate > LIMITS.FREE_TIER.database * 0.7 && currentTier === 'free' && (
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-sm text-gray-700">
                <strong>Database approaching limit:</strong> Consider upgrading to Pro tier or optimizing data storage.
              </p>
            </div>
          )}
          
          {metrics && metrics.totalPatients > 500 && (
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-sm text-gray-700">
                <strong>High patient volume:</strong> Consider implementing data archiving for completed treatments.
              </p>
            </div>
          )}
          
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-sm text-gray-700">
              <strong>Regular monitoring:</strong> Check this dashboard weekly to stay ahead of limits.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemHealthMonitor;
