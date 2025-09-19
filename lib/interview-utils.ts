export interface AssessmentQuestion {
  id: number
  question: string
  type: 'multiple_choice'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  options: string[]
  correctAnswer: string
}

export interface InterviewQuestion {
  id: number
  question: string
  category: 'technical' | 'behavioral' | 'problem_solving' | 'system_design'
  expectedPoints: string[]
  followUp?: string
}

export interface AssessmentResult {
  level: 'L1' | 'L2' | 'L3'
  confidence: number
  reasoning: string
  strengths: string[]
  improvements: string[]
  score: number
}

export interface InterviewFeedback {
  score: number
  feedback: string
  suggestions: string[]
  keyPoints: string[]
  followUp?: string
  improvementAreas: string[]
}

export interface InterviewSummary {
  overallScore: number
  recommendation: 'Strong Hire' | 'Hire' | 'No Hire' | 'Strong No Hire'
  summary: string
  strengths: string[]
  improvements: string[]
  technicalAssessment: {
    score: number
    comments: string
  }
  communicationAssessment: {
    score: number
    comments: string
  }
  nextSteps: string[]
}

export interface InterviewSession {
  id: string
  userId: string
  role: string
  level?: 'L1' | 'L2' | 'L3'
  status: 'setup' | 'assessment' | 'interview' | 'completed'
  sessionToken?: string
  questions: (AssessmentQuestion | InterviewQuestion)[]
  answers: { questionId: number; answer: string; timestamp: Date }[]
  feedback: InterviewFeedback[]
  summary?: InterviewSummary
  createdAt: Date
  updatedAt: Date
}

// Popular job roles for the dropdown
export const popularRoles = [
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Software Engineer',
  'DevOps Engineer',
  'Data Scientist',
  'Machine Learning Engineer',
  'Product Manager',
  'UI/UX Designer',
  'Quality Assurance Engineer',
  'Mobile Developer (iOS)',
  'Mobile Developer (Android)',
  'Cloud Architect',
  'Cybersecurity Engineer',
  'Database Administrator',
  'System Administrator',
  'Technical Lead',
  'Engineering Manager',
  'Solutions Architect',
  'Site Reliability Engineer'
]

// Level descriptions
export const levelDescriptions = {
  L1: {
    title: 'Beginner (L1)',
    description: '0-2 years experience, basic concepts and fundamentals',
    skills: ['Basic programming concepts', 'Simple problem solving', 'Learning mindset']
  },
  L2: {
    title: 'Intermediate (L2)',
    description: '2-5 years experience, solid fundamentals and some specialization',
    skills: ['Solid technical foundation', 'Independent problem solving', 'Code reviews and mentoring']
  },
  L3: {
    title: 'Senior/Advanced (L3)',
    description: '5+ years experience, advanced concepts and leadership abilities',
    skills: ['System design', 'Technical leadership', 'Architecture decisions', 'Team mentorship']
  }
}

// API helper functions
export async function assessCandidate(role: string, answers: string[]): Promise<AssessmentResult> {
  const response = await fetch('/api/interview/assessment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role, answers })
  })

  if (!response.ok) {
    throw new Error('Failed to assess candidate')
  }

  const data = await response.json()
  return data.assessment
}

export async function generateQuestions(
  role: string,
  level?: 'L1' | 'L2' | 'L3',
  questionType: 'assessment' | 'interview' = 'assessment'
): Promise<AssessmentQuestion[] | InterviewQuestion[]> {
  const response = await fetch('/api/interview/questions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role, level, questionType })
  })

  if (!response.ok) {
    throw new Error('Failed to generate questions')
  }

  const data = await response.json()
  return data.questions
}

export async function createInterviewSession(
  userId: string,
  role: string,
  level: 'L1' | 'L2' | 'L3'
): Promise<{ sessionToken: string; sessionId: string; personaId: string }> {
  const response = await fetch('/api/interview/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, role, level })
  })

  if (!response.ok) {
    throw new Error('Failed to create interview session')
  }

  const data = await response.json()
  return {
    sessionToken: data.sessionToken,
    sessionId: data.sessionId,
    personaId: data.personaId
  }
}

export async function endInterviewSession(sessionId: string): Promise<void> {
  const response = await fetch('/api/interview/session', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId })
  })

  if (!response.ok) {
    throw new Error('Failed to end interview session')
  }
}

export async function getFeedback(
  question: string,
  answer: string,
  role: string,
  level: 'L1' | 'L2' | 'L3',
  category?: string
): Promise<InterviewFeedback> {
  const response = await fetch('/api/interview/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, answer, role, level, category })
  })

  if (!response.ok) {
    throw new Error('Failed to get feedback')
  }

  const data = await response.json()
  return data.feedback
}

export async function generateInterviewSummary(
  interviewData: any,
  role: string,
  level: 'L1' | 'L2' | 'L3'
): Promise<InterviewSummary> {
  const response = await fetch('/api/interview/feedback', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ interviewData, role, level })
  })

  if (!response.ok) {
    throw new Error('Failed to generate interview summary')
  }

  const data = await response.json()
  return data.summary
}

// Utility functions for UI
export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600'
  if (score >= 60) return 'text-yellow-600'
  return 'text-red-600'
}

export function getScoreBgColor(score: number): string {
  if (score >= 80) return 'bg-green-100'
  if (score >= 60) return 'bg-yellow-100'
  return 'bg-red-100'
}

export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

export function getLevelBadgeVariant(level: 'L1' | 'L2' | 'L3') {
  switch (level) {
    case 'L1': return 'secondary'
    case 'L2': return 'default'
    case 'L3': return 'destructive'
    default: return 'outline'
  }
}