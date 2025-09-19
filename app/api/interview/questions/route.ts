import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { role, level, questionType = 'assessment' } = await request.json()

    if (!role) {
      return NextResponse.json(
        { error: 'Role is required' },
        { status: 400 }
      )
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    let prompt: string

    if (questionType === 'assessment') {
      // Initial skill assessment questions
      prompt = `
Generate 8-10 progressive difficulty multiple choice questions to assess a candidate's skill level for a ${role} position.

Requirements:
- ALL questions must be multiple choice with 4 options (A, B, C, D)
- Start with basic conceptual questions (beginner level)
- Progress to intermediate technical questions
- Include 2-3 advanced scenario-based questions
- Questions should help distinguish between beginner (L1), intermediate (L2), and senior (L3) levels
- Make one option clearly correct, and the others plausible but wrong
- Avoid ambiguous questions

Return JSON array format:
[
  {
    "id": 1,
    "question": "Question text",
    "type": "multiple_choice",
    "difficulty": "beginner|intermediate|advanced",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Option A"
  }
]
`
    } else {
      // Interview questions based on determined level
      const levelDescription = {
        L1: 'beginner level (0-2 years experience)',
        L2: 'intermediate level (2-5 years experience)',
        L3: 'senior/advanced level (5+ years experience)'
      }

      prompt = `
Generate 5-7 interview questions for a ${role} position at ${levelDescription[level as keyof typeof levelDescription]}.

Include a mix of:
- Technical knowledge questions
- Problem-solving scenarios
- Behavioral questions relevant to the role
- Real-world application questions
- Questions commonly asked at top tech companies

Make questions appropriate for ${level} level candidate.

Return JSON array format:
[
  {
    "id": 1,
    "question": "Question text",
    "category": "technical|behavioral|problem_solving|system_design",
    "expectedPoints": ["point1", "point2"],
    "followUp": "Optional follow-up question"
  }
]
`
    }

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Parse the JSON from the response
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      throw new Error('Failed to parse questions response')
    }

    const questions = JSON.parse(jsonMatch[0])

    return NextResponse.json({
      success: true,
      questions,
      metadata: {
        role,
        level: level || 'assessment',
        questionType,
        count: questions.length
      }
    })
  } catch (error) {
    console.error('Questions generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate questions' },
      { status: 500 }
    )
  }
}