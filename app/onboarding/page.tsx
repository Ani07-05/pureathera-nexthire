import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { OnboardingForm } from '@/components/onboarding/onboarding-form'

export default async function OnboardingPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Check if already onboarded
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, onboarded')
    .eq('id', user.id)
    .single()

  if (profile?.onboarded) {
    // Already onboarded, redirect to dashboard
    if (profile.role === 'candidate') {
      redirect('/job-seeker')
    } else {
      redirect('/recruiter')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted/20">
      <OnboardingForm user={user} role={profile?.role || 'candidate'} />
    </div>
  )
}
