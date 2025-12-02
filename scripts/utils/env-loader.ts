import * as fs from 'fs';
import * as path from 'path';

/**
 * 環境変数を確実に読み込むためのユーティリティ
 * dotenvライブラリを使用せず、fsで直接読み込んでパースする
 */
export function loadEnv(): void {
  const envPath = path.join(__dirname, '../../.env.local');

  try {
    if (fs.existsSync(envPath)) {
      console.log(`Loading .env.local from: ${envPath}`);
      const envContent = fs.readFileSync(envPath, 'utf-8');

      const lines = envContent.split('\n');
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine || trimmedLine.startsWith('#')) continue;

        const match = trimmedLine.match(/^([^=]+)=(.*)$/);
        if (match) {
          const key = match[1].trim();
          let value = match[2].trim();

          // クォートの除去
          if ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
          }

          if (!process.env[key]) {
            process.env[key] = value;
          }
        }
      }
      console.log('Environment variables loaded manually.');
    } else {
      console.error(`Error: .env.local not found at ${envPath}`);
    }
  } catch (error) {
    console.error('Error manually parsing .env.local:', error);
  }
}
