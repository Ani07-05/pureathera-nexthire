import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { role, answers } = await request.json()

    if (!role || !answers || !Array.isArray(answers)) {
      return NextResponse.json(
        { error: 'Role and answers are required' },
        { status: 400 }
      )
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const prompt = `
You are a technical hiring expert. Analyze the following interview answers for a ${role} position and determine the skill level.

Role: ${role}
Answers: ${answers.map((answer, index) => `Q${index + 1}: ${answer}`).join('\n')}

Based on the answers, categorize the candidate into one of these levels:
- L1 (Beginner): 0-2 years experience, basic concepts
- L2 (Intermediate): 2-5 years experience, solid fundamentals
- L3 (Senior/Advanced): 5+ years experience, advanced concepts and leadership

Provide your assessment in this JSON format:
{
  "level": "L1|L2|L3",
  "confidence": 0.0-1.0,
  "reasoning": "Brief explanation of the assessment",
  "strengths": ["strength1", "strength2"],
  "improvements": ["area1", "area2"],
  "score": 0-100
}
`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Parse the JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Failed to parse assessment response')
    }

    const assessment = JSON.parse(jsonMatch[0])

    return NextResponse.json({
      success: true,
      assessment
    })
  } catch (error) {
    console.error('Assessment error:', error)
    return NextResponse.json(
      { error: 'Failed to assess candidate' },
      { status: 500 }
    )
  }
}