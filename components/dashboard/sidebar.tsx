"use client"

import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Home, BookOpen, ClipboardCheck, TrendingUp, MessageSquare, Settings, LogOut, User, Video } from "lucide-react"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
  userType: "job-seeker" | "recruiter"
}

export function Sidebar({ activeTab, onTabChange, userType }: SidebarProps) {
  const [userName, setUserName] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const supabase = createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) return

        // Fetch user profile
        const { data: profile } = await supabase
          .from('candidate_profiles')
          .select('full_name, target_role')
          .eq('id', user.id)
          .single()

        if (profile) {
          setUserName(profile.full_name || user.email?.split('@')[0] || 'User')
          setUserRole(profile.target_role || 'Developer')
        } else {
          setUserName(user.email?.split('@')[0] || 'User')
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      }
    }

    fetchUserData()
  }, [])

  const jobSeekerItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "learning", label: "Learning Path", icon: BookOpen },
    { id: "interview", label: "Interview", icon: Video },
    { id: "assessments", label: "Assessments", icon: ClipboardCheck },
    { id: "progress", label: "Progress", icon: TrendingUp },
    { id: "messages", label: "Messages", icon: MessageSquare },
    { id: "profile", label: "Profile", icon: User },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  const recruiterItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "candidates", label: "Candidates", icon: User },
    { id: "assessments", label: "Create Tests", icon: ClipboardCheck },
    { id: "analytics", label: "Analytics", icon: TrendingUp },
    { id: "messages", label: "Messages", icon: MessageSquare },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  const items = userType === "job-seeker" ? jobSeekerItems : recruiterItems

  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border h-screen flex flex-col">
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground font-bold text-sm">
            PA
          </div>
          <span className="font-bold text-lg text-sidebar-foreground">PUREATHERA</span>
        </div>
        <p className="text-sm text-sidebar-foreground/70">
          {userType === "job-seeker" ? "Job Seeker Portal" : "Recruiter Portal"}
        </p>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id}>
              <Button
                variant={activeTab === item.id ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 h-11",
                  activeTab === item.id
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
                onClick={() => onTabChange(item.id)}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center justify-between mb-4">
          <ThemeToggle />
          <Button variant="ghost" size="icon" className="text-sidebar-foreground">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex items-center gap-3 p-3 bg-sidebar-accent text-sidebar-accent-foreground">
          <div className="w-8 h-8 bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center font-semibold text-sm">
            {userName?.substring(0, 2).toUpperCase() || "US"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{userName || "Loading..."}</p>
            <p className="text-xs text-sidebar-accent-foreground/70 truncate">
              {userRole || "Developer"}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
