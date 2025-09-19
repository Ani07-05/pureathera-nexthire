"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Mic, MicOff, Video, VideoOff, Phone, PhoneOff, MessageSquare, Monitor, MonitorStop } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { InterviewAnamClient } from "@/lib/anam-client-new"
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
  const videoRef = useRef<HTMLVideoElement>(null)
  const [anamClient, setAnamClient] = useState<InterviewAnamClient | null>(null)
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
  const [sessionId, setSessionId] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null)

  useEffect(() => {
    let isMounted = true
    let timeoutId: NodeJS.Timeout

    const initialize = async () => {
      // Add delay to avoid hot reload interruptions
      timeoutId = setTimeout(async () => {
        if (isMounted && !isConnected && !anamClient) {
          await initializeInterview()
        }
      }, 500)
    }

    initialize()

    return () => {
      isMounted = false
      if (timeoutId) clearTimeout(timeoutId)
      cleanup()
    }
  }, []) // Only run once on mount

  const initializeInterview = async () => {
    // Prevent multiple initializations
    if (isConnected || anamClient) {
      console.log('Interview already initialized or initializing, skipping...')
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

      // Create Anam.ai session token
      console.log('Step 2: Creating Anam session...')
      const sessionData = await createInterviewSession("user-123", role, assessmentResult.level)
      setSessionId(sessionData.sessionId)
      console.log('Step 2: Session created with token')

      // Initialize Anam client
      console.log('Step 3: Creating Anam client...')
      const client = new InterviewAnamClient(sessionData.sessionToken, {
        onConnect: () => {
          console.log('Anam client connected successfully!')
          setIsConnected(true)
          setIsLoading(false)
        },
        onDisconnect: () => {
          console.log('Anam client disconnected')
          setIsConnected(false)
        },
        onMessage: (message) => {
          console.log('Received message from AI:', message)
        },
        onError: (error) => {
          console.error('Anam client error:', error)
          setError('Connection error. Please try again.')
          setIsLoading(false)
        }
      })

      console.log('Step 4: Initializing Anam client...')
      await client.initialize()
      console.log('Step 4: Anam client initialized')
      setAnamClient(client)

      // Wait for video element to be properly mounted in DOM
      console.log('Step 5: Looking for video element...')
      let videoElement = videoRef.current
      let attempts = 0
      while (!videoElement && attempts < 10) {
        console.log(`Step 5: Video element attempt ${attempts + 1}/10`)
        await new Promise(resolve => setTimeout(resolve, 200))
        videoElement = videoRef.current
        attempts++
      }
      console.log('Step 5: Video element search completed, found:', !!videoElement)

      if (videoElement) {
        // Make sure video element has an ID
        if (!videoElement.id) {
          videoElement.id = `interview-video-${Date.now()}`
        }

        // Force DOM update
        videoElement.style.display = 'block'

        // Wait for element to be fully in DOM and force a reflow
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Force a style update to ensure element is rendered
        videoElement.style.width = '320px'
        videoElement.style.height = '240px'
        videoElement.style.background = '#000000'

        // Verify element exists in DOM
        const domElement = document.getElementById(videoElement.id)
        if (domElement) {
          console.log('Video element found, starting stream...')
          try {
            await client.streamToVideo(videoElement)
            console.log('Stream started successfully')
          } catch (streamError) {
            console.warn('Stream setup failed, continuing with audio-only mode:', streamError)
            // Continue anyway - the interview can work without video
          }
        } else {
          console.warn('Video element not found in DOM, continuing without video')
        }
      } else {
        console.warn('Video element not available, continuing without video')
      }

    } catch (err) {
      console.error('Failed to initialize interview:', err)
      setError('Failed to start interview. Please try again.')
      setIsLoading(false)
    }
  }

  const cleanup = async () => {
    try {
      if (anamClient) {
        await anamClient.stopStreaming()
      }
      if (sessionId) {
        await endInterviewSession(sessionId)
      }
      if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop())
        setScreenStream(null)
        setIsScreenSharing(false)
      }
    } catch (error) {
      console.log('Cleanup error:', error)
    }
  }

  const enableAudio = async () => {
    if (videoRef.current) {
      try {
        console.log('Enabling audio...')
        videoRef.current.muted = false
        videoRef.current.volume = 1.0

        // Try to play the video to trigger audio context
        await videoRef.current.play()
        console.log('Audio enabled successfully')
      } catch (err) {
        console.error('Failed to enable audio:', err)
      }
    }
  }

  const testConnection = async () => {
    if (!anamClient || !isConnected) {
      console.log('Client not ready for test')
      return
    }

    try {
      // Just enable audio without making avatar talk
      await enableAudio()
      console.log('Audio test completed - avatar ready but silent until interview starts')
    } catch (err) {
      console.error('Failed to test connection:', err)
      setError('Connection test failed.')
    }
  }

  const startInterview = async () => {
    if (!anamClient || !isConnected) return

    try {
      // Enable audio first
      await enableAudio()

      setInterviewStarted(true)

      // Start with a greeting and then first question
      await anamClient.setupInterviewContext(role, assessmentResult.level)

      // Small delay before first question
      await new Promise(resolve => setTimeout(resolve, 2000))

      const firstQuestion = questions[0]
      await anamClient.askQuestion(firstQuestion.question)
    } catch (err) {
      console.error('Failed to start interview:', err)
      setError('Failed to start interview question.')
    }
  }

  const toggleMic = async () => {
    if (!anamClient) return

    try {
      if (isMicOn) {
        // For now, just toggle the state - audio input is handled by the stream
        setIsListening(false)
      } else {
        setIsListening(true)
      }
      setIsMicOn(!isMicOn)
    } catch (err) {
      console.error('Failed to toggle microphone:', err)
    }
  }

  const startScreenShare = async () => {
    try {
      console.log('Starting screen share...')
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      })

      setScreenStream(stream)
      setIsScreenSharing(true)

      // Notify the interviewer that screen sharing has started
      if (anamClient) {
        await anamClient.talk("I can see you've started screen sharing. This is perfect for technical questions where you need to show code or solve problems. Please go ahead and show me what you're working on.")
      }

      // Listen for when user stops sharing
      stream.getVideoTracks()[0].addEventListener('ended', () => {
        stopScreenShare()
      })

    } catch (err) {
      console.error('Failed to start screen sharing:', err)
      setError('Failed to start screen sharing. Please make sure you grant permission.')
    }
  }

  const stopScreenShare = async () => {
    try {
      console.log('Stopping screen share...')

      if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop())
        setScreenStream(null)
      }

      setIsScreenSharing(false)

      // Notify the interviewer that screen sharing has stopped
      if (anamClient) {
        await anamClient.talk("Screen sharing has ended. Let's continue with the interview.")
      }

    } catch (err) {
      console.error('Failed to stop screen sharing:', err)
    }
  }

  const nextQuestion = async () => {
    if (currentQuestionIndex < questions.length - 1) {
      // Get feedback for current answer
      if (currentAnswer.trim()) {
        try {
          const feedbackResult = await getFeedback(
            questions[currentQuestionIndex].question,
            currentAnswer,
            role,
            assessmentResult.level,
            questions[currentQuestionIndex].category
          )
          setFeedback(prev => [...prev, feedbackResult])

          // Provide feedback through Azure
          if (anamClient) {
            await anamClient.provideFeedback(feedbackResult.feedback)
          }
        } catch (err) {
          console.error('Failed to get feedback:', err)
        }
      }

      // Move to next question
      const nextIndex = currentQuestionIndex + 1
      setCurrentQuestionIndex(nextIndex)
      setCurrentAnswer("")

      if (anamClient && questions[nextIndex]) {
        await anamClient.askQuestion(questions[nextIndex].question)
      }
    }
  }

  const endInterview = async () => {
    try {
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
          answer: index === currentQuestionIndex ? currentAnswer : "",
          category: q.category
        }))
      }

      await cleanup()
      onComplete(interviewData)
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
            <h1 className="text-2xl font-bold">AI Interview</h1>
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

      {/* Full Screen Video Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-6"
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              AI Interviewer
            </CardTitle>
            <CardDescription>
              {isLoading ? 'Connecting to AI interviewer...' :
               isConnected ? 'Connected and ready' : 'Disconnected'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={{ height: '70vh' }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted={false}
                className="w-full h-full object-cover"
                style={{ backgroundColor: '#000' }}
              />
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                    <p>Connecting...</p>
                  </div>
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
                    onClick={isVideoOn ? () => setIsVideoOn(false) : () => setIsVideoOn(true)}
                    variant={isVideoOn ? "default" : "outline"}
                    size="icon"
                    disabled={!isConnected}
                  >
                    {isVideoOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                  </Button>

                  <Button
                    onClick={isScreenSharing ? stopScreenShare : startScreenShare}
                    variant={isScreenSharing ? "default" : "outline"}
                    size="icon"
                    disabled={!interviewStarted}
                    title={isScreenSharing ? "Stop Screen Share" : "Start Screen Share"}
                  >
                    {isScreenSharing ? <MonitorStop className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
                  </Button>

                  {!interviewStarted ? (
                    <>
                      <Button
                        onClick={enableAudio}
                        variant="outline"
                        size="sm"
                      >
                        🔊 Enable Audio
                      </Button>
                      <Button
                        onClick={testConnection}
                        disabled={!isConnected || isLoading}
                        variant="outline"
                        size="sm"
                      >
                        Test Audio
                      </Button>
                      <Button
                        onClick={startInterview}
                        disabled={!isConnected || isLoading}
                        className="gap-2"
                      >
                        <Phone className="h-4 w-4" />
                        Start Interview
                      </Button>
                    </>
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

      {/* Controls and Question Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Question Section */}
        <div>
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
                      <Button onClick={nextQuestion} size="sm" className="w-full">
                        Next Question
                      </Button>
                    ) : (
                      <Button onClick={endInterview} size="sm" variant="destructive" className="w-full">
                        Complete Interview
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Status Section */}
        <div>
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
                <div className="flex justify-between">
                  <span>Screen Share:</span>
                  <Badge variant={isScreenSharing ? "default" : "outline"}>
                    {isScreenSharing ? "Active" : "Off"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}