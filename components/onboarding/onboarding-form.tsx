"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Building, Briefcase, User, MapPin, Globe, Github, Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import type { User } from "@supabase/supabase-js"

const TARGET_ROLES = [
  "Frontend Developer",
  "Backend Developer",
  "Full-Stack Developer",
  "Mobile Developer",
  "DevOps Engineer",
  "Data Scientist",
  "Machine Learning Engineer",
  "Security Engineer",
  "QA Engineer",
  "Product Manager"
]

const SKILLS = [
  "JavaScript", "TypeScript", "React", "Next.js", "Vue.js", "Angular",
  "Node.js", "Python", "Java", "Go", "Rust", "C++",
  "AWS", "Azure", "GCP", "Docker", "Kubernetes",
  "PostgreSQL", "MongoDB", "Redis", "GraphQL", "REST API",
  "Git", "CI/CD", "Terraform", "Jenkins"
]

interface OnboardingFormProps {
  user: User
  role: 'candidate' | 'recruiter'
}

export function OnboardingForm({ user, role }: OnboardingFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [analyzingGithub, setAnalyzingGithub] = useState(false)
  const [githubAnalyzed, setGithubAnalyzed] = useState(false)
  const [hasGithub, setHasGithub] = useState(false)

  // Candidate fields
  const [fullName, setFullName] = useState(user.user_metadata?.full_name || user.user_metadata?.name || '')
  const [targetRole, setTargetRole] = useState('')
  const [experienceYears, setExperienceYears] = useState('')
  const [skills, setSkills] = useState<string[]>([])
  const [location, setLocation] = useState('')
  const [bio, setBio] = useState(user.user_metadata?.bio || '')

  // Recruiter fields
  const [companyName, setCompanyName] = useState('')
  const [companyWebsite, setCompanyWebsite] = useState('')
  const [position, setPosition] = useState('')
  const [phone, setPhone] = useState('')

  // Check if user has GitHub and trigger analysis
  useEffect(() => {
    if (role === 'candidate') {
      checkAndAnalyzeGithub()
    }
  }, [role])

  const checkAndAnalyzeGithub = async () => {
    try {
      // Check if user signed up with GitHub
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser) return

      const githubIdentity = currentUser.identities?.find(
        (identity) => identity.provider === 'github'
      )

      if (githubIdentity) {
        setHasGithub(true)
        setAnalyzingGithub(true)

        toast({
          title: "Analyzing your GitHub...",
          description: "We're extracting your skills and projects. This takes ~30 seconds.",
        })

        // Trigger GitHub analysis
        const response = await fetch('/api/github/analyze', {
          method: 'POST'
        })

        if (response.ok) {
          const { data } = await response.json()

          // Auto-fill skills from GitHub analysis
          if (data.skills && data.skills.length > 0) {
            setSkills(data.skills)
            setGithubAnalyzed(true)

            toast({
              title: "GitHub Analysis Complete!",
              description: `Found ${data.skills.length} skills and ${data.notableProjects?.length || 0} notable projects.`,
            })
          }
        } else {
          console.error('GitHub analysis failed')
        }
      }
    } catch (error) {
      console.error('Error analyzing GitHub:', error)
    } finally {
      setAnalyzingGithub(false)
    }
  }

  const toggleSkill = (skill: string) => {
    setSkills(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    )
  }

  const handleCandidateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          onboarded: true
        })
        .eq('id', user.id)

      if (profileError) throw profileError

      // Create candidate profile
      const { error: candidateError } = await supabase
        .from('candidate_profiles')
        .insert({
          id: user.id,
          target_role: targetRole,
          experience_years: parseInt(experienceYears),
          skills,
          location,
          bio,
          github_username: user.user_metadata?.user_name || null
        })

      if (candidateError) throw candidateError

      toast({
        title: "Welcome aboard!",
        description: "Your profile has been created successfully.",
      })

      router.push('/job-seeker')
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to complete onboarding",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRecruiterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          onboarded: true
        })
        .eq('id', user.id)

      if (profileError) throw profileError

      // Create recruiter profile
      const { error: recruiterError } = await supabase
        .from('recruiter_profiles')
        .insert({
          id: user.id,
          company_name: companyName,
          company_website: companyWebsite,
          position,
          phone
        })

      if (recruiterError) throw recruiterError

      toast({
        title: "Welcome aboard!",
        description: "Your recruiter profile has been created successfully.",
      })

      router.push('/recruiter')
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to complete onboarding",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  if (role === 'candidate') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl"
      >
        <Card className="shadow-2xl border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">Complete Your Profile</CardTitle>
            <CardDescription>
              Tell us about yourself to get personalized job matches
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analyzingGithub && (
              <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 mb-6">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-900 dark:text-blue-100">
                        Analyzing your GitHub profile...
                      </p>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Extracting skills from your repositories (~30s)
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {githubAnalyzed && (
              <Card className="bg-green-50 dark:bg-green-950 border-green-200 mb-6">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Github className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-900 dark:text-green-100">
                        ✓ GitHub Analysis Complete!
                      </p>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        {skills.length} skills detected and auto-filled below
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <form onSubmit={handleCandidateSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="fullName"
                    placeholder="John Doe"
                    className="pl-10"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetRole">Target Role</Label>
                <Select value={targetRole} onValueChange={setTargetRole} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your target role" />
                  </SelectTrigger>
                  <SelectContent>
                    {TARGET_ROLES.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Years of Experience</Label>
                <Input
                  id="experience"
                  type="number"
                  min="0"
                  max="50"
                  placeholder="3"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>
                  Skills {githubAnalyzed && <span className="text-green-600 text-sm">(Auto-detected from GitHub)</span>}
                </Label>
                {githubAnalyzed && skills.length > 0 && (
                  <div className="p-3 bg-muted rounded-md mb-2">
                    <p className="text-sm mb-2 font-medium">From your GitHub:</p>
                    <div className="flex flex-wrap gap-1">
                      {skills.map((skill) => (
                        <span key={skill} className="px-2 py-1 bg-primary text-primary-foreground rounded text-xs">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <p className="text-sm text-muted-foreground mb-2">
                  {githubAnalyzed ? 'Add more skills if needed:' : 'Select your skills:'}
                </p>
                <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 border rounded-md">
                  {SKILLS.map((skill) => (
                    <Button
                      key={skill}
                      type="button"
                      variant={skills.includes(skill) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleSkill(skill)}
                      className="text-xs"
                      disabled={analyzingGithub}
                    >
                      {skill}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {skills.length} selected
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="location"
                    placeholder="San Francisco, CA"
                    className="pl-10"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio (optional)</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about your experience and what you're looking for..."
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={loading}
              >
                {loading ? "Creating Profile..." : "Complete Setup"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  // Recruiter form
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-2xl"
    >
      <Card className="shadow-2xl border-0">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Complete Your Company Profile</CardTitle>
          <CardDescription>
            Tell us about your company and hiring needs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRecruiterSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="fullName"
                  placeholder="Jane Smith"
                  className="pl-10"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="companyName"
                  placeholder="Tech Corp Inc."
                  className="pl-10"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyWebsite">Company Website</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="companyWebsite"
                  type="url"
                  placeholder="https://techcorp.com"
                  className="pl-10"
                  value={companyWebsite}
                  onChange={(e) => setCompanyWebsite(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">Your Position</Label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="position"
                  placeholder="Head of Talent Acquisition"
                  className="pl-10"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number (optional)</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={loading}
            >
              {loading ? "Creating Profile..." : "Complete Setup"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}
