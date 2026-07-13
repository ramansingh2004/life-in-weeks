interface ToggleFlowResponse {
  success: boolean;
  data: Record<string, boolean>;
}

export async function getToggleFlowFlags(
  userId: string
): Promise<Record<string, boolean>> {
  const apiUrl = process.env.TOGGLEFLOW_API_URL;
  const apiKey = process.env.TOGGLEFLOW_API_KEY;

  if (!apiUrl || !apiKey) {
    throw new Error(
      'ToggleFlow environment variables are missing'
    );
  }

  const response = await fetch(
    `${apiUrl}/sdk/flags?userId=${encodeURIComponent(userId)}`,
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      cache: 'no-store',
    }
  );

  if (!response.ok) {
    throw new Error(
      `ToggleFlow returned ${response.status}`
    );
  }

  const result =
    (await response.json()) as ToggleFlowResponse;

  return result.data;
}