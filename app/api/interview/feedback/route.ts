import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { question, answer, role, level, category } = await request.json()

    if (!question || !answer || !role || !level) {
      return NextResponse.json(
        { error: 'Question, answer, role, and level are required' },
        { status: 400 }
      )
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const prompt = `
You are an expert interviewer providing real-time feedback for a ${role} interview at ${level} level.

Question: ${question}
Candidate's Answer: ${answer}
Question Category: ${category || 'general'}

Provide constructive feedback in this JSON format:
{
  "score": 0-10,
  "feedback": "Brief, encouraging feedback focusing on strengths and improvements",
  "suggestions": ["specific suggestion 1", "specific suggestion 2"],
  "keyPoints": ["key point covered", "key point missed"],
  "followUp": "Optional follow-up question to dive deeper",
  "improvementAreas": ["area1", "area2"]
}

Keep feedback:
- Constructive and encouraging
- Specific and actionable
- Appropriate for the ${level} level
- Under 150 words for the main feedback
`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Parse the JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Failed to parse feedback response')
    }

    const feedback = JSON.parse(jsonMatch[0])

    return NextResponse.json({
      success: true,
      feedback,
      metadata: {
        question,
        role,
        level,
        category,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Feedback generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate feedback' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Generate overall interview summary
    const { interviewData, role, level } = await request.json()

    if (!interviewData || !role || !level) {
      return NextResponse.json(
        { error: 'Interview data, role, and level are required' },
        { status: 400 }
      )
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const prompt = `
Analyze the complete interview for a ${role} position at ${level} level and provide a comprehensive summary.

Interview Data: ${JSON.stringify(interviewData)}

Generate a final interview report in this JSON format:
{
  "overallScore": 0-100,
  "recommendation": "Strong Hire|Hire|No Hire|Strong No Hire",
  "summary": "Overall interview performance summary",
  "strengths": ["strength1", "strength2", "strength3"],
  "improvements": ["improvement1", "improvement2"],
  "technicalAssessment": {
    "score": 0-100,
    "comments": "Technical skills evaluation"
  },
  "communicationAssessment": {
    "score": 0-100,
    "comments": "Communication skills evaluation"
  },
  "nextSteps": ["recommended next step 1", "recommended next step 2"]
}
`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Parse the JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Failed to parse summary response')
    }

    const summary = JSON.parse(jsonMatch[0])

    return NextResponse.json({
      success: true,
      summary,
      metadata: {
        role,
        level,
        interviewDate: new Date().toISOString(),
        questionCount: interviewData.questions?.length || 0
      }
    })
  } catch (error) {
    console.error('Summary generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate interview summary' },
      { status: 500 }
    )
  }
}