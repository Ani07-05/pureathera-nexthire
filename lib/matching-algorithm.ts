import { createClient } from '@/lib/supabase/server'

export interface CandidateMatch {
  candidateId: string
  candidateName: string
  candidateEmail: string
  matchScore: number
  reasoning: string
  skills: string[]
  matchingSkills: string[]
  missingSkills: string[]
  interviewLevel: 'L1' | 'L2' | 'L3' | null
  interviewScore: number | null
  githubAnalyzed: boolean
  experienceYears: number | null
  targetRole: string | null
}

export interface JobPosting {
  id: string
  title: string
  required_skills: string[]
  experience_level: 'entry' | 'mid' | 'senior'
  description: string | null
}

/**
 * Calculate match score between a candidate and job posting
 *
 * Scoring breakdown:
 * - Skill overlap: 40 points (critical factor)
 * - Interview performance: 30 points
 * - Experience match: 20 points
 * - GitHub verification: 10 points (bonus for having analyzed data)
 */
export function calculateMatchScore(
  candidate: any,
  job: JobPosting
): { score: number; reasoning: string } {
  let score = 0
  const reasons: string[] = []

  // 1. Skill Overlap (40 points max)
  const candidateSkills = candidate.skills || []
  const requiredSkills = job.required_skills || []

  const matchingSkills = candidateSkills.filter((skill: string) =>
    requiredSkills.some((req: string) =>
      skill.toLowerCase() === req.toLowerCase()
    )
  )

  const skillMatchPercentage = requiredSkills.length > 0
    ? (matchingSkills.length / requiredSkills.length) * 100
    : 0

  const skillPoints = Math.round((skillMatchPercentage / 100) * 40)
  score += skillPoints

  if (skillMatchPercentage >= 80) {
    reasons.push(`Excellent skill match (${matchingSkills.length}/${requiredSkills.length} required skills)`)
  } else if (skillMatchPercentage >= 50) {
    reasons.push(`Good skill match (${matchingSkills.length}/${requiredSkills.length} required skills)`)
  } else if (skillMatchPercentage > 0) {
    reasons.push(`Partial skill match (${matchingSkills.length}/${requiredSkills.length} required skills)`)
  } else {
    reasons.push('Limited skill overlap with requirements')
  }

  // 2. Interview Performance (30 points max)
  if (candidate.highest_level && candidate.avg_score) {
    const levelMap = { 'L1': 0.6, 'L2': 0.8, 'L3': 1.0 }
    const levelMultiplier = levelMap[candidate.highest_level as keyof typeof levelMap] || 0.5

    const interviewPoints = Math.round((candidate.avg_score / 100) * 30 * levelMultiplier)
    score += interviewPoints

    reasons.push(`${candidate.highest_level} interview performance: ${Math.round(candidate.avg_score)}%`)
  } else {
    reasons.push('No interview assessment available')
  }

  // 3. Experience Match (20 points max)
  const experienceYears = candidate.experience_years || 0
  const experienceMap = {
    'entry': { min: 0, max: 2, ideal: 1 },
    'mid': { min: 2, max: 5, ideal: 3.5 },
    'senior': { min: 5, max: 50, ideal: 7 }
  }

  const expReq = experienceMap[job.experience_level]
  let experiencePoints = 0

  if (experienceYears >= expReq.min && experienceYears <= expReq.max) {
    // Perfect match
    experiencePoints = 20
    reasons.push(`Experience level matches perfectly (${experienceYears} years)`)
  } else if (experienceYears > expReq.max) {
    // Overqualified but still valuable
    experiencePoints = 15
    reasons.push(`Highly experienced (${experienceYears} years, may be overqualified)`)
  } else if (experienceYears === expReq.min - 1) {
    // Close match
    experiencePoints = 12
    reasons.push(`Close experience match (${experienceYears} years)`)
  } else {
    // Under-qualified
    experiencePoints = 5
    reasons.push(`Limited experience for role (${experienceYears} years)`)
  }

  score += experiencePoints

  // 4. GitHub Verification Bonus (10 points max)
  if (candidate.github_data) {
    score += 10
    reasons.push('GitHub portfolio verified by AI')
  }

  const reasoning = reasons.join('. ') + '.'

  return { score: Math.min(100, score), reasoning }
}

/**
 * Find and rank candidates for a job posting
 */
export async function findMatchingCandidates(
  jobPostingId: string,
  limit: number = 20
): Promise<CandidateMatch[]> {
  const supabase = await createClient()

  // Fetch job posting
  const { data: job, error: jobError } = await supabase
    .from('job_postings')
    .select('*')
    .eq('id', jobPostingId)
    .single()

  if (jobError || !job) {
    throw new Error('Job posting not found')
  }

  // Fetch all candidates with their data
  const { data: candidates, error: candidatesError } = await supabase
    .from('candidate_details')
    .select('*')

  if (candidatesError) {
    throw new Error('Failed to fetch candidates')
  }

  if (!candidates || candidates.length === 0) {
    return []
  }

  // Calculate match scores for all candidates
  const matches: CandidateMatch[] = candidates.map((candidate) => {
    const { score, reasoning } = calculateMatchScore(candidate, job)

    const candidateSkills = candidate.skills || []
    const requiredSkills = job.required_skills || []

    const matchingSkills = candidateSkills.filter((skill: string) =>
      requiredSkills.some((req: string) =>
        skill.toLowerCase() === req.toLowerCase()
      )
    )

    const missingSkills = requiredSkills.filter((req: string) =>
      !candidateSkills.some((skill: string) =>
        skill.toLowerCase() === req.toLowerCase()
      )
    )

    return {
      candidateId: candidate.id,
      candidateName: candidate.full_name || 'Anonymous',
      candidateEmail: candidate.email,
      matchScore: score,
      reasoning,
      skills: candidateSkills,
      matchingSkills,
      missingSkills,
      interviewLevel: candidate.highest_level || null,
      interviewScore: candidate.avg_score ? Math.round(candidate.avg_score) : null,
      githubAnalyzed: !!candidate.github_data,
      experienceYears: candidate.experience_years || null,
      targetRole: candidate.target_role || null
    }
  })

  // Sort by match score descending
  matches.sort((a, b) => b.matchScore - a.matchScore)

  return matches.slice(0, limit)
}

/**
 * Cache matches in the database for faster retrieval
 */
export async function cacheMatches(
  jobPostingId: string,
  matches: CandidateMatch[]
): Promise<void> {
  const supabase = await createClient()

  // Delete old matches
  await supabase
    .from('candidate_matches')
    .delete()
    .eq('job_posting_id', jobPostingId)

  // Insert new matches
  const matchRecords = matches.map(match => ({
    job_posting_id: jobPostingId,
    candidate_id: match.candidateId,
    match_score: match.matchScore,
    reasoning: match.reasoning
  }))

  if (matchRecords.length > 0) {
    await supabase
      .from('candidate_matches')
      .insert(matchRecords)
  }
}
