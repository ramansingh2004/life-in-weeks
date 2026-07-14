import 'server-only';

import {
  ToggleFlow,
  type ToggleFlowError,
} from '@toggleflow/node';

const globalForToggleFlow =
  globalThis as typeof globalThis & {
    __lifeInWeeksToggleFlow?: ToggleFlow;
  };

function createToggleFlowClient(): ToggleFlow {
  const apiKey =
    process.env.TOGGLEFLOW_API_KEY;

  const baseUrl =
    process.env.TOGGLEFLOW_API_URL;

  if (!apiKey) {
    throw new Error(
      'TOGGLEFLOW_API_KEY is not configured.'
    );
  }

  if (!baseUrl) {
    throw new Error(
      'TOGGLEFLOW_API_URL is not configured.'
    );
  }

  return new ToggleFlow({
    apiKey,
    baseUrl,

    // Faster flag changes while developing locally.
    cacheTtlMs:
      process.env.NODE_ENV === 'development'
        ? 1_000
        : 30_000,

    staleTtlMs: 5 * 60_000,
    maxCacheEntries: 1_000,
    timeoutMs: 3_000,
    maxRetries: 2,
    retryBaseDelayMs: 100,
    retryMaxDelayMs: 5_000,

    onError(error: ToggleFlowError) {
      console.error('ToggleFlow evaluation failed', {
        code: error.code,
        statusCode: error.statusCode,
        message: error.message,
      });
    },
  });
}

export function getToggleFlowClient(): ToggleFlow {
  if (!globalForToggleFlow.__lifeInWeeksToggleFlow) {
    globalForToggleFlow.__lifeInWeeksToggleFlow =
      createToggleFlowClient();
  }

  return globalForToggleFlow.__lifeInWeeksToggleFlow;
}

export async function isFeatureEnabled(
  key: string,
  userId: string,
  fallback = false
): Promise<boolean> {
  try {
    return await getToggleFlowClient().isEnabled(
      key,
      { userId },
      fallback
    );
  } catch (error) {
    console.error(
      'Unable to initialize ToggleFlow:',
      error
    );

    return fallback;
  }
}

export function clearToggleFlowCache(): void {
  globalForToggleFlow.__lifeInWeeksToggleFlow?.clearCache();
}