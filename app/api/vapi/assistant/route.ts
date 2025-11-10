import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { role, level } = await request.json()

    if (!role || !level) {
      return NextResponse.json(
        { error: 'Role and level are required' },
        { status: 400 }
      )
    }

    const vapiPrivateKey = process.env.VAPI_PRIVATE_API_KEY
    const vapiPublicKey = process.env.VAPI_PUBLIC_API_KEY

    if (!vapiPrivateKey || !vapiPublicKey) {
      return NextResponse.json(
        { error: 'Vapi API keys not configured' },
        { status: 500 }
      )
    }

    // Define the system prompt with dynamic variables for interview context
    const systemPrompt = `You are an experienced technical interviewer conducting a professional interview for a {{role}} position.

CANDIDATE CONTEXT:
- Level: {{level}} ({{levelDescription}})
- Assessment Score: {{score}}/100
- Key Strengths: {{strengths}}
- Areas to Focus On: {{improvements}}
- Assessment Reasoning: {{reasoning}}

YOUR ROLE:
1. Start by greeting the candidate warmly and introducing yourself as their AI interviewer
2. Acknowledge their {{level}} level assessment result
3. Ask 5-7 technical interview questions appropriate for their level
4. Ask one question at a time and wait for their complete answer
5. Provide brief, constructive feedback after each answer
6. Focus questions on their strengths while gently probing their improvement areas
7. Adapt difficulty based on their responses
8. Maintain a professional yet friendly tone throughout

QUESTION GUIDELINES:
- For L1 (Beginner): Focus on fundamental concepts, basic problem-solving, and learning mindset
- For L2 (Intermediate): Include practical applications, independent problem-solving, and some system design
- For L3 (Senior): Cover system design, architectural decisions, leadership scenarios, and advanced concepts

INTERVIEW FLOW:
1. Introduction and warm-up
2. Technical questions (5-7 questions)
3. Closing: Thank them and mention they'll receive detailed feedback

Keep responses concise and conversational. After each answer, give a score out of 10 and brief feedback before moving to the next question.`

    // Create Vapi assistant with the system prompt
    const vapiResponse = await fetch('https://api.vapi.ai/assistant', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${vapiPrivateKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: `${role} Interview - ${level}`,
        model: {
          provider: 'openai',
          model: 'gpt-4',
          temperature: 0.7,
          systemPrompt: systemPrompt,
          messages: [
            {
              role: 'system',
              content: systemPrompt
            }
          ]
        },
        voice: {
          provider: '11labs',
          voiceId: 'sarah', // Professional female voice
        },
        transcriber: {
          provider: 'deepgram',
          model: 'nova-2',
          language: 'en'
        },
        firstMessage: `Hello! I'm your AI interviewer today. I've reviewed your {{level}} level assessment for the {{role}} position, and I'm impressed with your score of {{score}}. Let's have a great conversation! Are you ready to begin?`,
        recordingEnabled: true,
        endCallFunctionEnabled: false,
        silenceTimeoutSeconds: 30,
        maxDurationSeconds: 1800, // 30 minutes max
        backgroundSound: 'office'
      })
    })

    if (!vapiResponse.ok) {
      const errorText = await vapiResponse.text()
      console.error('Vapi API error:', errorText)
      return NextResponse.json(
        { error: 'Failed to create Vapi assistant', details: errorText },
        { status: 500 }
      )
    }

    const vapiData = await vapiResponse.json()

    return NextResponse.json({
      success: true,
      assistantId: vapiData.id,
      publicKey: vapiPublicKey,
      metadata: {
        role,
        level,
        assistantName: vapiData.name
      }
    })
  } catch (error) {
    console.error('Assistant creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create interview assistant' },
      { status: 500 }
    )
  }
}

// Get assistant details
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const assistantId = searchParams.get('assistantId')

    if (!assistantId) {
      return NextResponse.json(
        { error: 'assistantId is required' },
        { status: 400 }
      )
    }

    const vapiPrivateKey = process.env.VAPI_PRIVATE_API_KEY

    if (!vapiPrivateKey) {
      return NextResponse.json(
        { error: 'Vapi API key not configured' },
        { status: 500 }
      )
    }

    const vapiResponse = await fetch(`https://api.vapi.ai/assistant/${assistantId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${vapiPrivateKey}`
      }
    })

    if (!vapiResponse.ok) {
      const errorText = await vapiResponse.text()
      console.error('Vapi API error:', errorText)
      return NextResponse.json(
        { error: 'Failed to get assistant details' },
        { status: 500 }
      )
    }

    const assistantData = await vapiResponse.json()

    return NextResponse.json({
      success: true,
      assistant: assistantData
    })
  } catch (error) {
    console.error('Get assistant error:', error)
    return NextResponse.json(
      { error: 'Failed to get assistant details' },
      { status: 500 }
    )
  }
}

// Delete assistant (cleanup)
export async function DELETE(request: NextRequest) {
  try {
    const { assistantId } = await request.json()

    if (!assistantId) {
      return NextResponse.json(
        { error: 'assistantId is required' },
        { status: 400 }
      )
    }

    const vapiPrivateKey = process.env.VAPI_PRIVATE_API_KEY

    if (!vapiPrivateKey) {
      return NextResponse.json(
        { error: 'Vapi API key not configured' },
        { status: 500 }
      )
    }

    const vapiResponse = await fetch(`https://api.vapi.ai/assistant/${assistantId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${vapiPrivateKey}`
      }
    })

    if (!vapiResponse.ok) {
      const errorText = await vapiResponse.text()
      console.error('Vapi API error:', errorText)
      return NextResponse.json(
        { error: 'Failed to delete assistant' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Assistant deleted successfully'
    })
  } catch (error) {
    console.error('Delete assistant error:', error)
    return NextResponse.json(
      { error: 'Failed to delete assistant' },
      { status: 500 }
    )
  }
}
