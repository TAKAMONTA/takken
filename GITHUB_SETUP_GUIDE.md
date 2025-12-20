# GitHubリポジトリ作成ガイド

## 📋 事前準備

- [ ] GitHubアカウントを持っている
- [ ] Gitがインストールされている（確認: `git --version`）
- [ ] プロジェクトがローカルに存在する

---

## 🚀 ステップ1: GitHubでリポジトリを作成

### 1-1. GitHubにアクセス

1. https://github.com にアクセス
2. ログイン（まだアカウントがない場合は作成）

### 1-2. 新しいリポジトリを作成

1. **右上の「+」ボタン**をクリック
2. **「New repository」**を選択

### 1-3. リポジトリ設定

以下の設定を入力：

- **Repository name**: `takken`（または任意の名前）
- **Description**: `宅建合格ロード - 宅建試験対策学習アプリ`（オプション）
- **Visibility**: 
  - **Public**（公開、無料）
  - **Private**（非公開、有料プランが必要な場合あり）
- **Initialize this repository with**:
  - ❌ **Add a README file**（チェックを外す - 既存のプロジェクトなので）
  - ❌ **Add .gitignore**（チェックを外す - 既に.gitignoreがある）
  - ❌ **Choose a license**（チェックを外す）

### 1-4. リポジトリ作成

**「Create repository」**をクリック

### 1-5. 表示される画面を確認

リポジトリが作成されると、以下のような画面が表示されます：
- 「Quick setup」セクションに、リモートリポジトリのURLが表示されます
- 例: `https://github.com/your-username/takken.git`

**このURLをコピーしておいてください！**

---

## 📦 ステップ2: ローカルプロジェクトをGitHubにプッシュ

### 2-1. ターミナルを開く

プロジェクトのディレクトリ（`C:\Users\tnaka\takken`）でターミナルを開きます。

### 2-2. Gitの初期化（まだの場合）

```powershell
# 現在のディレクトリを確認
cd C:\Users\tnaka\takken

# Gitが既に初期化されているか確認
# .gitフォルダがある場合はスキップ
git init
```

### 2-3. リモートリポジトリを追加

```powershell
# GitHubで作成したリポジトリのURLを追加
# your-username を実際のGitHubユーザー名に置き換えてください
git remote add origin https://github.com/your-username/takken.git

# リモートが正しく設定されたか確認
git remote -v
```

### 2-4. ファイルをステージング

```powershell
# すべてのファイルを追加（.gitignoreで除外されるファイルは自動的に除外されます）
git add .
```

### 2-5. 初回コミット

```powershell
# コミットメッセージを付けてコミット
git commit -m "Initial commit: 宅建合格ロードアプリ"
```

### 2-6. GitHubにプッシュ

```powershell
# mainブランチにプッシュ
git branch -M main
git push -u origin main
```

**注意**: 初回プッシュ時、GitHubの認証が求められる場合があります：
- **Personal Access Token**が必要な場合があります
- または、GitHub Desktopなどのアプリを使用することもできます

---

## 🔐 ステップ3: GitHub認証（必要な場合）

### 3-1. Personal Access Tokenの作成

GitHubがパスワード認証を廃止したため、Personal Access Tokenが必要です：

1. **GitHub** → **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
2. **「Generate new token」** → **「Generate new token (classic)」**
3. **Note**: `takken-project`（任意の名前）
4. **Expiration**: 適切な期間を選択（例: 90 days）
5. **Select scopes**: `repo`にチェック
6. **「Generate token」**をクリック
7. **トークンをコピー**（後で表示されないので注意！）

### 3-2. プッシュ時にトークンを使用

```powershell
# プッシュ時にユーザー名とトークンを入力
# Username: あなたのGitHubユーザー名
# Password: コピーしたPersonal Access Token
git push -u origin main
```

---

## ✅ ステップ4: プッシュの確認

### 4-1. GitHubで確認

1. https://github.com/your-username/takken にアクセス
2. ファイルが表示されているか確認
3. `.env.local`が表示されていないことを確認（`.gitignore`で除外されているはず）

### 4-2. 確認ポイント

- ✅ プロジェクトファイルが表示されている
- ✅ `.env.local`が表示されていない（機密情報保護）
- ✅ `node_modules`が表示されていない
- ✅ `.next`フォルダが表示されていない

---

## 🔄 今後の作業フロー

### 変更をプッシュする場合

```powershell
# 変更をステージング
git add .

# コミット
git commit -m "変更内容の説明"

# GitHubにプッシュ
git push
```

### 最新の変更を取得する場合

```powershell
# リモートの変更を取得
git pull
```

---

## ❓ トラブルシューティング

### 問題1: `git push`で認証エラー

**解決方法**:
- Personal Access Tokenを作成して使用
- または、GitHub Desktopなどのアプリを使用

### 問題2: `.env.local`がプッシュされてしまった

**解決方法**:
1. `.gitignore`に`.env.local`が含まれているか確認
2. 既にプッシュしてしまった場合：
   ```powershell
   # Git履歴から削除（GitHubからも削除）
   git rm --cached .env.local
   git commit -m "Remove .env.local from repository"
   git push
   ```

### 問題3: リモートリポジトリのURLが間違っている

**解決方法**:
```powershell
# 現在のリモートを確認
git remote -v

# リモートを削除
git remote remove origin

# 正しいURLで再追加
git remote add origin https://github.com/your-username/takken.git
```

---

## 📝 チェックリスト

- [ ] GitHubアカウントを作成/ログインした
- [ ] リポジトリを作成した
- [ ] リモートリポジトリのURLをコピーした
- [ ] ローカルで`git init`を実行した（必要な場合）
- [ ] リモートリポジトリを追加した
- [ ] ファイルをコミットした
- [ ] GitHubにプッシュした
- [ ] GitHubでファイルが表示されることを確認した
- [ ] `.env.local`が表示されていないことを確認した

---

## 🎯 次のステップ

GitHubリポジトリが作成できたら、次は：

1. **Vercelにプロジェクトをインポート**
   - Vercelダッシュボードで「Add New...」→「Project」
   - GitHubリポジトリから`takken`を選択

2. **環境変数を設定**
   - Vercelの「Environment Variables」に`.env.local`の値を設定

3. **デプロイ実行**
   - 「Deploy」ボタンをクリック

詳細は `VERCEL_QUICK_START.md` を参照してください。

---

**完了です！** 🎉

GitHubリポジトリが作成できたら、Vercelへのデプロイに進めます。















