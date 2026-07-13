import { getToggleFlowFlags } from '@/lib/toggleflow';
import LandingPageClient from '../components/landing-page-client';

export default async function Page() {
  let aModeEnabled = false;

  try {
    const flags = await getToggleFlowFlags(
      'test-user-123'
    );

    aModeEnabled = flags['a_mode'] ?? false;
  } catch (error) {
    console.error(
      'Unable to load ToggleFlow flags:',
      error
    );
  }

  return (
    <LandingPageClient
      aModeEnabled={aModeEnabled}
    />
  );
}