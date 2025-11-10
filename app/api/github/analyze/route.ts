import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { fetchGitHubProfile, analyzeGitHubWithAI } from '@/lib/github-analyzer'
import { Octokit } from '@octokit/rest'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get authenticated user and session
    const {
      data: { session },
      error: authError
    } = await supabase.auth.getSession()

    if (authError || !session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = session.user

    // Check if user has GitHub provider
    const githubIdentity = user.identities?.find(
      (identity) => identity.provider === 'github'
    )

    if (!githubIdentity) {
      return NextResponse.json(
        { error: 'GitHub account not connected. Please sign in with GitHub.' },
        { status: 400 }
      )
    }

    // Try to get provider token from session
    let accessToken = session.provider_token

    // If not in session, try from our custom storage table
    if (!accessToken) {
      console.log('Provider token not in session, checking custom storage table...')

      const { data: tokenData } = await supabase
        .from('user_provider_tokens')
        .select('access_token')
        .eq('user_id', user.id)
        .eq('provider', 'github')
        .single()

      if (tokenData?.access_token) {
        accessToken = tokenData.access_token
        console.log('Found GitHub token in custom storage table')
      }
    }

    // If still no token, try from identity data
    if (!accessToken) {
      const identityData = githubIdentity.identity_data as any
      accessToken = identityData?.provider_token || identityData?.access_token
    }

    // If still no token, try fallback to environment variable (for testing only)
    if (!accessToken) {
      console.warn('GitHub token not found in session/storage/identity.')
      console.log('Available session keys:', Object.keys(session))

      // Fallback to personal access token from environment (testing only)
      accessToken = process.env.GITHUB_PERSONAL_ACCESS_TOKEN

      if (!accessToken) {
        return NextResponse.json(
          {
            error: 'GitHub access token not found. Please reconnect your GitHub account.',
            solution: 'Sign out and sign in again with GitHub to re-authorize access.',
            hint: 'The OAuth flow needs to store the provider token. This should happen automatically on next login.'
          },
          { status: 400 }
        )
      }

      console.log('Using fallback GitHub token from environment variable (testing only)')
    }

    console.log('GitHub access token found, length:', accessToken.length)

    // Fetch GitHub profile and repos
    console.log('Fetching GitHub profile...')
    const { user: githubUser, repos } = await fetchGitHubProfile(accessToken)

    // Create Octokit instance for activity graph
    const octokit = new Octokit({ auth: accessToken })

     // Analyze with AI
     console.log('Analyzing with AI...')
     const analysis = await analyzeGitHubWithAI(githubUser.login, githubUser, repos, octokit)

    // Update candidate profile with GitHub data
    const { error: updateError } = await supabase
      .from('candidate_profiles')
      .update({
        github_username: githubUser.login,
        github_data: analysis as any,
        skills: analysis.skills // Update skills array
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error updating candidate profile:', updateError)
      return NextResponse.json(
        { error: 'Failed to save GitHub analysis' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: analysis
    }, { status: 200 })
  } catch (error: any) {
    console.error('Error in GitHub analysis:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET - Retrieve stored GitHub analysis
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch candidate profile with GitHub data
    const { data, error } = await supabase
      .from('candidate_profiles')
      .select('github_username, github_data')
      .eq('id', user.id)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch GitHub analysis' },
        { status: 500 }
      )
    }

    if (!data.github_data) {
      return NextResponse.json(
        { error: 'No GitHub analysis found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data.github_data
    }, { status: 200 })
  } catch (error: any) {
    console.error('Error fetching GitHub analysis:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Clear cached GitHub analysis (force re-analysis)
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🗑️ Clearing GitHub analysis cache for user:', user.id)

    // Clear GitHub analysis from database
    const { error } = await supabase
      .from('candidate_profiles')
      .update({
        github_data: null
      })
      .eq('id', user.id)

    if (error) {
      console.error('Error clearing GitHub cache:', error)
      return NextResponse.json(
        { error: 'Failed to clear GitHub cache' },
        { status: 500 }
      )
    }

    console.log('✅ GitHub analysis cache cleared successfully')

    return NextResponse.json({
      success: true,
      message: 'GitHub analysis cache cleared. Click Analyze to refresh.'
    }, { status: 200 })
  } catch (error: any) {
    console.error('Error clearing GitHub cache:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
