"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Eye, MessageSquare, Calendar, Star, MapPin, Briefcase } from "lucide-react"
import { motion } from "framer-motion"

export function CandidatesList() {
  const candidates = [
    {
      id: 1,
      name: "Raj Kumar",
      role: "Frontend Developer",
      location: "Bangalore, India",
      experience: "3 years",
      score: 92,
      skills: ["React", "TypeScript", "Node.js", "GraphQL", "AWS"],
      status: "Available",
      avatar: "RK",
      lastActive: "2 hours ago",
      education: "B.Tech Computer Science",
      expectedSalary: "₹12-15 LPA",
    },
    {
      id: 2,
      name: "Priya Sharma",
      role: "Full Stack Developer",
      location: "Mumbai, India",
      experience: "4 years",
      score: 88,
      skills: ["Python", "Django", "React", "PostgreSQL", "Docker"],
      status: "Interview",
      avatar: "PS",
      lastActive: "1 day ago",
      education: "M.Tech Software Engineering",
      expectedSalary: "₹15-18 LPA",
    },
    {
      id: 3,
      name: "Arjun Patel",
      role: "Backend Developer",
      location: "Pune, India",
      experience: "2 years",
      score: 85,
      skills: ["Java", "Spring Boot", "MySQL", "Redis", "Kafka"],
      status: "Available",
      avatar: "AP",
      lastActive: "5 hours ago",
      education: "B.E. Information Technology",
      expectedSalary: "₹10-12 LPA",
    },
    {
      id: 4,
      name: "Sneha Reddy",
      role: "DevOps Engineer",
      location: "Hyderabad, India",
      experience: "5 years",
      score: 90,
      skills: ["AWS", "Docker", "Kubernetes", "Jenkins", "Terraform"],
      status: "Hired",
      avatar: "SR",
      lastActive: "3 days ago",
      education: "B.Tech Electronics",
      expectedSalary: "₹18-22 LPA",
    },
    {
      id: 5,
      name: "Vikram Singh",
      role: "Mobile Developer",
      location: "Delhi, India",
      experience: "3 years",
      score: 87,
      skills: ["React Native", "Flutter", "iOS", "Android", "Firebase"],
      status: "Available",
      avatar: "VS",
      lastActive: "1 hour ago",
      education: "B.Tech Computer Science",
      expectedSalary: "₹14-16 LPA",
    },
    {
      id: 6,
      name: "Meera Joshi",
      role: "Data Scientist",
      location: "Chennai, India",
      experience: "4 years",
      score: 91,
      skills: ["Python", "Machine Learning", "TensorFlow", "SQL", "Tableau"],
      status: "Available",
      avatar: "MJ",
      lastActive: "30 minutes ago",
      education: "M.Sc. Data Science",
      expectedSalary: "₹16-20 LPA",
    },
  ]

  return (
    <div className="space-y-6 grid-bg min-h-screen p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <h1 className="text-3xl font-bold mb-2">Candidates</h1>
        <p className="text-muted-foreground">Browse and manage candidate profiles</p>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search candidates by name, skills, or role..." className="pl-10" />
                </div>
              </div>
              <div className="flex gap-2">
                <Select>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="frontend">Frontend</SelectItem>
                    <SelectItem value="backend">Backend</SelectItem>
                    <SelectItem value="fullstack">Full Stack</SelectItem>
                    <SelectItem value="devops">DevOps</SelectItem>
                    <SelectItem value="mobile">Mobile</SelectItem>
                    <SelectItem value="data">Data Science</SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Experience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Experience</SelectItem>
                    <SelectItem value="0-2">0-2 years</SelectItem>
                    <SelectItem value="2-5">2-5 years</SelectItem>
                    <SelectItem value="5+">5+ years</SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="interview">In Interview</SelectItem>
                    <SelectItem value="hired">Hired</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  More Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Candidates Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {candidates.map((candidate, index) => (
          <motion.div
            key={candidate.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback className="bg-primary text-primary-foreground font-bold text-lg">
                        {candidate.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-xl font-semibold">{candidate.name}</h3>
                      <p className="text-muted-foreground">{candidate.role}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {candidate.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Briefcase className="h-3 w-3" />
                          {candidate.experience}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="h-4 w-4 text-accent" />
                      <span className="text-2xl font-bold text-primary">{candidate.score}</span>
                    </div>
                    <Badge
                      variant={
                        candidate.status === "Available"
                          ? "default"
                          : candidate.status === "Interview"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {candidate.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Skills</h4>
                    <div className="flex flex-wrap gap-1">
                      {candidate.skills.map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Education:</span>
                      <p className="font-medium">{candidate.education}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Expected Salary:</span>
                      <p className="font-medium">{candidate.expectedSalary}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <span className="text-xs text-muted-foreground">Last active: {candidate.lastActive}</span>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button size="sm" variant="outline">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Message
                      </Button>
                      <Button size="sm">
                        <Calendar className="h-4 w-4 mr-1" />
                        Interview
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
