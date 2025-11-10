"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  Trophy,
  TrendingUp,
  MessageSquare,
  Brain,
  Target,
  ArrowRight,
  Download,
  Share,
  RefreshCw
} from "lucide-react"
import { motion } from "framer-motion"
import {
  InterviewSummary,
  generateInterviewSummary,
  getScoreColor,
  getScoreBgColor,
  levelDescriptions
} from "@/lib/interview-utils"

interface InterviewResultsProps {
  interviewData: any
  onRestart: () => void
  onNewRole: () => void
}

export function InterviewResults({ interviewData, onRestart, onNewRole }: InterviewResultsProps) {
  const [summary, setSummary] = useState<InterviewSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    generateSummary()
  }, [])

  const generateSummary = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const result = await generateInterviewSummary(interviewData, interviewData.role, interviewData.level)
      setSummary(result)

      // Save interview results to database
      try {
        const response = await fetch('/api/interview/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            role: interviewData.role,
            level: interviewData.level,
            score: result.overallScore,
            strengths: result.strengths,
            improvements: result.improvements,
            assessment_summary: result.summary,
            transcript_summary: result.recommendation,
            vapi_session_id: interviewData.sessionId || null
          })
        })

        if (!response.ok) {
          console.error('Failed to save interview results')
        }
      } catch (saveError) {
        console.error('Error saving interview results:', saveError)
        // Don't block the UI if save fails
      }
    } catch (err) {
      console.error('Failed to generate summary:', err)
      setError('Failed to generate interview summary. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center p-12">
            <div className="text-center space-y-4">
              <Brain className="h-12 w-12 animate-pulse text-primary mx-auto" />
              <h3 className="text-lg font-medium">Analyzing Your Interview</h3>
              <p className="text-muted-foreground">
                Our AI is evaluating your performance and generating insights...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !summary) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="text-center p-12">
            <h3 className="text-lg font-medium text-destructive mb-2">Error</h3>
            <p className="text-muted-foreground mb-4">{error || 'Failed to load results'}</p>
            <div className="space-x-2">
              <Button onClick={onNewRole} variant="outline">
                Start New Interview
              </Button>
              <Button onClick={generateSummary}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'Strong Hire': return 'text-green-600 bg-green-100'
      case 'Hire': return 'text-green-600 bg-green-50'
      case 'No Hire': return 'text-red-600 bg-red-50'
      case 'Strong No Hire': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <Trophy className="h-16 w-16 text-primary mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-2">Interview Complete!</h1>
        <p className="text-muted-foreground text-lg">
          Here's your detailed performance analysis for {interviewData.role}
        </p>
      </motion.div>

      {/* Overall Score */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardContent className="p-8">
            <div className="grid md:grid-cols-3 gap-6 items-center">
              <div className="text-center">
                <div className={`text-6xl font-bold ${getScoreColor(summary.overallScore)} mb-2`}>
                  {summary.overallScore}
                </div>
                <p className="text-muted-foreground">Overall Score</p>
              </div>
              <div className="text-center">
                <Badge className={`text-lg px-4 py-2 ${getRecommendationColor(summary.recommendation)}`}>
                  {summary.recommendation}
                </Badge>
                <p className="text-muted-foreground mt-2">Recommendation</p>
              </div>
              <div className="text-center">
                <Badge variant={interviewData.level === 'L1' ? 'secondary' : interviewData.level === 'L2' ? 'default' : 'destructive'} className="text-lg px-4 py-2">
                  {levelDescriptions[interviewData.level].title}
                </Badge>
                <p className="text-muted-foreground mt-2">Interview Level</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Detailed Scores */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Performance Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Technical Skills</span>
                  <span className={`font-bold ${getScoreColor(summary.technicalAssessment.score)}`}>
                    {summary.technicalAssessment.score}/100
                  </span>
                </div>
                <Progress value={summary.technicalAssessment.score} className="mb-2" />
                <p className="text-sm text-muted-foreground">
                  {summary.technicalAssessment.comments}
                </p>
              </div>

              <Separator />

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Communication</span>
                  <span className={`font-bold ${getScoreColor(summary.communicationAssessment.score)}`}>
                    {summary.communicationAssessment.score}/100
                  </span>
                </div>
                <Progress value={summary.communicationAssessment.score} className="mb-2" />
                <p className="text-sm text-muted-foreground">
                  {summary.communicationAssessment.comments}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Strengths and Improvements */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Key Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-green-600 mb-2">✅ Strengths</h4>
                <ul className="space-y-1">
                  {summary.strengths.map((strength, index) => (
                    <li key={index} className="text-sm text-muted-foreground">
                      • {strength}
                    </li>
                  ))}
                </ul>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium text-orange-600 mb-2">🎯 Areas for Improvement</h4>
                <ul className="space-y-1">
                  {summary.improvements.map((improvement, index) => (
                    <li key={index} className="text-sm text-muted-foreground">
                      • {improvement}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Summary and Next Steps */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Interview Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              {summary.summary}
            </p>

            <div>
              <h4 className="font-medium mb-3">🚀 Recommended Next Steps</h4>
              <ul className="space-y-2">
                {summary.nextSteps.map((step, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex flex-wrap gap-4 justify-center"
      >
        <Button onClick={onRestart} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Practice Again
        </Button>
        <Button onClick={onNewRole} className="gap-2">
          <Target className="h-4 w-4" />
          Try Different Role
        </Button>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Download Report
        </Button>
        <Button variant="outline" className="gap-2">
          <Share className="h-4 w-4" />
          Share Results
        </Button>
      </motion.div>

      {/* Interview Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">
                  {interviewData.questions?.length || 0}
                </div>
                <p className="text-sm text-muted-foreground">Questions</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">
                  {interviewData.feedback?.length || 0}
                </div>
                <p className="text-sm text-muted-foreground">Feedback Items</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">
                  {Math.round((interviewData.feedback?.reduce((sum: number, f: any) => sum + f.score, 0) || 0) / (interviewData.feedback?.length || 1))}
                </div>
                <p className="text-sm text-muted-foreground">Avg Score</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">
                  {interviewData.level}
                </div>
                <p className="text-sm text-muted-foreground">Level</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}