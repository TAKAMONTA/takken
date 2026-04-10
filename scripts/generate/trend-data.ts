/**
 * Step 1: 過去問傾向データの構造化モジュール
 * frequency-questions.ts から出題傾向を抽出し、問題生成用のデータに変換
 */

export interface TrendTopic {
  name: string;
  frequencyDescription: string;
  grade: "A" | "B" | "C";
  frequencyCount: number;
  keyPoints: string[];
  targetQuestions: { 基礎: number; 標準: number; 応用: number };
}

export interface TrendCategory {
  id: string;
  categoryCode: string; // Question型のcategoryフィールド用
  name: string;
  examQuestionCount: number;
  targetScore: string;
  topics: TrendTopic[];
}

/**
 * 頻度の記述からグレードと出題回数を推定
 */
function parseFrequency(freq: string): { grade: "A" | "B" | "C"; count: number } {
  if (freq.includes('全て出題') || freq.includes('12回')) {
    return { grade: "A", count: 12 };
  }
  if (freq.includes('ほぼ毎年') || freq.includes('10回') || freq.includes('11回')) {
    return { grade: "A", count: 10 };
  }
  if (freq.includes('7回') || freq.includes('8回') || freq.includes('9回')) {
    return { grade: "B", count: 8 };
  }
  if (freq.includes('5回') || freq.includes('6回')) {
    return { grade: "B", count: 6 };
  }
  return { grade: "C", count: 4 };
}

/**
 * グレードに応じた問題数配分を計算
 */
function calculateQuestionCounts(grade: "A" | "B" | "C"): { 基礎: number; 標準: number; 応用: number } {
  switch (grade) {
    case "A": return { 基礎: 3, 標準: 5, 応用: 2 }; // 10問
    case "B": return { 基礎: 3, 標準: 3, 応用: 1 };  // 7問
    case "C": return { 基礎: 2, 標準: 2, 応用: 1 };  // 5問
  }
}

/**
 * FrequencyTopicからキーポイントを抽出
 */
function extractKeyPoints(questions: { text: string; answers: string[] }[]): string[] {
  return questions.map(q => {
    // 穴埋め箇所を答えで埋めた完成文を作成
    let text = q.text;
    q.answers.forEach((ans, i) => {
      text = text.replace(`（ ① ）`, ans).replace(`（ ② ）`, ans).replace(`（ ③ ）`, ans);
      text = text.replace(`（ ${String.fromCharCode(0x2460 + i)} ）`, ans);
    });
    return text;
  });
}

/**
 * 全カテゴリの傾向データを構造化して返す
 */
export function getTrendData(): TrendCategory[] {
  // frequency-questions.ts のデータを直接ここに構造化
  // (importするとNext.jsのビルドパスに影響するため、スクリプト用に独立)

  return [
    {
      id: 'takkengyouhou',
      categoryCode: 'takkengyouhou',
      name: '宅建業法',
      examQuestionCount: 20,
      targetScore: '18～20点',
      topics: [
        {
          name: '宅建士',
          frequencyDescription: '過去10年間（12回）全て出題',
          grade: "A",
          frequencyCount: 12,
          keyPoints: [
            '宅建士証の有効期間は5年',
            '重要事項説明は宅地建物取引士が行う',
            '専任の宅建士の設置義務',
            '宅建士証の交付・更新手続き',
            '登録の移転、変更の届出',
          ],
          targetQuestions: { 基礎: 3, 標準: 5, 応用: 2 },
        },
        {
          name: '弁済業務保証金',
          frequencyDescription: '過去10年間（12回）全て出題',
          grade: "A",
          frequencyCount: 12,
          keyPoints: [
            '保証協会加入で営業保証金の供託が免除',
            '分担金: 主たる事務所60万円、支店30万円',
            '営業保証金: 主たる事務所1000万円、支店500万円',
            '還付と不足額の供託手続き',
            '保証協会の社員の地位と義務',
          ],
          targetQuestions: { 基礎: 3, 標準: 5, 応用: 2 },
        },
        {
          name: '媒介・代理契約',
          frequencyDescription: '過去10年間（12回）全て出題',
          grade: "A",
          frequencyCount: 12,
          keyPoints: [
            '一般媒介・専任媒介・専属専任媒介の3種類',
            '専任媒介は7日以内、専属専任は5日以内にレインズ登録',
            '専任媒介の有効期間は3ヶ月',
            '媒介契約書面の記載事項',
            '報告義務の頻度の違い',
          ],
          targetQuestions: { 基礎: 3, 標準: 5, 応用: 2 },
        },
        {
          name: '広告等に関する規制',
          frequencyDescription: '過去10年間（12回）全て出題',
          grade: "A",
          frequencyCount: 12,
          keyPoints: [
            '取引態様の明示義務（売主・代理・媒介）',
            '誇大広告の禁止',
            '広告開始時期の制限',
            '未完成物件の広告制限',
            'おとり広告の禁止',
          ],
          targetQuestions: { 基礎: 3, 標準: 5, 応用: 2 },
        },
        {
          name: '重要事項の説明（35条書面）',
          frequencyDescription: '過去10年間（12回）全て出題',
          grade: "A",
          frequencyCount: 12,
          keyPoints: [
            '契約成立前に宅建士が説明',
            '登記された権利の種類・内容',
            '法令に基づく制限の概要',
            '売買と貸借で異なる説明事項',
            '書面への宅建士の記名',
          ],
          targetQuestions: { 基礎: 3, 標準: 5, 応用: 2 },
        },
        {
          name: '37条書面（契約書面）',
          frequencyDescription: '過去10年間（12回）全て出題',
          grade: "A",
          frequencyCount: 12,
          keyPoints: [
            '契約成立後に遅滞なく交付',
            '宅建士の記名が必要',
            '必要的記載事項と任意的記載事項',
            '35条書面との記載事項の違い',
            '交付の相手方',
          ],
          targetQuestions: { 基礎: 3, 標準: 5, 応用: 2 },
        },
        {
          name: '自ら売主制限（8種制限）',
          frequencyDescription: '過去10年間（12回）全て出題',
          grade: "A",
          frequencyCount: 12,
          keyPoints: [
            '適用は宅建業者が売主、一般個人が買主の場合',
            'クーリング・オフ制度',
            '損害賠償額の予定等の制限（代金の2割）',
            '手付の額の制限と手付解除',
            '瑕疵担保責任の特約制限',
          ],
          targetQuestions: { 基礎: 3, 標準: 5, 応用: 2 },
        },
        {
          name: '報酬額の制限',
          frequencyDescription: '過去10年間（12回）全て出題',
          grade: "A",
          frequencyCount: 12,
          keyPoints: [
            '国土交通大臣が告示で上限を定める',
            '売買: 200万以下5%、200-400万4%、400万超3%',
            '賃貸の媒介: 原則0.5ヶ月分ずつ',
            '消費税の取り扱い',
            '低廉な空家等の特例',
          ],
          targetQuestions: { 基礎: 3, 標準: 5, 応用: 2 },
        },
        {
          name: '住宅瑕疵担保履行法',
          frequencyDescription: '過去10年間（12回）全て出題',
          grade: "A",
          frequencyCount: 12,
          keyPoints: [
            '新築住宅の構造耐力上主要な部分等に10年の担保責任',
            '保証金の供託 or 保険への加入が義務',
            '適用対象は新築住宅の売主',
            '届出義務',
            '基準日と届出期限',
          ],
          targetQuestions: { 基礎: 3, 標準: 5, 応用: 2 },
        },
      ],
    },
    {
      id: 'kenri',
      categoryCode: 'minpou',
      name: '権利関係',
      examQuestionCount: 14,
      targetScore: '7～8点',
      topics: [
        {
          name: '相続',
          frequencyDescription: '過去10年間（12回）全て出題',
          grade: "A",
          frequencyCount: 12,
          keyPoints: [
            '法定相続分の計算',
            '遺産分割協議',
            '遺言の方式と効力',
            '相続の承認・放棄',
            '制限行為能力者制度',
          ],
          targetQuestions: { 基礎: 3, 標準: 5, 応用: 2 },
        },
        {
          name: '賃貸借・使用貸借',
          frequencyDescription: '過去10年間（12回）全て出題',
          grade: "A",
          frequencyCount: 12,
          keyPoints: [
            '賃貸借の解約申入れ期間（貸主6ヶ月、借主3ヶ月）',
            '賃借権の対抗要件（登記 or 建物引渡し）',
            '転貸と賃借権の譲渡',
            '敷金の返還義務',
            '使用貸借との違い',
          ],
          targetQuestions: { 基礎: 3, 標準: 5, 応用: 2 },
        },
        {
          name: '借地法',
          frequencyDescription: '過去10年間（12回）全て出題',
          grade: "A",
          frequencyCount: 12,
          keyPoints: [
            '借地権の存続期間（当初30年）',
            '更新後の期間（1回目20年、2回目以降10年）',
            '借地権の対抗要件',
            '建物買取請求権',
            '定期借地権の種類',
          ],
          targetQuestions: { 基礎: 3, 標準: 5, 応用: 2 },
        },
        {
          name: '借家法',
          frequencyDescription: '過去10年間（12回）全て出題',
          grade: "A",
          frequencyCount: 12,
          keyPoints: [
            '造作買取請求権',
            '定期建物賃貸借契約（公正証書等の書面）',
            '借家権の対抗要件（建物の引渡し）',
            '正当事由による解約',
            '賃料増減額請求権',
          ],
          targetQuestions: { 基礎: 3, 標準: 5, 応用: 2 },
        },
        {
          name: '不動産登記法',
          frequencyDescription: '過去10年間（12回）全て出題',
          grade: "A",
          frequencyCount: 12,
          keyPoints: [
            '登記の対抗力（第三者対抗要件）',
            '登記には公信力がない',
            '表示の登記と権利の登記',
            '登記の申請手続き',
            '仮登記の効力',
          ],
          targetQuestions: { 基礎: 3, 標準: 5, 応用: 2 },
        },
        {
          name: '区分所有法',
          frequencyDescription: '過去10年間（12回）全て出題',
          grade: "A",
          frequencyCount: 12,
          keyPoints: [
            '共用部分の変更（3/4以上）',
            '規約の設定・変更（3/4以上）',
            '建替え決議（4/5以上）',
            '管理者の選任・解任',
            '専有部分と共用部分の区別',
          ],
          targetQuestions: { 基礎: 3, 標準: 5, 応用: 2 },
        },
      ],
    },
    {
      id: 'hourei',
      categoryCode: 'hourei',
      name: '法令上の制限',
      examQuestionCount: 8,
      targetScore: '5点',
      topics: [
        {
          name: '都市計画の内容・都市計画制限等',
          frequencyDescription: 'ほぼ毎年出題',
          grade: "A",
          frequencyCount: 10,
          keyPoints: [
            '市街化区域と市街化調整区域の区分',
            '用途地域の種類と制限',
            '都市計画の決定手続き',
            '都市施設と市街地開発事業',
            '地区計画',
          ],
          targetQuestions: { 基礎: 3, 標準: 5, 応用: 2 },
        },
        {
          name: '開発許可の要否',
          frequencyDescription: 'ほぼ毎年出題',
          grade: "A",
          frequencyCount: 10,
          keyPoints: [
            '開発行為の定義（区画形質の変更）',
            '許可が必要な面積基準（市街化区域1000㎡以上等）',
            '許可不要の例外（農林漁業、公益施設等）',
            '開発許可の基準',
            '工事完了の検査と公告',
          ],
          targetQuestions: { 基礎: 3, 標準: 5, 応用: 2 },
        },
        {
          name: '建築確認・単体規定',
          frequencyDescription: 'ほぼ毎年出題',
          grade: "A",
          frequencyCount: 10,
          keyPoints: [
            '建築確認が必要な建築物',
            '建築主事と指定確認検査機関',
            '用途変更と建築確認',
            '容積率・建ぺい率',
            '高さ制限（斜線制限・日影規制）',
          ],
          targetQuestions: { 基礎: 3, 標準: 5, 応用: 2 },
        },
        {
          name: '宅地造成等規制法（盛土規制法）',
          frequencyDescription: 'ほぼ毎年出題',
          grade: "A",
          frequencyCount: 10,
          keyPoints: [
            '崖崩れ又は土砂の流出の防止が目的',
            '規制区域の指定',
            '許可が必要な工事の範囲',
            '届出と許可の違い',
            '監督処分',
          ],
          targetQuestions: { 基礎: 3, 標準: 5, 応用: 2 },
        },
        {
          name: '土地区画整理法',
          frequencyDescription: 'ほぼ毎年出題',
          grade: "A",
          frequencyCount: 10,
          keyPoints: [
            '宅地の利用増進を図る目的',
            '換地計画と換地処分',
            '仮換地の指定',
            '施行者の種類',
            '建築等の制限',
          ],
          targetQuestions: { 基礎: 3, 標準: 5, 応用: 2 },
        },
        {
          name: '農地法（3条・4条・5条許可）',
          frequencyDescription: 'ほぼ毎年出題',
          grade: "A",
          frequencyCount: 10,
          keyPoints: [
            '3条: 農地の権利移動は農業委員会の許可',
            '4条: 農地転用は都道府県知事等の許可',
            '5条: 転用目的の権利移動は都道府県知事等の許可',
            '市街化区域内の特例（届出のみ）',
            '許可を受けない場合の効力',
          ],
          targetQuestions: { 基礎: 3, 標準: 5, 応用: 2 },
        },
        {
          name: '国土利用計画法',
          frequencyDescription: 'ほぼ毎年出題',
          grade: "B",
          frequencyCount: 8,
          keyPoints: [
            '事後届出制が原則',
            '届出対象面積（市街化区域2000㎡、他5000㎡、都計外10000㎡）',
            '届出期限は契約後2週間以内',
            '知事の勧告権',
            '注視区域・監視区域の事前届出',
          ],
          targetQuestions: { 基礎: 3, 標準: 3, 応用: 1 },
        },
      ],
    },
    {
      id: 'zei',
      categoryCode: 'zeihou',
      name: '税・その他',
      examQuestionCount: 8,
      targetScore: '7～8点',
      topics: [
        {
          name: '不動産取得税',
          frequencyDescription: 'ほぼ毎年出題',
          grade: "A",
          frequencyCount: 10,
          keyPoints: [
            '都道府県税である',
            '課税標準は固定資産税評価額',
            '標準税率は4%（住宅は3%特例）',
            '免税点（土地10万円、建物23万円等）',
            '新築住宅の課税標準控除（1200万円）',
          ],
          targetQuestions: { 基礎: 3, 標準: 5, 応用: 2 },
        },
        {
          name: '固定資産税',
          frequencyDescription: 'ほぼ毎年出題',
          grade: "A",
          frequencyCount: 10,
          keyPoints: [
            '1月1日現在の所有者に課税',
            '市町村税（東京23区は都税）',
            '標準税率1.4%',
            '住宅用地の課税標準特例（1/6, 1/3）',
            '新築住宅の税額軽減',
          ],
          targetQuestions: { 基礎: 3, 標準: 5, 応用: 2 },
        },
        {
          name: '地価公示法',
          frequencyDescription: 'ほぼ毎年出題',
          grade: "B",
          frequencyCount: 8,
          keyPoints: [
            '土地鑑定委員会が判定・公示',
            '毎年1月1日時点の価格',
            '一般の土地取引価格の指標',
            '不動産鑑定士による鑑定評価',
            '標準地の選定基準',
          ],
          targetQuestions: { 基礎: 3, 標準: 3, 応用: 1 },
        },
      ],
    },
  ];
}

/**
 * カテゴリIDから傾向データを取得
 */
export function getTrendDataByCategory(categoryId: string): TrendCategory | undefined {
  return getTrendData().find(c => c.id === categoryId);
}

/**
 * 全カテゴリの合計問題数を計算
 */
export function getTotalQuestionCount(): number {
  return getTrendData().reduce((total, cat) => {
    return total + cat.topics.reduce((topicTotal, topic) => {
      const q = topic.targetQuestions;
      return topicTotal + q.基礎 + q.標準 + q.応用;
    }, 0);
  }, 0);
}
