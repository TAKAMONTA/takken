import CryptoJS from "crypto-js";

// 暗号化キー（本番環境では環境変数から取得すべき）
const ENCRYPTION_KEY =
  process.env.NEXT_PUBLIC_ENCRYPTION_KEY || "takken-rpg-default-key-2024";

/**
 * パスワードを暗号化する
 * @param password 平文パスワード
 * @returns 暗号化されたパスワード
 */
export function encryptPassword(password: string): string {
  try {
    const encrypted = CryptoJS.AES.encrypt(password, ENCRYPTION_KEY).toString();
    return encrypted;
  } catch (error) {
    console.error("Password encryption error:", error);
    throw new Error("パスワードの暗号化に失敗しました");
  }
}

/**
 * 暗号化されたパスワードを復号化する
 * @param encryptedPassword 暗号化されたパスワード
 * @returns 平文パスワード
 */
export function decryptPassword(encryptedPassword: string): string {
  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedPassword, ENCRYPTION_KEY);
    const password = decrypted.toString(CryptoJS.enc.Utf8);

    if (!password) {
      throw new Error("Invalid encrypted password");
    }

    return password;
  } catch (error) {
    console.error("Password decryption error:", error);
    throw new Error("パスワードの復号化に失敗しました");
  }
}

/**
 * パスワードのハッシュ化（検証用）
 * @param password 平文パスワード
 * @returns ハッシュ化されたパスワード
 */
export function hashPassword(password: string): string {
  try {
    const hash = CryptoJS.SHA256(password + ENCRYPTION_KEY).toString();
    return hash;
  } catch (error) {
    console.error("Password hashing error:", error);
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
    console.error("Password verification error:", error);
    return false;
  }
}
