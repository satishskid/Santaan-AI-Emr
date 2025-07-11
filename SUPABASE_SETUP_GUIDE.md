# 🚀 Supabase Setup Guide for IVF EMR

## Step 1: Database Schema Setup

### 1.1 Access Supabase SQL Editor
1. Go to your Supabase dashboard: https://app.supabase.com
2. Select your project: `uzjoolaejhitcwyoarxx`
3. Navigate to **SQL Editor** in the left sidebar
4. Click **New Query**

### 1.2 Run Database Schema
Copy and paste the entire content from `database/schema.sql` into the SQL Editor and click **Run**.

This will create:
- ✅ All necessary tables (users, patients, treatments, etc.)
- ✅ Row Level Security (RLS) policies
- ✅ Indexes for performance
- ✅ Triggers for automatic timestamps

## Step 2: Create Your First Admin User

### 2.1 Sign Up Through Authentication
1. Go to **Authentication** → **Users** in Supabase dashboard
2. Click **Add User**
3. Enter:
   - **Email**: `admin@democlinic.com`
   - **Password**: `demo123456`
   - **Email Confirm**: ✅ (check this)

### 2.2 Create Default Clinic
In SQL Editor, run:
```sql
-- Create default clinic
INSERT INTO clinics (id, name, address, phone, email) VALUES 
('00000000-0000-0000-0000-000000000001', 'Demo IVF Clinic', '123 Medical Center Dr', '+1-555-0123', 'admin@democlinic.com');
```

### 2.3 Create Admin Profile
Replace `YOUR_USER_ID` with the actual UUID from the auth.users table:
```sql
-- Get the user ID first
SELECT id, email FROM auth.users WHERE email = 'admin@democlinic.com';

-- Then insert profile (replace the UUID below with actual user ID)
INSERT INTO user_profiles (id, email, full_name, role, clinic_id, permissions) VALUES 
('REPLACE_WITH_ACTUAL_USER_ID', 'admin@democlinic.com', 'Admin User', 'admin', '00000000-0000-0000-0000-000000000001', 
'{
    "patients": {"read": true, "write": true, "delete": true},
    "treatments": {"read": true, "write": true, "delete": true},
    "reports": {"read": true, "write": true},
    "configuration": {"read": true, "write": true}
}');
```

## Step 3: Configure Row Level Security

### 3.1 Verify RLS Policies
Run this query to check if RLS policies are active:
```sql
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = true;
```

You should see all tables with `rowsecurity = true`.

### 3.2 Test Authentication
Try logging in with:
- **Email**: `admin@democlinic.com`
- **Password**: `demo123456`

## Step 4: Environment Variables

### 4.1 Update Your .env File
Create `.env.local` in your project root:
```bash
# Supabase Configuration
REACT_APP_SUPABASE_URL=https://uzjoolaejhitcwyoarxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6am9vbGFlamhpdGN3eW9hcnh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMjUyMTUsImV4cCI6MjA2NzgwMTIxNX0.tnHXzqDbJ9xB0WajNyzKGzbRodMh50wGMgnuUCSahPc

# Demo Mode (set to false for production)
REACT_APP_DEMO_MODE=true

# AI API Keys (existing)
REACT_APP_GEMINI_API_KEY=your_gemini_key
REACT_APP_GROQ_API_KEY=your_groq_key
```

## Step 5: Data Migration

### 5.1 Automatic Migration
The app will automatically detect localStorage data and offer to migrate it to Supabase on first login.

### 5.2 Manual Migration (if needed)
If you have existing demo data, you can run:
```javascript
// In browser console after logging in
await supabaseDataService.migrateFromLocalStorage();
```

## Step 6: Testing the Setup

### 6.1 Login Test
1. Start your development server: `npm run dev`
2. Navigate to the app
3. You should see a login form
4. Login with admin credentials
5. Verify you can see the dashboard

### 6.2 Real-time Test
1. Open the app in two browser windows
2. Login with the same account in both
3. Create a patient in one window
4. Verify it appears in the other window immediately

### 6.3 Permission Test
1. Create additional users with different roles
2. Test that permissions work correctly
3. Verify clinic isolation works

## Step 7: Production Considerations

### 7.1 Security Checklist
- [ ] Change default admin password
- [ ] Review RLS policies
- [ ] Enable 2FA for admin accounts
- [ ] Set up backup procedures
- [ ] Configure audit log retention

### 7.2 Performance Optimization
- [ ] Add database indexes for large datasets
- [ ] Configure connection pooling
- [ ] Set up CDN for file attachments
- [ ] Monitor query performance

### 7.3 HIPAA Compliance (if required)
- [ ] Request Business Associate Agreement from Supabase
- [ ] Enable additional encryption
- [ ] Set up audit log monitoring
- [ ] Configure data retention policies

## Troubleshooting

### Common Issues

**1. RLS Policy Errors**
```
Error: new row violates row-level security policy
```
**Solution**: Check that user profile exists and has correct clinic_id.

**2. Authentication Errors**
```
Error: Invalid login credentials
```
**Solution**: Verify user exists in auth.users and user_profiles tables.

**3. Real-time Not Working**
```
No real-time updates
```
**Solution**: Check that RLS policies allow SELECT on tables for the user.

### Debug Queries

**Check User Profile:**
```sql
SELECT * FROM user_profiles WHERE email = 'admin@democlinic.com';
```

**Check Clinic Access:**
```sql
SELECT p.*, c.name as clinic_name 
FROM patients p 
JOIN clinics c ON p.clinic_id = c.id 
WHERE p.clinic_id = '00000000-0000-0000-0000-000000000001';
```

**Check Audit Logs:**
```sql
SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 10;
```

## Support

If you encounter issues:
1. Check the browser console for errors
2. Verify database schema is correctly applied
3. Ensure RLS policies are active
4. Test with a fresh user account

Your Supabase integration is now ready for multi-user, real-time IVF EMR functionality! 🎉
