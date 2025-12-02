/**
 * 音声フィードバックユーティリティ
 * Web Audio API を使用してシンプルな効果音を生成
 */

import { logger } from './logger';

class SoundEffects {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;

  constructor() {
    // ブラウザ環境でのみ初期化
    if (typeof window !== "undefined") {
      try {
        this.audioContext = new (window.AudioContext ||
          (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)();
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.warn("Web Audio API not supported", {
          errorName: err.name,
          errorMessage: err.message,
          errorStack: err.stack,
        });
        this.enabled = false;
      }
    }
  }

  /**
   * 音声を有効/無効にする
   */
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (typeof window !== "undefined") {
      localStorage.setItem("soundEffectsEnabled", enabled.toString());
    }
  }

  /**
   * 音声が有効かどうか
   */
  isEnabled(): boolean {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("soundEffectsEnabled");
      if (saved !== null) {
        return saved === "true";
      }
    }
    return this.enabled;
  }

  /**
   * 正解音を再生
   */
  playCorrect(streak: number = 0) {
    if (!this.enabled || !this.isEnabled() || !this.audioContext) return;

    const ctx = this.audioContext;
    const now = ctx.currentTime;

    // 連続正解数に応じて音を変化
    const frequencies =
      streak >= 5
        ? [523.25, 659.25, 783.99] // C5, E5, G5 (華やか)
        : streak >= 3
        ? [440, 554.37, 659.25] // A4, C#5, E5 (明るい)
        : [523.25, 659.25]; // C5, E5 (シンプル)

    frequencies.forEach((freq, index) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = freq;
      oscillator.type = "sine";

      const startTime = now + index * 0.1;
      gainNode.gain.setValueAtTime(0.3, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);

      oscillator.start(startTime);
      oscillator.stop(startTime + 0.3);
    });
  }

  /**
   * 不正解音を再生
   */
  playIncorrect() {
    if (!this.enabled || !this.isEnabled() || !this.audioContext) return;

    const ctx = this.audioContext;
    const now = ctx.currentTime;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    // 下降音
    oscillator.frequency.setValueAtTime(300, now);
    oscillator.frequency.exponentialRampToValueAtTime(150, now + 0.2);
    oscillator.type = "sine";

    gainNode.gain.setValueAtTime(0.2, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    oscillator.start(now);
    oscillator.stop(now + 0.2);
  }

  /**
   * クリック音を再生
   */
  playClick() {
    if (!this.enabled || !this.isEnabled() || !this.audioContext) return;

    const ctx = this.audioContext;
    const now = ctx.currentTime;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = 800;
    oscillator.type = "sine";

    gainNode.gain.setValueAtTime(0.1, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

    oscillator.start(now);
    oscillator.stop(now + 0.05);
  }

  /**
   * 完了音を再生（クイズ完了時）
   */
  playComplete() {
    if (!this.enabled || !this.isEnabled() || !this.audioContext) return;

    const ctx = this.audioContext;
    const now = ctx.currentTime;

    // ファンファーレ風
    const melody = [
      { freq: 523.25, time: 0 }, // C5
      { freq: 659.25, time: 0.15 }, // E5
      { freq: 783.99, time: 0.3 }, // G5
      { freq: 1046.5, time: 0.45 }, // C6
    ];

    melody.forEach(({ freq, time }) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = freq;
      oscillator.type = "triangle";

      const startTime = now + time;
      gainNode.gain.setValueAtTime(0.25, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);

      oscillator.start(startTime);
      oscillator.stop(startTime + 0.4);
    });
  }

  /**
   * 苦手克服音を再生
   */
  playWeakPointConquered() {
    if (!this.enabled || !this.isEnabled() || !this.audioContext) return;

    const ctx = this.audioContext;
    const now = ctx.currentTime;

    // 上昇音階で達成感を演出
    const notes = [261.63, 329.63, 392.0, 523.25]; // C4, E4, G4, C5

    notes.forEach((freq, index) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = freq;
      oscillator.type = "sine";

      const startTime = now + index * 0.12;
      gainNode.gain.setValueAtTime(0.2, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);

      oscillator.start(startTime);
      oscillator.stop(startTime + 0.3);
    });
  }
}

// シングルトンインスタンス
export const soundEffects = new SoundEffects();
