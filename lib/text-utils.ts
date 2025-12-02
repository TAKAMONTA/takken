// テキスト処理ユーティリティ
import DOMPurify from 'dompurify';

/**
 * 解説文を読みやすく改行処理する関数
 * @param text - 処理対象のテキスト
 * @returns 改行処理されたテキスト
 */
export function formatExplanationText(text: string): string {
  if (!text || typeof text !== 'string') return '';

  // 既存の改行を正規化
  let formattedText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
  // 正規化後の値がundefined/nullの場合の防御
  if (!formattedText || typeof formattedText !== 'string') {
    return '';
  }

  // 【】で囲まれた見出しの前後に改行を追加
  formattedText = formattedText.replace(/【([^】]+)】/g, '\n\n【$1】\n');

  // 句読点の後で適切に改行（ただし、既に改行がある場合は除く）
  formattedText = formattedText.replace(/([。！？])([^。！？\n])/g, '$1\n$2');

  // 「です。」「ます。」の後で改行
  formattedText = formattedText.replace(/(です|ます)。([^\n])/g, '$1。\n$2');

  // 箇条書きの前に改行を追加
  formattedText = formattedText.replace(/([^\n])(\d+\.\s)/g, '$1\n$2');
  formattedText = formattedText.replace(/([^\n])(-\s)/g, '$1\n$2');
  formattedText = formattedText.replace(/([^\n])(・\s)/g, '$1\n$2');

  // 法令名や条文の前後で改行
  formattedText = formattedText.replace(/([^\n])(宅建業法第\d+条)/g, '$1\n$2');
  formattedText = formattedText.replace(/([^\n])(民法第\d+条)/g, '$1\n$2');
  formattedText = formattedText.replace(/([^\n])(建築基準法第\d+条)/g, '$1\n$2');

  // 連続する改行を整理（3つ以上の改行を2つに）
  formattedText = formattedText.replace(/\n{3,}/g, '\n\n');

  // 先頭と末尾の余分な改行を削除
  formattedText = formattedText.trim();

  return formattedText;
}

/**
 * 問題文を読みやすく改行処理する関数
 * @param text - 処理対象のテキスト
 * @returns 改行処理されたテキスト
 */
export function formatQuestionText(text: string): string {
  if (!text || typeof text !== 'string') return '';

  let formattedText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // 長い文章を適切な位置で改行（60文字程度で）
  if (!formattedText || typeof formattedText !== 'string') {
    return '';
  }
  
  const lines = formattedText.split('\n');
  const processedLines = lines.map(line => {
    if (!line || typeof line !== 'string' || line.length <= 60) return line;

    // 句読点で区切って改行
    return line.replace(/([。、])([^。、]{20,})/g, '$1\n$2');
  });

  return processedLines.join('\n').trim();
}

/**
 * テキストを段落に分割する関数
 * @param text - 処理対象のテキスト
 * @returns 段落の配列
 */
export function splitIntoParagraphs(text: string): string[] {
  if (!text) return [];

  const formattedText = formatExplanationText(text);
  
  // formatExplanationTextの結果がundefined/nullの場合の防御
  if (!formattedText || typeof formattedText !== 'string') {
    return [];
  }
  
  // 【】見出しで分割
  const sections = formattedText.split(/\n\n(?=【)/);
  
  return sections.filter(section => section.trim().length > 0);
}

/**
 * 見出しを抽出する関数
 * @param text - 処理対象のテキスト
 * @returns 見出しの配列
 */
export function extractHeadings(text: string): string[] {
  if (!text) return [];

  const headingMatches = text.match(/【([^】]+)】/g);
  return headingMatches ? headingMatches.map(match => match.replace(/【|】/g, '')) : [];
}

/**
 * 重要なキーワードを強調するためのマークアップを追加する関数
 * @param text - 処理対象のテキスト
 * @returns マークアップされたテキスト
 */
export function highlightKeywords(text: string): string {
  if (!text) return '';

  // 法令名を強調
  let highlighted = text.replace(/(宅建業法|民法|建築基準法|都市計画法|農地法)第?\d*条?/g, '<strong class="text-blue-600">$1</strong>');

  // 重要な数字を強調
  highlighted = highlighted.replace(/(\d+%|\d+万円|\d+年|\d+日|\d+か月)/g, '<strong class="text-red-600">$1</strong>');

  // 重要な用語を強調
  const importantTerms = [
    '宅地建物取引士', '重要事項説明', '営業保証金', '媒介契約', 'クーリング・オフ',
    '手付金', '報酬', '免許', '登録', '専任', '業務停止', '免許取消'
  ];

  importantTerms.forEach(term => {
    const regex = new RegExp(`(${term})`, 'g');
    highlighted = highlighted.replace(regex, '<strong class="text-purple-600">$1</strong>');
  });

  return highlighted;
}

/**
 * HTMLコンテンツをサニタイズする関数（XSS対策）
 * @param html - サニタイズ対象のHTML文字列
 * @returns サニタイズされたHTML文字列
 */
export function sanitizeHtml(html: string): string {
  if (!html) return '';

  // DOMPurifyを使用してXSS攻撃を防ぐ
  // 許可するタグと属性を指定
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['strong', 'em', 'br', 'p', 'span', 'div'],
    ALLOWED_ATTR: ['class'],
    KEEP_CONTENT: true,
  });
}

/**
 * キーワードをハイライトし、安全にサニタイズする関数
 * @param text - 処理対象のテキスト
 * @returns サニタイズされたマークアップテキスト
 */
export function highlightAndSanitize(text: string): string {
  if (!text) return '';

  const highlighted = highlightKeywords(text);
  return sanitizeHtml(highlighted);
}
