# 🚀 Production Deployment Checklist

## Pre-Deployment
- [ ] Run `node scripts/clear-demo-data.js` to clear demo data
- [ ] Set up AI API keys (Gemini, Groq, or OpenRouter)
- [ ] Configure clinic settings in Configuration panel
- [ ] Test AI functionality with real data
- [ ] Verify all user roles and permissions
- [ ] Test patient onboarding workflow

## Environment Variables (Netlify)
- [ ] GEMINI_API_KEY (recommended)
- [ ] GROQ_API_KEY (recommended backup)
- [ ] DEMO_MODE=false
- [ ] CLINIC_NAME=Your Clinic Name

## Post-Deployment
- [ ] Create first real patient record
- [ ] Configure staff accounts and roles
- [ ] Set up clinic-specific protocols
- [ ] Train staff on system usage
- [ ] Set up data backup procedures

## Security Checklist
- [ ] Verify HTTPS is enabled
- [ ] Test user authentication
- [ ] Verify data encryption
- [ ] Set up access logging
- [ ] Configure session timeouts

## Compliance Checklist
- [ ] HIPAA compliance verification
- [ ] Data retention policies configured
- [ ] Audit trail functionality tested
- [ ] Patient consent forms updated
- [ ] Staff training documentation

## Support & Maintenance
- [ ] Set up monitoring and alerts
- [ ] Configure automated backups
- [ ] Document emergency procedures
- [ ] Set up support contact information
- [ ] Schedule regular system updates
