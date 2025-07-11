// Health Monitoring Service for automated alerts and monitoring
import { supabase } from './supabaseClient';

export interface HealthAlert {
  id: string;
  type: 'database_limit' | 'user_limit' | 'performance' | 'error_rate';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  threshold: number;
  currentValue: number;
  timestamp: Date;
  acknowledged: boolean;
}

export interface HealthThresholds {
  database: {
    warning: number; // 70% of limit
    critical: number; // 90% of limit
  };
  users: {
    warning: number; // 70% of limit
    critical: number; // 90% of limit
  };
  performance: {
    warning: number; // Response time in ms
    critical: number; // Response time in ms
  };
}

export class HealthMonitoringService {
  private static instance: HealthMonitoringService;
  private alerts: HealthAlert[] = [];
  private thresholds: HealthThresholds;
  private monitoringInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.thresholds = {
      database: {
        warning: 350, // 70% of 500MB free tier
        critical: 450  // 90% of 500MB free tier
      },
      users: {
        warning: 35000, // 70% of 50k free tier
        critical: 45000  // 90% of 50k free tier
      },
      performance: {
        warning: 2000, // 2 seconds
        critical: 5000  // 5 seconds
      }
    };
  }

  static getInstance(): HealthMonitoringService {
    if (!HealthMonitoringService.instance) {
      HealthMonitoringService.instance = new HealthMonitoringService();
    }
    return HealthMonitoringService.instance;
  }

  // Start automated monitoring
  startMonitoring(intervalMinutes: number = 15): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    this.monitoringInterval = setInterval(() => {
      this.performHealthCheck();
    }, intervalMinutes * 60 * 1000);

    // Perform initial check
    this.performHealthCheck();
    console.log(`Health monitoring started - checking every ${intervalMinutes} minutes`);
  }

  // Stop automated monitoring
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      console.log('Health monitoring stopped');
    }
  }

  // Perform comprehensive health check
  async performHealthCheck(): Promise<HealthAlert[]> {
    const newAlerts: HealthAlert[] = [];

    try {
      // Check database usage
      const dbAlerts = await this.checkDatabaseUsage();
      newAlerts.push(...dbAlerts);

      // Check user limits
      const userAlerts = await this.checkUserLimits();
      newAlerts.push(...userAlerts);

      // Check performance
      const perfAlerts = await this.checkPerformance();
      newAlerts.push(...perfAlerts);

      // Store new alerts
      for (const alert of newAlerts) {
        await this.storeAlert(alert);
        await this.sendNotification(alert);
      }

      this.alerts.push(...newAlerts);
      return newAlerts;

    } catch (error) {
      console.error('Health check failed:', error);
      const errorAlert: HealthAlert = {
        id: `error-${Date.now()}`,
        type: 'error_rate',
        severity: 'critical',
        message: 'Health monitoring system error',
        threshold: 0,
        currentValue: 1,
        timestamp: new Date(),
        acknowledged: false
      };
      
      await this.storeAlert(errorAlert);
      return [errorAlert];
    }
  }

  // Check database usage against limits
  private async checkDatabaseUsage(): Promise<HealthAlert[]> {
    const alerts: HealthAlert[] = [];

    try {
      // Get table counts
      const [patientsResult, treatmentsResult, usersResult] = await Promise.all([
        supabase.from('patients').select('id', { count: 'exact', head: true }),
        supabase.from('treatment_records').select('id', { count: 'exact', head: true }),
        supabase.from('user_profiles').select('id', { count: 'exact', head: true })
      ]);

      // Estimate database size (simplified calculation)
      const totalPatients = patientsResult.count || 0;
      const totalTreatments = treatmentsResult.count || 0;
      const totalUsers = usersResult.count || 0;

      const estimatedSizeMB = (
        (totalPatients * 50) + // 50KB per patient
        (totalTreatments * 20) + // 20KB per treatment
        (totalUsers * 5) // 5KB per user
      ) / 1024; // Convert to MB

      // Check against thresholds
      if (estimatedSizeMB >= this.thresholds.database.critical) {
        alerts.push({
          id: `db-critical-${Date.now()}`,
          type: 'database_limit',
          severity: 'critical',
          message: `Database usage critical: ${estimatedSizeMB.toFixed(1)}MB (${((estimatedSizeMB/500)*100).toFixed(1)}% of free tier limit)`,
          threshold: this.thresholds.database.critical,
          currentValue: estimatedSizeMB,
          timestamp: new Date(),
          acknowledged: false
        });
      } else if (estimatedSizeMB >= this.thresholds.database.warning) {
        alerts.push({
          id: `db-warning-${Date.now()}`,
          type: 'database_limit',
          severity: 'warning',
          message: `Database usage high: ${estimatedSizeMB.toFixed(1)}MB (${((estimatedSizeMB/500)*100).toFixed(1)}% of free tier limit)`,
          threshold: this.thresholds.database.warning,
          currentValue: estimatedSizeMB,
          timestamp: new Date(),
          acknowledged: false
        });
      }

    } catch (error) {
      console.error('Database usage check failed:', error);
    }

    return alerts;
  }

  // Check user limits
  private async checkUserLimits(): Promise<HealthAlert[]> {
    const alerts: HealthAlert[] = [];

    try {
      const { count: userCount } = await supabase
        .from('user_profiles')
        .select('id', { count: 'exact', head: true });

      const currentUsers = userCount || 0;

      if (currentUsers >= this.thresholds.users.critical) {
        alerts.push({
          id: `users-critical-${Date.now()}`,
          type: 'user_limit',
          severity: 'critical',
          message: `User count critical: ${currentUsers} users (${((currentUsers/50000)*100).toFixed(1)}% of free tier limit)`,
          threshold: this.thresholds.users.critical,
          currentValue: currentUsers,
          timestamp: new Date(),
          acknowledged: false
        });
      } else if (currentUsers >= this.thresholds.users.warning) {
        alerts.push({
          id: `users-warning-${Date.now()}`,
          type: 'user_limit',
          severity: 'warning',
          message: `User count high: ${currentUsers} users (${((currentUsers/50000)*100).toFixed(1)}% of free tier limit)`,
          threshold: this.thresholds.users.warning,
          currentValue: currentUsers,
          timestamp: new Date(),
          acknowledged: false
        });
      }

    } catch (error) {
      console.error('User limit check failed:', error);
    }

    return alerts;
  }

  // Check performance metrics
  private async checkPerformance(): Promise<HealthAlert[]> {
    const alerts: HealthAlert[] = [];

    try {
      const startTime = Date.now();
      
      // Test database response time
      await supabase.from('patients').select('id').limit(1);
      
      const responseTime = Date.now() - startTime;

      if (responseTime >= this.thresholds.performance.critical) {
        alerts.push({
          id: `perf-critical-${Date.now()}`,
          type: 'performance',
          severity: 'critical',
          message: `Database response time critical: ${responseTime}ms`,
          threshold: this.thresholds.performance.critical,
          currentValue: responseTime,
          timestamp: new Date(),
          acknowledged: false
        });
      } else if (responseTime >= this.thresholds.performance.warning) {
        alerts.push({
          id: `perf-warning-${Date.now()}`,
          type: 'performance',
          severity: 'warning',
          message: `Database response time slow: ${responseTime}ms`,
          threshold: this.thresholds.performance.warning,
          currentValue: responseTime,
          timestamp: new Date(),
          acknowledged: false
        });
      }

    } catch (error) {
      console.error('Performance check failed:', error);
    }

    return alerts;
  }

  // Store alert in database
  private async storeAlert(alert: HealthAlert): Promise<void> {
    try {
      await supabase.from('health_alerts').insert({
        id: alert.id,
        type: alert.type,
        severity: alert.severity,
        message: alert.message,
        threshold: alert.threshold,
        current_value: alert.currentValue,
        timestamp: alert.timestamp.toISOString(),
        acknowledged: alert.acknowledged
      });
    } catch (error) {
      console.error('Failed to store alert:', error);
    }
  }

  // Send notification (email, webhook, etc.)
  private async sendNotification(alert: HealthAlert): Promise<void> {
    try {
      // For now, just log to console
      // In production, integrate with email service, Slack, etc.
      console.warn(`🚨 HEALTH ALERT [${alert.severity.toUpperCase()}]: ${alert.message}`);
      
      // You can integrate with services like:
      // - SendGrid for email
      // - Slack webhooks
      // - Discord webhooks
      // - SMS services
      
      if (alert.severity === 'critical') {
        console.error(`🔥 CRITICAL ALERT: Immediate action required!`);
        // Send immediate notification to admin
      }

    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  }

  // Get all unacknowledged alerts
  async getUnacknowledgedAlerts(): Promise<HealthAlert[]> {
    try {
      const { data, error } = await supabase
        .from('health_alerts')
        .select('*')
        .eq('acknowledged', false)
        .order('timestamp', { ascending: false });

      if (error) throw error;

      return data.map(row => ({
        id: row.id,
        type: row.type,
        severity: row.severity,
        message: row.message,
        threshold: row.threshold,
        currentValue: row.current_value,
        timestamp: new Date(row.timestamp),
        acknowledged: row.acknowledged
      }));

    } catch (error) {
      console.error('Failed to get alerts:', error);
      return [];
    }
  }

  // Acknowledge an alert
  async acknowledgeAlert(alertId: string): Promise<void> {
    try {
      await supabase
        .from('health_alerts')
        .update({ acknowledged: true })
        .eq('id', alertId);

      // Remove from local alerts array
      this.alerts = this.alerts.filter(alert => alert.id !== alertId);

    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
    }
  }

  // Update thresholds for different tiers
  updateThresholds(tier: 'free' | 'pro'): void {
    if (tier === 'pro') {
      this.thresholds = {
        database: {
          warning: 5600, // 70% of 8GB pro tier
          critical: 7200  // 90% of 8GB pro tier
        },
        users: {
          warning: 70000, // 70% of 100k pro tier
          critical: 90000  // 90% of 100k pro tier
        },
        performance: {
          warning: 1000, // 1 second (pro tier should be faster)
          critical: 3000  // 3 seconds
        }
      };
    } else {
      // Reset to free tier thresholds
      this.thresholds = {
        database: {
          warning: 350,
          critical: 450
        },
        users: {
          warning: 35000,
          critical: 45000
        },
        performance: {
          warning: 2000,
          critical: 5000
        }
      };
    }
  }

  // Get current thresholds
  getThresholds(): HealthThresholds {
    return { ...this.thresholds };
  }

  // Manual health check trigger
  async triggerHealthCheck(): Promise<HealthAlert[]> {
    console.log('Manual health check triggered');
    return await this.performHealthCheck();
  }
}

// Export singleton instance
export const healthMonitor = HealthMonitoringService.getInstance();

// Auto-start monitoring when service is imported
if (typeof window !== 'undefined') {
  // Only start in browser environment
  healthMonitor.startMonitoring(15); // Check every 15 minutes
}
