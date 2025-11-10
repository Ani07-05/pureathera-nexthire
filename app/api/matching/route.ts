import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { findMatchingCandidates, cacheMatches } from '@/lib/matching-algorithm-v2'

/**
 * POST /api/matching - Find and rank candidates for a job posting
 * Query params: ?jobId=xxx
 */
export async function POST(request: NextRequest) {
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

    // Verify user is a recruiter
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'recruiter') {
      return NextResponse.json(
        { error: 'Only recruiters can access matching' },
        { status: 403 }
      )
    }

    // Get job ID from query params
    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('jobId')

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      )
    }

    // Verify job belongs to this recruiter
    const { data: job } = await supabase
      .from('job_postings')
      .select('*')
      .eq('id', jobId)
      .eq('recruiter_id', user.id)
      .single()

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found or access denied' },
        { status: 404 }
      )
    }

    // Run matching algorithm
    console.log(`Running matching algorithm for job: ${job.title}`)
    const matches = await findMatchingCandidates(jobId)

    // Cache results for faster future retrieval
    await cacheMatches(jobId, matches)

    return NextResponse.json({
      success: true,
      data: {
        jobTitle: job.title,
        totalMatches: matches.length,
        matches
      }
    }, { status: 200 })
  } catch (error: any) {
    console.error('Error in matching route:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/matching - Retrieve cached matches
 * Query params: ?jobId=xxx
 */
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

    // Get job ID from query params
    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('jobId')

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      )
    }

    // Verify job belongs to this recruiter
    const { data: job } = await supabase
      .from('job_postings')
      .select('*')
      .eq('id', jobId)
      .eq('recruiter_id', user.id)
      .single()

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found or access denied' },
        { status: 404 }
      )
    }

    // Fetch cached matches
    const { data: cachedMatches, error } = await supabase
      .from('candidate_matches')
      .select(`
        *,
        candidate:candidate_profiles!candidate_id (
          id,
          target_role,
          experience_years,
          skills,
          github_username,
          github_data
        )
      `)
      .eq('job_posting_id', jobId)
      .order('match_score', { ascending: false })

    if (error) {
      console.error('Error fetching cached matches:', error)
    }

    if (!cachedMatches || cachedMatches.length === 0) {
      // No cached matches, trigger new matching
      return NextResponse.json({
        success: true,
        data: {
          jobTitle: job.title,
          totalMatches: 0,
          matches: [],
          needsRefresh: true
        }
      }, { status: 200 })
    }

    return NextResponse.json({
      success: true,
      data: {
        jobTitle: job.title,
        totalMatches: cachedMatches.length,
        matches: cachedMatches
      }
    }, { status: 200 })
  } catch (error: any) {
    console.error('Error in get matching route:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
