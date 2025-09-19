"use client"

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
} from "lucide-react"
import { motion } from "framer-motion"

export function DashboardOverview() {
  const hireabilityIndex = {
    score: 87,
    level: "Job Ready",
    improvement: "+12 points this month",
    breakdown: [
      { skill: "Technical Skills", score: 92, color: "text-primary" },
      { skill: "Communication", score: 85, color: "text-accent" },
      { skill: "Problem Solving", score: 88, color: "text-chart-2" },
      { skill: "Team Collaboration", score: 84, color: "text-chart-4" },
    ],
  }

  const stats = [
    {
      title: "Skill Level",
      value: "Advanced",
      progress: 87,
      icon: TrendingUp,
      color: "text-primary",
    },
    {
      title: "Courses Completed",
      value: "15/18",
      progress: 83,
      icon: BookOpen,
      color: "text-accent",
    },
    {
      title: "Assessments Passed",
      value: "9/10",
      progress: 90,
      icon: ClipboardCheck,
      color: "text-chart-2",
    },
    {
      title: "Job Applications",
      value: "23",
      progress: 76,
      icon: Target,
      color: "text-chart-4",
    },
  ]

  const recentActivities = [
    {
      title: "Completed Advanced React Patterns",
      time: "2 hours ago",
      badge: "Completed",
      impact: "+3 Hireability Points",
    },
    {
      title: "JavaScript Assessment - Score: 94%",
      time: "1 day ago",
      badge: "Excellent",
      impact: "+5 Hireability Points",
    },
    {
      title: "Applied to Senior Frontend at TechCorp",
      time: "2 days ago",
      badge: "Pending",
      impact: "Profile Viewed 12 times",
    },
  ]

  const recommendations = [
    {
      title: "Complete System Design Course",
      description: "Boost your hireability by +8 points",
      progress: 0,
      estimatedTime: "6 hours",
      priority: "High Impact",
    },
    {
      title: "Practice Coding Interviews",
      description: "Improve problem-solving score",
      progress: 25,
      estimatedTime: "2 hours",
      priority: "Quick Win",
    },
    {
      title: "Update Portfolio Projects",
      description: "Showcase recent learnings",
      progress: 60,
      estimatedTime: "3 hours",
      priority: "Medium",
    },
  ]

  return (
    <div className="space-y-6 grid-bg min-h-screen p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <h1 className="text-3xl font-bold mb-2">Welcome back, Raj!</h1>
        <p className="text-muted-foreground">Your hireability index shows you're ready for senior roles</p>
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
                  <span className="text-2xl font-bold text-primary">RK</span>
                </div>
                <h3 className="font-semibold">Raj Kumar</h3>
                <p className="text-sm text-muted-foreground">Frontend Developer</p>
                <Badge className="mt-2">3+ Years Experience</Badge>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Profile Completion</span>
                  <span className="font-medium">92%</span>
                </div>
                <Progress value={92} className="h-2" />
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
