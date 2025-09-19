import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { userId, role, level } = await request.json()

    if (!userId || !role || !level) {
      return NextResponse.json(
        { error: 'userId, role, and level are required' },
        { status: 400 }
      )
    }

    // Create Anam.ai session token using new API
    const anamApiKey = process.env.ANAM_API_KEY

    if (!anamApiKey) {
      return NextResponse.json(
        { error: 'Anam API key not configured' },
        { status: 500 }
      )
    }

    // Call Anam.ai session token API
    const anamResponse = await fetch('https://api.anam.ai/v1/auth/session-token', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${anamApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        clientLabel: `interview-${userId}`,
        personaConfig: {
          name: "Alex",
          avatarId: "30fa96d0-26c4-4e55-94a0-517025942e18",
          voiceId: "6bfbe25a-979d-40f3-a92b-5394170af54b",
          brainType: "ANAM_GPT_4O_MINI_V1",
          systemPrompt: `You are an experienced ${role} interviewer conducting a technical interview at ${level} level. Ask thoughtful questions, provide constructive feedback, and maintain a professional yet friendly demeanor. Focus on technical skills, problem-solving abilities, and relevant experience.`,
          maxSessionLengthSeconds: 1800 // 30 minutes
        }
      })
    })

    if (!anamResponse.ok) {
      const errorText = await anamResponse.text()
      console.error('Anam API error:', errorText)
      return NextResponse.json(
        { error: 'Failed to create Anam session' },
        { status: 500 }
      )
    }

    const anamData = await anamResponse.json()

    return NextResponse.json({
      success: true,
      sessionToken: anamData.sessionToken,
      sessionId: `anam_session_${Date.now()}`,
      metadata: {
        role,
        level,
        userId,
        clientLabel: `interview-${userId}`
      }
    })
  } catch (error) {
    console.error('Session creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create interview session' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { sessionId } = await request.json()

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 }
      )
    }

    // For Azure sessions, cleanup is handled client-side
    // This endpoint is mainly for logging/tracking purposes
    console.log(`Ending Azure avatar session: ${sessionId}`)

    return NextResponse.json({
      success: true,
      message: 'Session ended successfully'
    })
  } catch (error) {
    console.error('Session deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to end interview session' },
      { status: 500 }
    )
  }
}