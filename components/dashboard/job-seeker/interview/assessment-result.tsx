"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Trophy, Target, ArrowRight, RotateCcw } from "lucide-react"
import { motion } from "framer-motion"
import { AssessmentResult, levelDescriptions } from "@/lib/interview-utils"

interface AssessmentResultProps {
  role: string
  result: AssessmentResult
  onProceed: () => void
  onRetake: () => void
}

export function AssessmentResultView({ role, result, onProceed, onRetake }: AssessmentResultProps) {
  const levelInfo = levelDescriptions[result.level]

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getLevelMessage = (level: string) => {
    switch (level) {
      case 'L1':
        return "You're ready for entry-level positions! The interview will focus on fundamental concepts and basic problem-solving skills."
      case 'L2':
        return "You're suitable for intermediate roles! The interview will cover technical depth and practical applications."
      case 'L3':
        return "You're qualified for senior positions! The interview will include system design, leadership scenarios, and advanced concepts."
      default:
        return "Let's proceed with your interview!"
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <Trophy className="h-16 w-16 text-primary mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-2">Assessment Complete!</h1>
        <p className="text-muted-foreground text-lg">
          Here's your skill level for {role}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-3">
              <Badge
                variant={result.level === 'L1' ? 'secondary' : result.level === 'L2' ? 'default' : 'destructive'}
                className="text-lg px-4 py-2"
              >
                {levelInfo.title}
              </Badge>
            </CardTitle>
            <CardDescription className="text-base">
              {levelInfo.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Score */}
            <div className="text-center">
              <div className={`text-6xl font-bold ${getScoreColor(result.score)} mb-2`}>
                {result.score}
              </div>
              <p className="text-muted-foreground">Assessment Score</p>
              <Progress value={result.score} className="mt-2 max-w-md mx-auto" />
            </div>

            {/* Level Message */}
            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <Target className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                    Interview Recommendation
                  </h4>
                  <p className="text-blue-700 dark:text-blue-300 text-sm">
                    {getLevelMessage(result.level)}
                  </p>
                </div>
              </div>
            </div>

            {/* Strengths & Improvements */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-green-600 mb-2 flex items-center gap-1">
                  ✅ Strengths
                </h4>
                <ul className="space-y-1 text-sm">
                  {result.strengths.map((strength, index) => (
                    <li key={index} className="text-muted-foreground">• {strength}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-orange-600 mb-2 flex items-center gap-1">
                  🎯 Focus Areas
                </h4>
                <ul className="space-y-1 text-sm">
                  {result.improvements.map((improvement, index) => (
                    <li key={index} className="text-muted-foreground">• {improvement}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Skills for this level */}
            <div>
              <h4 className="font-medium mb-2">Expected Skills for {levelInfo.title}</h4>
              <div className="flex flex-wrap gap-2">
                {levelInfo.skills.map((skill, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Reasoning */}
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Assessment Reasoning</h4>
              <p className="text-sm text-muted-foreground">{result.reasoning}</p>
              <div className="mt-2 text-xs text-muted-foreground">
                Confidence: {Math.round(result.confidence * 100)}%
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex gap-4 justify-center"
      >
        <Button onClick={onRetake} variant="outline" className="gap-2">
          <RotateCcw className="h-4 w-4" />
          Retake Assessment
        </Button>
        <Button onClick={onProceed} size="lg" className="gap-2">
          Start {levelInfo.title} Interview
          <ArrowRight className="h-4 w-4" />
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center text-sm text-muted-foreground"
      >
        🎯 Your interview will be tailored to your {levelInfo.title} level with appropriate questions and expectations.
      </motion.div>
    </div>
  )
}