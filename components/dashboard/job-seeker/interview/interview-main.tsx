"use client"

import { useState } from "react"
import { InterviewSetup } from "./interview-setup"
import { SkillAssessment } from "./skill-assessment"
import { AssessmentResultView } from "./assessment-result"
import { InterviewRoom } from "./interview-room"
import { InterviewResults } from "./interview-results"
import { AssessmentResult } from "@/lib/interview-utils"

type InterviewStep = 'setup' | 'assessment' | 'assessment-result' | 'interview' | 'results'

export function InterviewMain() {
  const [currentStep, setCurrentStep] = useState<InterviewStep>('setup')
  const [selectedRole, setSelectedRole] = useState<string>("")
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null)
  const [interviewData, setInterviewData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleStartAssessment = async (role: string) => {
    setIsLoading(true)
    setSelectedRole(role)
    // Small delay to show loading state
    setTimeout(() => {
      setCurrentStep('assessment')
      setIsLoading(false)
    }, 500)
  }

  const handleAssessmentComplete = (result: AssessmentResult) => {
    setAssessmentResult(result)
    setCurrentStep('assessment-result')
  }

  const handleProceedToInterview = () => {
    setCurrentStep('interview')
  }

  const handleRetakeAssessment = () => {
    setCurrentStep('assessment')
    setAssessmentResult(null)
  }

  const handleInterviewComplete = (data: any) => {
    setInterviewData(data)
    setCurrentStep('results')
  }

  const handleBackToSetup = () => {
    setCurrentStep('setup')
    setSelectedRole("")
    setAssessmentResult(null)
    setInterviewData(null)
  }

  const handleBackToAssessment = () => {
    setCurrentStep('assessment-result')
    setInterviewData(null)
  }

  const handleRestartInterview = () => {
    if (assessmentResult) {
      setCurrentStep('interview')
      setInterviewData(null)
    }
  }

  const handleNewRole = () => {
    setCurrentStep('setup')
    setSelectedRole("")
    setAssessmentResult(null)
    setInterviewData(null)
  }

  switch (currentStep) {
    case 'setup':
      return (
        <InterviewSetup
          onStart={handleStartAssessment}
          isLoading={isLoading}
        />
      )

    case 'assessment':
      return (
        <SkillAssessment
          role={selectedRole}
          onComplete={handleAssessmentComplete}
          onBack={handleBackToSetup}
        />
      )

    case 'assessment-result':
      return assessmentResult ? (
        <AssessmentResultView
          role={selectedRole}
          result={assessmentResult}
          onProceed={handleProceedToInterview}
          onRetake={handleRetakeAssessment}
        />
      ) : null

    case 'interview':
      return assessmentResult ? (
        <InterviewRoom
          role={selectedRole}
          assessmentResult={assessmentResult}
          onComplete={handleInterviewComplete}
          onBack={handleBackToAssessment}
        />
      ) : null

    case 'results':
      return interviewData ? (
        <InterviewResults
          interviewData={interviewData}
          onRestart={handleRestartInterview}
          onNewRole={handleNewRole}
        />
      ) : null

    default:
      return null
  }
}