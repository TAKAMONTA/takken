// 出題頻度順重要問題のデータ定義

export interface QuestionItem {
  text: string;
  blanks: string[];
  answers: string[];
}

export interface FrequencyTopic {
  topic: string;
  frequency: string;
  questions: QuestionItem[];
}

export interface FrequencyCategory {
  id: string;
  name: string;
  questionsCount: number;
  targetScore: string;
  description: string;
  topics: FrequencyTopic[];
}

export const frequencyData: FrequencyCategory[] = [
  {
    id: 'takkengyouhou',
    name: '宅建業法',
    questionsCount: 20,
    targetScore: '18～20点',
    description: '最も出題数が多く、かつ得点しやすい分野。満点に近い高得点を目指すことが推奨されています。',
    topics: [
      {
        topic: '宅建士',
        frequency: '過去10年間（12回）全て出題',
        questions: [
          {
            text: '宅地建物取引士証の有効期間は、（ ① ）年である。',
            blanks: ['①'],
            answers: ['5']
          },
          {
            text: '重要事項説明は、原則として（ ① ）の宅地建物取引士が行わなければならない。',
            blanks: ['①'],
            answers: ['専任でない者でも可']
          },
          {
            text: '宅地建物取引士は、宅地建物の取引に関し、（ ① ）と認められる事務については、その事務を誠実に遂行しなければならない。',
            blanks: ['①'],
            answers: ['専門家']
          }
        ]
      },
      {
        topic: '弁済業務保証金',
        frequency: '過去10年間（12回）全て出題',
        questions: [
          {
            text: '（ ① ）に加入している宅建業者は、営業保証金の供託を免除される。',
            blanks: ['①'],
            answers: ['保証協会']
          },
          {
            text: '弁済業務保証金分担金の額は、主たる事務所につき（ ① ）万円、その他の事務所（支店）につき（ ② ）万円である。',
            blanks: ['①', '②'],
            answers: ['60', '30']
          }
        ]
      },
      {
        topic: '媒介・代理契約',
        frequency: '過去10年間（12回）全て出題',
        questions: [
          {
            text: '媒介契約には、一般媒介契約、専任媒介契約、（ ① ）媒介契約の3種類がある。',
            blanks: ['①'],
            answers: ['専属専任']
          },
          {
            text: '専任媒介契約及び専属専任媒介契約を締結した宅建業者は、契約締結の日から（ ① ）日以内に、目的物件に関する情報を（ ② ）に登録しなければならない（休業日除く）。',
            blanks: ['①', '②'],
            answers: ['7 (専属専任は5)', '指定流通機構（レインズ）']
          }
        ]
      },
      {
        topic: '広告等に関する規制',
        frequency: '過去10年間（12回）全て出題',
        questions: [
          {
            text: '宅建業者は、広告をするときは、取引態様の（ ① ）（売主、代理、媒介）を明示しなければならない。',
            blanks: ['①'],
            answers: ['別']
          },
          {
            text: '宅建業者は、著しく事実に相違する表示や、実際のものよりも著しく（ ① ）若しくは有利であると人を誤認させるような表示（誇大広告）をしてはならない。',
            blanks: ['①'],
            answers: ['優良']
          }
        ]
      },
      {
        topic: '重要事項の説明（35条書面）',
        frequency: '過去10年間（12回）全て出題',
        questions: [
          {
            text: '宅建業者は、売買・交換・貸借の相手方等に対し、契約が成立するまでの間に、（ ① ）をして、重要事項説明書を交付して説明させなければならない。',
            blanks: ['①'],
            answers: ['宅地建物取引士']
          },
          {
            text: '売買における重要事項説明では、登記された（ ① ）の種類・内容や、（ ② ）に関する事項などを説明する必要がある。',
            blanks: ['①', '②'],
            answers: ['権利', '代金・交換差金及び借賃以外に授受される金銭']
          }
        ]
      },
      {
        topic: '37条書面（契約書面）',
        frequency: '過去10年間（12回）全て出題',
        questions: [
          {
            text: '宅建業者は、売買・交換・貸借の契約が成立したときは、遅滞なく、契約当事者に対し、契約内容を記載した書面（（ ① ）書面）を交付しなければならない。',
            blanks: ['①'],
            answers: ['37条']
          },
          {
            text: '37条書面には、交付する（ ① ）が記名（又は記名押印・署名）しなければならない。',
            blanks: ['①'],
            answers: ['宅地建物取引士']
          }
        ]
      },
      {
        topic: '自ら売主制限（8種制限）',
        frequency: '過去10年間（12回）全て出題',
        questions: [
          {
            text: '宅建業者は、自ら（ ① ）となる宅地又は建物の売買契約において、買主が宅建業者でない場合、原則として（ ② ）制限を受ける。',
            blanks: ['①', '②'],
            answers: ['売主', '8種']
          },
          {
            text: '宅建業者は、自ら売主となる売買契約において、買主が宅建業者でない場合、原則として（ ① ）による解除（手付解除）に関する特約で、買主に不利なものを設けることはできない。',
            blanks: ['①'],
            answers: ['手付の放棄・倍返し']
          }
        ]
      },
      {
        topic: '報酬額の制限',
        frequency: '過去10年間（12回）全て出題',
        questions: [
          {
            text: '宅建業者が受領できる報酬の額は、（ ① ）が定めて告示しており、これを超える額を受領することはできない。',
            blanks: ['①'],
            answers: ['国土交通大臣']
          },
          {
            text: '売買の媒介における報酬限度額は、代金200万円以下の部分は（ ① ）％、200万円超400万円以下の部分は（ ② ）％、400万円超の部分は（ ③ ）％に、それぞれ消費税を加えた額である。',
            blanks: ['①', '②', '③'],
            answers: ['5', '4', '3']
          }
        ]
      },
      {
        topic: '住宅瑕疵担保履行法',
        frequency: '過去10年間（12回）全て出題',
        questions: [
          {
            text: '新築住宅の売主等は、構造耐力上主要な部分等の瑕疵について（ ① ）年間の担保責任を負う。',
            blanks: ['①'],
            answers: ['10']
          },
          {
            text: '新築住宅の売主である宅建業者は、住宅販売瑕疵担保（ ① ）金の供託又は住宅販売瑕疵担保責任（ ② ）への加入が義務付けられている。',
            blanks: ['①', '②'],
            answers: ['保証', '保険']
          }
        ]
      }
    ]
  },
  {
    id: 'kenri',
    name: '権利関係',
    questionsCount: 14,
    targetScore: '7～8点',
    description: '民法から10問、借地借家法から2問、区分所有法から1問、不動産登記法から1問が出題されます。',
    topics: [
      {
        topic: '相続',
        frequency: '過去10年間（12回）全て出題',
        questions: [
          {
            text: '権利能力、意思能力、（ ① ）能力が、人が法律行為を有効に行うための基本的な能力である。',
            blanks: ['①'],
            answers: ['行為']
          },
          {
            text: '未成年者が法定代理人の同意を得ずにした法律行為は、原則として（ ① ）ことができる。',
            blanks: ['①'],
            answers: ['取り消す']
          }
        ]
      },
      {
        topic: '賃貸借・使用貸借',
        frequency: '過去10年間（12回）全て出題',
        questions: [
          {
            text: '建物の賃貸借契約において、期間の定めがない場合、解約申入れから（ ① ）月（建物貸主から）、（ ② ）月（建物借主から）で終了する。',
            blanks: ['①', '②'],
            answers: ['6', '3']
          },
          {
            text: '建物の賃借権の対抗要件は、登記のほか、建物の（ ① ）である。',
            blanks: ['①'],
            answers: ['引渡し']
          }
        ]
      },
      {
        topic: '借地法',
        frequency: '過去10年間（12回）全て出題',
        questions: [
          {
            text: '建物の所有を目的とする地上権又は土地の賃借権を（ ① ）という。',
            blanks: ['①'],
            answers: ['借地権']
          },
          {
            text: '借地権の存続期間は、定めがない場合でも（ ① ）年となる（当初）。',
            blanks: ['①'],
            answers: ['30']
          }
        ]
      },
      {
        topic: '借家法',
        frequency: '過去10年間（12回）全て出題',
        questions: [
          {
            text: '造作買取請求権は、建物の賃借人が賃貸人の（ ① ）を得て建物に付加した造作について、賃貸借終了時に賃貸人に買い取りを請求できる権利である。',
            blanks: ['①'],
            answers: ['同意']
          },
          {
            text: '定期建物賃貸借契約（定期借家契約）は、契約期間が満了すると（ ① ）することなく終了する契約であり、（ ② ）等の書面による契約が必要である。',
            blanks: ['①', '②'],
            answers: ['更新', '公正証書']
          }
        ]
      },
      {
        topic: '不動産登記法',
        frequency: '過去10年間（12回）全て出題',
        questions: [
          {
            text: '不動産に関する物権の変動は、その（ ① ）をしなければ、第三者に対抗することができない。',
            blanks: ['①'],
            answers: ['登記']
          },
          {
            text: '登記には（ ① ）効力はないとされている。',
            blanks: ['①'],
            answers: ['公信']
          }
        ]
      },
      {
        topic: '区分所有法',
        frequency: '過去10年間（12回）全て出題',
        questions: [
          {
            text: '区分所有法において、専有部分以外の建物の部分、専有部分に属しない建物の附属物、及び規約により共用部分とされた部分を（ ① ）という。',
            blanks: ['①'],
            answers: ['共用部分']
          },
          {
            text: '共用部分の変更（軽微変更を除く）は、区分所有者及び議決権の各（ ① ）以上の多数による集会の決議が必要である。',
            blanks: ['①'],
            answers: ['4分の3']
          }
        ]
      }
    ]
  },
  {
    id: 'hourei',
    name: '法令上の制限',
    questionsCount: 8,
    targetScore: '5点',
    description: '学習範囲がそれほど広くないものの、原則と例外を押さえた正確な暗記が求められます。',
    topics: [
      {
        topic: '都市計画の内容・都市計画制限等',
        frequency: 'ほぼ毎年出題',
        questions: [
          {
            text: '都市計画区域は、（ ① ）区域と（ ② ）区域、又は非線引き区域に区分される。',
            blanks: ['①', '②'],
            answers: ['市街化', '市街化調整']
          },
          {
            text: '市街化調整区域は、（ ① ）を抑制すべき区域である。',
            blanks: ['①'],
            answers: ['市街化']
          }
        ]
      },
      {
        topic: '開発許可の要否',
        frequency: 'ほぼ毎年出題',
        questions: [
          {
            text: '都市計画区域内において、一定規模以上の土地の区画形質の変更（開発行為）を行う場合は、原則として（ ① ）の許可が必要である。',
            blanks: ['①'],
            answers: ['都道府県知事等']
          },
          {
            text: '市街化調整区域内における開発行為は、原則として（ ① ）される。',
            blanks: ['①'],
            answers: ['許可されない（抑制される）']
          }
        ]
      },
      {
        topic: '建築確認・単体規定',
        frequency: 'ほぼ毎年出題',
        questions: [
          {
            text: '建築物を建築しようとする者は、工事着手前に建築計画が法令に適合するかについて（ ① ）を受けなければならない。',
            blanks: ['①'],
            answers: ['建築確認']
          },
          {
            text: '建築確認申請は、原則として（ ① ）に対して行う。',
            blanks: ['①'],
            answers: ['建築主事又は指定確認検査機関']
          }
        ]
      },
      {
        topic: '宅地造成等規制法（盛土規制法）',
        frequency: 'ほぼ毎年出題',
        questions: [
          {
            text: '宅地造成及び特定盛土等規制法（盛土規制法）は、宅地造成、特定盛土等又は土石の堆積に伴う（ ① ）の防止を目的とする。',
            blanks: ['①'],
            answers: ['崖崩れ又は土砂の流出']
          },
          {
            text: '特定盛土等規制区域内において、特定盛土等又は土石の堆積に関する工事を行う場合、原則として（ ① ）の許可が必要である。',
            blanks: ['①'],
            answers: ['都道府県知事等']
          }
        ]
      },
      {
        topic: '土地区画整理法',
        frequency: 'ほぼ毎年出題',
        questions: [
          {
            text: '土地区画整理事業は、公共施設の整備改善及び宅地の（ ① ）の増進を図ることを目的とする。',
            blanks: ['①'],
            answers: ['利用']
          },
          {
            text: '換地計画において定められた換地は、原則として（ ① ）の公告があった日の翌日から、従前の宅地とみなされる。',
            blanks: ['①'],
            answers: ['換地処分']
          }
        ]
      },
      {
        topic: '農地法（3条・4条・5条許可）',
        frequency: 'ほぼ毎年出題',
        questions: [
          {
            text: '農地を農地以外のものにする（農地転用）場合、原則として（ ① ）の許可が必要である（市街化区域内の場合は事前に届出）。',
            blanks: ['①'],
            answers: ['都道府県知事等（又は農林水産大臣）']
          },
          {
            text: '農地を転用し、さらに権利移動も伴う場合（例：農地を買って宅地にする）、農地法（ ① ）条の許可が必要である。',
            blanks: ['①'],
            answers: ['5']
          }
        ]
      },
      {
        topic: '国土利用計画法',
        frequency: 'ほぼ毎年出題',
        questions: [
          {
            text: '知事は、事後届出に係る土地の利用目的が公表された土地利用に関する計画に適合しない場合、（ ① ）をすることができる。',
            blanks: ['①'],
            answers: ['勧告']
          },
          {
            text: '規制区域内において、一定面積以上の土地売買等の契約を締結するには、（ ① ）の許可が必要である（許可制）。',
            blanks: ['①'],
            answers: ['都道府県知事等']
          }
        ]
      }
    ]
  },
  {
    id: 'zei',
    name: '税・その他',
    questionsCount: 8,
    targetScore: '7～8点',
    description: '学習範囲が最も狭く、満点を目指すことが推奨される得点源です。',
    topics: [
      {
        topic: '不動産取得税',
        frequency: 'ほぼ毎年出題',
        questions: [
          {
            text: '不動産を取得した際に課される都道府県税を（ ① ）税という。',
            blanks: ['①'],
            answers: ['不動産取得']
          },
          {
            text: '不動産取得税の課税標準は、原則として不動産の（ ① ）である。',
            blanks: ['①'],
            answers: ['価格（固定資産税評価額）']
          }
        ]
      },
      {
        topic: '固定資産税',
        frequency: 'ほぼ毎年出題',
        questions: [
          {
            text: '毎年（ ① ）現在において、土地・家屋等を所有している者に課される市町村税（東京23区内は都税）を（ ② ）税という。',
            blanks: ['①', '②'],
            answers: ['1月1日', '固定資産']
          },
          {
            text: '固定資産税の標準税率は（ ① ）％であるが、市町村は条例で異なる税率（制限税率の範囲内）を定めることができる。',
            blanks: ['①'],
            answers: ['1.4']
          }
        ]
      },
      {
        topic: '地価公示法',
        frequency: 'ほぼ毎年出題',
        questions: [
          {
            text: '地価公示法に基づき、（ ① ）が標準地の正常な価格を判定し、公示する。',
            blanks: ['①'],
            answers: ['土地鑑定委員会']
          },
          {
            text: '地価公示の価格（公示価格）は、毎年（ ① ）現在の価格であり、一般の土地取引価格に対して（ ② ）を与える。',
            blanks: ['①', '②'],
            answers: ['1月1日', '指標']
          }
        ]
      }
    ]
  }
];

// カテゴリアイコンのマッピング
export const categoryIcons: Record<string, string> = {
  takkengyouhou: '🏢',
  kenri: '⚖️',
  hourei: '📋',
  zei: '💰'
};

// カテゴリカラーのマッピング
export const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  takkengyouhou: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200'
  },
  kenri: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200'
  },
  hourei: {
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200'
  },
  zei: {
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200'
  }
};
