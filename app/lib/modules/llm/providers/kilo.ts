import { BaseProvider, getOpenAILikeModel } from '~/lib/modules/llm/base-provider';
import type { ModelInfo } from '~/lib/modules/llm/types';
import type { IProviderSetting } from '~/types/model';
import type { LanguageModelV1 } from 'ai';

export default class KiloProvider extends BaseProvider {
  name = 'Kilo';
  getApiKeyLink = undefined;

  config = {
    baseUrlKey: 'KILO_API_BASE_URL',
    apiTokenKey: 'KILO_API_KEY',
    baseUrl: 'https://api.kilo.ai/api/gateway',
  };

  staticModels: ModelInfo[] = [
    {
      name: 'poolside/laguna-xs-2.1:free',
      label: 'Poolside Laguna XS 2.1',
      provider: this.name,
      maxTokenAllowed: 262144,
      maxCompletionTokens: 65536,
    },
    {
      name: 'poolside/laguna-m.1:free',
      label: 'Poolside Laguna M.1',
      provider: this.name,
      maxTokenAllowed: 262144,
      maxCompletionTokens: 65536,
    },
    {
      name: 'stepfun/step-3.7-flash:free',
      label: 'StepFun Step 3.7 Flash',
      provider: this.name,
      maxTokenAllowed: 262144,
      maxCompletionTokens: 65536,
    },
    {
      name: 'cohere/north-mini-code:free',
      label: 'Cohere North Mini Code',
      provider: this.name,
      maxTokenAllowed: 262144,
      maxCompletionTokens: 65536,
    },
    {
      name: 'tencent/hy3:free',
      label: 'Tencent Hy3',
      provider: this.name,
      maxTokenAllowed: 262144,
      maxCompletionTokens: 65536,
    },
    {
      name: 'kilo-auto/free',
      label: 'Auto Free',
      provider: this.name,
      maxTokenAllowed: 262144,
      maxCompletionTokens: 65536,
    },
    {
      name: 'nvidia/nemotron-3-ultra-550b-a55b:free',
      label: 'NVIDIA Nemotron 3 Ultra',
      provider: this.name,
      maxTokenAllowed: 1000000,
      maxCompletionTokens: 65536,
    },
    {
      name: 'openrouter/free',
      label: 'OpenRouter Free',
      provider: this.name,
      maxTokenAllowed: 262144,
      maxCompletionTokens: 65536,
    },
  ];

  getModelInstance(options: {
    model: string;
    serverEnv: Env;
    apiKeys?: Record<string, string>;
    providerSettings?: Record<string, IProviderSetting>;
  }): LanguageModelV1 {
    const { model, serverEnv, apiKeys, providerSettings } = options;
    const envRecord = this.convertEnvToRecord(serverEnv);

    const { baseUrl, apiKey } = this.getProviderBaseUrlAndKey({
      apiKeys,
      providerSettings: providerSettings?.[this.name],
      serverEnv: envRecord,
      defaultBaseUrlKey: 'KILO_API_BASE_URL',
      defaultApiTokenKey: 'KILO_API_KEY',
    });

    if (!baseUrl) {
      throw new Error(`Missing configuration for ${this.name} provider`);
    }

    return getOpenAILikeModel(baseUrl, apiKey, model);
  }
}
