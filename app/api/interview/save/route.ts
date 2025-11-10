import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

    const body = await request.json()
    const {
      role,
      level,
      score,
      strengths,
      improvements,
      assessment_summary,
      transcript_summary,
      vapi_session_id
    } = body

    // Validate required fields
    if (!role || !level) {
      return NextResponse.json(
        { error: 'Role and level are required' },
        { status: 400 }
      )
    }

    // Insert interview result
    const { data, error } = await supabase
      .from('interview_results')
      .insert({
        user_id: user.id,
        role,
        level,
        score: score || null,
        strengths: strengths || [],
        improvements: improvements || [],
        assessment_summary: assessment_summary || null,
        transcript_summary: transcript_summary || null,
        vapi_session_id: vapi_session_id || null
      })
      .select()
      .single()

    if (error) {
      console.error('Error saving interview result:', error)
      return NextResponse.json(
        { error: 'Failed to save interview result' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error: any) {
    console.error('Error in save interview route:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET - Fetch user's interview history
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

    // Fetch user's interview results
    const { data, error } = await supabase
      .from('interview_results')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching interview results:', error)
      return NextResponse.json(
        { error: 'Failed to fetch interview results' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data }, { status: 200 })
  } catch (error: any) {
    console.error('Error in get interview route:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
