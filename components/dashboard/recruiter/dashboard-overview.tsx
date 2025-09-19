"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Users,
  ClipboardCheck,
  TrendingUp,
  Target,
  Eye,
  Star,
  Calendar,
  Filter,
  Zap,
  Brain,
  Search,
  BarChart3,
} from "lucide-react"
import { motion } from "framer-motion"

export function RecruiterDashboardOverview() {
  const hireabilityAnalytics = {
    averageScore: 78,
    totalCandidates: 1247,
    readyCandidates: 342,
    improvement: "+15% this month",
    distribution: [
      { range: "90-100", count: 89, color: "text-primary", label: "Excellent" },
      { range: "80-89", count: 253, color: "text-accent", label: "Very Good" },
      { range: "70-79", count: 456, color: "text-chart-2", label: "Good" },
      { range: "60-69", count: 449, color: "text-chart-4", label: "Developing" },
    ],
  }

  const stats = [
    {
      title: "Job-Ready Candidates",
      value: "342",
      change: "+18%",
      icon: Users,
      color: "text-primary",
    },
    {
      title: "Avg. Hireability Score",
      value: "78",
      change: "+5 pts",
      icon: TrendingUp,
      color: "text-accent",
    },
    {
      title: "Successful Hires",
      value: "89",
      change: "+23%",
      icon: Target,
      color: "text-chart-2",
    },
    {
      title: "Time to Hire",
      value: "8 days",
      change: "-4 days",
      icon: BarChart3,
      color: "text-chart-4",
    },
  ]

  const topCandidates = [
    {
      name: "Raj Kumar",
      role: "Frontend Developer",
      hireabilityScore: 92,
      skills: ["React", "TypeScript", "Node.js"],
      experience: "3 years",
      status: "Available",
      avatar: "RK",
      improvement: "+8 pts",
    },
    {
      name: "Priya Sharma",
      role: "Full Stack Developer",
      hireabilityScore: 88,
      skills: ["Python", "Django", "React"],
      experience: "4 years",
      status: "Interview",
      avatar: "PS",
      improvement: "+12 pts",
    },
    {
      name: "Arjun Patel",
      role: "Backend Developer",
      hireabilityScore: 85,
      skills: ["Java", "Spring", "MySQL"],
      experience: "2 years",
      status: "Available",
      avatar: "AP",
      improvement: "+6 pts",
    },
    {
      name: "Sneha Reddy",
      role: "DevOps Engineer",
      hireabilityScore: 90,
      skills: ["AWS", "Docker", "Kubernetes"],
      experience: "5 years",
      status: "Hired",
      avatar: "SR",
      improvement: "+4 pts",
    },
  ]

  const recentActivity = [
    {
      action: "High-scoring candidate registered",
      candidate: "Vikram Singh (Score: 91)",
      time: "2 hours ago",
    },
    {
      action: "Assessment completed",
      candidate: "Meera Joshi (+7 hireability points)",
      time: "4 hours ago",
    },
    {
      action: "Top candidate hired",
      candidate: "Anjali Nair (Score: 89)",
      time: "1 day ago",
    },
  ]

  const upcomingInterviews = [
    {
      candidate: "Raj Kumar",
      role: "Frontend Developer",
      time: "Today, 2:00 PM",
      type: "Technical",
      avatar: "RK",
    },
    {
      candidate: "Priya Sharma",
      role: "Full Stack Developer",
      time: "Tomorrow, 10:00 AM",
      type: "Final Round",
      avatar: "PS",
    },
    {
      candidate: "Kiran Desai",
      role: "UI/UX Designer",
      time: "Tomorrow, 3:00 PM",
      type: "Portfolio Review",
      avatar: "KD",
    },
  ]

  return (
    <div className="space-y-6 grid-bg min-h-screen p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <h1 className="text-3xl font-bold mb-2">Recruiter Dashboard</h1>
        <p className="text-muted-foreground">Find job-ready candidates with transparent hireability scores</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Section - Quick Search */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="lg:col-span-4"
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Smart Candidate Search
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <Zap className="h-4 w-4 mr-2" />
                  Hireability Score 85+
                </Button>
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <Target className="h-4 w-4 mr-2" />
                  Available Now
                </Button>
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <Star className="h-4 w-4 mr-2" />
                  Top Performers
                </Button>
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <Brain className="h-4 w-4 mr-2" />
                  AI Recommended
                </Button>
              </div>
              <div className="pt-4 border-t">
                <h4 className="font-medium text-sm mb-2">Popular Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {["React", "Python", "AWS", "Node.js", "Java"].map((skill) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Center Section - Hireability Analytics (Prominent) */}
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
                Hireability Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-6">
              {/* Large Circular Average Score */}
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
                    strokeDashoffset={`${2 * Math.PI * 50 * (1 - hireabilityAnalytics.averageScore / 100)}`}
                    className="text-primary transition-all duration-1000 ease-out"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-primary">{hireabilityAnalytics.averageScore}</span>
                  <span className="text-xs text-muted-foreground">Avg Score</span>
                </div>
              </div>

              <div className="text-center">
                <h3 className="font-bold text-lg text-primary">{hireabilityAnalytics.readyCandidates} Job-Ready</h3>
                <p className="text-sm text-muted-foreground">
                  out of {hireabilityAnalytics.totalCandidates} candidates
                </p>
                <p className="text-sm text-accent font-medium">{hireabilityAnalytics.improvement}</p>
              </div>

              {/* Score Distribution */}
              <div className="grid grid-cols-2 gap-3 w-full">
                {hireabilityAnalytics.distribution.map((dist, index) => (
                  <div key={dist.range} className="text-center p-2 bg-background/50 border border-border/50">
                    <div className={`text-lg font-bold ${dist.color}`}>{dist.count}</div>
                    <div className="text-xs text-muted-foreground">{dist.label}</div>
                    <div className="text-xs text-muted-foreground">({dist.range})</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right Section - Key Metrics Grid */}
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
                <p className="text-xs text-muted-foreground">
                  <span
                    className={
                      stat.change.startsWith("+") || stat.change.includes("-4") ? "text-accent" : "text-primary"
                    }
                  >
                    {stat.change}
                  </span>{" "}
                  from last month
                </p>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Candidates with Hireability Scores */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Top Hireability Candidates
                </CardTitle>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topCandidates.map((candidate, index) => (
                  <div
                    key={candidate.name}
                    className="flex items-center gap-4 p-3 hover:bg-muted/50 transition-colors border border-border/50"
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                        {candidate.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm">{candidate.name}</h4>
                        <Badge
                          variant={
                            candidate.status === "Available"
                              ? "default"
                              : candidate.status === "Interview"
                                ? "secondary"
                                : "outline"
                          }
                          className="text-xs"
                        >
                          {candidate.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {candidate.role} • {candidate.experience}
                      </p>
                      <div className="flex items-center gap-1 flex-wrap">
                        {candidate.skills.slice(0, 3).map((skill) => (
                          <Badge key={skill} variant="outline" className="text-xs px-1 py-0">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">{candidate.hireabilityScore}</div>
                      <div className="text-xs text-muted-foreground">Hireability</div>
                      <div className="text-xs text-accent font-medium">{candidate.improvement}</div>
                    </div>
                    <Button size="sm" variant="ghost">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity & Insights */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">
                          <span className="font-medium">{activity.action}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">{activity.candidate}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-primary/5 border border-primary/20">
                    <p className="text-sm font-medium text-primary">Trending Skills</p>
                    <p className="text-xs text-muted-foreground">React developers show 23% higher hireability scores</p>
                  </div>
                  <div className="p-3 bg-accent/5 border border-accent/20">
                    <p className="text-sm font-medium text-accent">Best Time to Hire</p>
                    <p className="text-xs text-muted-foreground">Candidates with 80+ scores get hired 3x faster</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Find Your Perfect Candidate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button className="h-16 flex-col gap-2">
                <Search className="h-6 w-6" />
                Browse by Score
              </Button>
              <Button variant="outline" className="h-16 flex-col gap-2 bg-transparent">
                <ClipboardCheck className="h-6 w-6" />
                Create Assessment
              </Button>
              <Button variant="outline" className="h-16 flex-col gap-2 bg-transparent">
                <Calendar className="h-6 w-6" />
                Schedule Interview
              </Button>
              <Button variant="outline" className="h-16 flex-col gap-2 bg-transparent">
                <TrendingUp className="h-6 w-6" />
                View Analytics
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
