"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Brain, ArrowLeft, ArrowRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { AssessmentQuestion, AssessmentResult, generateQuestions, assessCandidate } from "@/lib/interview-utils"

interface SkillAssessmentProps {
  role: string
  onComplete: (result: AssessmentResult) => void
  onBack: () => void
}

export function SkillAssessment({ role, onComplete, onBack }: SkillAssessmentProps) {
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [currentAnswer, setCurrentAnswer] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isAssessing, setIsAssessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadQuestions()
  }, [role])

  const loadQuestions = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const generatedQuestions = await generateQuestions(role, undefined, 'assessment') as AssessmentQuestion[]
      setQuestions(generatedQuestions)
      setAnswers(new Array(generatedQuestions.length).fill(""))
    } catch (err) {
      console.error('Failed to load questions:', err)
      setError('Failed to load assessment questions. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAnswerChange = (answer: string) => {
    setCurrentAnswer(answer)
    const newAnswers = [...answers]
    newAnswers[currentQuestionIndex] = answer
    setAnswers(newAnswers)
  }

  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setCurrentAnswer(answers[currentQuestionIndex + 1] || "")
    }
  }

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
      setCurrentAnswer(answers[currentQuestionIndex - 1] || "")
    }
  }

  const handleSubmitAssessment = async () => {
    try {
      setIsAssessing(true)
      const result = await assessCandidate(role, answers)
      onComplete(result)
    } catch (err) {
      console.error('Failed to assess candidate:', err)
      setError('Failed to complete assessment. Please try again.')
    } finally {
      setIsAssessing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center p-12">
            <div className="text-center space-y-4">
              <Brain className="h-12 w-12 animate-pulse text-primary mx-auto" />
              <h3 className="text-lg font-medium">Generating Assessment Questions</h3>
              <p className="text-muted-foreground">
                Creating personalized questions for {role}...
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
                Go Back
              </Button>
              <Button onClick={loadQuestions}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100
  const isLastQuestion = currentQuestionIndex === questions.length - 1
  const canProceed = currentAnswer.trim() !== ""

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <Button onClick={onBack} variant="ghost" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Setup
        </Button>
        <Badge variant="outline">
          {role} Assessment
        </Badge>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Skill Assessment
              </CardTitle>
              <span className="text-sm text-muted-foreground">
                {currentQuestionIndex + 1} of {questions.length}
              </span>
            </div>
            <CardDescription>
              Answer these questions to help us determine your experience level
            </CardDescription>
            <Progress value={progress} className="mt-2" />
          </CardHeader>
        </Card>
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={
                  currentQuestion.difficulty === 'beginner' ? 'secondary' :
                  currentQuestion.difficulty === 'intermediate' ? 'default' : 'destructive'
                }>
                  {currentQuestion.difficulty}
                </Badge>
                <Badge variant="outline">Multiple Choice</Badge>
              </div>
              <CardTitle className="text-lg leading-relaxed">
                {currentQuestion.question}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup
                value={currentAnswer}
                onValueChange={handleAnswerChange}
                className="space-y-3"
              >
                {currentQuestion.options?.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex justify-between items-center"
      >
        <Button
          onClick={goToPreviousQuestion}
          disabled={currentQuestionIndex === 0}
          variant="outline"
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Previous
        </Button>

        <div className="text-sm text-muted-foreground">
          {answers.filter(answer => answer.trim() !== "").length} of {questions.length} answered
        </div>

        {isLastQuestion ? (
          <Button
            onClick={handleSubmitAssessment}
            disabled={!canProceed || isAssessing}
            className="gap-2"
          >
            {isAssessing ? (
              "Assessing..."
            ) : (
              <>
                Complete Assessment
                <CheckCircle className="h-4 w-4" />
              </>
            )}
          </Button>
        ) : (
          <Button
            onClick={goToNextQuestion}
            disabled={!canProceed}
            className="gap-2"
          >
            Next
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </motion.div>

      {isAssessing && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <Card>
            <CardContent className="p-8">
              <Brain className="h-12 w-12 animate-pulse text-primary mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Analyzing Your Responses</h3>
              <p className="text-muted-foreground">
                Our AI is evaluating your answers to determine your skill level...
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}