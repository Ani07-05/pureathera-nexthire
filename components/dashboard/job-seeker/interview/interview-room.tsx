"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Mic, MicOff, Phone, PhoneOff, Radio, Sparkles, ArrowLeft } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { InterviewVapiClient } from "@/lib/vapi-client"
import {
  AssessmentResult,
  InterviewQuestion,
  InterviewFeedback,
  generateQuestions,
  createInterviewSession,
  endInterviewSession,
  getFeedback,
  levelDescriptions
} from "@/lib/interview-utils"

interface InterviewRoomProps {
  role: string
  assessmentResult: AssessmentResult
  onComplete: (interviewData: any) => void
  onBack: () => void
}

export function InterviewRoom({ role, assessmentResult, onComplete, onBack }: InterviewRoomProps) {
  const [vapiClient, setVapiClient] = useState<InterviewVapiClient | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [questions, setQuestions] = useState<InterviewQuestion[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [interviewStarted, setInterviewStarted] = useState(false)
  const [feedback, setFeedback] = useState<InterviewFeedback[]>([])
  const [sessionId, setSessionId] = useState<string>("")
  const [assistantId, setAssistantId] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const [transcript, setTranscript] = useState<string[]>([])
  const [interviewDuration, setInterviewDuration] = useState(0)

  useEffect(() => {
    let isMounted = true
    let timeoutId: NodeJS.Timeout
    let durationInterval: NodeJS.Timeout

    const initialize = async () => {
      timeoutId = setTimeout(async () => {
        if (isMounted && !isConnected && !vapiClient) {
          await initializeInterview()
        }
      }, 500)
    }

    initialize()

    // Duration counter
    durationInterval = setInterval(() => {
      if (interviewStarted) {
        setInterviewDuration(prev => prev + 1)
      }
    }, 1000)

    return () => {
      isMounted = false
      if (timeoutId) clearTimeout(timeoutId)
      if (durationInterval) clearInterval(durationInterval)
      cleanup()
    }
  }, [])

  const initializeInterview = async () => {
    if (isConnected || vapiClient) {
      console.log('Interview already initialized, skipping...')
      return
    }

    try {
      console.log('Starting interview initialization...')
      setIsLoading(true)
      setError(null)

      // Generate interview questions based on assessment result
      console.log('Step 1: Generating interview questions...')
      const interviewQuestions = await generateQuestions(role, assessmentResult.level, 'interview') as InterviewQuestion[]
      setQuestions(interviewQuestions)
      console.log('Step 1: Questions generated:', interviewQuestions.length)

      // Create Vapi session (creates assistant)
      console.log('Step 2: Creating Vapi session...')
      const sessionData = await createInterviewSession("user-123", role, assessmentResult.level)
      setSessionId(sessionData.sessionId)
      setAssistantId(sessionData.assistantId)
      console.log('Step 2: Session created with assistant:', sessionData.assistantId)

      // Initialize Vapi client
      console.log('Step 3: Creating Vapi client...')
      const client = new InterviewVapiClient(
        sessionData.publicKey,
        sessionData.assistantId,
        assessmentResult,
        role,
        {
          onCallStart: () => {
            console.log('Vapi call started')
            setIsConnected(true)
            setIsLoading(false)
            setInterviewStarted(true)
          },
          onCallEnd: () => {
            console.log('Vapi call ended')
            setIsConnected(false)
            setInterviewStarted(false)
          },
          onSpeechStart: () => {
            console.log('AI started speaking')
            setIsSpeaking(true)
          },
          onSpeechEnd: () => {
            console.log('AI stopped speaking')
            setIsSpeaking(false)
          },
          onMessage: (message) => {
            console.log('Received message from AI:', message)

            // Handle transcript updates
            if (message.type === 'transcript' && message.transcript) {
              setTranscript(prev => [...prev, message.transcript])
            }

            // Handle conversation messages
            if (message.type === 'conversation-update') {
              console.log('Conversation update:', message)
            }
          },
          onError: (error) => {
            console.error('Vapi client error:', error)
            setError('Connection error. Please try again.')
            setIsLoading(false)
          }
        }
      )

      console.log('Step 4: Initializing Vapi client...')
      await client.initialize()
      console.log('Step 4: Vapi client initialized')
      setVapiClient(client)
      setIsLoading(false)

    } catch (err) {
      console.error('Failed to initialize interview:', err)
      setError('Failed to start interview. Please try again.')
      setIsLoading(false)
    }
  }

  const cleanup = async () => {
    try {
      if (vapiClient) {
        await vapiClient.stopInterview()
        vapiClient.destroy()
      }
      if (sessionId) {
        await endInterviewSession(sessionId)
      }
    } catch (error) {
      console.log('Cleanup error:', error)
    }
  }

  const startInterview = async () => {
    if (!vapiClient) {
      setError('Client not initialized. Please refresh and try again.')
      return
    }

    try {
      console.log('Starting Vapi interview...')
      await vapiClient.startInterview()
      // The onCallStart callback will set interviewStarted to true
    } catch (err) {
      console.error('Failed to start interview:', err)
      setError('Failed to start interview. Please check your microphone permissions.')
    }
  }

  const endInterview = async () => {
    if (!vapiClient) return

    try {
      console.log('Ending interview...')
      await vapiClient.stopInterview()

      // Collect interview data for results
      const interviewData = {
        role,
        level: assessmentResult.level,
        duration: interviewDuration,
        questionsAsked: questions.length,
        transcript,
        feedback
      }

      onComplete(interviewData)
    } catch (err) {
      console.error('Failed to end interview:', err)
      setError('Failed to end interview properly.')
    }
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center p-12">
            <div className="text-center space-y-4">
              <Sparkles className="h-12 w-12 animate-pulse text-primary mx-auto" />
              <h3 className="text-lg font-medium">Preparing Your Interview</h3>
              <p className="text-muted-foreground">
                Setting up AI interviewer for {role} - {assessmentResult.level}...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="text-center p-12">
            <h3 className="text-lg font-medium text-destructive mb-2">Error</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <div className="space-x-2">
              <Button onClick={onBack} variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <Button onClick={onBack} variant="ghost" size="sm" disabled={interviewStarted}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Badge variant="outline" className="gap-2">
            <Radio className="h-3 w-3" />
            {role} Interview
          </Badge>
          <Badge variant={assessmentResult.level === 'L1' ? 'secondary' : assessmentResult.level === 'L2' ? 'default' : 'destructive'}>
            {levelDescriptions[assessmentResult.level].title}
          </Badge>
        </div>
        {interviewStarted && (
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            Duration: {formatTime(interviewDuration)}
          </div>
        )}
      </motion.div>

      {/* Main Interview Area */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Left: Voice Interface */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                AI Voice Interview
              </CardTitle>
              <CardDescription>
                Speak naturally with the AI interviewer. Your responses will be evaluated in real-time.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Voice Visualization */}
              <div className="relative h-64 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg flex items-center justify-center overflow-hidden">
                <AnimatePresence>
                  {isSpeaking ? (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className="text-center"
                    >
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4"
                      >
                        <Mic className="h-12 w-12 text-primary" />
                      </motion.div>
                      <p className="text-lg font-medium text-primary">AI is speaking...</p>
                    </motion.div>
                  ) : interviewStarted ? (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-center"
                    >
                      <div className="w-24 h-24 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Mic className="h-12 w-12 text-green-600 dark:text-green-400" />
                      </div>
                      <p className="text-lg font-medium">Listening to your response...</p>
                    </motion.div>
                  ) : (
                    <div className="text-center">
                      <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Phone className="h-12 w-12 text-gray-400" />
                      </div>
                      <p className="text-lg font-medium mb-2">Ready to Start</p>
                      <p className="text-sm text-muted-foreground">Click "Start Interview" to begin</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>

              {/* Controls */}
              <div className="flex justify-center gap-4">
                {!interviewStarted ? (
                  <Button
                    onClick={startInterview}
                    disabled={!vapiClient || isConnected}
                    size="lg"
                    className="gap-2"
                  >
                    <Phone className="h-5 w-5" />
                    Start Interview
                  </Button>
                ) : (
                  <Button
                    onClick={endInterview}
                    variant="destructive"
                    size="lg"
                    className="gap-2"
                  >
                    <PhoneOff className="h-5 w-5" />
                    End Interview
                  </Button>
                )}
              </div>

              {/* Status */}
              {isConnected && (
                <div className="text-center text-sm text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    Connected to AI Interviewer
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Transcript */}
          {transcript.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Conversation Transcript</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {transcript.map((text, index) => (
                    <div key={index} className="text-sm p-2 bg-muted rounded">
                      {text}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: Interview Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Your Assessment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-2xl font-bold text-center mb-2">
                  {assessmentResult.score}/100
                </div>
                <Progress value={assessmentResult.score} className="h-2" />
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2 text-green-600">✅ Strengths</h4>
                <ul className="text-xs space-y-1">
                  {assessmentResult.strengths.map((strength, index) => (
                    <li key={index} className="text-muted-foreground">• {strength}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2 text-orange-600">🎯 Focus Areas</h4>
                <ul className="text-xs space-y-1">
                  {assessmentResult.improvements.map((improvement, index) => (
                    <li key={index} className="text-muted-foreground">• {improvement}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Interview Tips</CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2 text-muted-foreground">
              <p>• Speak clearly and at a natural pace</p>
              <p>• Think before you answer</p>
              <p>• Ask for clarification if needed</p>
              <p>• Be specific with examples</p>
              <p>• Stay calm and confident</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Expected Questions</CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2">
              <Badge variant="outline" className="text-xs">Technical Knowledge</Badge>
              <Badge variant="outline" className="text-xs">Problem Solving</Badge>
              <Badge variant="outline" className="text-xs">Behavioral</Badge>
              <Badge variant="outline" className="text-xs">Experience</Badge>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
