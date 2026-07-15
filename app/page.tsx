import LandingPageClient from '../components/landing-page-client';

import { isFeatureEnabled } from '@/lib/toggleflow';

/*
 * Ensure the flag is evaluated at request time instead of
 * permanently capturing its value during next build.
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Page() {
  const LoginModeEnabled =
    await isFeatureEnabled(
      'login_button',
      'life-in-weeks-landing',
      false
    );

  return (
    <LandingPageClient
      LoginModeEnabled={LoginModeEnabled}
    />
  );
}