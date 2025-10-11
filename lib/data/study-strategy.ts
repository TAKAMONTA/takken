// 学習戦略データ（2025年版）
// 目的: 分野ごとの目標点・優先順位、頻出テーマ、勉強法、重要改正、迷った時の対処法を構造化して提供し、ページ/クイズで再利用可能にする

import { StudyTip } from '@/lib/types/quiz';

export type DomainId = 'takkengyouhou' | 'hourei' | 'zeihou' | 'minpou';

export interface PriorityItem {
  id: DomainId;
  name: string;
  priority: 1 | 2 | 3 | 4;
  targetScoreLabel: string; // 表示用 e.g. "18〜20点"
  rationale: string;        // その優先度の理由/戦略上の位置づけ
}

export interface DomainStrategy {
  id: DomainId;
  name: string;
  frequentThemes: string[];   // 必ず出る問題・頻出テーマ
  studyMethods: string[];     // 分野別勉強法の要点
  notes?: string[];           // 追加の注記(ケアレスミス/個数問題 等)
  // クイズ画面に差し込む短い学習チップ（StudyTipDisplay用）
  studyTips: StudyTip[];
}

export interface LawRevision {
  title: string;
  description: string;
}

export interface UnknownQuestionTactic {
  title: string;
  description: string;
  icon?: string;
}

export interface StudyStrategyData {
  revisionYear: number;
  recommendedOrderNote: string;
  priorities: PriorityItem[];
  domains: Record<DomainId, DomainStrategy>;
  revisions: LawRevision[];
  unknownQuestionTactics: UnknownQuestionTactic[];
}

export const studyStrategy2025: StudyStrategyData = {
  revisionYear: 2025,
  recommendedOrderNote:
    '学習の優先順位は一般的に「宅建業法」→「法令上の制限」→「税・その他」→「権利関係」。ただし個人差やダブル受験等を踏まえて調整。',
  priorities: [
    {
      id: 'takkengyouhou',
      name: '宅建業法',
      priority: 1,
      targetScoreLabel: '18〜20点（ほぼ満点）',
      rationale:
        '最も出題数が多く比較的取りやすい。ここで高得点を確保し、他分野の取りこぼしを補う。暗記中心で努力が直接得点に繋がりやすい。',
    },
    {
      id: 'hourei',
      name: '法令上の制限',
      priority: 2,
      targetScoreLabel: '5点',
      rationale:
        '暗記項目が多いが過去問から繰り返し出題。原則と例外の型で押さえると効率的。',
    },
    {
      id: 'zeihou',
      name: '税・その他',
      priority: 3,
      targetScoreLabel: '7〜8点',
      rationale:
        '範囲が狭く満点を狙いやすい。出題サイクルがあり、頻出テーマを確実に仕上げる。',
    },
    {
      id: 'minpou',
      name: '権利関係（民法等）',
      priority: 4,
      targetScoreLabel: '7〜8点',
      rationale:
        '範囲が広く難易度が高い。捨て問戦略も視野に入れ、優先度の高いテーマに絞って効率学習。',
    },
  ],
  domains: {
    takkengyouhou: {
      id: 'takkengyouhou',
      name: '宅建業法',
      frequentThemes: [
        '宅建業の免許',
        '広告・契約締結時期',
        '媒介契約の規制',
        '重要事項説明（35条書面）',
        '37条書面（契約書面）',
        '自ら売主制限（8種制限）',
        '報酬',
        '業務上の規制（禁止事項・義務）',
        '住宅瑕疵担保履行法',
        '宅建士',
        '営業保証金',
        '弁済業務保証金',
      ],
      studyMethods: [
        'インプット（テキスト・講義）→アウトプット（問題演習）を高速に往復',
        'テキストを読んだら即対応する問題に着手し「覚えたつもり」を排除',
        '映像・音声も併用し、隙間時間で反復記憶',
        '過去問は「解き方」を学ぶガイドとして使い、不明点はすぐ解説で埋める',
        '個数問題が多いため、ケアレスミス対策をルーチン化',
      ],
      notes: [
        '35条・37条は「誰が・いつ・誰に・何を」の比較で整理',
        '自ら売主制限は消費者保護の観点で理解（クーリング・オフ/手付金等の保全は頻出）',
      ],
      studyTips: [
        { type: 'memory', icon: '🧾', content: '35条⇔37条は「誰が/いつ/誰に/何を」で対比暗記。図表化して2分で再現。' },
        { type: 'understanding', icon: '🏠', content: '自ら売主制限は「業者=強者/買主=消費者」の保護目的で条文の趣旨を掴む。' },
        { type: 'application', icon: '🔢', content: '個数問題は選択肢をメモ列挙→消去法→残りの文言の語尾と例外に注意して確定。' },
      ],
    },
    hourei: {
      id: 'hourei',
      name: '法令上の制限',
      frequentThemes: [
        '都市計画の内容・都市計画制限',
        '開発許可の要否・手続・建築制限（毎年級の頻出）',
        '建築確認・単体規定',
        '集団規定',
        '宅地造成等規制法',
        '土地区画整理法',
        '農地法（3条・4条・5条）',
        '国土利用計画法',
      ],
      studyMethods: [
        '「原則と例外」を見出し化して暗記（例外は出題者の好物）',
        '用語定義と目的を先に押さえて、数字・要件を後から紐付ける',
        '区域/許可/手続フローを図解で固定化',
      ],
      notes: ['開発許可は要否→手続→建築制限の順に一気通貫で覚えると得点が安定。'],
      studyTips: [
        { type: 'memory', icon: '📐', content: '原則→例外の対で暗記カード化。例外に線を引き、テスト前3分で確認。' },
        { type: 'understanding', icon: '🗺️', content: '区域/許可/建築制限は「誰が・どこで・いつ・何を」の軸で因果関係を把握。' },
        { type: 'application', icon: '🔁', content: '過去問の言い換えパターンに慣れる。数字と用語を入れ替えた引っかけに注意。' },
      ],
    },
    zeihou: {
      id: 'zeihou',
      name: '税・その他',
      frequentThemes: [
        '住宅金融支援機構（ほぼ毎年）',
        '公正競争規約（ほぼ毎年）',
        '土地・建物に関する統計（ほぼ毎年）',
        '不動産取得税（特例と数字）',
        '固定資産税（例外・特例・数字）',
        '地価公示法（公示の手続と意義）',
        '5問免除科目（登録講習）',
        '統計（問48）：前年比などトレンド把握',
      ],
      studyMethods: [
        '学習範囲が狭いため全項目を網羅して満点狙い',
        '過去問反復で問われ方の型に慣れる（数字/％/㎡/月など）',
      ],
      notes: ['統計は「数値の大小」より「前年比の増減トレンド」を優先して読む。'],
      studyTips: [
        { type: 'memory', icon: '🔢', content: '特例の数字は「根拠→数字→適用条件」の三点セットで丸暗記。' },
        { type: 'understanding', icon: '📈', content: '統計問題は用語の定義とデータの意味（増減の理由）を把握。' },
        { type: 'application', icon: '🧮', content: '計算問題はテンプレ手順を固定化。設問で指定された例外・特例の適用漏れに注意。' },
      ],
    },
    minpou: {
      id: 'minpou',
      name: '権利関係（民法等）',
      frequentThemes: [
        '相続',
        '賃貸借・使用貸借',
        '意思表示',
        '代理・無権代理',
        '時効',
        '売主の担保責任（契約不適合）',
        '不法行為',
        '抵当権・根抵当権',
        '制限行為能力者',
        '弁済・相殺・対抗要件',
        '債務不履行・解除・手付',
        '共有',
        '特別法：借地法/借家法/区分所有法/不動産登記法',
      ],
      studyMethods: [
        '「深入りするな」の真意＝テキスト外の難問は切る勇気',
        '法律用語を平易に言い換えて意味理解（善意/悪意、契約不適合等）',
        '原則と例外、要件と効果のフレームで条文を読む',
        '本人と第三者の関係（保護対象）を常に意識',
        '接続詞（したがって/なぜなら 等）に注目して趣旨を掴む',
        '図示で事実関係を整理',
      ],
      notes: ['配点効率の高い論点から順に仕上げ、捨て問を予め決めておく。'],
      studyTips: [
        { type: 'understanding', icon: '🧭', content: '要件→効果の流れに矢印を引く。第三者保護の軸で読み解くと混乱が減る。' },
        { type: 'memory', icon: '🧠', content: '用語は日常語に置換して暗記。例：悪意=知っている/善意=知らない。' },
        { type: 'application', icon: '📝', content: '長文は主語/述語/接続詞でスライス。登場人物の関係図を2行でメモ。' },
      ],
    },
  },
  revisions: [
    {
      title: '相続登記義務化',
      description:
        '相続により所有権を取得した相続人は、相続開始と取得を知った日から3年以内に相続登記の申請義務。怠ると過料の可能性。',
    },
    {
      title: '配偶者居住権・配偶者短期居住権',
      description:
        '残された配偶者の居住継続を可能にする権利。配偶者居住権は存続期間を明確化（延長・更新不可）。短期居住権は未出題。',
    },
    {
      title: '宅建業法の改正',
      description:
        '従業者名簿・宅建業者名簿・標識の記載事項、媒介契約における指定流通機構への登録事項、国土交通大臣免許業者の申請先等が変更。',
    },
    {
      title: '空き家等の報酬特例の変更',
      description:
        '売買価格800万円以下の空き家等について、業者が受領できる報酬額の上限が変更。',
    },
    {
      title: '建築確認対象建築物の規模見直し',
      description:
        '木造・非木造の要件が統一。都市計画区域外での階数や延べ面積による建築確認の要否が変更。',
    },
  ],
  unknownQuestionTactics: [
    {
      title: 'ハートで解く（民法で有効）',
      description:
        '国語力・常識・価値観で選択肢の不自然さを見抜く。断定の強さ/文脈の整合性に注目し推測。',
      icon: '❤️',
    },
    {
      title: '消去法',
      description:
        '全肢の正誤が判断できなくても、誤りを確実に削って正解に近づく。根拠の弱い肢から除外。',
      icon: '🧹',
    },
    {
      title: '肢切りテクニック',
      description:
        '「必ず/常に/すべて/〜に限り」等の断定表現は誤りが多く、「場合がある/余地がある」は正解寄りの傾向。',
      icon: '✂️',
    },
    {
      title: '選択肢分布のバランス確認',
      description:
        '全体の正解番号が極端に偏らない傾向。時間が余れば分布を確認し、少ない番号を選ぶのは最終手段として有効。',
      icon: '⚖️',
    },
    {
      title: '最終手段は「3」',
      description:
        '歴年傾向では正解肢「3」がわずかに多い。迷い切ったら一貫して「3」にマーク（あくまで最後の手段）。',
      icon: '3️⃣',
    },
  ],
};

// クイズ出題分野に応じた学習チップを返すヘルパー
export function getStudyTipsByDomain(domain: DomainId): StudyTip[] {
  return studyStrategy2025.domains[domain]?.studyTips ?? [];
}

// 頻出テーマ（短文チップ用の文字列配列）を返すヘルパー
export function getFrequentThemes(domain: DomainId): string[] {
  return studyStrategy2025.domains[domain]?.frequentThemes ?? [];
}
