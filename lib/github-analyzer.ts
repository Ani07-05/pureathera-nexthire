import { Octokit } from '@octokit/rest'
import { GoogleGenerativeAI } from "@google/generative-ai"

export interface GitHubRepo {
  name: string
  description: string | null
  stargazers_count: number
  forks_count: number
  language: string | null
  html_url: string
  topics: string[]
  size: number
  updated_at: string
  created_at: string
}

export interface ProjectMetrics {
  commits: number
  daysActive: number
  linesOfCode: number
  hasReadme: boolean
  hasTests: boolean
  hasCI: boolean
  isFork: boolean
  isRecent: boolean
  workScore: number
  category: 'professional' | 'active' | 'learning' | 'oss'
}

export interface GitHubActivity {
  date: string
  commits: number
}

export interface GitHubAnalysis {
  username: string
  profileUrl: string
  avatarUrl: string
  bio: string | null
  totalRepos: number
  totalStars: number
  totalCommits: number
  activeRepos: number
  codeVolume: string
  recentActivityGraph: GitHubActivity[]
  languages: Record<string, number>
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
  analysisDate: string
}

export async function fetchGitHubProfile(accessToken: string) {
  const octokit = new Octokit({ auth: accessToken })

  try {
    // Fetch user profile
    const { data: user } = await octokit.users.getAuthenticated()

    // Fetch all repositories (handle pagination)
    let allRepos: any[] = []
    let page = 1
    let hasMore = true

    while (hasMore) {
      const { data: pageRepos } = await octokit.repos.listForAuthenticatedUser({
        sort: 'updated',
        per_page: 100,
        page: page
      })

      if (pageRepos.length === 0) {
        hasMore = false
      } else {
        allRepos = allRepos.concat(pageRepos)
        if (pageRepos.length < 100) {
          hasMore = false
        }
        page++
      }
    }

    const repos = allRepos

    // Fetch enriched data for each repo (languages, commits, files)
    const reposWithEnrichedData = await Promise.all(
      repos.map(async (repo) => {
        try {
          const [languagesData, readmeData, contributorStats] = await Promise.all([
            // Get languages
            octokit.repos.listLanguages({
              owner: user.login,
              repo: repo.name
            }).catch(() => ({ data: {} })),
            // Check for README
            octokit.repos.getReadme({
              owner: user.login,
              repo: repo.name
            }).catch(() => null),
            // Get contributor stats - MOST ACCURATE for commit count
            octokit.repos.getContributorsStats({
              owner: user.login,
              repo: repo.name
            }).catch(() => ({ data: [] }))
          ])

          // Try contributor stats first (most accurate)
          let actualCommitCount = 0
          const userContribStats = Array.isArray(contributorStats.data)
            ? contributorStats.data.find((c: any) => c.author?.login === user.login)
            : null
          
          if (userContribStats && userContribStats.total > 0) {
            actualCommitCount = userContribStats.total
          } else {
            // Fallback: Count commits via listCommits API (up to 300)
            try {
              let commitCount = 0
              for (let page = 1; page <= 3; page++) {
                const commits = await octokit.repos.listCommits({
                  owner: user.login,
                  repo: repo.name,
                  author: user.login,
                  per_page: 100,
                  page
                })
                commitCount += commits.data.length
                if (commits.data.length < 100) break
              }
              actualCommitCount = commitCount
            } catch {
              // If both fail, use 0
              actualCommitCount = 0
            }
          }
          
          console.log(`  ${repo.name}: ${actualCommitCount} commits (owner: ${repo.owner.login === user.login})`)

          return {
            ...repo,
            languages: languagesData.data || {},
            hasReadme: !!readmeData,
            userCommits: actualCommitCount, // ACTUAL user commits
            isOwner: repo.owner.login === user.login // Track if user owns the repo
          }
        } catch {
          return { ...repo, languages: {}, hasReadme: false, userCommits: 0 }
        }
      })
    )

    return {
      user,
      repos: reposWithEnrichedData
    }
  } catch (error) {
    console.error('Error fetching GitHub profile:', error)
    throw new Error('Failed to fetch GitHub profile')
  }
}

/**
 * Advanced Project Scoring Algorithm
 * 
 * This algorithm evaluates GitHub repositories based on multiple quality indicators
 * that demonstrate real engineering work, especially for developers with 0-2 stars.
 * 
 * Key Metrics:
 * 1. Commit Depth - sustained work over time
 * 2. Project Maturity - longevity and consistency
 * 3. Code Quality Indicators - README, tests, CI/CD
 * 4. Recent Activity - ongoing maintenance
 * 5. Code Volume - scale of work
 * 6. Community Impact - stars, forks (weighted low)
 */
function calculateWorkScore(repo: any): number {
  const now = new Date()
  const createdDate = new Date(repo.created_at)
  const lastUpdate = new Date(repo.updated_at)
  
  const daysActive = Math.max(1, (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24))
  const daysSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24)
  
  let score = 0
  
  // 1. COMMIT DEPTH SCORE (30 points max) - Most important for 0-star devs
  // Use actual user commits if available, otherwise estimate from size
  const actualCommits = repo.userCommits || 0
  const estimatedCommits = actualCommits > 0 ? actualCommits : Math.max(1, Math.floor(repo.size / 50))
  if (estimatedCommits >= 100) score += 30
  else if (estimatedCommits >= 50) score += 25
  else if (estimatedCommits >= 25) score += 20
  else if (estimatedCommits >= 10) score += 15
  else score += Math.min(estimatedCommits * 1.5, 10)
  
  // 2. PROJECT MATURITY SCORE (25 points max)
  // Balance between longevity and active maintenance
  const maturityMonths = daysActive / 30
  
  if (maturityMonths >= 12 && daysSinceUpdate < 90) {
    // Mature + maintained = best
    score += 25
  } else if (maturityMonths >= 6 && daysSinceUpdate < 180) {
    // Mid-term project with updates
    score += 20
  } else if (maturityMonths >= 3 && daysSinceUpdate < 365) {
    // Newer but maintained
    score += 15
  } else if (maturityMonths < 1 && daysSinceUpdate < 7) {
    // Very new, very active (might be learning project)
    score += 10
  } else {
    // Old and abandoned
    score += 5
  }
  
  // 3. RECENT ACTIVITY BONUS (20 points max) - Shows current engagement
  if (daysSinceUpdate < 7) score += 20       // Last week
  else if (daysSinceUpdate < 30) score += 15  // Last month
  else if (daysSinceUpdate < 90) score += 10  // Last quarter
  else if (daysSinceUpdate < 180) score += 5  // Last 6 months
  // Else: 0 points for stale repos
  
  // 4. CODE QUALITY INDICATORS (15 points max)
  if (repo.hasReadme) score += 8             // Documentation
  if (repo.description && repo.description.length > 20) score += 4  // Good description
  if (repo.size > 100) score += 3            // Non-trivial size
  
  // 5. CODE VOLUME SCORE (10 points max)
  // Larger projects = more substantial work
  const sizeInMB = repo.size / 1024
  if (sizeInMB >= 5) score += 10
  else if (sizeInMB >= 1) score += 7
  else if (sizeInMB >= 0.5) score += 5
  else score += Math.min(sizeInMB * 10, 3)
  
  // 6. ORIGINALITY BONUS (10 points max)
  if (!repo.fork) {
    score += 10  // Original work
  } else {
    // Fork with substantial changes (OSS contribution indicator)
    if (estimatedCommits >= 10) score += 7  // Active fork = OSS contribution
    else score += 3  // Minor fork activity
  }
  
  // 7. COMMUNITY IMPACT (10 points max) - Weighted low since most have 0-2 stars
  const communityScore = (repo.stargazers_count * 2) + (repo.forks_count * 1)
  if (communityScore >= 20) score += 10
  else if (communityScore >= 10) score += 8
  else if (communityScore >= 5) score += 6
  else if (communityScore >= 2) score += 4
  else if (communityScore >= 1) score += 2
  // 0 stars/forks = 0 points (doesn't hurt score)
  
  // 8. ACTIVITY CONSISTENCY BONUS (10 points max)
  // Reward projects with sustained work over time
  if (maturityMonths >= 6) {
    const avgCommitsPerMonth = estimatedCommits / maturityMonths
    if (avgCommitsPerMonth >= 10) score += 10      // Very active
    else if (avgCommitsPerMonth >= 5) score += 7   // Active
    else if (avgCommitsPerMonth >= 2) score += 5   // Regular
    else score += 3                                // Sporadic
  }
  
  // Normalize to 0-100 scale
  return Math.round(Math.min(score, 100))
}

/**
 * Categorize repository based on its characteristics
 */
function categorizeRepository(repo: any, workScore: number): string {
  const now = new Date()
  const createdDate = new Date(repo.created_at)
  const lastUpdate = new Date(repo.updated_at)
  const daysSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24)
  const daysActive = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
  const maturityMonths = daysActive / 30
  const actualCommits = repo.userCommits || 0
  const estimatedCommits = actualCommits > 0 ? actualCommits : Math.max(1, Math.floor(repo.size / 50))
  
  // OSS Contribution (forked repo with USER's commits)
  if (repo.fork && actualCommits >= 10) {
    return 'oss'
  }
  
  // Professional (high quality, mature, maintained)
  if (workScore >= 70 && maturityMonths >= 6 && repo.hasReadme) {
    return 'professional'
  }
  
  // Active (recent work, ongoing)
  if (daysSinceUpdate < 30 && workScore >= 50) {
    return 'active'
  }
  
  // Learning (smaller, newer, or exploratory)
  if (maturityMonths < 3 || estimatedCommits < 10 || repo.size < 100) {
    return 'learning'
  }
  
  // Default: notable
  return 'notable'
}

/**
 * Intelligent Project Selection Algorithm
 * 
 * Strategy:
 * 1. If user has repos with 10+ stars → Show top starred repos
 * 2. If user has OSS contributions (forks with commits) → Prioritize those
 * 3. Otherwise → Show by Work Score (commit depth, maturity, quality)
 * 
 * This ensures meaningful projects are shown for ALL developers, regardless of star count.
 */
function selectTopProjects(repos: any[], totalStars: number): any[] {
  if (repos.length === 0) return []
  
  // Calculate work scores and categorize all repos
  const scoredRepos = repos
    .filter(r => r.size > 0 && !r.archived) // Only non-empty, non-archived
    .map(r => {
      const workScore = calculateWorkScore(r)
      const category = categorizeRepository(r, workScore)
      return { ...r, workScore, category }
    })
  
  // CRITICAL: Filter out forks AND repos you don't own
  // Only show: YOUR original repos OR significant OSS contributions (10+ commits)
  const meaningfulRepos = scoredRepos.filter(r => {
    // Filter 1: Exclude forks unless significant contribution
    if (r.fork) {
      const hasSignificantContribution = (r.userCommits || 0) >= 10
      if (!hasSignificantContribution) {
        console.log(`🚫 Filtered fork: ${r.name} (${r.userCommits || 0} commits)`)
        return false
      }
      console.log(`✅ Kept OSS contribution: ${r.name} (${r.userCommits} commits)`)
      return true
    }
    
    // Filter 2: Exclude repos you don't own (like Cognitium where you're just a contributor)
    if (!r.isOwner) {
      console.log(`🚫 Filtered non-owned repo: ${r.name} (not owner)`)
      return false
    }
    
    // Include: Original repos that you own
    return true
  })
  
  // STRATEGY 1: If any repo has 10+ stars, show starred repos
  const highStarRepos = meaningfulRepos.filter(r => r.stargazers_count >= 10)
  if (highStarRepos.length > 0) {
    return highStarRepos
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, 3)
  }
  
  // STRATEGY 2: If any OSS contributions (forks with 10+ commits), prioritize them
  const ossContributions = meaningfulRepos.filter(r => r.category === 'oss')
  const nonOSSRepos = meaningfulRepos.filter(r => r.category !== 'oss')
  
  if (ossContributions.length > 0) {
    // Sort OSS by work score
    const topOSS = ossContributions.sort((a, b) => b.workScore - a.workScore)
    
    // If we have 3+ OSS contributions, show top 3
    if (topOSS.length >= 3) {
      return topOSS.slice(0, 3)
    }
    
    // Otherwise, mix OSS + best original work
    const topOriginal = nonOSSRepos
      .filter(r => !r.fork) // Original repos only
      .sort((a, b) => b.workScore - a.workScore)
    
    return [...topOSS, ...topOriginal].slice(0, 3)
  }
  
  // STRATEGY 3: Show by Work Score (for 99% of users with 0-2 stars)
  // Only original work (forks already filtered above)
  const originalRepos = meaningfulRepos.filter(r => !r.fork)
  
  // Return top 3 original repos by work score
  return originalRepos
    .sort((a, b) => b.workScore - a.workScore)
    .slice(0, 3)
}

/**
 * Analyze project distribution for better insights
 */
function analyzeProjectDistribution(repos: any[]): {
  professional: number
  active: number
  oss: number
  learning: number
  topByCategory: Record<string, any[]>
} {
  const scoredRepos = repos
    .filter(r => r.size > 0 && !r.archived)
    .map(r => {
      const workScore = calculateWorkScore(r)
      const category = categorizeRepository(r, workScore)
      return { ...r, workScore, category }
    })
  
  const categoryCounts = {
    professional: scoredRepos.filter(r => r.category === 'professional').length,
    active: scoredRepos.filter(r => r.category === 'active').length,
    oss: scoredRepos.filter(r => r.category === 'oss').length,
    learning: scoredRepos.filter(r => r.category === 'learning').length
  }
  
  const topByCategory: Record<string, any[]> = {
    professional: scoredRepos.filter(r => r.category === 'professional').sort((a, b) => b.workScore - a.workScore).slice(0, 2),
    active: scoredRepos.filter(r => r.category === 'active').sort((a, b) => b.workScore - a.workScore).slice(0, 2),
    oss: scoredRepos.filter(r => r.category === 'oss').sort((a, b) => b.workScore - a.workScore).slice(0, 2),
    learning: [] // Don't showcase learning projects
  }
  
  return {
    ...categoryCounts,
    topByCategory
  }
}

async function getRecentActivityGraph(
  octokit: any,
  username: string,
  days: number = 90
): Promise<GitHubActivity[]> {
  try {
    // Fetch user's public events (last 90 days of activity)
    const { data: events } = await octokit.activity.listPublicEventsForUser({
      username: username,
      per_page: 100
    })

    // Count commits per day
    const activityMap: Record<string, number> = {}
    const today = new Date()

    for (let i = 0; i < days; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      activityMap[dateStr] = 0
    }

    // Filter for PushEvents and count
    events.forEach((event: any) => {
      if (event.type === 'PushEvent') {
        const dateStr = event.created_at.split('T')[0]
        if (activityMap.hasOwnProperty(dateStr)) {
          // Each push can have multiple commits
          const commitCount = event.payload.size || 1
          activityMap[dateStr] += commitCount
        }
      }
    })

    // Convert to array and sort
    return Object.entries(activityMap)
      .map(([date, commits]) => ({ date, commits }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  } catch (error) {
    console.error('Error fetching activity graph:', error)
    return []
  }
}

export async function analyzeGitHubWithAI(
  username: string,
  profileData: any,
  repos: any[],
  octokit?: any
): Promise<GitHubAnalysis> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" })

  // Calculate language statistics
  const languageStats: Record<string, number> = {}
  repos.forEach(repo => {
    if (repo.languages) {
      Object.entries(repo.languages).forEach(([lang, bytes]: [string, any]) => {
        languageStats[lang] = (languageStats[lang] || 0) + bytes
      })
    }
  })

  // Sort languages by bytes
  const sortedLanguages = Object.entries(languageStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)

  // Calculate totals - ONLY for repos YOU OWN (exclude forks AND repos you don't own)
  const originalRepos = repos.filter(r => !r.fork && r.isOwner)
  const totalStars = originalRepos.reduce((sum, r) => sum + r.stargazers_count, 0)
  const totalCodeSize = originalRepos.reduce((sum, r) => sum + r.size, 0)
  const codeVolumeStr = totalCodeSize > 1024 ? `${(totalCodeSize / 1024).toFixed(1)}MB` : `${totalCodeSize}KB`
  
  // Calculate ACTUAL user commits (not repo-wide)
  const totalUserCommits = originalRepos.reduce((sum, r) => sum + (r.userCommits || 0), 0)
  
  // Debug logging
  console.log(`📊 GitHub Analysis Summary:`)
  console.log(`   Total repos fetched: ${repos.length}`)
  console.log(`   Original repos: ${originalRepos.length}`)
  console.log(`   Forked repos: ${repos.filter(r => r.fork).length}`)
  console.log(`   Total user commits (original repos): ${totalUserCommits}`)
  console.log(`   Code volume: ${codeVolumeStr}`)

  // Get recent activity graph
  let recentActivityGraph: GitHubActivity[] = []
  if (octokit) {
    recentActivityGraph = await getRecentActivityGraph(octokit, username, 90)
  }

  // Get repos with activity - ONLY originals
  const activeRepos = originalRepos
    .filter(repo => repo.size > 0)
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 20)

  // Smart project selection
  const topProjects = selectTopProjects(repos, totalStars)
  
  // Debug: Log selected projects
  console.log(`\n🏆 Top Projects Selected:`)
  topProjects.forEach((p, idx) => {
    console.log(`   ${idx + 1}. ${p.name} (${p.fork ? 'FORK' : 'ORIGINAL'}) - ${p.userCommits || 0} commits`)
  })

  // Analyze project distribution
  const distribution = analyzeProjectDistribution(repos)
  const totalEstimatedCommits = topProjects.reduce((sum, r) => sum + (r.userCommits || Math.max(1, Math.floor(r.size / 50))), 0)

  const prompt = `Analyze this software developer's GitHub profile based on REAL WORK & COMMITMENT:

**Profile Overview:**
- Username: ${username}
- Total Repositories: ${repos.length}
- Code Volume: ${codeVolumeStr}
- Estimated Total Commits: ${totalEstimatedCommits}+
- Bio: ${profileData.bio || 'Not provided'}

**Project Distribution:**
- Professional Projects: ${distribution.professional} (mature, well-maintained)
- Active Projects: ${distribution.active} (updated in last 30 days)
- OSS Contributions: ${distribution.oss} (forks with commits)
- Learning Projects: ${distribution.learning}

**Primary Languages (by code volume):**
${sortedLanguages.map(([lang, bytes]) => `- ${lang}: ${Math.round(bytes / 1024)}KB of code`).join('\n')}

**Top Projects (selected by intelligent algorithm prioritizing real work):**
${topProjects.slice(0, 5).map((r, idx) => {
    const created = new Date(r.created_at)
    const updated = new Date(r.updated_at)
    const daysActive = Math.floor((updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
    const estimatedCommits = Math.max(1, Math.floor(r.size / 50))
    const daysSinceUpdate = Math.floor((Date.now() - updated.getTime()) / (1000 * 60 * 60 * 24))
    
    return `${idx + 1}. ${r.name} [Work Score: ${r.workScore}/100, Category: ${r.category}]
   - Description: ${r.description || 'No description'}
   - Tech: ${r.language || 'Multiple languages'}
   - Activity: ${estimatedCommits}+ commits over ${daysActive} days
   - Last Update: ${daysSinceUpdate} days ago
   - Stars: ${r.stargazers_count} | Forks: ${r.forks_count}
   - Has README: ${r.hasReadme ? 'Yes' : 'No'}
   - Type: ${r.fork ? 'Fork (OSS contribution)' : 'Original work'}`
  }).join('\n\n')}

**Analysis Task:**
You're evaluating this developer for REAL WORK, not vanity metrics. Focus on:
1. Commit consistency & project sustainability (NOT star count)
2. Code volume & technical depth
3. OSS contributions (forks with commits = collaboration)
4. Project maturity (sustained work over months)
5. Recent activity (ongoing learning)

**Return JSON (no markdown, pure JSON only):**
{
  "skills": ["TechStack", ...],
  "proficiency_scores": {"TechStack": 7, ...},
  "notable_projects": [
    {
      "name": "exact-repo-name-from-above",
      "description": "What makes this project demonstrate real skill",
      "quality_score": 75,
      "category": "professional|active|oss|notable",
      "why_notable": "Specific reason: sustained commits, complexity, OSS impact, etc."
    }
  ],
  "overall_assessment": "2-3 sentences on technical depth, work ethic, and engineering practices",
  "recommendation": "1 actionable career advice sentence"
}

**Critical Guidelines:**
- IGNORE star counts completely for scoring (99% have 0-2 stars)
- PRIORITIZE: commit frequency, project longevity, code volume, OSS contributions
- Quality score based on: sustained work (50%), code complexity (20%), documentation (15%), recency (15%)
- For projects with 50+ commits over 6+ months → Quality score 70+
- For active OSS contributions → Quality score 65+
- Be encouraging but honest - focus on growth potential`

  try {
    const result = await model.generateContent(prompt)
    const responseText = result.response.text()

    // Clean up the response - remove markdown code blocks if present
    let cleanedText = responseText.trim()
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '')
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/```\n?/g, '')
    }

    const analysis = JSON.parse(cleanedText)

    // Build the final analysis object
    const gitHubAnalysis: GitHubAnalysis = {
      username,
      profileUrl: profileData.html_url,
      avatarUrl: profileData.avatar_url,
      bio: profileData.bio,
      totalRepos: originalRepos.length, // Only original repos
      totalStars,
      totalCommits: totalUserCommits || totalEstimatedCommits, // Use actual user commits
      activeRepos: originalRepos.filter(r => {
        const lastUpdate = new Date(r.updated_at)
        const daysSince = (new Date().getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24)
        return daysSince < 90
      }).length,
      codeVolume: codeVolumeStr,
      recentActivityGraph,
      languages: Object.fromEntries(sortedLanguages),
      skills: analysis.skills || [],
      proficiencyScores: analysis.proficiency_scores || {},
      notableProjects: (analysis.notable_projects || []).map((proj: any) => {
        const repoData = repos.find(r => r.name === proj.name)
        return {
          name: proj.name,
          description: proj.description || proj.why_notable || '',
          quality_score: proj.quality_score || 50,
          url: repoData?.html_url || `https://github.com/${username}/${proj.name}`,
          stars: repoData?.stargazers_count || 0,
          language: repoData?.language || null,
          commits: repoData?.userCommits || 0, // ONLY user commits, no estimation fallback
          daysActive: repoData ? Math.floor((new Date(repoData.updated_at).getTime() - new Date(repoData.created_at).getTime()) / (1000 * 60 * 60 * 24)) : 0,
          category: proj.category || 'notable'
        }
      }),
      overallAssessment: analysis.overall_assessment || '',
      recommendation: analysis.recommendation || '',
      analysisDate: new Date().toISOString()
    }

    return gitHubAnalysis
  } catch (error) {
    console.error('Error analyzing with AI:', error)

    // Fallback: Basic analysis without AI
    return {
      username,
      profileUrl: profileData.html_url,
      avatarUrl: profileData.avatar_url,
      bio: profileData.bio,
      totalRepos: originalRepos.length, // Only original repos
      totalStars,
      totalCommits: totalUserCommits || totalEstimatedCommits,
      activeRepos: originalRepos.filter(r => {
        const lastUpdate = new Date(r.updated_at)
        const daysSince = (new Date().getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24)
        return daysSince < 90
      }).length,
      codeVolume: codeVolumeStr,
      recentActivityGraph,
      languages: Object.fromEntries(sortedLanguages),
      skills: sortedLanguages.map(([lang]) => lang),
      proficiencyScores: Object.fromEntries(
        sortedLanguages.map(([lang], idx) => [lang, Math.max(5, 10 - idx)])
      ),
      notableProjects: topProjects.slice(0, 3).map(repo => ({
        name: repo.name,
        description: repo.description || 'Notable project',
        quality_score: Math.min(100, Math.max(50, repo.workScore + 20)),
        url: repo.html_url,
        stars: repo.stargazers_count,
        language: repo.language,
        commits: repo.userCommits || 0, // ONLY user commits, no estimation fallback
        daysActive: Math.floor((new Date(repo.updated_at).getTime() - new Date(repo.created_at).getTime()) / (1000 * 60 * 60 * 24))
      })),
      overallAssessment: `Developer with ${originalRepos.length} original repositories and ${codeVolumeStr} of code, primarily using ${sortedLanguages[0]?.[0] || 'various languages'}.`,
      recommendation: 'Focus on consistent project updates and consider contributing to open source.',
      analysisDate: new Date().toISOString()
    }
  }
}

export async function getGitHubAccessToken(userId: string): Promise<string | null> {
  // This will be called from the API route with Supabase admin client
  // to fetch the provider token from auth.identities
  return null // Placeholder - will be handled in API route
}
