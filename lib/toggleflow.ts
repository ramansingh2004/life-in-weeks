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
    timeoutMs:
      process.env.NODE_ENV === 'development'
        ? 5_000
        : 15_000,
    maxRetries: 2,
    retryBaseDelayMs: 100,
    retryMaxDelayMs: 5_000,

    onError(error: ToggleFlowError) {
  console.warn(
    [
      '[ToggleFlow] Evaluation failed',
      `code=${error.code}`,
      `status=${error.statusCode ?? 'none'}`,
      `message=${error.message}`,
    ].join(' | ')
  );
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
    const message =
  error instanceof Error
    ? error.message
    : String(error);

console.warn(
  `[ToggleFlow] Using fallback for "${key}": ${message}`
);

    return fallback;
  }
}

interface TrackFeatureConversionOptions {
  eventId?: string;
  metadata?: Record<string, unknown>;
}

export async function trackFeatureConversion(
  flagKey: string,
  userId: string,
  conversionType: string,
  options: TrackFeatureConversionOptions = {}
): Promise<boolean> {
  try {
    const result =
      await getToggleFlowClient().trackFlagConversion(
        flagKey,
        userId,
        conversionType,
        {
          eventId: options.eventId,
          metadata: options.metadata,
        }
      );

    return result.recorded || result.duplicate;
  } catch (error) {
    console.error(
      'Unable to record ToggleFlow conversion:',
      {
        flagKey,
        conversionType,
        error,
      }
    );

    // Analytics failures must not break the user's action.
    return false;
  }
}

export function clearToggleFlowCache(): void {
  globalForToggleFlow.__lifeInWeeksToggleFlow?.clearCache();
}