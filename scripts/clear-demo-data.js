#!/usr/bin/env node

/**
 * Production Data Clearing Script
 * 
 * This script clears all demo/mock data and prepares the system for production use.
 * Run this before deploying to a real clinic environment.
 * 
 * Usage: node scripts/clear-demo-data.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧹 Clearing Demo Data for Production Use...\n');

// 1. Clear patient data in ivfDataService.ts
const ivfDataServicePath = path.join(__dirname, '../services/ivfDataService.ts');

console.log('📋 Clearing patient data...');

const ivfDataContent = fs.readFileSync(ivfDataServicePath, 'utf8');

// Replace the mock patients array with an empty array
const clearedIvfData = ivfDataContent.replace(
  /let allPatients: Patient\[\] = \[[\s\S]*?\]\.map\(p => \(\{\.\.\.p, pathway: createPatientPathway\(p\.id, p\.cycleStartDate\)\}\)\);/,
  `// Production mode: Start with empty patient list
// To enable demo data for testing, set DEMO_MODE=true in environment variables
const DEMO_MODE = process.env.DEMO_MODE === 'true' || false;

let allPatients: Patient[] = DEMO_MODE ? [
    // Demo patient for testing - remove in production
    {
        id: 'demo-patient-001',
        name: 'Demo Patient',
        age: 30,
        partnerName: 'Demo Partner',
        protocol: 'Antagonist Protocol',
        cycleStartDate: new Date().toISOString().split('T')[0],
        pathway: [],
    }
].map(p => ({...p, pathway: createPatientPathway(p.id, p.cycleStartDate)})) : [];`
);

fs.writeFileSync(ivfDataServicePath, clearedIvfData);
console.log('✅ Patient data cleared');

// 2. Update patient counter to start from 1
const updatedIvfData = fs.readFileSync(ivfDataServicePath, 'utf8');
const finalIvfData = updatedIvfData.replace(
  /let patientCounter = \d+;/,
  'let patientCounter = 1;'
);
fs.writeFileSync(ivfDataServicePath, finalIvfData);
console.log('✅ Patient counter reset to 1');

// 3. Clear any cached data references
console.log('📊 Clearing analytics demo data...');

// Update quality data service to show empty state
const qualityDataServicePath = path.join(__dirname, '../services/qualityDataService.ts');
if (fs.existsSync(qualityDataServicePath)) {
  const qualityContent = fs.readFileSync(qualityDataServicePath, 'utf8');
  
  // Reset patient counts to 0 for production
  const clearedQualityData = qualityContent
    .replace(/totalPatients: \d+/g, 'totalPatients: 0')
    .replace(/activeCycles: \d+/g, 'activeCycles: 0')
    .replace(/completedCycles: \d+/g, 'completedCycles: 0');
  
  fs.writeFileSync(qualityDataServicePath, clearedQualityData);
  console.log('✅ Quality metrics reset');
}

// 4. Create production environment template
console.log('🔧 Creating production environment template...');

const envProductionTemplate = `# Production Environment Configuration
# Copy this to .env and fill in your actual values

# AI Provider API Keys (at least one required for AI features)
GEMINI_API_KEY=your_gemini_api_key_here
GROQ_API_KEY=your_groq_api_key_here
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Demo Mode (set to false for production)
DEMO_MODE=false

# Clinic Configuration
CLINIC_NAME=Your Clinic Name
CLINIC_TIMEZONE=America/New_York

# Optional: Database Configuration (for future backend integration)
# DATABASE_URL=postgresql://username:password@localhost:5432/ivf_emr
# REDIS_URL=redis://localhost:6379

# Optional: Email/SMS Configuration
# SMTP_SERVER=smtp.your-clinic.com
# SMTP_USER=noreply@your-clinic.com
# SMTP_PASS=your_smtp_password
# TWILIO_SID=your_twilio_sid
# TWILIO_TOKEN=your_twilio_token
`;

fs.writeFileSync(path.join(__dirname, '../.env.production'), envProductionTemplate);
console.log('✅ Production environment template created');

// 5. Create production deployment checklist
const deploymentChecklist = `# 🚀 Production Deployment Checklist

## Pre-Deployment
- [ ] Run \`node scripts/clear-demo-data.js\` to clear demo data
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
`;

fs.writeFileSync(path.join(__dirname, '../PRODUCTION_CHECKLIST.md'), deploymentChecklist);
console.log('✅ Production checklist created');

// 6. Update README with production notes
console.log('📝 Adding production notes to README...');

const readmePath = path.join(__dirname, '../README.md');
const readmeContent = fs.readFileSync(readmePath, 'utf8');

if (!readmeContent.includes('## 🏥 Production Deployment')) {
  const productionSection = `

## 🏥 Production Deployment

### Clearing Demo Data
Before deploying to a real clinic, clear all demo data:
\`\`\`bash
node scripts/clear-demo-data.js
\`\`\`

### Environment Setup
1. Copy \`.env.production\` to \`.env\`
2. Fill in your actual API keys and clinic information
3. Set \`DEMO_MODE=false\`

### First-Time Setup
1. Deploy to Netlify with environment variables
2. Access the system and go to Configuration panel
3. Set up your clinic details, staff, and protocols
4. Create your first real patient record
5. Train staff on system usage

### Data Storage
Currently uses frontend-only storage. For production with multiple users:
- Consider implementing backend database (PostgreSQL recommended)
- Set up automated backups
- Implement user authentication system
- Add audit logging for compliance

See \`PRODUCTION_CHECKLIST.md\` for complete deployment guide.
`;

  const updatedReadme = readmeContent + productionSection;
  fs.writeFileSync(readmePath, updatedReadme);
  console.log('✅ README updated with production notes');
}

console.log('\n🎉 Demo data cleared successfully!');
console.log('\n📋 Next Steps:');
console.log('1. Review .env.production template');
console.log('2. Set DEMO_MODE=false in Netlify environment variables');
console.log('3. Add your AI API keys to Netlify');
console.log('4. Redeploy the application');
console.log('5. Follow PRODUCTION_CHECKLIST.md for complete setup');
console.log('\n✨ Your IVF EMR system is now ready for production use!');
