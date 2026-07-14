import LandingPageClient from '../components/landing-page-client';

import { isFeatureEnabled } from '@/lib/toggleflow';

/*
 * Ensure the flag is evaluated at request time instead of
 * permanently capturing its value during next build.
 */
export const dynamic = 'force-dynamic';

export default async function Page() {
  const aModeEnabled =
    await isFeatureEnabled(
      'a_mode',
      'life-in-weeks-landing',
      false
    );

  return (
    <LandingPageClient
      aModeEnabled={aModeEnabled}
    />
  );
}