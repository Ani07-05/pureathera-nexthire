"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff, Mail, Lock, User, Building, Github } from "lucide-react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

export function SignupForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [userType, setUserType] = useState<"candidate" | "recruiter">("candidate")
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const handleGitHubSignup = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          scopes: 'read:user repo',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          },
          data: {
            role: 'candidate'
          }
        }
      })

      if (error) throw error
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to sign up with GitHub",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRecruiterSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: 'recruiter',
            full_name: fullName
          }
        }
      })

      if (error) throw error

      toast({
        title: "Success!",
        description: "Account created. Redirecting to onboarding...",
      })

      // Redirect to onboarding
      router.push('/onboarding')
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create account",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-md"
    >
      <Card className="shadow-2xl border-0">
        <CardHeader className="text-center pb-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 bg-primary flex items-center justify-center text-primary-foreground font-bold">
              PA
            </div>
            <span className="font-bold text-xl">PUREATHERA</span>
          </div>
          <CardTitle className="text-2xl font-bold">Join Next-Hire</CardTitle>
          <p className="text-muted-foreground">Create your account to get started</p>
        </CardHeader>
        <CardContent>
          <Tabs value={userType} onValueChange={(value) => setUserType(value as "candidate" | "recruiter")}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="candidate" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Candidate
              </TabsTrigger>
              <TabsTrigger value="recruiter" className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                Recruiter
              </TabsTrigger>
            </TabsList>

            <TabsContent value="candidate" className="space-y-4">
              <div className="text-center py-8">
                <div className="mb-6">
                  <Github className="h-16 w-16 mx-auto mb-4 text-primary" />
                  <h3 className="text-xl font-semibold mb-2">Sign up with GitHub</h3>
                  <p className="text-muted-foreground text-sm">
                    We'll analyze your repositories and skills automatically
                  </p>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleGitHubSignup}
                  disabled={loading}
                >
                  <Github className="mr-2 h-5 w-5" />
                  {loading ? "Connecting..." : "Continue with GitHub"}
                </Button>

                <div className="mt-6 space-y-2 text-sm text-muted-foreground">
                  <p className="flex items-center justify-center gap-2">
                    ✓ Auto-analyze your code
                  </p>
                  <p className="flex items-center justify-center gap-2">
                    ✓ Extract your tech stack
                  </p>
                  <p className="flex items-center justify-center gap-2">
                    ✓ Match with relevant jobs
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="recruiter" className="space-y-4">
              <form onSubmit={handleRecruiterSignup} className="space-y-4">
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
                  <Label htmlFor="recruiterEmail">Work Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="recruiterEmail"
                      type="email"
                      placeholder="john@company.com"
                      className="pl-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recruiterPassword">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="recruiterPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      className="pl-10 pr-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="recruiterTerms" required />
                  <Label htmlFor="recruiterTerms" className="text-sm">
                    I agree to the Terms of Service and Privacy Policy
                  </Label>
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={loading}
                >
                  {loading ? "Creating Account..." : "Create Recruiter Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center">
            <div className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/auth/login">
                <Button variant="link" className="p-0 h-auto font-medium">
                  Sign in here
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
