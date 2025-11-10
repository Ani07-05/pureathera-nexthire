import Vapi from '@vapi-ai/web'
import { AssessmentResult } from './interview-utils'

export interface VapiConfig {
  onCallStart?: () => void
  onCallEnd?: () => void
  onSpeechStart?: () => void
  onSpeechEnd?: () => void
  onMessage?: (message: any) => void
  onError?: (error: any) => void
}

export interface InterviewContext {
  role: string
  level: 'L1' | 'L2' | 'L3'
  score: number
  strengths: string[]
  improvements: string[]
  reasoning: string
}

export class InterviewVapiClient {
  private vapiInstance: Vapi | null = null
  private config: VapiConfig
  private isConnected = false
  private assistantId: string
  private publicKey: string
  private interviewContext: InterviewContext

  constructor(
    publicKey: string,
    assistantId: string,
    assessmentResult: AssessmentResult,
    role: string,
    config: VapiConfig
  ) {
    this.publicKey = publicKey
    this.assistantId = assistantId
    this.config = config
    this.interviewContext = {
      role,
      level: assessmentResult.level,
      score: assessmentResult.score,
      strengths: assessmentResult.strengths,
      improvements: assessmentResult.improvements,
      reasoning: assessmentResult.reasoning
    }
  }

  async initialize(): Promise<void> {
    try {
      console.log('Initializing Vapi client...')

      // Create Vapi instance with public key
      this.vapiInstance = new Vapi(this.publicKey)

      // Set up event listeners
      this.vapiInstance.on('call-start', () => {
        console.log('Vapi call started')
        this.isConnected = true
        this.config.onCallStart?.()
      })

      this.vapiInstance.on('call-end', () => {
        console.log('Vapi call ended')
        this.isConnected = false
        this.config.onCallEnd?.()
      })

      this.vapiInstance.on('speech-start', () => {
        console.log('AI started speaking')
        this.config.onSpeechStart?.()
      })

      this.vapiInstance.on('speech-end', () => {
        console.log('AI stopped speaking')
        this.config.onSpeechEnd?.()
      })

      this.vapiInstance.on('message', (message) => {
        console.log('Received message:', message)
        this.config.onMessage?.(message)
      })

      this.vapiInstance.on('error', (error) => {
        console.error('Vapi error:', error)
        this.config.onError?.(error)
      })

      console.log('Vapi client initialized successfully')
    } catch (error) {
      console.error('Failed to initialize Vapi client:', error)
      this.config.onError?.(error)
      throw error
    }
  }

  async startInterview(): Promise<void> {
    if (!this.vapiInstance) {
      throw new Error('Vapi client not initialized')
    }

    try {
      console.log('Starting interview with context:', this.interviewContext)

      // Prepare assistant overrides with interview context
      const assistantOverrides = {
        variableValues: {
          role: this.interviewContext.role,
          level: this.interviewContext.level,
          score: this.interviewContext.score.toString(),
          strengths: this.interviewContext.strengths.join(', '),
          improvements: this.interviewContext.improvements.join(', '),
          reasoning: this.interviewContext.reasoning,
          // Add formatted level description
          levelDescription: this.getLevelDescription(this.interviewContext.level)
        }
      }

      console.log('Starting call with assistant:', this.assistantId)
      console.log('Assistant overrides:', assistantOverrides)

      // Start the call with the assistant and context
      await this.vapiInstance.start(this.assistantId, assistantOverrides)

      console.log('Interview started successfully')
    } catch (error) {
      console.error('Failed to start interview:', error)
      this.config.onError?.(error)
      throw error
    }
  }

  async stopInterview(): Promise<void> {
    if (!this.vapiInstance) {
      return
    }

    try {
      console.log('Stopping interview...')
      await this.vapiInstance.stop()
      this.isConnected = false
      console.log('Interview stopped successfully')
    } catch (error) {
      console.error('Failed to stop interview:', error)
      throw error
    }
  }

  isActive(): boolean {
    return this.isConnected && this.vapiInstance !== null
  }

  // Send a message during the interview (if needed for custom interactions)
  async sendMessage(message: string): Promise<void> {
    if (!this.vapiInstance || !this.isConnected) {
      throw new Error('Cannot send message: interview not active')
    }

    try {
      // Vapi handles conversation automatically, but we can send custom messages if needed
      await this.vapiInstance.send({
        type: 'add-message',
        message: {
          role: 'system',
          content: message
        }
      })
    } catch (error) {
      console.error('Failed to send message:', error)
      throw error
    }
  }

  // Helper to get level description for context
  private getLevelDescription(level: 'L1' | 'L2' | 'L3'): string {
    const descriptions = {
      L1: 'Beginner level with 0-2 years of experience, focusing on basic concepts and fundamentals',
      L2: 'Intermediate level with 2-5 years of experience, with solid fundamentals and some specialization',
      L3: 'Senior/Advanced level with 5+ years of experience, demonstrating advanced concepts and leadership abilities'
    }
    return descriptions[level]
  }

  // Helper to format interview questions (can be called by UI)
  async askQuestion(question: string): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Interview not active')
    }
    // In Vapi, the assistant handles questions automatically based on the system prompt
    // But we can inject specific questions if needed
    await this.sendMessage(`Ask the candidate this question: ${question}`)
  }

  // Cleanup
  destroy(): void {
    if (this.vapiInstance) {
      this.vapiInstance.stop()
      this.vapiInstance = null
    }
    this.isConnected = false
  }
}
