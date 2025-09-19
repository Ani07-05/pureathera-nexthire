"use client"

import { useState } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { RecruiterDashboardOverview } from "@/components/dashboard/recruiter/dashboard-overview"
import { CandidatesList } from "@/components/dashboard/recruiter/candidates-list"

export default function RecruiterDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard")

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <RecruiterDashboardOverview />
      case "candidates":
        return <CandidatesList />
      case "assessments":
        return <div className="p-6">Create Tests content coming soon...</div>
      case "analytics":
        return <div className="p-6">Analytics content coming soon...</div>
      case "messages":
        return <div className="p-6">Messages content coming soon...</div>
      case "settings":
        return <div className="p-6">Settings content coming soon...</div>
      default:
        return <RecruiterDashboardOverview />
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} userType="recruiter" />
      <main className="flex-1 overflow-auto">{renderContent()}</main>
    </div>
  )
}
