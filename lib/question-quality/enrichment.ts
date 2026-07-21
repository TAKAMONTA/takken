import { Article, KeyTerm, Question } from "../types/quiz";
import { normalizeTopicKey } from "./grades";

interface TopicEnrichment {
  keyTerms: KeyTerm[];
  relatedArticles: Article[];
}

/** 宅建業法の高頻度テーマ向け学習補助（UIの keyTerms / relatedArticles 用） */
const TAKKEN_TOPIC_ENRICHMENT: Record<string, TopicEnrichment> = {
  宅建士: {
    keyTerms: [
      { term: "宅地建物取引士証", definition: "有効期間は5年。法定講習の受講が更新の要件。" },
      { term: "専任の宅地建物取引士", definition: "事務所ごとに成年者である専任の宅建士を設置。従業員5人に1人以上が目安。" },
    ],
    relatedArticles: [
      {
        law: "宅地建物取引業法",
        article: "第35条",
        content: "重要事項の説明は宅地建物取引士が行う独占業務。",
      },
    ],
  },
  重要事項の説明35条書面: {
    keyTerms: [
      { term: "重要事項説明", definition: "契約成立前に、宅建士が買主・借主等に対し書面を交付して行う説明。" },
      { term: "35条書面", definition: "重要事項説明書。説明は契約成立まで。" },
    ],
    relatedArticles: [
      {
        law: "宅地建物取引業法",
        article: "第35条",
        content: "宅建業者は、契約が成立するまでの間に、宅建士をして重要事項を説明させなければならない。",
      },
    ],
  },
  重要事項説明37条書面: {
    keyTerms: [
      { term: "35条書面", definition: "契約前の重要事項説明書（誰が・いつ・誰に・何を）。" },
      { term: "37条書面", definition: "契約成立後に遅滞なく交付する契約内容書面。" },
    ],
    relatedArticles: [
      {
        law: "宅地建物取引業法",
        article: "第35条",
        content: "重要事項の説明（契約成立前）。",
      },
      {
        law: "宅地建物取引業法",
        article: "第37条",
        content: "契約成立後の書面交付（遅滞なく）。",
      },
    ],
  },
  "37条書面契約書面": {
    keyTerms: [
      { term: "37条書面", definition: "契約成立後、遅滞なく当事者に交付する書面。宅建士の記名が必要。" },
    ],
    relatedArticles: [
      {
        law: "宅地建物取引業法",
        article: "第37条",
        content: "契約が成立したときは、遅滞なく契約内容を記載した書面を交付しなければならない。",
      },
    ],
  },
  自ら売主制限8種制限: {
    keyTerms: [
      { term: "自ら売主制限", definition: "宅建業者が自ら売主となり、買主が業者でない場合に課される8種の制限。" },
      { term: "クーリング・オフ", definition: "事務所等以外の場所で申込み等した場合の無条件解除。" },
    ],
    relatedArticles: [
      {
        law: "宅地建物取引業法",
        article: "第33条の2〜第43条等",
        content: "手付金等の保全、クーリング・オフ、損害賠償額の予定の制限など。",
      },
    ],
  },
  弁済業務保証金: {
    keyTerms: [
      { term: "営業保証金", definition: "主たる事務所1,000万円、その他の事務所ごとに500万円を供託。" },
      { term: "弁済業務保証金分担金", definition: "保証協会加入時。主たる事務所60万円、支店30万円。" },
    ],
    relatedArticles: [
      {
        law: "宅地建物取引業法",
        article: "第25条・保証協会関連",
        content: "営業保証金の供託、保証協会の弁済業務保証金。",
      },
    ],
  },
  媒介代理契約: {
    keyTerms: [
      { term: "専任媒介", definition: "1社のみ依頼。7日以内にレインズ登録、2週間に1回以上報告。" },
      { term: "専属専任媒介", definition: "自己発見取引不可。5日以内にレインズ、1週間に1回以上報告。" },
    ],
    relatedArticles: [
      {
        law: "宅地建物取引業法",
        article: "第34条の2",
        content: "媒介契約の書面交付・登録・報告義務。",
      },
    ],
  },
  広告等に関する規制: {
    keyTerms: [
      { term: "取引態様の明示", definition: "売主・代理・媒介の別を広告時に明示する義務。" },
      { term: "誇大広告", definition: "著しく事実に相違する、又は著しく優良・有利と誤認させる表示の禁止。" },
    ],
    relatedArticles: [
      {
        law: "宅地建物取引業法",
        article: "第32条・第34条",
        content: "誇大広告の禁止、取引態様の明示。",
      },
    ],
  },
  報酬額の制限: {
    keyTerms: [
      { term: "報酬限度額", definition: "国土交通大臣が告示で定める上限を超えて受領できない。" },
    ],
    relatedArticles: [
      {
        law: "宅地建物取引業法",
        article: "第46条",
        content: "報酬の額は国土交通大臣の定めるところによる。",
      },
    ],
  },
  住宅瑕疵担保履行法: {
    keyTerms: [
      { term: "住宅販売瑕疵担保保証金", definition: "新築住宅の売主業者が供託する保証金（または保険加入）。" },
    ],
    relatedArticles: [
      {
        law: "特定住宅瑕疵担保責任の履行の確保等に関する法律",
        article: "関連規定",
        content: "構造耐力上主要な部分等について10年間の担保責任の履行確保。",
      },
    ],
  },
};

function lookupEnrichment(topic: string | undefined): TopicEnrichment | undefined {
  if (!topic) return undefined;
  const direct = TAKKEN_TOPIC_ENRICHMENT[topic];
  if (direct) return direct;

  const normalized = normalizeTopicKey(topic);
  for (const [key, value] of Object.entries(TAKKEN_TOPIC_ENRICHMENT)) {
    if (normalizeTopicKey(key) === normalized) return value;
  }

  if (/重要事項|35条/.test(topic) && /37/.test(topic)) {
    return TAKKEN_TOPIC_ENRICHMENT["重要事項説明37条書面"];
  }
  if (/重要事項|35条/.test(topic)) {
    return TAKKEN_TOPIC_ENRICHMENT["重要事項の説明35条書面"];
  }
  if (/37条/.test(topic)) {
    return TAKKEN_TOPIC_ENRICHMENT["37条書面契約書面"];
  }
  if (/自ら売主|8種/.test(topic)) {
    return TAKKEN_TOPIC_ENRICHMENT["自ら売主制限8種制限"];
  }
  if (/弁済|営業保証金|保証協会/.test(topic)) {
    return TAKKEN_TOPIC_ENRICHMENT["弁済業務保証金"];
  }
  if (/媒介|専任/.test(topic)) {
    return TAKKEN_TOPIC_ENRICHMENT["媒介代理契約"];
  }
  if (/報酬/.test(topic)) {
    return TAKKEN_TOPIC_ENRICHMENT["報酬額の制限"];
  }
  if (/瑕疵|住宅瑕疵/.test(topic)) {
    return TAKKEN_TOPIC_ENRICHMENT["住宅瑕疵担保履行法"];
  }
  if (/宅建士|取引士/.test(topic)) {
    return TAKKEN_TOPIC_ENRICHMENT["宅建士"];
  }
  if (/広告/.test(topic)) {
    return TAKKEN_TOPIC_ENRICHMENT["広告等に関する規制"];
  }

  return undefined;
}

export function enrichQuestionLearningAids(question: Question): Question {
  const enrichment = lookupEnrichment(question.topic);
  if (!enrichment) return question;

  const needsTerms = !question.keyTerms || question.keyTerms.length === 0;
  const needsArticles =
    !question.relatedArticles || question.relatedArticles.length === 0;

  if (!needsTerms && !needsArticles) return question;

  return {
    ...question,
    keyTerms: needsTerms ? enrichment.keyTerms : question.keyTerms,
    relatedArticles: needsArticles
      ? enrichment.relatedArticles
      : question.relatedArticles,
  };
}

export function enrichQuestions(questions: Question[]): {
  questions: Question[];
  enrichedCount: number;
} {
  let enrichedCount = 0;
  const result = questions.map((q) => {
    const next = enrichQuestionLearningAids(q);
    if (next !== q) enrichedCount += 1;
    return next;
  });
  return { questions: result, enrichedCount };
}
