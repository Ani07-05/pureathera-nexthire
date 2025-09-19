"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Sparkles, Target, Clock } from "lucide-react"
import { motion } from "framer-motion"
import { popularRoles } from "@/lib/interview-utils"

interface InterviewSetupProps {
  onStart: (role: string) => void
  isLoading?: boolean
}

export function InterviewSetup({ onStart, isLoading = false }: InterviewSetupProps) {
  const [selectedRole, setSelectedRole] = useState<string>("")

  const handleStart = () => {
    if (selectedRole) {
      onStart(selectedRole)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4 flex items-center justify-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            AI Interview Practice
          </h1>
          <p className="text-muted-foreground text-lg">
            Get personalized interview practice with our AI interviewer
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid md:grid-cols-2 gap-6"
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              How it Works
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                1
              </div>
              <div>
                <h4 className="font-medium">Skill Assessment</h4>
                <p className="text-sm text-muted-foreground">
                  Answer 7-10 questions to determine your experience level
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                2
              </div>
              <div>
                <h4 className="font-medium">AI Interview</h4>
                <p className="text-sm text-muted-foreground">
                  Practice with our AI interviewer avatar based on your level
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                3
              </div>
              <div>
                <h4 className="font-medium">Real-time Feedback</h4>
                <p className="text-sm text-muted-foreground">
                  Get instant feedback and improvement suggestions
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Interview Levels
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Badge variant="secondary" className="w-full justify-start">
                L1 - Beginner (0-2 years)
              </Badge>
              <p className="text-xs text-muted-foreground ml-1">
                Basic concepts and fundamentals
              </p>
            </div>
            <div className="space-y-2">
              <Badge variant="default" className="w-full justify-start">
                L2 - Intermediate (2-5 years)
              </Badge>
              <p className="text-xs text-muted-foreground ml-1">
                Solid foundation with specialization
              </p>
            </div>
            <div className="space-y-2">
              <Badge variant="destructive" className="w-full justify-start">
                L3 - Senior/Advanced (5+ years)
              </Badge>
              <p className="text-xs text-muted-foreground ml-1">
                Advanced concepts and leadership
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Select Your Target Role</CardTitle>
            <CardDescription>
              Choose the position you're preparing for to get tailored interview questions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role-select">Job Role</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger id="role-select">
                  <SelectValue placeholder="Select a role to practice for" />
                </SelectTrigger>
                <SelectContent>
                  {popularRoles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="pt-4">
              <Button
                onClick={handleStart}
                disabled={!selectedRole || isLoading}
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  "Starting..."
                ) : (
                  <>
                    Start Interview Practice
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="text-center text-sm text-muted-foreground"
      >
        <p>
          🎯 Practice makes perfect! Our AI will adapt to your skill level and provide personalized feedback.
        </p>
      </motion.div>
    </div>
  )
}