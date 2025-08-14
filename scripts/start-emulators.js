#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Firebaseエミュレーターを起動しています...');

// Firebaseエミュレーターを起動
const emulator = spawn('firebase', ['emulators:start'], {
  stdio: 'inherit',
  shell: true,
  cwd: path.join(__dirname, '..')
});

emulator.on('error', (error) => {
  console.error('❌ エミュレーターの起動に失敗しました:', error.message);
  console.log('💡 Firebase CLIがインストールされているか確認してください: npm install -g firebase-tools');
  process.exit(1);
});

emulator.on('close', (code) => {
  console.log(`✅ エミュレーターが終了しました (コード: ${code})`);
  process.exit(code);
});

// プロセス終了時の処理
process.on('SIGINT', () => {
  console.log('\n🛑 エミュレーターを停止しています...');
  emulator.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 エミュレーターを停止しています...');
  emulator.kill('SIGTERM');
});
