import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createClient()
    const { data: sessionData, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && sessionData.session) {
      const user = sessionData.user
      const session = sessionData.session

      // Extract provider token if available
      const providerToken = session.provider_token
      const providerRefreshToken = session.provider_refresh_token

      console.log('OAuth callback - provider_token available:', !!providerToken)
      console.log('OAuth callback - provider_refresh_token available:', !!providerRefreshToken)

      // If GitHub provider token exists, store it in user metadata
      if (providerToken && user) {
        const githubIdentity = user.identities?.find(i => i.provider === 'github')

        if (githubIdentity) {
          console.log('Storing GitHub token in user app_metadata')

          // Store in a custom table for provider tokens
          const { error: tokenError } = await supabase
            .from('user_provider_tokens')
            .upsert({
              user_id: user.id,
              provider: 'github',
              access_token: providerToken,
              refresh_token: providerRefreshToken,
              updated_at: new Date().toISOString()
            })

          if (tokenError) {
            console.error('Failed to store provider token:', tokenError)
            // Continue anyway - this is optional
          } else {
            console.log('✅ GitHub token stored successfully')
          }
        }
      }

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, onboarded')
          .eq('id', user.id)
          .single()

        // If not onboarded, redirect to onboarding
        if (profile && !profile.onboarded) {
          return NextResponse.redirect(`${origin}/onboarding`)
        }

        // Redirect based on role
        if (profile?.role === 'candidate') {
          return NextResponse.redirect(`${origin}/job-seeker`)
        } else if (profile?.role === 'recruiter') {
          return NextResponse.redirect(`${origin}/recruiter`)
        }
      }
    }
  }

  // If error or no user, redirect to login
  return NextResponse.redirect(`${origin}/auth/login`)
}
