import CryptoJS from "crypto-js";
import { logger } from "./logger";

/**
 * 暗号化キーを取得する（環境変数から）
 * @throws {Error} 暗号化キーが設定されていない場合
 */
function getEncryptionKey(): string {
  const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;

  if (!key) {
    throw new Error(
      "暗号化キーが設定されていません。.env.localファイルにNEXT_PUBLIC_ENCRYPTION_KEYを設定してください。\n" +
      "セキュリティ上の理由から、デフォルトキーは使用できません。"
    );
  }

  // 最低限のキー強度チェック（32文字以上）
  if (key.length < 32) {
    throw new Error(
      "暗号化キーが短すぎます。セキュリティのため、32文字以上のキーを設定してください。"
    );
  }

  return key;
}

/**
 * パスワードを暗号化する
 *
 * ⚠️ 重要: この関数はクライアントサイドで実行されるため、
 * 暗号化されたデータもクライアント側で復号可能です。
 * 本当のセキュリティが必要な場合は、Firebase Authenticationを使用してください。
 *
 * @param password 平文パスワード
 * @returns 暗号化されたパスワード
 */
export function encryptPassword(password: string): string {
  try {
    const key = getEncryptionKey();
    const encrypted = CryptoJS.AES.encrypt(password, key).toString();
    return encrypted;
  } catch (error) {
    if (error instanceof Error) {
      throw error; // 環境変数エラーをそのまま投げる
    }
    throw new Error("パスワードの暗号化に失敗しました");
  }
}

/**
 * 暗号化されたパスワードを復号化する
 *
 * ⚠️ 重要: この関数はクライアントサイドで実行されるため、
 * 暗号化されたデータもクライアント側で復号可能です。
 * 本当のセキュリティが必要な場合は、Firebase Authenticationを使用してください。
 *
 * @param encryptedPassword 暗号化されたパスワード
 * @returns 平文パスワード
 */
export function decryptPassword(encryptedPassword: string): string {
  try {
    const key = getEncryptionKey();
    const decrypted = CryptoJS.AES.decrypt(encryptedPassword, key);
    const password = decrypted.toString(CryptoJS.enc.Utf8);

    if (!password) {
      throw new Error("復号化に失敗しました。データが破損しているか、キーが間違っています。");
    }

    return password;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("パスワードの復号化に失敗しました");
  }
}

/**
 * パスワードのハッシュ化（検証用）
 *
 * ⚠️ 注意: この実装はクライアントサイドのため、真のセキュリティは提供しません。
 * サーバーサイドでの検証には、bcryptやArgon2などの適切なハッシュ関数を使用してください。
 *
 * @param password 平文パスワード
 * @returns ハッシュ化されたパスワード
 */
export function hashPassword(password: string): string {
  try {
    const key = getEncryptionKey();
    const hash = CryptoJS.SHA256(password + key).toString();
    return hash;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("パスワードのハッシュ化に失敗しました");
  }
}

/**
 * パスワードの検証
 * @param password 平文パスワード
 * @param hashedPassword ハッシュ化されたパスワード
 * @returns 一致するかどうか
 */
export function verifyPassword(
  password: string,
  hashedPassword: string
): boolean {
  try {
    const hash = hashPassword(password);
    return hash === hashedPassword;
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error("Password verification error", err);
    return false;
  }
}
