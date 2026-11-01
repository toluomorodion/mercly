import React from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { OnboardingWizard } from '@/components/features/OnboardingWizard';

export default async function OnboardingPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect('/auth?mode=login');
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { onboardingCompleted: true, businessName: true, name: true },
  });

  if (!user) {
    redirect('/auth?mode=login');
  }

  if (user.onboardingCompleted) {
    redirect('/dashboard');
  }

  return <OnboardingWizard userName={user.name} initialBusinessName={user.businessName} />;
}
