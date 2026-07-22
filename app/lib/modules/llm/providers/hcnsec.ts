import { BaseProvider, getOpenAILikeModel } from '~/lib/modules/llm/base-provider';
import type { ModelInfo } from '~/lib/modules/llm/types';
import type { IProviderSetting } from '~/types/model';
import type { LanguageModelV1 } from 'ai';
import { logger } from '~/utils/logger';

interface HcnsecModelsResponse {
  data?: Array<{ id: string }>;
  models?: Array<{ id: string; name?: string }>;
}

export default class HcnsecProvider extends BaseProvider {
  name = 'Hcnsec';
  getApiKeyLink = undefined;

  config = {
    baseUrlKey: 'HCNSEC_API_BASE_URL',
    apiTokenKey: 'HCNSEC_API_KEY',
    baseUrl: 'https://api.hcnsec.cn/v1',
  };

  staticModels: ModelInfo[] = [
    {
      name: 'Qwen3.6-35B-A3B',
      label: 'Qwen 3.6 35B-A3B',
      provider: this.name,
      maxTokenAllowed: 128000,
      maxCompletionTokens: 8192,
    },
    {
      name: 'Qwen3.5-397B-A17B',
      label: 'Qwen 3.5 397B-A17B',
      provider: this.name,
      maxTokenAllowed: 128000,
      maxCompletionTokens: 8192,
    },
    {
      name: 'step-3.5-flash',
      label: 'Step 3.5 Flash',
      provider: this.name,
      maxTokenAllowed: 128000,
      maxCompletionTokens: 8192,
    },
    {
      name: 'kat-coder-pro-v2',
      label: 'Kat Coder Pro V2',
      provider: this.name,
      maxTokenAllowed: 128000,
      maxCompletionTokens: 8192,
    },
    {
      name: 'MiniMax-M2.7',
      label: 'MiniMax M2.7',
      provider: this.name,
      maxTokenAllowed: 128000,
      maxCompletionTokens: 8192,
    },
    {
      name: 'MiniMax-M3',
      label: 'MiniMax M3',
      provider: this.name,
      maxTokenAllowed: 128000,
      maxCompletionTokens: 8192,
    },
    {
      name: 'step-3.5-flash-2603',
      label: 'Step 3.5 Flash 2603',
      provider: this.name,
      maxTokenAllowed: 128000,
      maxCompletionTokens: 8192,
    },
  ];

  async getDynamicModels(
    apiKeys?: Record<string, string>,
    settings?: IProviderSetting,
    serverEnv: Record<string, string> = {},
  ): Promise<ModelInfo[]> {
    const { baseUrl, apiKey } = this.getProviderBaseUrlAndKey({
      apiKeys,
      providerSettings: settings,
      serverEnv,
      defaultBaseUrlKey: 'HCNSEC_API_BASE_URL',
      defaultApiTokenKey: 'HCNSEC_API_KEY',
    });

    if (!baseUrl || !apiKey) {
      return this.staticModels;
    }

    try {
      const response = await fetch(`${baseUrl}/models`, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        signal: this.createTimeoutSignal(),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const res = (await response.json()) as HcnsecModelsResponse;
      const rawModels = res.data || res.models || [];
      const models = rawModels.map((m) => ({
        name: m.id,
        label: m.id,
        provider: this.name,
        maxTokenAllowed: 128000,
        maxCompletionTokens: 8192,
      }));

      return models.length > 0 ? models : this.staticModels;
    } catch (error) {
      logger.info(`${this.name}: Could not fetch /models endpoint, using static models`, error);

      return this.staticModels;
    }
  }

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
      defaultBaseUrlKey: 'HCNSEC_API_BASE_URL',
      defaultApiTokenKey: 'HCNSEC_API_KEY',
    });

    if (!baseUrl) {
      throw new Error(`Missing configuration for ${this.name} provider`);
    }

    return getOpenAILikeModel(baseUrl, apiKey, model);
  }
}
