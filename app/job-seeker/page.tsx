"use client"

import { useState } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { DashboardOverview } from "@/components/dashboard/job-seeker/dashboard-overview"
import { LearningPath } from "@/components/dashboard/job-seeker/learning-path"
import { InterviewMain } from "@/components/dashboard/job-seeker/interview/interview-main"

export default function JobSeekerDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard")

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardOverview />
      case "learning":
        return <LearningPath />
      case "interview":
        return <InterviewMain />
      case "assessments":
        return <div className="p-6">Assessments content coming soon...</div>
      case "progress":
        return <div className="p-6">Progress content coming soon...</div>
      case "messages":
        return <div className="p-6">Messages content coming soon...</div>
      case "profile":
        return <div className="p-6">Profile content coming soon...</div>
      case "settings":
        return <div className="p-6">Settings content coming soon...</div>
      default:
        return <DashboardOverview />
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} userType="job-seeker" />
      <main className="flex-1 overflow-auto">{renderContent()}</main>
    </div>
  )
}
