# GitHubリポジトリ作成 - クイックスタート

## 🚀 5分で完了！

### ステップ1: GitHubでリポジトリ作成（2分）

1. **https://github.com にアクセス**
2. **右上の「+」→「New repository」**
3. **設定**:
   - Repository name: `takken`
   - Visibility: **Public**（またはPrivate）
   - **すべてのチェックボックスを外す**（README、.gitignore、license）
4. **「Create repository」をクリック**
5. **表示されたURLをコピー**（例: `https://github.com/your-username/takken.git`）

---

### ステップ2: ローカルプロジェクトをプッシュ（3分）

プロジェクトのディレクトリでPowerShellを開き、以下を実行：

```powershell
# 1. 現在のディレクトリに移動
cd C:\Users\tnaka\takken

# 2. Gitが初期化されているか確認（.gitフォルダがある場合はスキップ）
git init

# 3. リモートリポジトリを追加（your-usernameを実際のユーザー名に置き換え）
git remote add origin https://github.com/your-username/takken.git

# 4. すべてのファイルを追加
git add .

# 5. 初回コミット
git commit -m "Initial commit: 宅建合格ロードアプリ"

# 6. GitHubにプッシュ
git branch -M main
git push -u origin main
```

---

### ⚠️ 認証が必要な場合

`git push`で認証が求められたら：

1. **Personal Access Tokenを作成**:
   - GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
   - 「Generate new token (classic)」
   - Note: `takken-project`
   - Select scopes: `repo`にチェック
   - 「Generate token」→ **トークンをコピー**

2. **プッシュ時に使用**:
   - Username: あなたのGitHubユーザー名
   - Password: コピーしたPersonal Access Token

---

### ✅ 確認

https://github.com/your-username/takken にアクセスして、ファイルが表示されているか確認してください。

**重要**: `.env.local`が表示されていないことを確認（機密情報保護）

---

## 🎯 次のステップ

GitHubリポジトリが作成できたら、Vercelにデプロイできます！

詳細は `GITHUB_SETUP_GUIDE.md` を参照してください。














