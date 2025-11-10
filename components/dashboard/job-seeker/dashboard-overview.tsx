"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  TrendingUp,
  BookOpen,
  ClipboardCheck,
  Target,
  ArrowRight,
  Calendar,
  Award,
  Zap,
  Brain,
  Code,
  Users,
  Loader2,
} from "lucide-react"
import { motion } from "framer-motion"
import { GitHubProfileCard } from "./github-profile-card"

interface CandidateProfile {
  id: string
  email: string
  fullName: string | null
  role: string
  targetRole: string | null
  experienceYears: number
  skills: string[]
  githubUsername: string | null
  githubData: any
  location: string | null
  totalInterviews: number
  avgScore: number
  highestLevel: 'L1' | 'L2' | 'L3' | null
  latestInterview: any
  profileCompletion: number
  createdAt: string
  updatedAt: string
}

export function DashboardOverview() {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<CandidateProfile | null>(null)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/candidate/profile')

      if (response.ok) {
        const { data } = await response.json()
        setProfile(data)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 grid-bg min-h-screen p-6 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="space-y-6 grid-bg min-h-screen p-6 flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">Failed to load profile data</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Calculate hireability index based on real data
  const hireabilityScore = Math.min(100, Math.round(
    (profile.profileCompletion * 0.3) + // 30% profile completion
    (profile.avgScore * 0.4) + // 40% interview performance
    (profile.skills.length * 2) + // Skills contribution
    (profile.githubData ? 15 : 0) // 15 points for GitHub
  ))

  const getHireabilityLevel = (score: number) => {
    if (score >= 80) return "Job Ready"
    if (score >= 60) return "Nearly Ready"
    if (score >= 40) return "Building Skills"
    return "Getting Started"
  }

  const hireabilityIndex = {
    score: hireabilityScore,
    level: getHireabilityLevel(hireabilityScore),
    improvement: profile.totalInterviews > 0 ? `${profile.totalInterviews} interviews completed` : "Complete your first interview",
    breakdown: [
      { skill: "Technical Skills", score: profile.skills.length > 5 ? 85 : profile.skills.length * 10, color: "text-primary" },
      { skill: "Interview Score", score: profile.avgScore || 0, color: "text-accent" },
      { skill: "Profile Completion", score: profile.profileCompletion, color: "text-chart-2" },
      { skill: "GitHub Portfolio", score: profile.githubData ? 90 : 0, color: "text-chart-4" },
    ],
  }

  const stats = [
    {
      title: "Experience Level",
      value: profile.highestLevel || "Not assessed",
      progress: profile.highestLevel ? (profile.highestLevel === 'L3' ? 100 : profile.highestLevel === 'L2' ? 66 : 33) : 0,
      icon: TrendingUp,
      color: "text-primary",
    },
    {
      title: "Skills Verified",
      value: `${profile.skills.length}`,
      progress: Math.min(100, profile.skills.length * 10),
      icon: BookOpen,
      color: "text-accent",
    },
    {
      title: "Interviews Completed",
      value: `${profile.totalInterviews}`,
      progress: Math.min(100, profile.totalInterviews * 20),
      icon: ClipboardCheck,
      color: "text-chart-2",
    },
    {
      title: "Avg Interview Score",
      value: profile.avgScore > 0 ? `${profile.avgScore}%` : "N/A",
      progress: profile.avgScore || 0,
      icon: Target,
      color: "text-chart-4",
    },
  ]

  const recentActivities = profile.latestInterview ? [
    {
      title: `${profile.latestInterview.role} Interview - ${profile.latestInterview.level}`,
      time: new Date(profile.latestInterview.created_at).toLocaleDateString(),
      badge: profile.latestInterview.score >= 80 ? "Excellent" : profile.latestInterview.score >= 60 ? "Good" : "Completed",
      impact: `Score: ${profile.latestInterview.score}%`,
    }
  ] : []

  const recommendations = [
    {
      title: profile.totalInterviews === 0 ? "Take Your First Interview" : "Take Another Interview",
      description: profile.totalInterviews === 0 ? "Complete an AI interview to get assessed" : "Improve your interview score",
      progress: profile.totalInterviews > 0 ? 50 : 0,
      estimatedTime: "20-30 minutes",
      priority: "High Impact",
    },
    {
      title: profile.githubData ? "Update GitHub Portfolio" : "Connect GitHub Account",
      description: profile.githubData ? "Keep your projects up to date" : "Verify your technical skills",
      progress: profile.githubData ? 75 : 0,
      estimatedTime: profile.githubData ? "2 hours" : "5 minutes",
      priority: profile.githubData ? "Medium" : "Quick Win",
    },
    {
      title: "Complete Your Profile",
      description: "Add missing information to boost visibility",
      progress: profile.profileCompletion,
      estimatedTime: "10 minutes",
      priority: profile.profileCompletion < 100 ? "Quick Win" : "Completed",
    },
  ]

  const getInitials = (name: string | null) => {
    if (!name) return "?"
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const firstName = profile.fullName?.split(' ')[0] || 'there'

  return (
    <div className="space-y-6 grid-bg min-h-screen p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <h1 className="text-3xl font-bold mb-2">Welcome back, {firstName}!</h1>
        <p className="text-muted-foreground">
          {hireabilityScore >= 80
            ? "Your profile shows you're ready for opportunities"
            : hireabilityScore >= 60
            ? "You're making great progress towards being job-ready"
            : "Complete your profile and interviews to boost your hireability"}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Section - Profile Summary */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="lg:col-span-4"
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Profile Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">{getInitials(profile.fullName)}</span>
                </div>
                <h3 className="font-semibold">{profile.fullName || 'Anonymous User'}</h3>
                <p className="text-sm text-muted-foreground">{profile.targetRole || 'Job Seeker'}</p>
                {profile.experienceYears > 0 && (
                  <Badge className="mt-2">{profile.experienceYears}+ Years Experience</Badge>
                )}
                {profile.experienceYears === 0 && (
                  <Badge variant="outline" className="mt-2">Entry Level</Badge>
                )}
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Profile Completion</span>
                  <span className="font-medium">{profile.profileCompletion}%</span>
                </div>
                <Progress value={profile.profileCompletion} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Center Section - Hireability Index (Prominent) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="lg:col-span-4"
        >
          <Card className="h-full bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-primary">
                <Zap className="h-6 w-6" />
                Hireability Index
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-6">
              {/* Large Circular Score */}
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-muted/20"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 50}`}
                    strokeDashoffset={`${2 * Math.PI * 50 * (1 - hireabilityIndex.score / 100)}`}
                    className="text-primary transition-all duration-1000 ease-out"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-primary">{hireabilityIndex.score}</span>
                  <span className="text-xs text-muted-foreground">/ 100</span>
                </div>
              </div>

              <div className="text-center">
                <h3 className="font-bold text-lg text-primary">{hireabilityIndex.level}</h3>
                <p className="text-sm text-muted-foreground">{hireabilityIndex.improvement}</p>
              </div>

              {/* Skill Breakdown */}
              <div className="grid grid-cols-2 gap-3 w-full">
                {hireabilityIndex.breakdown.map((skill, index) => (
                  <div key={skill.skill} className="text-center p-2 bg-background/50 border border-border/50">
                    <div className={`text-lg font-bold ${skill.color}`}>{skill.score}</div>
                    <div className="text-xs text-muted-foreground">{skill.skill}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right Section - Quick Stats Grid */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="lg:col-span-4 grid grid-cols-2 gap-4"
        >
          {stats.map((stat, index) => (
            <Card key={stat.title} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-medium">{stat.title}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold mb-1">{stat.value}</div>
                <Progress value={stat.progress} className="h-1" />
              </CardContent>
            </Card>
          ))}
        </motion.div>
      </div>

      {/* GitHub Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.35 }}
      >
        <GitHubProfileCard />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentActivities.length > 0 ? (
                <div className="space-y-4">
                  {recentActivities.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 hover:bg-muted/50 transition-colors border border-border/50"
                    >
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{activity.title}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                        <p className="text-xs text-primary font-medium mt-1">{activity.impact}</p>
                      </div>
                      <Badge
                        variant={
                          activity.badge === "Completed"
                            ? "default"
                            : activity.badge === "Excellent"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {activity.badge}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <ClipboardCheck className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No recent activity yet</p>
                  <p className="text-xs mt-1">Complete an interview to get started</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Recommendations */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI-Powered Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendations.map((rec, index) => (
                  <div key={index} className="p-4 border border-border/50 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm">{rec.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        {rec.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{rec.description}</p>
                    <p className="text-xs text-primary font-medium mb-3">{rec.estimatedTime} to complete</p>
                    <div className="flex items-center justify-between">
                      <Progress value={rec.progress} className="h-2 flex-1 mr-3" />
                      <Button size="sm" variant="ghost" className="h-8 px-2">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Boost Your Hireability</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button className="h-16 flex-col gap-2">
                <BookOpen className="h-6 w-6" />
                Continue Learning
              </Button>
              <Button variant="outline" className="h-16 flex-col gap-2 bg-transparent">
                <ClipboardCheck className="h-6 w-6" />
                Take Assessment
              </Button>
              <Button variant="outline" className="h-16 flex-col gap-2 bg-transparent">
                <Code className="h-6 w-6" />
                Practice Coding
              </Button>
              <Button variant="outline" className="h-16 flex-col gap-2 bg-transparent">
                <Award className="h-6 w-6" />
                View Certificates
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
