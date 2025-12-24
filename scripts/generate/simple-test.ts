#!/usr/bin/env ts-node

console.log('=== Simple Test ===');
console.log('Node version:', process.version);
console.log('Current directory:', __dirname);

// 環境変数を確認
console.log('\nEnvironment variables:');
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 'Set (****)' : 'Not set');

// dotenvを試す
try {
  const dotenv = require('dotenv');
  const path = require('path');
  const fs = require('fs');
  
  const envPath = path.join(__dirname, '../../.env.local');
  console.log('\n.env.local path:', envPath);
  console.log('.env.local exists:', fs.existsSync(envPath));
  
  if (fs.existsSync(envPath)) {
    const result = dotenv.config({ path: envPath });
    if (result.error) {
      console.log('dotenv error:', result.error);
    } else {
      console.log('dotenv loaded successfully');
      console.log('OPENAI_API_KEY after load:', process.env.OPENAI_API_KEY ? 'Set (****)' : 'Still not set');
    }
  }
} catch (error) {
  console.error('Error:', error);
}

console.log('\n=== Test Complete ===');


