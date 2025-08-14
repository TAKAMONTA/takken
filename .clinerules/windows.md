# Windows環境での開発

このプロジェクトはWindows環境で開発されています。以下の点に注意してください：

1. コマンド実行時の注意点
   - PowerShellでは`&&`による複数コマンドの連結は使用できません
   - `rmdir`の代わりに`Remove-Item -Recurse -Force`を使用します
   - パスの区切り文字はバックスラッシュ`\`を使用します

2. 開発環境
   - Windows 11
   - PowerShell
   - Node.js
   - Visual Studio Code
