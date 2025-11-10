import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/candidate/profile - Fetch candidate profile with aggregated stats
 */
export async function GET() {
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

    // Fetch profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Fetch candidate profile
    const { data: candidateProfile, error: candidateError } = await supabase
      .from('candidate_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    // Fetch interview results
    const { data: interviewResults, error: interviewError } = await supabase
      .from('interview_results')
      .select('*')
      .eq('candidate_id', user.id)
      .order('created_at', { ascending: false })

    // Calculate stats
    const totalInterviews = interviewResults?.length || 0
    const avgScore = totalInterviews > 0
      ? Math.round(
          interviewResults.reduce((sum, r) => sum + (r.score || 0), 0) / totalInterviews
        )
      : 0

    const highestLevel = interviewResults?.[0]?.level || null
    const latestInterview = interviewResults?.[0] || null

    // Calculate profile completion
    const completionFactors = [
      !!candidateProfile?.target_role,
      !!candidateProfile?.experience_years,
      candidateProfile?.skills && candidateProfile.skills.length > 0,
      !!candidateProfile?.github_data,
      totalInterviews > 0,
    ]
    const profileCompletion = Math.round(
      (completionFactors.filter(Boolean).length / completionFactors.length) * 100
    )

    return NextResponse.json({
      success: true,
      data: {
        // Profile info
        id: user.id,
        email: user.email,
        fullName: profile.full_name || user.user_metadata?.full_name || null,
        role: profile.role,

        // Candidate-specific data
        targetRole: candidateProfile?.target_role || null,
        experienceYears: candidateProfile?.experience_years || 0,
        skills: candidateProfile?.skills || [],
        githubUsername: candidateProfile?.github_username || null,
        githubData: candidateProfile?.github_data || null,
        location: candidateProfile?.location || null,

        // Interview stats
        totalInterviews,
        avgScore,
        highestLevel,
        latestInterview,

        // Calculated metrics
        profileCompletion,

        // Activity data
        createdAt: profile.created_at,
        updatedAt: profile.updated_at,
      }
    })
  } catch (error: any) {
    console.error('Error fetching candidate profile:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
