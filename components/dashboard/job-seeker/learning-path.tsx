"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Play, CheckCircle, Clock, Star, ArrowRight, Trophy, Target } from "lucide-react"
import { motion } from "framer-motion"

export function LearningPath() {
  const learningPaths = [
    {
      title: "Frontend Developer Track",
      description: "Complete path to become a job-ready frontend developer",
      progress: 65,
      totalCourses: 18,
      completedCourses: 12,
      estimatedTime: "120 hours",
      difficulty: "Intermediate",
      isActive: true,
    },
    {
      title: "Full Stack JavaScript",
      description: "Master both frontend and backend with JavaScript",
      progress: 25,
      totalCourses: 24,
      completedCourses: 6,
      estimatedTime: "180 hours",
      difficulty: "Advanced",
      isActive: false,
    },
  ]

  const currentCourses = [
    {
      title: "React Advanced Patterns",
      description: "Learn advanced React patterns and best practices",
      progress: 80,
      duration: "4 hours",
      lessons: 12,
      completedLessons: 10,
      status: "in-progress",
      difficulty: "Advanced",
    },
    {
      title: "TypeScript Fundamentals",
      description: "Master TypeScript for better JavaScript development",
      progress: 100,
      duration: "3 hours",
      lessons: 8,
      completedLessons: 8,
      status: "completed",
      difficulty: "Intermediate",
    },
    {
      title: "Node.js & Express",
      description: "Build backend applications with Node.js",
      progress: 30,
      duration: "6 hours",
      lessons: 15,
      completedLessons: 4,
      status: "in-progress",
      difficulty: "Intermediate",
    },
    {
      title: "Database Design",
      description: "Learn SQL and database design principles",
      progress: 0,
      duration: "5 hours",
      lessons: 10,
      completedLessons: 0,
      status: "not-started",
      difficulty: "Beginner",
    },
  ]

  const achievements = [
    { title: "JavaScript Master", icon: Trophy, earned: true },
    { title: "React Expert", icon: Star, earned: true },
    { title: "Problem Solver", icon: Target, earned: false },
    { title: "Full Stack", icon: BookOpen, earned: false },
  ]

  return (
    <div className="space-y-6 grid-bg min-h-screen p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <h1 className="text-3xl font-bold mb-2">Learning Path</h1>
        <p className="text-muted-foreground">Track your progress and continue learning</p>
      </motion.div>

      {/* Learning Paths Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {learningPaths.map((path, index) => (
          <motion.div
            key={path.title}
            initial={{ opacity: 0, x: index === 0 ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className={`${path.isActive ? "border-primary shadow-lg" : ""} hover:shadow-lg transition-all`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{path.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{path.description}</p>
                  </div>
                  {path.isActive && <Badge className="bg-primary text-primary-foreground">Active</Badge>}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progress</span>
                      <span>
                        {path.completedCourses}/{path.totalCourses} courses
                      </span>
                    </div>
                    <Progress value={path.progress} className="h-3" />
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {path.estimatedTime}
                      </span>
                      <Badge variant="outline">{path.difficulty}</Badge>
                    </div>
                    <Button size="sm" variant={path.isActive ? "default" : "outline"}>
                      {path.isActive ? "Continue" : "Start"}
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Courses */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Current Courses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currentCourses.map((course, index) => (
                  <div key={course.title} className="p-4 border hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-medium mb-1">{course.title}</h4>
                        <p className="text-sm text-muted-foreground">{course.description}</p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        {course.status === "completed" && <CheckCircle className="h-5 w-5 text-accent" />}
                        <Badge
                          variant={
                            course.status === "completed"
                              ? "default"
                              : course.status === "in-progress"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {course.status === "completed"
                            ? "Completed"
                            : course.status === "in-progress"
                              ? "In Progress"
                              : "Not Started"}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>
                          {course.completedLessons}/{course.lessons} lessons
                        </span>
                        <span>{course.duration}</span>
                        <Badge variant="outline" className="text-xs">
                          {course.difficulty}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <Progress value={course.progress} className="h-2 flex-1 mr-4" />
                      <Button size="sm" variant="ghost">
                        {course.status === "completed"
                          ? "Review"
                          : course.status === "in-progress"
                            ? "Continue"
                            : "Start"}
                        <Play className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {achievements.map((achievement, index) => (
                  <div
                    key={achievement.title}
                    className={`flex items-center gap-3 p-3 border ${
                      achievement.earned ? "bg-accent/10 border-accent/20" : "opacity-50"
                    }`}
                  >
                    <achievement.icon
                      className={`h-6 w-6 ${achievement.earned ? "text-accent" : "text-muted-foreground"}`}
                    />
                    <span className="font-medium text-sm">{achievement.title}</span>
                    {achievement.earned && <CheckCircle className="h-4 w-4 text-accent ml-auto" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
