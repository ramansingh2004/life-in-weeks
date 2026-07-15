import { headers } from 'next/headers';

import LandingPageClient from '../components/landing-page-client';
import { isFeatureEnabled } from '@/lib/toggleflow';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Page() {
  const requestHeaders = await headers();

  const visitorId =
    requestHeaders.get(
      'x-toggleflow-visitor-id'
    ) ?? 'anonymous';

  const loginModeEnabled =
    await isFeatureEnabled(
      'login_button',
      visitorId,
      false
    );

  return (
    <LandingPageClient
      LoginModeEnabled={loginModeEnabled}
    />
  );
}