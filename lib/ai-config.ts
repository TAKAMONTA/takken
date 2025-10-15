// AI API Configuration and utilities

export interface AIProvider {
  name: string;
  apiKey: string | undefined;
  isConfigured: boolean;
}

export interface AIResponse {
  content: string;
  provider: string;
  usage?: {
    tokens: number;
    cost?: number;
  };
}

// Check which AI providers are configured
export const getConfiguredAIProviders = (): AIProvider[] => {
  const providers: AIProvider[] = [
    {
      name: "OpenAI",
      apiKey: process.env.OPENAI_API_KEY,
      isConfigured: !!process.env.OPENAI_API_KEY,
    },
    {
      name: "Anthropic",
      apiKey: process.env.ANTHROPIC_API_KEY,
      isConfigured: !!process.env.ANTHROPIC_API_KEY,
    },
    {
      name: "Google AI",
      apiKey: process.env.GOOGLE_AI_API_KEY,
      isConfigured: !!process.env.GOOGLE_AI_API_KEY,
    },
  ];

  return providers;
};

// Get the primary AI provider (first configured one)
export const getPrimaryAIProvider = (): AIProvider | null => {
  const providers = getConfiguredAIProviders();
  return providers.find((provider) => provider.isConfigured) || null;
};

// Validate AI configuration
export const validateAIConfiguration = (): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const providers = getConfiguredAIProviders();
  const configuredProviders = providers.filter((p) => p.isConfigured);

  if (configuredProviders.length === 0) {
    errors.push(
      "No AI providers are configured. Please set at least one API key."
    );
  }

  if (configuredProviders.length === 1) {
    warnings.push(
      "Only one AI provider is configured. Consider adding backup providers for redundancy."
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

// AI API rate limiting configuration
export const AI_RATE_LIMITS = {
  OpenAI: {
    requestsPerMinute: 60,
    tokensPerMinute: 90000,
  },
  Anthropic: {
    requestsPerMinute: 50,
    tokensPerMinute: 40000,
  },
  "Google AI": {
    requestsPerMinute: 60,
    tokensPerMinute: 32000,
  },
} as const;

// AI model configurations
export const AI_MODELS = {
  OpenAI: {
    chat: "gpt-4o", // 最新モデルに変更
    embedding: "text-embedding-3-small",
  },
  Anthropic: {
    chat: "claude-3-sonnet-20240229",
  },
  "Google AI": {
    chat: "gemini-pro",
    embedding: "embedding-001",
  },
} as const;
