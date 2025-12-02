"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiRecommendations = exports.aiMotivation = exports.aiExplanation = exports.aiChat = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const cors_1 = __importDefault(require("cors"));
// Firebase Admin SDK初期化
admin.initializeApp();
// CORS設定
const corsHandler = (0, cors_1.default)({ origin: true });
// AI Client クラス
class AIClient {
    constructor() {
        this.baseURL = {
            OpenAI: "https://api.openai.com/v1",
            Anthropic: "https://api.anthropic.com/v1",
            "Google AI": "https://generativelanguage.googleapis.com/v1beta",
        };
    }
    async chat(messages, options = {}) {
        const provider = options.provider || this.getPrimaryAIProvider();
        if (!provider) {
            throw new Error("No AI provider configured");
        }
        switch (provider) {
            case "OpenAI":
                return this.chatOpenAI(messages, options);
            case "Anthropic":
                return this.chatAnthropic(messages, options);
            case "Google AI":
                return this.chatGoogleAI(messages, options);
            default:
                throw new Error(`Unsupported provider: ${provider}`);
        }
    }
    getPrimaryAIProvider() {
        if (process.env.OPENAI_API_KEY)
            return "OpenAI";
        if (process.env.ANTHROPIC_API_KEY)
            return "Anthropic";
        if (process.env.GOOGLE_AI_API_KEY)
            return "Google AI";
        throw new Error("No AI provider configured");
    }
    async chatOpenAI(messages, options) {
        var _a;
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            throw new Error("OpenAI API key not configured");
        }
        const response = await fetch(`${this.baseURL["OpenAI"]}/chat/completions`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: options.model || "gpt-4o-mini",
                messages,
                temperature: options.temperature || 0.7,
                max_tokens: options.maxTokens || 1000,
            }),
        });
        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.statusText}`);
        }
        const data = await response.json();
        return {
            content: data.choices[0].message.content,
            provider: "OpenAI",
            usage: {
                tokens: ((_a = data.usage) === null || _a === void 0 ? void 0 : _a.total_tokens) || 0,
            },
        };
    }
    async chatAnthropic(messages, options) {
        var _a, _b, _c;
        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) {
            throw new Error("Anthropic API key not configured");
        }
        const systemMessage = ((_a = messages.find(m => m.role === "system")) === null || _a === void 0 ? void 0 : _a.content) || "";
        const userMessages = messages.filter(m => m.role !== "system");
        const response = await fetch(`${this.baseURL["Anthropic"]}/messages`, {
            method: "POST",
            headers: {
                "x-api-key": apiKey,
                "Content-Type": "application/json",
                "anthropic-version": "2023-06-01",
            },
            body: JSON.stringify({
                model: options.model || "claude-3-haiku-20240307",
                max_tokens: options.maxTokens || 1000,
                system: systemMessage,
                messages: userMessages,
            }),
        });
        if (!response.ok) {
            throw new Error(`Anthropic API error: ${response.statusText}`);
        }
        const data = await response.json();
        return {
            content: data.content[0].text,
            provider: "Anthropic",
            usage: {
                tokens: ((_b = data.usage) === null || _b === void 0 ? void 0 : _b.input_tokens) + ((_c = data.usage) === null || _c === void 0 ? void 0 : _c.output_tokens) || 0,
            },
        };
    }
    async chatGoogleAI(messages, options) {
        var _a;
        const apiKey = process.env.GOOGLE_AI_API_KEY;
        if (!apiKey) {
            throw new Error("Google AI API key not configured");
        }
        const contents = messages.map(msg => ({
            role: msg.role === "assistant" ? "model" : "user",
            parts: [{ text: msg.content }],
        }));
        const response = await fetch(`${this.baseURL["Google AI"]}/models/${options.model || "gemini-1.5-flash"}:generateContent?key=${apiKey}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                contents,
                generationConfig: {
                    temperature: options.temperature || 0.7,
                    maxOutputTokens: options.maxTokens || 1000,
                },
            }),
        });
        if (!response.ok) {
            throw new Error(`Google AI API error: ${response.statusText}`);
        }
        const data = await response.json();
        return {
            content: data.candidates[0].content.parts[0].text,
            provider: "Google AI",
            usage: {
                tokens: ((_a = data.usageMetadata) === null || _a === void 0 ? void 0 : _a.totalTokenCount) || 0,
            },
        };
    }
    async generateStudyRecommendations(userProgress, weakAreas) {
        const messages = [
            {
                role: "system",
                content: `あなたは宅地建物取引士試験の学習アドバイザーです。ユーザーの学習進捗と苦手分野を分析して、具体的で実践的な学習アドバイスを提供してください。`,
            },
            {
                role: "user",
                content: `
学習進捗: ${JSON.stringify(userProgress, null, 2)}
苦手分野: ${weakAreas.join(", ")}

上記の情報を基に、今後の学習計画と具体的なアドバイスを日本語で提供してください。
        `,
            },
        ];
        const response = await this.chat(messages, {
            temperature: 0.7,
            maxTokens: 800,
        });
        return response.content;
    }
    async generateQuestionExplanation(question, correctAnswer, userAnswer) {
        const messages = [
            {
                role: "system",
                content: `あなたは宅地建物取引士試験の問題解説の専門家です。問題の解説を分かりやすく、法的根拠を含めて説明してください。`,
            },
            {
                role: "user",
                content: `
問題: ${question}
正解: ${correctAnswer}
ユーザーの回答: ${userAnswer}

この問題について、なぜ正解がその選択肢なのか、他の選択肢がなぜ間違いなのかを法的根拠とともに詳しく解説してください。
        `,
            },
        ];
        const response = await this.chat(messages, {
            temperature: 0.3,
            maxTokens: 600,
        });
        return response.content;
    }
    async generateMotivationalMessage(streak, recentPerformance) {
        const messages = [
            {
                role: "system",
                content: `あなたは学習者を励ます優しいコーチです。ユーザーの学習状況に応じて、前向きで具体的な励ましのメッセージを提供してください。`,
            },
            {
                role: "user",
                content: `
連続学習日数: ${streak}日
最近の正答率: ${recentPerformance}%

ユーザーを励まし、継続的な学習をサポートするメッセージを日本語で作成してください。
        `,
            },
        ];
        const response = await this.chat(messages, {
            temperature: 0.8,
            maxTokens: 200,
        });
        return response.content;
    }
}
const aiClient = new AIClient();
// コスト計算関数
function calculateCost(provider, tokens) {
    const costPerToken = {
        OpenAI: 0.00003,
        Anthropic: 0.000015,
        "Google AI": 0.00001, // Gemini Pro の概算
    };
    return (costPerToken[provider] || 0.00002) * tokens;
}
// 認証ヘルパー関数
async function verifyAuthToken(authHeader) {
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new Error("Invalid authorization header");
    }
    const token = authHeader.split("Bearer ")[1];
    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        return decodedToken.uid;
    }
    catch (error) {
        throw new Error("Invalid token");
    }
}
// AI Chat API
exports.aiChat = functions.https.onRequest(async (req, res) => {
    return corsHandler(req, res, async () => {
        var _a, _b;
        if (req.method !== "POST") {
            return res.status(405).json({ error: "Method not allowed" });
        }
        try {
            const userId = await verifyAuthToken(req.headers.authorization || "");
            const { messages, options } = req.body;
            if (!messages || !Array.isArray(messages) || messages.length === 0) {
                return res.status(400).json({ error: "メッセージが必要です" });
            }
            const validMessages = messages.filter((msg) => msg &&
                typeof msg === "object" &&
                ["system", "user", "assistant"].includes(msg.role) &&
                typeof msg.content === "string");
            if (validMessages.length === 0) {
                return res
                    .status(400)
                    .json({ error: "有効なメッセージが含まれていません" });
            }
            const response = await aiClient.chat(validMessages, options);
            // 使用量をFirestoreに記録
            await admin
                .firestore()
                .collection("ai_usage")
                .add({
                userId,
                provider: response.provider,
                model: options.model,
                tokens: response.usage.tokens,
                cost: calculateCost(response.provider, response.usage.tokens),
                endpoint: "aiChat",
                success: true,
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
                requestId: `req_${Date.now()}_${Math.random()
                    .toString(36)
                    .substr(2, 9)}`,
            });
            // ユーザー統計を更新
            await admin
                .firestore()
                .collection("user_usage_stats")
                .doc(userId)
                .set({
                totalTokens: admin.firestore.FieldValue.increment(response.usage.tokens),
                totalCost: admin.firestore.FieldValue.increment(calculateCost(response.provider, response.usage.tokens)),
                lastUsed: admin.firestore.FieldValue.serverTimestamp(),
                usageCount: admin.firestore.FieldValue.increment(1),
                [`providers.${response.provider}`]: admin.firestore.FieldValue.increment(response.usage.tokens),
            }, { merge: true });
            return res.json({
                success: true,
                data: response,
            });
        }
        catch (error) {
            console.error("AI Chat API error:", error);
            if ((_a = error.message) === null || _a === void 0 ? void 0 : _a.includes("API key not configured")) {
                return res.status(503).json({ error: "AI APIが設定されていません" });
            }
            if ((_b = error.message) === null || _b === void 0 ? void 0 : _b.includes("rate limit")) {
                return res.status(429).json({
                    error: "リクエスト数が上限に達しました。しばらくしてから再試行してください",
                });
            }
            return res.status(500).json({ error: "AI処理中にエラーが発生しました" });
        }
    });
});
// AI Explanation API
exports.aiExplanation = functions.https.onRequest(async (req, res) => {
    return corsHandler(req, res, async () => {
        if (req.method !== "POST") {
            return res.status(405).json({ error: "Method not allowed" });
        }
        try {
            await verifyAuthToken(req.headers.authorization || "");
            const { question, correctAnswer, userAnswer } = req.body;
            if (!question || !correctAnswer || !userAnswer) {
                return res
                    .status(400)
                    .json({ error: "question, correctAnswer, userAnswerが必要です" });
            }
            const explanation = await aiClient.generateQuestionExplanation(question, correctAnswer, userAnswer);
            return res.json({
                success: true,
                explanation,
            });
        }
        catch (error) {
            console.error("AI Explanation API error:", error);
            return res
                .status(500)
                .json({ error: "解説の生成中にエラーが発生しました" });
        }
    });
});
// AI Motivation API
exports.aiMotivation = functions.https.onRequest(async (req, res) => {
    return corsHandler(req, res, async () => {
        if (req.method !== "POST") {
            return res.status(405).json({ error: "Method not allowed" });
        }
        try {
            await verifyAuthToken(req.headers.authorization || "");
            const { streak, recentPerformance } = req.body;
            if (typeof streak !== "number" || typeof recentPerformance !== "number") {
                return res
                    .status(400)
                    .json({ error: "streakとrecentPerformance（数値）が必要です" });
            }
            const message = await aiClient.generateMotivationalMessage(streak, recentPerformance);
            return res.json({
                success: true,
                message,
            });
        }
        catch (error) {
            console.error("AI Motivation API error:", error);
            return res
                .status(500)
                .json({ error: "メッセージの生成中にエラーが発生しました" });
        }
    });
});
// AI Recommendations API
exports.aiRecommendations = functions.https.onRequest(async (req, res) => {
    return corsHandler(req, res, async () => {
        if (req.method !== "POST") {
            return res.status(405).json({ error: "Method not allowed" });
        }
        try {
            await verifyAuthToken(req.headers.authorization || "");
            const { userProgress, weakAreas } = req.body;
            if (!userProgress || !weakAreas || !Array.isArray(weakAreas)) {
                return res
                    .status(400)
                    .json({ error: "userProgressとweakAreasが必要です" });
            }
            const recommendations = await aiClient.generateStudyRecommendations(userProgress, weakAreas);
            return res.json({
                success: true,
                recommendations,
            });
        }
        catch (error) {
            console.error("AI Recommendations API error:", error);
            return res
                .status(500)
                .json({ error: "推奨事項の生成中にエラーが発生しました" });
        }
    });
});
//# sourceMappingURL=index.js.map