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

    const vapiPublicKey = process.env.VAPI_PUBLIC_API_KEY

    if (!vapiPublicKey) {
      return NextResponse.json(
        { error: 'Vapi API key not configured' },
        { status: 500 }
      )
    }

    // Create Vapi assistant for this interview session
    const assistantResponse = await fetch(`${request.nextUrl.origin}/api/vapi/assistant`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ role, level })
    })

    if (!assistantResponse.ok) {
      const errorText = await assistantResponse.text()
      console.error('Failed to create Vapi assistant:', errorText)
      return NextResponse.json(
        { error: 'Failed to create interview assistant' },
        { status: 500 }
      )
    }

    const assistantData = await assistantResponse.json()

    return NextResponse.json({
      success: true,
      assistantId: assistantData.assistantId,
      publicKey: assistantData.publicKey,
      sessionId: `vapi_session_${Date.now()}`,
      metadata: {
        role,
        level,
        userId,
        provider: 'vapi'
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
    const { sessionId, assistantId } = await request.json()

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 }
      )
    }

    // For Vapi sessions, cleanup is handled client-side
    // Optionally delete the assistant if provided
    if (assistantId) {
      try {
        await fetch(`${request.nextUrl.origin}/api/vapi/assistant`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ assistantId })
        })
        console.log(`Deleted Vapi assistant: ${assistantId}`)
      } catch (error) {
        console.error('Failed to delete assistant:', error)
        // Non-critical, continue anyway
      }
    }

    console.log(`Ending Vapi interview session: ${sessionId}`)

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