import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST - Create new job posting
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
        { error: 'Only recruiters can create job postings' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      title,
      description,
      required_skills,
      experience_level,
      location,
      salary_range,
      status
    } = body

    // Validate required fields
    if (!title || !required_skills || !experience_level) {
      return NextResponse.json(
        { error: 'Title, required skills, and experience level are required' },
        { status: 400 }
      )
    }

    // Insert job posting
    const { data, error } = await supabase
      .from('job_postings')
      .insert({
        recruiter_id: user.id,
        title,
        description: description || null,
        required_skills: Array.isArray(required_skills) ? required_skills : [],
        experience_level,
        location: location || null,
        salary_range: salary_range || null,
        status: status || 'active'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating job posting:', error)
      return NextResponse.json(
        { error: 'Failed to create job posting' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error: any) {
    console.error('Error in create job route:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET - Fetch job postings
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

    // Get user role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    let query = supabase.from('job_postings').select('*')

    // Recruiters see their own posts
    // Candidates see all active posts
    if (profile.role === 'recruiter') {
      query = query.eq('recruiter_id', user.id)
    } else if (profile.role === 'candidate') {
      query = query.eq('status', 'active')
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching job postings:', error)
      return NextResponse.json(
        { error: 'Failed to fetch job postings' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data }, { status: 200 })
  } catch (error: any) {
    console.error('Error in get jobs route:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
