"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Mic, MicOff, Video, VideoOff, Phone, PhoneOff, MessageSquare, Bot } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import {
  AssessmentResult,
  InterviewQuestion,
  InterviewFeedback,
  generateQuestions,
  getFeedback,
  levelDescriptions
} from "@/lib/interview-utils"

interface MockInterviewRoomProps {
  role: string
  assessmentResult: AssessmentResult
  onComplete: (interviewData: any) => void
  onBack: () => void
}

export function MockInterviewRoom({ role, assessmentResult, onComplete, onBack }: MockInterviewRoomProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isMicOn, setIsMicOn] = useState(false)
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [questions, setQuestions] = useState<InterviewQuestion[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [interviewStarted, setInterviewStarted] = useState(false)
  const [feedback, setFeedback] = useState<InterviewFeedback[]>([])
  const [currentAnswer, setCurrentAnswer] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [aiSpeaking, setAiSpeaking] = useState(false)
  const [aiMessage, setAiMessage] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    initializeInterview()
  }, [])

  const initializeInterview = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Generate interview questions based on assessment result
      const interviewQuestions = await generateQuestions(role, assessmentResult.level, 'interview') as InterviewQuestion[]
      setQuestions(interviewQuestions)

      // Simulate connection
      setTimeout(() => {
        setIsConnected(true)
        setIsLoading(false)
        setAiMessage(`Hello! I'm your AI interviewer. I'll be conducting a ${assessmentResult.level} level interview for the ${role} position. Are you ready to begin?`)
      }, 2000)

    } catch (err) {
      console.error('Failed to initialize interview:', err)
      setError('Failed to start interview. Please try again.')
      setIsLoading(false)
    }
  }

  const startInterview = async () => {
    if (!isConnected) return

    try {
      setInterviewStarted(true)
      setAiSpeaking(true)

      const firstQuestion = questions[0]
      setAiMessage(`Great! Let's start with our first question: ${firstQuestion.question}`)

      setTimeout(() => {
        setAiSpeaking(false)
        setIsListening(true)
      }, 3000)
    } catch (err) {
      console.error('Failed to start interview:', err)
      setError('Failed to start interview question.')
    }
  }

  const toggleMic = () => {
    setIsMicOn(!isMicOn)
    setIsListening(!isListening)
  }

  const nextQuestion = async () => {
    if (currentQuestionIndex < questions.length - 1) {
      // Get feedback for current answer
      if (currentAnswer.trim()) {
        try {
          setAiSpeaking(true)
          setAiMessage("Let me provide some feedback on your answer...")

          const feedbackResult = await getFeedback(
            questions[currentQuestionIndex].question,
            currentAnswer,
            role,
            assessmentResult.level,
            questions[currentQuestionIndex].category
          )
          setFeedback(prev => [...prev, feedbackResult])

          setTimeout(() => {
            setAiMessage(`${feedbackResult.feedback} Now, let's move to the next question.`)
          }, 1500)

          setTimeout(() => {
            // Move to next question
            const nextIndex = currentQuestionIndex + 1
            setCurrentQuestionIndex(nextIndex)
            setCurrentAnswer("")
            setAiMessage(`${questions[nextIndex].question}`)

            setTimeout(() => {
              setAiSpeaking(false)
              setIsListening(true)
            }, 2000)
          }, 4000)

        } catch (err) {
          console.error('Failed to get feedback:', err)
        }
      }
    }
  }

  const endInterview = async () => {
    try {
      setAiSpeaking(true)
      setAiMessage("Thank you for completing the interview! Let me prepare your results...")

      // Get final feedback if there's a current answer
      if (currentAnswer.trim()) {
        const feedbackResult = await getFeedback(
          questions[currentQuestionIndex].question,
          currentAnswer,
          role,
          assessmentResult.level,
          questions[currentQuestionIndex].category
        )
        setFeedback(prev => [...prev, feedbackResult])
      }

      // Compile interview data
      const interviewData = {
        role,
        level: assessmentResult.level,
        questions,
        feedback,
        answers: questions.map((q, index) => ({
          questionId: q.id,
          question: q.question,
          answer: index === currentQuestionIndex ? currentAnswer : `Sample answer for question ${index + 1}`,
          category: q.category
        }))
      }

      setTimeout(() => {
        onComplete(interviewData)
      }, 2000)
    } catch (err) {
      console.error('Failed to end interview:', err)
      setError('Failed to end interview properly.')
    }
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
                Go Back
              </Button>
              <Button onClick={initializeInterview}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const progress = ((currentQuestionIndex + 1) / questions.length) * 100
  const currentQuestion = questions[currentQuestionIndex]

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <Button onClick={onBack} variant="ghost">
            ← Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Mock AI Interview</h1>
            <p className="text-muted-foreground">{role}</p>
          </div>
        </div>
        <Badge variant={assessmentResult.level === 'L1' ? 'secondary' : assessmentResult.level === 'L2' ? 'default' : 'destructive'}>
          {levelDescriptions[assessmentResult.level].title}
        </Badge>
      </motion.div>

      {/* Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Interview Progress</span>
              <span className="text-sm text-muted-foreground">
                {currentQuestionIndex + 1} of {questions.length}
              </span>
            </div>
            <Progress value={progress} />
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Video Section */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  Mock AI Interviewer
                </CardTitle>
                <CardDescription>
                  {isLoading ? 'Connecting to AI interviewer...' :
                   isConnected ? 'Connected and ready' : 'Disconnected'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg overflow-hidden aspect-video flex items-center justify-center">
                  {isLoading ? (
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      <p className="text-sm text-muted-foreground">Connecting...</p>
                    </div>
                  ) : (
                    <div className="text-center p-8">
                      <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Bot className="h-12 w-12 text-white" />
                      </div>
                      <h3 className="font-medium mb-2">AI Interviewer</h3>
                      {aiMessage && (
                        <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-4 max-w-md">
                          <p className="text-sm">{aiMessage}</p>
                          {aiSpeaking && (
                            <div className="flex items-center gap-2 mt-2">
                              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                              <span className="text-xs text-muted-foreground">Speaking...</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-4 mt-4">
                  <Button
                    onClick={toggleMic}
                    variant={isMicOn ? "default" : "outline"}
                    size="icon"
                    disabled={!isConnected}
                  >
                    {isMicOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                  </Button>

                  <Button
                    onClick={() => setIsVideoOn(!isVideoOn)}
                    variant={isVideoOn ? "default" : "outline"}
                    size="icon"
                    disabled={!isConnected}
                  >
                    {isVideoOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                  </Button>

                  {!interviewStarted ? (
                    <Button
                      onClick={startInterview}
                      disabled={!isConnected || isLoading}
                      className="gap-2"
                    >
                      <Phone className="h-4 w-4" />
                      Start Interview
                    </Button>
                  ) : (
                    <Button
                      onClick={endInterview}
                      variant="destructive"
                      className="gap-2"
                    >
                      <PhoneOff className="h-4 w-4" />
                      End Interview
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Question and Controls */}
        <div className="space-y-6">
          {interviewStarted && currentQuestion && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Current Question
                  </CardTitle>
                  <Badge variant="outline">{currentQuestion.category}</Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4">{currentQuestion.question}</p>
                  <textarea
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    placeholder="Take notes or type your answer here..."
                    className="w-full h-24 p-2 border rounded text-sm"
                  />
                  <div className="flex gap-2 mt-4">
                    {currentQuestionIndex < questions.length - 1 ? (
                      <Button onClick={nextQuestion} size="sm" className="w-full" disabled={aiSpeaking}>
                        Next Question
                      </Button>
                    ) : (
                      <Button onClick={endInterview} size="sm" variant="destructive" className="w-full" disabled={aiSpeaking}>
                        Complete Interview
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Status */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Connection:</span>
                  <Badge variant={isConnected ? "default" : "secondary"}>
                    {isConnected ? "Connected" : "Connecting..."}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Microphone:</span>
                  <Badge variant={isMicOn ? "default" : "outline"}>
                    {isMicOn ? "On" : "Off"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Interview:</span>
                  <Badge variant={interviewStarted ? "default" : "outline"}>
                    {interviewStarted ? "In Progress" : "Not Started"}
                  </Badge>
                </div>
                {isListening && (
                  <div className="flex justify-between">
                    <span>AI Status:</span>
                    <Badge variant="outline">
                      {aiSpeaking ? "Speaking" : "Listening"}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}