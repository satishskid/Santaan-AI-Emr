-- Health Alerts Table for System Monitoring
-- Run this in your Supabase SQL Editor to create the health monitoring table

-- Create health_alerts table
CREATE TABLE IF NOT EXISTS health_alerts (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('database_limit', 'user_limit', 'performance', 'error_rate')),
    severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
    message TEXT NOT NULL,
    threshold NUMERIC NOT NULL,
    current_value NUMERIC NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    acknowledged BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_health_alerts_severity ON health_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_health_alerts_type ON health_alerts(type);
CREATE INDEX IF NOT EXISTS idx_health_alerts_acknowledged ON health_alerts(acknowledged);
CREATE INDEX IF NOT EXISTS idx_health_alerts_timestamp ON health_alerts(timestamp DESC);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_health_alerts_updated_at 
    BEFORE UPDATE ON health_alerts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE health_alerts ENABLE ROW LEVEL SECURITY;

-- Create policies for health_alerts
-- Only authenticated users can view alerts
CREATE POLICY "Users can view health alerts" ON health_alerts
    FOR SELECT USING (auth.role() = 'authenticated');

-- Only authenticated users can insert alerts (for the monitoring service)
CREATE POLICY "Service can insert health alerts" ON health_alerts
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Only authenticated users can update alerts (for acknowledging)
CREATE POLICY "Users can update health alerts" ON health_alerts
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Admin users can delete old alerts
CREATE POLICY "Admins can delete health alerts" ON health_alerts
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.user_id = auth.uid() 
            AND user_profiles.role = 'admin'
        )
    );

-- Create a function to clean up old acknowledged alerts (older than 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_health_alerts()
RETURNS void AS $$
BEGIN
    DELETE FROM health_alerts 
    WHERE acknowledged = true 
    AND timestamp < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to run cleanup weekly (if pg_cron is available)
-- Note: This requires the pg_cron extension which may not be available on all Supabase plans
-- SELECT cron.schedule('cleanup-health-alerts', '0 2 * * 0', 'SELECT cleanup_old_health_alerts();');

-- Insert some sample data for testing (remove in production)
INSERT INTO health_alerts (id, type, severity, message, threshold, current_value, acknowledged) VALUES
('sample-1', 'database_limit', 'warning', 'Database usage approaching limit: 350MB (70% of free tier)', 350, 350, false),
('sample-2', 'user_limit', 'info', 'User count growing: 100 users (0.2% of free tier)', 35000, 100, true),
('sample-3', 'performance', 'warning', 'Database response time slow: 2500ms', 2000, 2500, false);

-- Grant necessary permissions
GRANT ALL ON health_alerts TO authenticated;
GRANT ALL ON health_alerts TO service_role;

-- Create a view for dashboard summary
CREATE OR REPLACE VIEW health_alerts_summary AS
SELECT 
    type,
    severity,
    COUNT(*) as alert_count,
    COUNT(*) FILTER (WHERE acknowledged = false) as unacknowledged_count,
    MAX(timestamp) as latest_alert,
    AVG(current_value) as avg_current_value,
    MAX(current_value) as max_current_value
FROM health_alerts 
WHERE timestamp > NOW() - INTERVAL '7 days'
GROUP BY type, severity
ORDER BY severity DESC, type;

-- Grant access to the summary view
GRANT SELECT ON health_alerts_summary TO authenticated;
GRANT SELECT ON health_alerts_summary TO service_role;

-- Create a function to get system health status
CREATE OR REPLACE FUNCTION get_system_health_status()
RETURNS TABLE (
    overall_status TEXT,
    critical_alerts INTEGER,
    warning_alerts INTEGER,
    info_alerts INTEGER,
    last_check TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        CASE 
            WHEN COUNT(*) FILTER (WHERE severity = 'critical' AND acknowledged = false) > 0 THEN 'critical'
            WHEN COUNT(*) FILTER (WHERE severity = 'warning' AND acknowledged = false) > 0 THEN 'warning'
            ELSE 'healthy'
        END as overall_status,
        COUNT(*) FILTER (WHERE severity = 'critical' AND acknowledged = false)::INTEGER as critical_alerts,
        COUNT(*) FILTER (WHERE severity = 'warning' AND acknowledged = false)::INTEGER as warning_alerts,
        COUNT(*) FILTER (WHERE severity = 'info' AND acknowledged = false)::INTEGER as info_alerts,
        COALESCE(MAX(timestamp), NOW() - INTERVAL '1 hour') as last_check
    FROM health_alerts 
    WHERE timestamp > NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_system_health_status() TO authenticated;
GRANT EXECUTE ON FUNCTION get_system_health_status() TO service_role;

-- Create notification settings table
CREATE TABLE IF NOT EXISTS notification_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email_alerts BOOLEAN DEFAULT true,
    critical_alerts_only BOOLEAN DEFAULT false,
    notification_email TEXT,
    webhook_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for notification settings
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

-- Users can only manage their own notification settings
CREATE POLICY "Users can manage own notification settings" ON notification_settings
    FOR ALL USING (user_id = auth.uid());

-- Create trigger for notification_settings updated_at
CREATE TRIGGER update_notification_settings_updated_at 
    BEFORE UPDATE ON notification_settings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL ON notification_settings TO authenticated;
GRANT ALL ON notification_settings TO service_role;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Health monitoring tables created successfully!';
    RAISE NOTICE 'Tables created: health_alerts, notification_settings';
    RAISE NOTICE 'Views created: health_alerts_summary';
    RAISE NOTICE 'Functions created: get_system_health_status, cleanup_old_health_alerts';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Remove sample data if in production';
    RAISE NOTICE '2. Configure notification settings for admin users';
    RAISE NOTICE '3. Set up external notification services (email, Slack, etc.)';
END $$;
