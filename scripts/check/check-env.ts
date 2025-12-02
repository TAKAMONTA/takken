import { loadEnv } from '../utils/env-loader';

console.log('--- Environment Variable Check ---');
loadEnv();

const googleKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
const openaiKey = process.env.OPENAI_API_KEY;

console.log('NEXT_PUBLIC_GOOGLE_API_KEY:', googleKey ? 'Set (Length: ' + googleKey.length + ')' : 'NOT SET');
console.log('OPENAI_API_KEY:', openaiKey ? 'Set (Length: ' + openaiKey.length + ')' : 'NOT SET');

if (googleKey) {
    console.log('✅ Environment variables loaded successfully.');
    process.exit(0);
} else {
    console.error('❌ Failed to load environment variables.');
    process.exit(1);
}
