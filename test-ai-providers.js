// Simple test script to verify AI provider configuration
// Run with: node test-ai-providers.js

console.log('🧪 Testing AI Provider Configuration...\n');

// Check environment variables
const providers = [
  { name: 'Gemini', key: process.env.GEMINI_API_KEY || process.env.API_KEY },
  { name: 'OpenRouter', key: process.env.OPENROUTER_API_KEY },
  { name: 'Groq', key: process.env.GROQ_API_KEY }
];

let configuredCount = 0;

providers.forEach(provider => {
  const isConfigured = !!provider.key;
  const status = isConfigured ? '✅ Configured' : '❌ Not configured';
  const keyPreview = isConfigured ? `(${provider.key.substring(0, 8)}...)` : '';
  
  console.log(`${provider.name}: ${status} ${keyPreview}`);
  
  if (isConfigured) configuredCount++;
});

console.log(`\n📊 Summary: ${configuredCount}/${providers.length} providers configured`);

if (configuredCount === 0) {
  console.log('\n⚠️  No AI providers configured!');
  console.log('Please set up at least one API key in your .env file:');
  console.log('- GEMINI_API_KEY for Google Gemini');
  console.log('- OPENROUTER_API_KEY for OpenRouter/DeepSeek');
  console.log('- GROQ_API_KEY for Groq');
  console.log('\nSee .env.example for the template.');
} else {
  console.log('\n🎉 AI functionality should work with automatic fallback!');
  console.log('The system will try providers in order: Gemini → OpenRouter → Groq');
}

console.log('\n💡 To test the application:');
console.log('1. npm run dev (for development)');
console.log('2. npm run preview (for production build)');
