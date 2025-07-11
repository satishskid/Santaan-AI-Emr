// Health Alert Badge Component for Header
import React, { useState, useEffect } from 'react';
import { healthMonitor, HealthAlert } from '../services/healthMonitoringService';

interface HealthAlertBadgeProps {
  userRole: string;
}

export const HealthAlertBadge: React.FC<HealthAlertBadgeProps> = ({ userRole }) => {
  const [alerts, setAlerts] = useState<HealthAlert[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  // Only show for admin users
  if (userRole !== 'admin') {
    return null;
  }

  useEffect(() => {
    fetchAlerts();
    
    // Refresh alerts every 5 minutes
    const interval = setInterval(fetchAlerts, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchAlerts = async () => {
    try {
      const unacknowledgedAlerts = await healthMonitor.getUnacknowledgedAlerts();
      setAlerts(unacknowledgedAlerts);
    } catch (error) {
      console.error('Failed to fetch health alerts:', error);
    }
  };

  const handleAcknowledge = async (alertId: string) => {
    try {
      setLoading(true);
      await healthMonitor.acknowledgeAlert(alertId);
      await fetchAlerts(); // Refresh the list
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
    } finally {
      setLoading(false);
    }
  };

  const triggerHealthCheck = async () => {
    try {
      setLoading(true);
      await healthMonitor.triggerHealthCheck();
      await fetchAlerts(); // Refresh after check
    } catch (error) {
      console.error('Failed to trigger health check:', error);
    } finally {
      setLoading(false);
    }
  };

  const criticalAlerts = alerts.filter(alert => alert.severity === 'critical');
  const warningAlerts = alerts.filter(alert => alert.severity === 'warning');
  const totalAlerts = alerts.length;

  const getBadgeColor = () => {
    if (criticalAlerts.length > 0) return 'bg-red-500';
    if (warningAlerts.length > 0) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return '🔥';
      case 'warning':
        return '⚠️';
      default:
        return 'ℹ️';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <div className="relative">
      {/* Health Status Badge */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative flex items-center space-x-2 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        title={`System Health: ${totalAlerts} alerts`}
      >
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${getBadgeColor()}`}></div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Health
          </span>
          {totalAlerts > 0 && (
            <span className={`inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white rounded-full ${getBadgeColor()}`}>
              {totalAlerts}
            </span>
          )}
        </div>
        
        {/* Dropdown Arrow */}
        <svg 
          className={`w-4 h-4 text-gray-500 transition-transform ${showDropdown ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                System Health
              </h3>
              <button
                onClick={triggerHealthCheck}
                disabled={loading}
                className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Checking...' : 'Check Now'}
              </button>
            </div>

            {/* Health Summary */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="text-center p-2 bg-red-50 dark:bg-red-900/20 rounded">
                <div className="text-lg font-bold text-red-600 dark:text-red-400">
                  {criticalAlerts.length}
                </div>
                <div className="text-xs text-red-600 dark:text-red-400">Critical</div>
              </div>
              <div className="text-center p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                  {warningAlerts.length}
                </div>
                <div className="text-xs text-yellow-600 dark:text-yellow-400">Warning</div>
              </div>
              <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
                <div className="text-lg font-bold text-green-600 dark:text-green-400">
                  {totalAlerts === 0 ? '✓' : alerts.filter(a => a.severity === 'info').length}
                </div>
                <div className="text-xs text-green-600 dark:text-green-400">
                  {totalAlerts === 0 ? 'Healthy' : 'Info'}
                </div>
              </div>
            </div>

            {/* Alerts List */}
            <div className="max-h-64 overflow-y-auto">
              {alerts.length === 0 ? (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                  <div className="text-2xl mb-2">✅</div>
                  <div>All systems healthy!</div>
                </div>
              ) : (
                <div className="space-y-2">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-3 rounded-lg border-l-4 ${
                        alert.severity === 'critical'
                          ? 'bg-red-50 dark:bg-red-900/20 border-red-500'
                          : alert.severity === 'warning'
                          ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500'
                          : 'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-lg">{getAlertIcon(alert.severity)}</span>
                            <span className={`text-xs font-medium px-2 py-1 rounded ${
                              alert.severity === 'critical'
                                ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                                : alert.severity === 'warning'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100'
                            }`}>
                              {alert.severity.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                            {alert.message}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatTimestamp(alert.timestamp)}
                          </p>
                        </div>
                        <button
                          onClick={() => handleAcknowledge(alert.id)}
                          disabled={loading}
                          className="ml-2 px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50 transition-colors"
                        >
                          ✓
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Auto-check: Every 15 min</span>
                <button
                  onClick={() => setShowDropdown(false)}
                  className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                >
                  View Full Dashboard →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
};

export default HealthAlertBadge;
