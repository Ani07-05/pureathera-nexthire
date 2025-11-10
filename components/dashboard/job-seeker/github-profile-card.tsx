"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Github, Loader2, Star, GitFork, RefreshCw, ExternalLink } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

interface GitHubActivity {
  date: string
  commits: number
}

interface GitHubAnalysis {
  username: string
  profileUrl: string
  avatarUrl: string
  totalRepos: number
  totalStars: number
  totalCommits: number
  activeRepos: number
  codeVolume: string
  recentActivityGraph: GitHubActivity[]
  skills: string[]
  proficiencyScores: Record<string, number>
  notableProjects: Array<{
    name: string
    description: string
    quality_score: number
    url: string
    stars: number
    language: string | null
    commits?: number
    daysActive?: number
    category?: string
  }>
  overallAssessment: string
  recommendation: string
}

export function GitHubProfileCard() {
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<GitHubAnalysis | null>(null)
  const [hasGithub, setHasGithub] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchAnalysis()
  }, [])

  const fetchAnalysis = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/github/analyze')

      if (response.ok) {
        const { data } = await response.json()
        setAnalysis(data)
        setHasGithub(true)
        console.log('✅ GitHub analysis loaded:', data)
      } else if (response.status === 404) {
        // No analysis found
        console.log('❌ No GitHub analysis found (404)')
        setHasGithub(false)
      } else {
        // Other error
        const error = await response.json().catch(() => ({}))
        console.error('❌ GitHub analysis error:', response.status, error.error || error)
        setHasGithub(false)
      }
    } catch (error) {
      console.error('❌ Error fetching GitHub analysis:', error)
      setHasGithub(false)
    } finally {
      setLoading(false)
    }
  }

  const triggerAnalysis = async () => {
    try {
      setAnalyzing(true)
      console.log('🚀 Starting GitHub analysis...')
      toast({
        title: "Analyzing GitHub...",
        description: "This will take about 30 seconds",
      })

      const response = await fetch('/api/github/analyze', {
        method: 'POST'
      })

      if (response.ok) {
        const { data } = await response.json()
        console.log('✅ Analysis successful:', data)
        setAnalysis(data)
        setHasGithub(true)

        toast({
          title: "Analysis Complete!",
          description: `Found ${data.skills.length} skills and ${data.notableProjects?.length || 0} projects`,
        })

        // Optionally, trigger a page refresh or parent component refresh here
        // This ensures the hireability score updates on the dashboard
        // Wait a moment for the database to sync, then reload
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('❌ Analysis failed:', response.status, errorData)
        toast({
          title: "Analysis Failed",
          description: errorData.error || errorData.solution || "Could not analyze GitHub profile. Make sure you're signed in with GitHub.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('❌ Error analyzing GitHub:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to analyze GitHub profile",
        variant: "destructive"
      })
    } finally {
      setAnalyzing(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (!analysis) {
    return (
      <Card className="border-dashed border-amber-200 bg-amber-50 dark:bg-amber-950/20">
        <CardHeader className="text-center">
          <Github className="h-12 w-12 mx-auto mb-2 text-amber-600" />
          <CardTitle className="text-amber-900 dark:text-amber-100">Connect & Analyze GitHub</CardTitle>
          <CardDescription className="text-amber-800 dark:text-amber-200">
            Let AI analyze your repositories and extract your technical skills to boost your hireability score
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-amber-700 dark:text-amber-300">
            Make sure you're signed in with your GitHub account first, then click the button below.
          </p>
          <Button
            onClick={triggerAnalysis}
            disabled={analyzing}
            size="lg"
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            {analyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing... (30 seconds)
              </>
            ) : (
              <>
                <Github className="mr-2 h-4 w-4" />
                Analyze GitHub Profile
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground">
            Requires you to be logged in with GitHub. If you're not, please sign out and sign in with GitHub.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <img
              src={analysis.avatarUrl}
              alt={analysis.username}
              className="h-12 w-12 rounded-full"
            />
            <div>
              <CardTitle className="flex items-center gap-2">
                <a
                  href={analysis.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline flex items-center gap-1"
                >
                  @{analysis.username}
                  <ExternalLink className="h-4 w-4" />
                </a>
              </CardTitle>
              <CardDescription className="flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1">
                  <Github className="h-3 w-3" />
                  {analysis.totalRepos} repos
                </span>
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  {analysis.totalStars} stars
                </span>
              </CardDescription>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={triggerAnalysis}
            disabled={analyzing}
          >
            {analyzing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats and Graph - Split into two sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Activity Stats Card */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Activity Overview</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-muted/40 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Total Commits</p>
                <p className="text-lg font-bold">{analysis.totalCommits}</p>
              </div>
              <div className="p-3 bg-muted/40 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Active Repos</p>
                <p className="text-lg font-bold">{analysis.activeRepos}/{analysis.totalRepos}</p>
              </div>
              <div className="p-3 bg-muted/40 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Code Volume</p>
                <p className="text-lg font-bold">{analysis.codeVolume}</p>
              </div>
              <div className="p-3 bg-muted/40 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Total Stars</p>
                <p className="text-lg font-bold">{analysis.totalStars}</p>
              </div>
            </div>
          </div>

          {/* Activity Line Chart - Shadcn Recharts */}
          {analysis.recentActivityGraph && analysis.recentActivityGraph.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Recent Activity (90 days)</h4>
              <div className="h-[200px]">
                <ChartContainer
                  config={{
                    commits: {
                      label: "Commits",
                      color: "hsl(var(--primary))",
                    },
                  }}
                  className="h-full w-full"
                >
                  <AreaChart
                    data={analysis.recentActivityGraph}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="fillCommits" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tickFormatter={(value) => {
                        const date = new Date(value)
                        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                      }}
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          labelFormatter={(value) => {
                            return new Date(value).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          }}
                          formatter={(value) => [`${value} commits`, 'Commits']}
                        />
                      }
                    />
                    <Area
                      type="monotone"
                      dataKey="commits"
                      stroke="hsl(var(--primary))"
                      strokeWidth={3}
                      fill="url(#fillCommits)"
                      dot={{
                        r: 4,
                        fill: "hsl(var(--primary))",
                        strokeWidth: 2,
                        stroke: "hsl(var(--background))",
                      }}
                      activeDot={{
                        r: 6,
                        strokeWidth: 2,
                      }}
                    />
                  </AreaChart>
                </ChartContainer>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                {Math.floor(analysis.recentActivityGraph.reduce((sum, a) => sum + a.commits, 0) / 90)} commits/day average
              </p>
            </div>
          )}
        </div>

        {/* AI Assessment */}
        <div>
          <h4 className="font-semibold mb-2 text-sm">Assessment</h4>
          <p className="text-sm text-muted-foreground">{analysis.overallAssessment}</p>
          {analysis.recommendation && (
            <p className="text-sm text-primary mt-2 italic">{analysis.recommendation}</p>
          )}
        </div>

        {/* Skills with Proficiency */}
        <div>
          <h4 className="font-semibold mb-3 text-sm">Technical Skills</h4>
          <div className="flex flex-wrap gap-2">
            {analysis.skills.slice(0, 10).map((skill) => {
              const proficiency = analysis.proficiencyScores[skill] || 5
              return (
                <Badge
                  key={skill}
                  variant={proficiency >= 7 ? "default" : "secondary"}
                  className="text-xs"
                >
                  {skill}
                  {proficiency >= 8 && ` (Expert)`}
                  {proficiency >= 6 && proficiency < 8 && ` (Strong)`}
                </Badge>
              )
            })}
          </div>
        </div>

        {/* Best Projects */}
        {analysis.notableProjects && analysis.notableProjects.length > 0 && (
          <div>
            <h4 className="font-semibold mb-3 text-sm">Best Projects</h4>
            <div className="space-y-3">
              {analysis.notableProjects.slice(0, 3).map((project, idx) => (
                <div
                  key={project.name}
                  className="p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-muted-foreground">#{idx + 1}</span>
                        <a
                          href={project.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-sm hover:underline flex items-center gap-1 truncate"
                        >
                          {project.name}
                          <ExternalLink className="h-3 w-3 flex-shrink-0" />
                        </a>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {project.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-muted-foreground">
                        {project.language && (
                          <span className="px-2 py-1 bg-muted rounded">
                            {project.language}
                          </span>
                        )}
                        {project.commits !== undefined && project.commits > 0 && (
                          <span className="font-semibold text-primary">
                            {project.commits} commits
                          </span>
                        )}
                        {project.daysActive !== undefined && (
                          <span>Active: {project.daysActive}d</span>
                        )}
                        {project.stars > 0 && (
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3" /> {project.stars}
                          </span>
                        )}
                      </div>
                    </div>
                    <Badge
                      variant={project.quality_score >= 70 ? "default" : "secondary"}
                      className="ml-2 flex-shrink-0"
                    >
                      {project.quality_score}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
