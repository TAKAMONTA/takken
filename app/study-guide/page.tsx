'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const studyGuideData = {
  overview: {
    title: '宅建士試験の概要',
    examDate: '2025年10月19日（日）',
    totalHours: '200〜300時間',
    passingScore: '35点前後（50点満点）',
    targetScore: '38点',
    subjects: [
      { name: '宅建業法', questions: 20, difficulty: '低', target: '18問正解' },
      { name: '権利関係', questions: 14, difficulty: '高', target: '7-9問正解' },
      { name: '法令上の制限', questions: 8, difficulty: '中', target: '5問正解' },
      { name: '税・その他', questions: 8, difficulty: '中', target: '5問正解' }
    ]
  },
  schedules: [
    {
      id: 'half-year',
      title: '6ヶ月計画（推奨）',
      period: '4月〜10月',
      dailyHours: { weekday: 1.5, weekend: 2 },
      phases: [
        { month: '4〜5月', focus: 'インプット中心', detail: 'テキストと一問一答で基礎固め' },
        { month: '6〜7月', focus: '問題練習', detail: '四肢択一式の過去問で得点力強化' },
        { month: '8〜9月', focus: '直前対策', detail: '過去問繰り返し・模試活用' }
      ]
    },
    {
      id: 'short-term',
      title: '3ヶ月計画（短期集中）',
      period: '7月〜10月',
      dailyHours: { weekday: 2.5, weekend: 4 },
      phases: [
        { month: '7月', focus: '集中インプット', detail: '重要分野を効率的に学習' },
        { month: '8月', focus: '問題演習', detail: '過去問中心の実践練習' },
        { month: '9月', focus: '総仕上げ', detail: '弱点補強と試験対策' }
      ]
    },
    {
      id: 'long-term',
      title: '1年計画（じっくり型）',
      period: '11月〜10月',
      dailyHours: { weekday: 1, weekend: 1.3 },
      phases: [
        { month: '11〜2月', focus: '基礎学習', detail: '各分野の基本理解' },
        { month: '3〜6月', focus: '知識定着', detail: '問題練習で理解深化' },
        { month: '7〜10月', focus: '実践強化', detail: '過去問・模試で仕上げ' }
      ]
    }
  ],
  strategies: {
    takkengyouhou: {
      name: '宅建業法',
      difficulty: '低',
      target: '20問中18問正解',
      timeAllocation: '総勉強時間の40%（120時間程度）',
      keyTopics: [
        '重要事項説明書（35条書面）',
        '37条書面（契約書）',
        '自ら売主制限（8種制限）'
      ],
      studyTips: [
        '素直な暗記問題が多く、知識がそのまま正解につながりやすい',
        '35条書面と37条書面の記載事項の違いをしっかり整理',
        'インプット学習に偏らず、テキストを読んだらすぐに問題練習',
        '映像や音声など視覚・聴覚を活用したインプットも効果的'
      ]
    },
    minpou: {
      name: '権利関係（民法等）',
      difficulty: '高',
      target: '14問中7〜9問正解',
      timeAllocation: '総勉強時間の35%',
      keyTopics: [
        '代理（最頻出）',
        '不動産物権変動（最頻出）',
        '制限行為能力者',
        '意思表示',
        '時効',
        '抵当権',
        '債務不履行と解除',
        '賃貸借',
        '相続'
      ],
      studyTips: [
        '問題文を1文1文区切って読み、正確に意味を把握',
        '「主語」を常に意識し、問題が何について問われているかを把握',
        '事例式問題では登場人物や関係性を図に描いて整理',
        '一度に大量に学習せず、1つずつ確実にクリア'
      ]
    },
    hourei: {
      name: '法令上の制限',
      difficulty: '中',
      target: '8問中5問正解',
      timeAllocation: '総勉強時間の15%',
      keyTopics: [
        '都市計画法（2問）',
        '建築基準法（2問）',
        '国土利用計画法',
        '農地法',
        '宅地造成等規制法'
      ],
      studyTips: [
        '専門用語の意味（定義）を正確に理解',
        '規制の趣旨（目的）を理解することで記憶しやすくなる',
        '規制の場面を想像して理解を深める',
        '国土利用計画法・農地法・宅地造成等規制法は1〜2日で得点力向上可能'
      ]
    },
    zeihou: {
      name: '税・その他',
      difficulty: '中',
      target: '8問中5問正解',
      timeAllocation: '総勉強時間の10%',
      keyTopics: [
        '地方税（不動産取得税、固定資産税）',
        '地価公示法',
        '不動産鑑定評価基準',
        '統計問題（最新データ要確認）'
      ],
      studyTips: [
        '「課税主体」「課税標準」「課税客体」などの専門用語を正確に記憶',
        '易しい問題から確実に得点を積み上げ',
        '印紙税、登録免許税、不動産取得税、固定資産税は比較的易しい',
        '配点が少ないため必要以上に時間をかけすぎない'
      ]
    }
  },
  exemption: {
    title: '5問免除科目',
    description: '宅建業従事者は登録講習受講で5問免除・5点加算',
    benefits: [
      '5問が免除され、代わりに5点加算',
      '試験時間が10分短縮',
      '合格率が一般受験者より高い傾向'
    ],
    topics: [
      '住宅金融支援機構',
      '公正競争規約',
      '土地',
      '建物',
      '統計'
    ],
    studyTips: [
      '常識で考えて判断できる問題が多い',
      '試験直前1週間程度の学習で十分',
      '過去問を繰り返し解くことが重要',
      '出題範囲が狭く、満遍なく出題される傾向'
    ]
  },
  mentalSupport: {
    title: '独学での学習とスランプ克服',
    challenges: [
      '法令上の制限でつまづく受験生が多い',
      '馴染みが薄く専門的な話が多く理解に時間がかかる',
      '難問化傾向で十分な対策が必要'
    ],
    solutions: [
      'じわじわと理解が深まるものと捉え、繰り返し学習',
      '推奨勉強法に固執せず、自分に合うようにアレンジ',
      '過去問から始めるのが合わないなら参考書から始める',
      '様々な方法を試して最適なやり方を見つける'
    ],
    encouragement: [
      '最初の壁にぶつかるのは当然のこと',
      '自信を失う必要は全くない',
      '粘り強く学習を進めることが合格への鍵'
    ]
  }
};

export default function StudyGuide() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const savedUser = localStorage.getItem('takken_rpg_user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
    } else {
      router.push('/');
    }
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-2xl font-bold text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">ログインが必要です</p>
          <Link href="/">
            <button className="bg-purple-600 text-white px-6 py-3 rounded-lg font-bold">
              ホームに戻る
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', name: '試験概要', icon: '📋' },
    { id: 'schedule', name: '学習計画', icon: '📅' },
    { id: 'strategy', name: '分野別攻略', icon: '🎯' },
    { id: 'exemption', name: '5問免除', icon: '🎁' },
    { id: 'mental', name: 'メンタル', icon: '💪' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 pb-20">
      {/* ヘッダー */}
      <div className="bg-white shadow-sm border-b fixed top-0 w-full z-10">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center">
          <Link href="/dashboard" className="text-purple-600 mr-4">
            <div className="w-5 h-5 flex items-center justify-center">
              <i className="ri-arrow-left-line text-xl"></i>
            </div>
          </Link>
          <h1 className="text-xl font-bold text-gray-800">学習ガイド</h1>
        </div>
      </div>

      {/* タブナビゲーション */}
      <div className="bg-white border-b sticky top-16 z-10">
        <div className="max-w-md mx-auto px-2 py-2">
          <div className="flex space-x-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-600 hover:text-purple-700'
                }`}
              >
                <span className="mr-1">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pt-4 pb-6 space-y-4">
        {/* 試験概要タブ */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-800 mb-4">🎯 {studyGuideData.overview.title}</h2>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <div className="text-sm text-gray-700">試験日</div>
                    <div className="font-bold text-blue-700">{studyGuideData.overview.examDate}</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <div className="text-sm text-gray-700">必要学習時間</div>
                    <div className="font-bold text-green-700">{studyGuideData.overview.totalHours}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-orange-50 rounded-lg p-3 text-center">
                    <div className="text-sm text-gray-700">合格ライン</div>
                    <div className="font-bold text-orange-700">{studyGuideData.overview.passingScore}</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3 text-center">
                    <div className="text-sm text-gray-700">目標得点</div>
                    <div className="font-bold text-purple-700">{studyGuideData.overview.targetScore}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-lg mb-4 text-gray-800">📚 出題分野と目標</h3>
              <div className="space-y-3">
                {studyGuideData.overview.subjects.map((subject, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-gray-800">{subject.name}</h4>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        subject.difficulty === '低' ? 'bg-green-100 text-green-700' :
                        subject.difficulty === '中' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {subject.difficulty}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{subject.questions}問出題</span>
                      <span className="font-medium text-purple-600">{subject.target}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 学習計画タブ */}
        {activeTab === 'schedule' && (
          <div className="space-y-4">
            {studyGuideData.schedules.map((schedule) => (
              <div key={schedule.id} className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="font-bold text-lg mb-4 text-gray-800">
                  📅 {schedule.title}
                </h3>
                <div className="mb-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-sm text-gray-600 mb-1">学習期間</div>
                    <div className="font-bold text-gray-800">{schedule.period}</div>
                  </div>
                </div>
                <div className="mb-4">
                  <div className="text-sm text-gray-600 mb-2">1日の学習時間目安</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-blue-50 rounded-lg p-3 text-center">
                      <div className="text-sm text-gray-700">平日</div>
                      <div className="font-bold text-blue-700">{schedule.dailyHours.weekday}時間</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3 text-center">
                      <div className="text-sm text-gray-700">休日</div>
                      <div className="font-bold text-green-700">{schedule.dailyHours.weekend}時間</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="text-sm text-gray-600 font-medium">学習フェーズ</div>
                  {schedule.phases.map((phase, index) => (
                    <div key={index} className="border-l-4 border-purple-500 pl-4">
                      <div className="font-bold text-gray-800">{phase.month}</div>
                      <div className="text-purple-600 font-medium">{phase.focus}</div>
                      <div className="text-sm text-gray-600">{phase.detail}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 分野別攻略タブ */}
        {activeTab === 'strategy' && (
          <div className="space-y-4">
            {Object.values(studyGuideData.strategies).map((strategy, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg text-gray-800">{strategy.name}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    strategy.difficulty === '低' ? 'bg-green-100 text-green-700' :
                    strategy.difficulty === '中' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    難易度: {strategy.difficulty}
                  </span>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-purple-50 rounded-lg p-3">
                    <div className="text-sm text-gray-700 mb-1">目標得点</div>
                    <div className="font-bold text-purple-700">{strategy.target}</div>
                  </div>
                  
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="text-sm text-gray-700 mb-1">時間配分</div>
                    <div className="font-bold text-blue-700">{strategy.timeAllocation}</div>
                  </div>

                  <div>
                    <div className="text-sm font-bold text-gray-700 mb-2">🎯 重要テーマ</div>
                    <div className="space-y-1">
                      {strategy.keyTopics.map((topic, i) => (
                        <div key={i} className="text-sm bg-gray-50 rounded px-3 py-2">
                          • {topic}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-bold text-gray-700 mb-2">💡 学習のコツ</div>
                    <div className="space-y-2">
                      {strategy.studyTips.map((tip, i) => (
                        <div key={i} className="text-sm text-gray-600 bg-yellow-50 rounded px-3 py-2">
                          • {tip}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 5問免除タブ */}
        {activeTab === 'exemption' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-lg mb-4 text-gray-800">🎁 {studyGuideData.exemption.title}</h3>
              <p className="text-gray-600 mb-4">{studyGuideData.exemption.description}</p>
              
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-bold text-gray-700 mb-2">✨ メリット</div>
                  <div className="space-y-2">
                    {studyGuideData.exemption.benefits.map((benefit, i) => (
                      <div key={i} className="text-sm bg-green-50 rounded px-3 py-2 text-green-700">
                        • {benefit}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-bold text-gray-700 mb-2">📚 出題テーマ</div>
                  <div className="grid grid-cols-2 gap-2">
                    {studyGuideData.exemption.topics.map((topic, i) => (
                      <div key={i} className="text-sm bg-blue-50 rounded px-3 py-2 text-center text-blue-700">
                        {topic}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-bold text-gray-700 mb-2">💡 学習アドバイス</div>
                  <div className="space-y-2">
                    {studyGuideData.exemption.studyTips.map((tip, i) => (
                      <div key={i} className="text-sm text-gray-600 bg-yellow-50 rounded px-3 py-2">
                        • {tip}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* メンタルサポートタブ */}
        {activeTab === 'mental' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-lg mb-4 text-gray-800">💪 {studyGuideData.mentalSupport.title}</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-bold text-gray-700 mb-2">😰 よくある悩み</div>
                  <div className="space-y-2">
                    {studyGuideData.mentalSupport.challenges.map((challenge, i) => (
                      <div key={i} className="text-sm bg-red-50 rounded px-3 py-2 text-red-700">
                        • {challenge}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-bold text-gray-700 mb-2">💡 解決策</div>
                  <div className="space-y-2">
                    {studyGuideData.mentalSupport.solutions.map((solution, i) => (
                      <div key={i} className="text-sm bg-blue-50 rounded px-3 py-2 text-blue-700">
                        • {solution}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-bold text-gray-700 mb-2">🌟 応援メッセージ</div>
                  <div className="space-y-2">
                    {studyGuideData.mentalSupport.encouragement.map((message, i) => (
                      <div key={i} className="text-sm bg-green-50 rounded px-3 py-2 text-green-700">
                        • {message}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl p-6 text-white">
              <h4 className="font-bold text-lg mb-2">🎯 合格への道のり</h4>
              <p className="text-white/90">
                宅建士試験は正しい方法で継続すれば必ず合格できる試験です。
                自分に合った学習方法を見つけ、諦めずに粘り強く取り組むことが成功の鍵となります。
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ボトムナビゲーション */}
      <div className="bg-white border-t fixed bottom-0 w-full">
        <div className="max-w-md mx-auto px-0 py-2">
          <div className="grid grid-cols-4 gap-0">
            <Link href="/dashboard" className="flex flex-col items-center justify-center py-2 px-1">
              <div className="w-5 h-5 flex items-center justify-center">
                <i className="ri-home-line text-gray-400 text-lg"></i>
              </div>
              <span className="text-xs text-gray-400 mt-1">ホーム</span>
            </Link>
            
            <Link href="/practice" className="flex flex-col items-center justify-center py-2 px-1">
              <div className="w-5 h-5 flex items-center justify-center">
                <i className="ri-book-line text-gray-400 text-lg"></i>
              </div>
              <span className="text-xs text-gray-400 mt-1">学習</span>
            </Link>
            
            <Link href="/stats" className="flex flex-col items-center justify-center py-2 px-1">
              <div className="w-5 h-5 flex items-center justify-center">
                <i className="ri-bar-chart-line text-gray-400 text-lg"></i>
              </div>
              <span className="text-xs text-gray-400 mt-1">統計</span>
            </Link>
            
            <Link href="/profile" className="flex flex-col items-center justify-center py-2 px-1">
              <div className="w-5 h-5 flex items-center justify-center">
                <i className="ri-user-line text-gray-400 text-lg"></i>
              </div>
              <span className="text-xs text-gray-400 mt-1">プロフィール</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}