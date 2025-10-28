import { GoogleGenerativeAI } from '@google/generative-ai'
import { UserProfile, CareerRecommendation, AlternativeCareer } from '../types'
import { config } from '../config'
import { cacheService } from './cacheService'
import { loadingService } from './loadingService'

// Enhanced Gemini AI Configuration Interface (Requirements 5.1, 5.2)
interface GeminiConfig {
  apiKey: string
  model: string
  cacheEnabled: boolean
  maxTokens: number
  timeout: number
  retryAttempts: number
  retryDelay: number
}

// Roadmap Request Interface (Requirements 5.1, 5.2, 5.3)
interface RoadmapRequest {
  domain: string
  jobRole: string
  experienceLevel: 'entry' | 'junior' | 'mid' | 'senior' | 'expert'
  skills: string[]
  educationLevel: string
  age?: number
  name?: string
}

// Enhanced cache configuration for AI responses (Requirements 10.1, 10.2)
interface GeminiCacheConfig {
  enabled: boolean
  ttl: number
  maxSize: number
  compressionEnabled: boolean
}

// Enhanced Gemini AI Configuration
const geminiConfig: GeminiConfig = {
  apiKey: config.geminiApiKey,
  model: 'gemini-1.5-flash',
  cacheEnabled: true,
  maxTokens: 8192,
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
}

// Initialize Gemini AI with error handling
let genAI: GoogleGenerativeAI | null = null
let model: any = null

try {
  if (geminiConfig.apiKey) {
    genAI = new GoogleGenerativeAI(geminiConfig.apiKey)
    model = genAI.getGenerativeModel({
      model: geminiConfig.model,
      generationConfig: {
        maxOutputTokens: geminiConfig.maxTokens,
      },
    })
  }
} catch (error) {
  console.error('Failed to initialize Gemini AI:', error)
}

/**
 * Enhanced Gemini AI Integration Service
 * Implements requirements 5.1, 5.2, 5.3, 5.4, 10.1, 10.2, 10.3, 10.4
 */
export class GeminiService {
  private static cacheConfig: GeminiCacheConfig = {
    enabled: true,
    ttl: 24 * 60 * 60 * 1000, // 24 hours
    maxSize: 100, // Max cached responses
    compressionEnabled: true
  }

  /**
   * Generate cache key for requests (Requirements 10.1, 10.2)
   */
  private static generateCacheKey(request: RoadmapRequest): string {
    const keyData = {
      domain: request.domain,
      jobRole: request.jobRole,
      experienceLevel: request.experienceLevel,
      skills: request.skills.sort().join(','),
      educationLevel: request.educationLevel,
    }
    return `gemini_roadmap_${btoa(JSON.stringify(keyData)).replace(/[^a-zA-Z0-9]/g, '')}`
  }

  /**
   * Enhanced caching with multi-layer cache service (Requirements 10.1, 10.2)
   */
  private static async getCachedResponse<T>(cacheKey: string): Promise<T | null> {
    if (!this.cacheConfig.enabled) return null

    try {
      const cached = await cacheService.get<T>(cacheKey)
      if (cached) {
        console.log('🎯 Cache hit for Gemini AI request')
        return cached
      }
      return null
    } catch (error) {
      console.error('Cache retrieval error:', error)
      return null
    }
  }

  /**
   * Enhanced caching with compression and TTL (Requirements 10.1, 10.2)
   */
  private static async setCachedResponse<T>(cacheKey: string, data: T): Promise<void> {
    if (!this.cacheConfig.enabled) return

    try {
      await cacheService.set(cacheKey, data, this.cacheConfig.ttl)
      console.log('💾 Cached Gemini AI response with enhanced caching')
    } catch (error) {
      console.error('Cache storage error:', error)
    }
  }

  /**
   * Retry mechanism with exponential backoff (Requirements 10.3, 10.4)
   */
  private static async withRetry<T>(
    operation: () => Promise<T>,
    context: string
  ): Promise<T> {
    let lastError: Error | null = null

    for (let attempt = 1; attempt <= geminiConfig.retryAttempts; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error as Error
        console.warn(`Gemini AI ${context} attempt ${attempt} failed:`, error)

        if (attempt < geminiConfig.retryAttempts) {
          const delay = geminiConfig.retryDelay * Math.pow(2, attempt - 1)
          console.log(`Retrying in ${delay}ms...`)
          await new Promise((resolve) => setTimeout(resolve, delay))
        }
      }
    }

    throw lastError
  }

  /**
   * Validate API configuration (Requirements 5.1, 10.4)
   */
  private static validateConfiguration(): void {
    if (!geminiConfig.apiKey) {
      throw new Error(
        'Gemini API key not configured. Please set VITE_GEMINI_API_KEY environment variable.'
      )
    }

    if (!genAI || !model) {
      throw new Error('Gemini AI client not properly initialized.')
    }
  }

  /**
   * Generate personalized career roadmap based on domain and experience (Requirements 5.1, 5.2, 5.3, 5.4)
   */
  static async generateCareerRoadmap(
    request: RoadmapRequest
  ): Promise<CareerRecommendation> {
    const operationId = `gemini_roadmap_${request.jobRole}_${request.experienceLevel}`
    
    try {
      this.validateConfiguration()

      // Set loading state
      loadingService.setLoading(operationId, true, {
        message: 'Generating personalized career roadmap...',
        stage: 'initialization',
        progress: 10
      })

      // Check cache first with enhanced caching
      const cacheKey = this.generateCacheKey(request)
      const cachedResult = await this.getCachedResponse<CareerRecommendation>(cacheKey)
      if (cachedResult) {
        loadingService.setLoading(operationId, false, {
          progress: 100,
          message: 'Roadmap loaded from cache'
        })
        return cachedResult
      }

      loadingService.updateProgress(operationId, 30, 'Preparing AI request...', 'preparation')

      console.log('🚀 Generating career roadmap with Gemini AI:', {
        domain: request.domain,
        jobRole: request.jobRole,
        experienceLevel: request.experienceLevel,
      })

      loadingService.updateProgress(operationId, 50, 'Generating roadmap with AI...', 'generation')

      const roadmap = await this.withRetry(async () => {
        const prompt = this.buildRoadmapPrompt(request)

        const result = await Promise.race([
          model.generateContent(prompt),
          new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error('Request timeout')),
              geminiConfig.timeout
            )
          ),
        ])

        const response = await result.response
        const text = response.text()

        loadingService.updateProgress(operationId, 80, 'Processing AI response...', 'processing')

        return this.parseRoadmapResponse(text, request)
      }, 'roadmap generation')

      loadingService.updateProgress(operationId, 90, 'Caching results...', 'caching')

      // Cache the result with enhanced caching
      await this.setCachedResponse(cacheKey, roadmap)

      loadingService.setLoading(operationId, false, {
        progress: 100,
        message: 'Career roadmap generated successfully',
        stage: 'complete'
      })

      return roadmap
    } catch (error) {
      console.error('Error generating career roadmap:', error)
      loadingService.setError(operationId, `Failed to generate roadmap: ${(error as Error).message}`)
      return this.getFallbackRoadmap(request)
    }
  }

  /**
   * Build comprehensive roadmap prompt based on domain and experience (Requirements 5.2, 5.3)
   */
  private static buildRoadmapPrompt(request: RoadmapRequest): string {
    return `
You are an expert career advisor specializing in personalized career roadmaps. Generate a comprehensive career roadmap based on the following profile:

**User Profile:**
- Domain: ${request.domain}
- Target Role: ${request.jobRole}
- Experience Level: ${request.experienceLevel}
- Current Skills: ${request.skills.join(', ')}
- Education Level: ${request.educationLevel}
${request.name ? `- Name: ${request.name}` : ''}
${request.age ? `- Age: ${request.age}` : ''}

**Experience Level Guidelines:**
- Entry: 0-1 years (new graduates, career changers)
- Junior: 1-3 years (some experience, building skills)
- Mid: 3-7 years (established skills, taking on more responsibility)
- Senior: 7-15 years (leadership roles, mentoring others)
- Expert: 15+ years (industry thought leader, strategic roles)

**Domain-Specific Requirements:**
Focus on the ${
      request.domain
    } domain and provide roadmap elements specific to this field. Include:
- Industry-standard tools and technologies
- Relevant certifications and credentials
- Professional development opportunities
- Networking and community involvement
- Career progression paths within the domain

**Output Format:**
Provide a detailed JSON response with the following structure:

{
  "primaryCareer": "${request.jobRole}",
  "relatedRoles": ["Role 1", "Role 2", "Role 3", "Role 4"],
  "summary": "Personalized summary explaining why this career path fits the user's profile and experience level",
  "careerPath": {
    "nodes": [
      {
        "id": "1",
        "type": "course|internship|job|company|skill|certification",
        "title": "Specific title relevant to ${request.experienceLevel} level",
        "description": "Detailed description",
        "duration": "Time estimate",
        "difficulty": "beginner|intermediate|advanced",
        "salary": "Salary range (for job nodes)",
        "requirements": ["Requirement 1", "Requirement 2"],
        "position": {"x": 100, "y": 100}
      }
    ],
    "edges": [
      {
        "id": "e1-2",
        "source": "1",
        "target": "2",
        "sourceHandle": "bottom",
        "targetHandle": "top",
        "type": "smoothstep",
        "animated": true
      }
    ]
  },
  "alternatives": [
    {
      "id": "alt1",
      "title": "Alternative Career Title",
      "description": "Why this alternative fits the user's profile",
      "matchScore": 85,
      "salary": "$XX,XXX-$XX,XXX",
      "requirements": ["Skill 1", "Skill 2", "Skill 3"],
      "growth": "high|medium|low"
    }
  ]
}

**Important Guidelines:**
1. Tailor recommendations to the ${request.experienceLevel} experience level
2. Include 6-10 nodes in the career path with realistic progression
3. Position nodes appropriately (x: 100-1200, y: 100-500)
4. Provide 3 relevant alternative careers
5. Focus on ${request.domain} domain-specific opportunities
6. Include realistic salary ranges based on experience level and location
7. Ensure all edges have proper sourceHandle and targetHandle properties
8. Make recommendations actionable and specific to the user's current situation

Generate a roadmap that helps the user progress from their current ${
      request.experienceLevel
    } level to the next stage in their career within the ${
      request.domain
    } domain.
    `
  }

  /**
   * Parse and validate roadmap response (Requirements 5.4, 10.4)
   */
  private static parseRoadmapResponse(
    text: string,
    request: RoadmapRequest
  ): CareerRecommendation {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No valid JSON found in Gemini response')
      }

      const roadmapData = JSON.parse(jsonMatch[0])

      // Validate required fields
      if (
        !roadmapData.primaryCareer ||
        !roadmapData.careerPath ||
        !roadmapData.alternatives
      ) {
        throw new Error('Invalid roadmap structure from Gemini AI')
      }

      // Transform to match CareerRecommendation interface
      return this.transformToCareerRecommendation(roadmapData, request)
    } catch (error) {
      console.error('Error parsing Gemini roadmap response:', error)
      throw new Error('Failed to parse AI-generated roadmap')
    }
  }

  /**
   * Transform Gemini response to CareerRecommendation format (Requirements 5.4)
   */
  private static transformToCareerRecommendation(
    roadmapData: any,
    request: RoadmapRequest
  ): CareerRecommendation {
    return {
      id: `gemini_roadmap_${Date.now()}`,
      title: roadmapData.primaryCareer,
      description:
        roadmapData.summary ||
        `Personalized career roadmap for ${request.jobRole} in ${request.domain}`,
      fitScore: this.calculateFitScore(request),
      salaryRange: this.extractSalaryRange(roadmapData),
      growthProspects: this.determineGrowthProspects(request.domain),
      requiredSkills: this.extractRequiredSkills(roadmapData),
      recommendedPath: this.buildLearningPath(roadmapData, request),
      jobMarketData: this.generateJobMarketData(request),
      primaryCareer: roadmapData.primaryCareer,
      relatedRoles: roadmapData.relatedRoles || [],
      careerPath: roadmapData.careerPath,
      alternatives: roadmapData.alternatives || [],
      summary:
        roadmapData.summary ||
        `AI-generated career roadmap for ${request.experienceLevel} level ${request.jobRole}`,
    }
  }

  /**
   * Generate fallback roadmap when AI fails (Requirements 10.3, 10.4)
   */
  private static getFallbackRoadmap(
    request: RoadmapRequest
  ): CareerRecommendation {
    console.log('🔄 Using fallback roadmap generation')

    const fallbackRoadmaps = this.getFallbackRoadmapsByDomain()
    const domainRoadmap =
      fallbackRoadmaps[request.domain.toLowerCase()] || fallbackRoadmaps.default

    return {
      id: `fallback_roadmap_${Date.now()}`,
      title: request.jobRole,
      description: `Fallback career roadmap for ${request.jobRole} in ${request.domain} (${request.experienceLevel} level)`,
      fitScore: 75,
      salaryRange: this.getDefaultSalaryRange(request.experienceLevel),
      growthProspects: 'medium' as const,
      requiredSkills: this.getDefaultSkills(request.domain),
      recommendedPath: this.buildFallbackLearningPath(request),
      jobMarketData: this.getDefaultJobMarketData(),
      primaryCareer: request.jobRole,
      relatedRoles: domainRoadmap.relatedRoles,
      careerPath: domainRoadmap.careerPath,
      alternatives: domainRoadmap.alternatives,
      summary: `This is a fallback roadmap for ${request.jobRole}. For personalized recommendations, please ensure your internet connection is stable and try again.`,
    }
  }
  /**
   * Helper method to calculate fit score based on user profile (Requirements 5.3)
   */
  private static calculateFitScore(request: RoadmapRequest): number {
    let score = 70 // Base score

    // Adjust based on experience level
    const experienceBonus = {
      entry: 5,
      junior: 10,
      mid: 15,
      senior: 20,
      expert: 25,
    }
    score += experienceBonus[request.experienceLevel] || 0

    // Adjust based on skills count
    if (request.skills.length > 5) score += 10
    else if (request.skills.length > 2) score += 5

    return Math.min(score, 95) // Cap at 95
  }

  /**
   * Extract salary range from roadmap data (Requirements 5.4)
   */
  private static extractSalaryRange(roadmapData: any): any {
    // Try to extract from job nodes or use defaults
    const jobNodes =
      roadmapData.careerPath?.nodes?.filter(
        (node: any) => node.type === 'job'
      ) || []
    if (jobNodes.length > 0 && jobNodes[0].salary) {
      const salaryMatch = jobNodes[0].salary.match(/\$(\d+)k?-\$?(\d+)k?/)
      if (salaryMatch) {
        return {
          min:
            parseInt(salaryMatch[1]) * (salaryMatch[1].length <= 2 ? 1000 : 1),
          max:
            parseInt(salaryMatch[2]) * (salaryMatch[2].length <= 2 ? 1000 : 1),
          currency: 'USD',
          period: 'yearly',
        }
      }
    }

    return {
      min: 50000,
      max: 90000,
      currency: 'USD',
      period: 'yearly',
    }
  }

  /**
   * Determine growth prospects based on domain (Requirements 5.3)
   */
  private static determineGrowthProspects(
    domain: string
  ): 'high' | 'medium' | 'low' {
    const highGrowthDomains = [
      'technology',
      'computer science',
      'ai',
      'machine learning',
      'data science',
      'cybersecurity',
      'cloud computing',
      'blockchain',
    ]

    return highGrowthDomains.some((d) => domain.toLowerCase().includes(d))
      ? 'high'
      : 'medium'
  }

  /**
   * Extract required skills from roadmap data (Requirements 5.4)
   */
  private static extractRequiredSkills(roadmapData: any): any[] {
    const skills: any[] = []
    const skillNodes =
      roadmapData.careerPath?.nodes?.filter(
        (node: any) => node.type === 'skill'
      ) || []

    skillNodes.forEach((node: any, index: number) => {
      skills.push({
        id: `skill_${index}`,
        name: node.title,
        category: 'technical',
        isRequired: true,
        priority: index < 3 ? 'critical' : 'important',
      })
    })

    return skills
  }

  /**
   * Build learning path from roadmap data (Requirements 5.4)
   */
  private static buildLearningPath(
    roadmapData: any,
    request: RoadmapRequest
  ): any {
    return {
      id: `learning_path_${Date.now()}`,
      title: `${request.jobRole} Learning Path`,
      description: `Comprehensive learning path for ${request.jobRole} in ${request.domain}`,
      totalDuration: '6-12 months',
      phases: this.extractLearningPhases(roadmapData),
      estimatedCost: 2000,
      difficulty:
        request.experienceLevel === 'entry' ? 'beginner' : 'intermediate',
      prerequisites: [
        `Basic understanding of ${request.domain}`,
        'Problem-solving mindset',
      ],
      outcomes: [
        `Master ${request.jobRole} skills`,
        'Build portfolio projects',
        'Ready for job applications',
      ],
    }
  }

  /**
   * Extract learning phases from roadmap (Requirements 5.4)
   */
  private static extractLearningPhases(roadmapData: any): any[] {
    const courseNodes =
      roadmapData.careerPath?.nodes?.filter(
        (node: any) => node.type === 'course' || node.type === 'certification'
      ) || []

    return courseNodes.map((node: any, index: number) => ({
      id: `phase_${index + 1}`,
      title: node.title,
      description: node.description,
      duration: node.duration || '4 weeks',
      priority: index < 2 ? 'critical' : 'important',
      order: index + 1,
      skills: node.requirements || [],
      resources: [
        {
          id: `resource_${index}`,
          title: node.title,
          description: node.description,
          type: node.type,
          provider: 'Multiple Platforms',
          duration: node.duration || '4 weeks',
          cost: 50,
          difficulty: node.difficulty || 'beginner',
          skills: node.requirements || [],
        },
      ],
    }))
  }

  /**
   * Generate job market data (Requirements 5.3)
   */
  private static generateJobMarketData(request: RoadmapRequest): any {
    return {
      demand:
        this.determineGrowthProspects(request.domain) === 'high'
          ? 'high'
          : 'medium',
      competitiveness: request.experienceLevel === 'entry' ? 'high' : 'medium',
      locations: ['Remote', 'Major Cities', 'Tech Hubs'],
      industryGrowth: 15,
      averageSalary: this.getAverageSalaryByExperience(request.experienceLevel),
    }
  }

  /**
   * Get average salary by experience level (Requirements 5.3)
   */
  private static getAverageSalaryByExperience(experienceLevel: string): number {
    const salaryMap = {
      entry: 60000,
      junior: 75000,
      mid: 95000,
      senior: 120000,
      expert: 150000,
    }
    return salaryMap[experienceLevel as keyof typeof salaryMap] || 75000
  }

  /**
   * Get default salary range by experience level (Requirements 10.4)
   */
  private static getDefaultSalaryRange(experienceLevel: string): any {
    const ranges = {
      entry: { min: 45000, max: 70000 },
      junior: { min: 60000, max: 85000 },
      mid: { min: 80000, max: 110000 },
      senior: { min: 100000, max: 140000 },
      expert: { min: 130000, max: 180000 },
    }

    const range =
      ranges[experienceLevel as keyof typeof ranges] || ranges.junior
    return {
      ...range,
      currency: 'USD',
      period: 'yearly',
    }
  }

  /**
   * Get default skills by domain (Requirements 10.4)
   */
  private static getDefaultSkills(domain: string): any[] {
    const skillMap: Record<string, string[]> = {
      technology: ['Programming', 'Problem Solving', 'System Design'],
      business: ['Communication', 'Leadership', 'Strategic Thinking'],
      design: ['Creativity', 'User Experience', 'Visual Design'],
      healthcare: ['Patient Care', 'Medical Knowledge', 'Empathy'],
      education: ['Teaching', 'Curriculum Development', 'Student Engagement'],
    }

    const domainKey =
      Object.keys(skillMap).find((key) => domain.toLowerCase().includes(key)) ||
      'technology'

    return skillMap[domainKey].map((skill, index) => ({
      id: `skill_${index}`,
      name: skill,
      category: 'core',
      isRequired: true,
      priority: 'important',
    }))
  }

  /**
   * Build fallback learning path (Requirements 10.4)
   */
  private static buildFallbackLearningPath(request: RoadmapRequest): any {
    return {
      id: `fallback_path_${Date.now()}`,
      title: `${request.jobRole} Fallback Path`,
      description: `Basic learning path for ${request.jobRole}`,
      totalDuration: '6 months',
      phases: [
        {
          id: 'phase1',
          title: 'Foundation Skills',
          description: `Learn the basics of ${request.domain}`,
          duration: '3 months',
          priority: 'critical',
          order: 1,
          skills: request.skills,
          resources: [
            {
              id: 'basic-course',
              title: `Introduction to ${request.domain}`,
              description: `Foundational course in ${request.domain}`,
              type: 'course',
              provider: 'Online Learning Platform',
              duration: '4 weeks',
              cost: 50,
              difficulty: 'beginner',
              skills: request.skills,
            },
          ],
        },
      ],
      estimatedCost: 500,
      difficulty: 'beginner',
      prerequisites: ['Basic computer skills'],
      outcomes: [
        `Understanding of ${request.domain}`,
        'Ready for advanced learning',
      ],
    }
  }

  /**
   * Get default job market data (Requirements 10.4)
   */
  private static getDefaultJobMarketData(): any {
    return {
      demand: 'medium',
      competitiveness: 'medium',
      locations: ['Remote', 'Major Cities'],
      industryGrowth: 10,
      averageSalary: 75000,
    }
  }

  /**
   * Get fallback roadmaps by domain (Requirements 10.4)
   */
  private static getFallbackRoadmapsByDomain(): Record<string, any> {
    return {
      technology: {
        relatedRoles: [
          'Software Developer',
          'System Analyst',
          'Technical Lead',
          'DevOps Engineer',
        ],
        careerPath: this.getDefaultTechCareerPath(),
        alternatives: this.getDefaultTechAlternatives(),
      },
      business: {
        relatedRoles: [
          'Business Analyst',
          'Project Manager',
          'Operations Manager',
          'Strategy Consultant',
        ],
        careerPath: this.getDefaultBusinessCareerPath(),
        alternatives: this.getDefaultBusinessAlternatives(),
      },
      default: {
        relatedRoles: ['Specialist', 'Coordinator', 'Manager', 'Director'],
        careerPath: this.getDefaultGenericCareerPath(),
        alternatives: this.getDefaultGenericAlternatives(),
      },
    }
  }

  /**
   * Get default technology career path (Requirements 10.4)
   */
  private static getDefaultTechCareerPath(): any {
    return {
      nodes: [
        {
          id: '1',
          type: 'course',
          title: 'Programming Fundamentals',
          description: 'Learn basic programming concepts',
          duration: '3 months',
          difficulty: 'beginner',
          position: { x: 100, y: 100 },
        },
        {
          id: '2',
          type: 'internship',
          title: 'Tech Internship',
          description: 'Gain practical experience',
          duration: '6 months',
          position: { x: 300, y: 100 },
        },
        {
          id: '3',
          type: 'job',
          title: 'Junior Developer',
          description: 'Entry-level development role',
          salary: '$60k-80k',
          position: { x: 500, y: 100 },
        },
      ],
      edges: [
        {
          id: 'e1-2',
          source: '1',
          target: '2',
          sourceHandle: 'bottom',
          targetHandle: 'top',
          type: 'smoothstep',
          animated: true,
        },
        {
          id: 'e2-3',
          source: '2',
          target: '3',
          sourceHandle: 'bottom',
          targetHandle: 'top',
          type: 'smoothstep',
          animated: true,
        },
      ],
    }
  }

  /**
   * Get default technology alternatives (Requirements 10.4)
   */
  private static getDefaultTechAlternatives(): any[] {
    return [
      {
        id: 'alt1',
        title: 'Data Analyst',
        description: 'Analyze data to drive business decisions',
        matchScore: 80,
        salary: '$65k-95k',
        requirements: ['SQL', 'Python', 'Statistics'],
        growth: 'high',
      },
      {
        id: 'alt2',
        title: 'UX Designer',
        description: 'Design user-friendly interfaces',
        matchScore: 75,
        salary: '$70k-100k',
        requirements: ['Design Tools', 'User Research', 'Prototyping'],
        growth: 'medium',
      },
      {
        id: 'alt3',
        title: 'Product Manager',
        description: 'Manage product development lifecycle',
        matchScore: 70,
        salary: '$80k-120k',
        requirements: ['Product Strategy', 'Communication', 'Analytics'],
        growth: 'high',
      },
    ]
  }

  /**
   * Get default business career path (Requirements 10.4)
   */
  private static getDefaultBusinessCareerPath(): any {
    return {
      nodes: [
        {
          id: '1',
          type: 'course',
          title: 'Business Fundamentals',
          description: 'Learn core business concepts',
          duration: '2 months',
          difficulty: 'beginner',
          position: { x: 100, y: 100 },
        },
        {
          id: '2',
          type: 'internship',
          title: 'Business Internship',
          description: 'Gain business experience',
          duration: '4 months',
          position: { x: 300, y: 100 },
        },
        {
          id: '3',
          type: 'job',
          title: 'Business Analyst',
          description: 'Analyze business processes',
          salary: '$55k-75k',
          position: { x: 500, y: 100 },
        },
      ],
      edges: [
        {
          id: 'e1-2',
          source: '1',
          target: '2',
          sourceHandle: 'bottom',
          targetHandle: 'top',
          type: 'smoothstep',
          animated: true,
        },
        {
          id: 'e2-3',
          source: '2',
          target: '3',
          sourceHandle: 'bottom',
          targetHandle: 'top',
          type: 'smoothstep',
          animated: true,
        },
      ],
    }
  }

  /**
   * Get default business alternatives (Requirements 10.4)
   */
  private static getDefaultBusinessAlternatives(): any[] {
    return [
      {
        id: 'alt1',
        title: 'Marketing Specialist',
        description: 'Develop and execute marketing strategies',
        matchScore: 75,
        salary: '$50k-80k',
        requirements: ['Marketing', 'Communication', 'Analytics'],
        growth: 'medium',
      },
      {
        id: 'alt2',
        title: 'Operations Manager',
        description: 'Optimize business operations',
        matchScore: 80,
        salary: '$70k-100k',
        requirements: ['Operations', 'Leadership', 'Process Improvement'],
        growth: 'medium',
      },
      {
        id: 'alt3',
        title: 'Financial Analyst',
        description: 'Analyze financial data and trends',
        matchScore: 70,
        salary: '$60k-90k',
        requirements: ['Finance', 'Excel', 'Data Analysis'],
        growth: 'medium',
      },
    ]
  }

  /**
   * Get default generic career path (Requirements 10.4)
   */
  private static getDefaultGenericCareerPath(): any {
    return {
      nodes: [
        {
          id: '1',
          type: 'course',
          title: 'Professional Skills',
          description: 'Develop core professional skills',
          duration: '2 months',
          difficulty: 'beginner',
          position: { x: 100, y: 100 },
        },
        {
          id: '2',
          type: 'job',
          title: 'Entry Level Position',
          description: 'Start your career journey',
          salary: '$40k-60k',
          position: { x: 300, y: 100 },
        },
      ],
      edges: [
        {
          id: 'e1-2',
          source: '1',
          target: '2',
          sourceHandle: 'bottom',
          targetHandle: 'top',
          type: 'smoothstep',
          animated: true,
        },
      ],
    }
  }

  /**
   * Get default generic alternatives (Requirements 10.4)
   */
  private static getDefaultGenericAlternatives(): any[] {
    return [
      {
        id: 'alt1',
        title: 'Administrative Specialist',
        description: 'Support organizational operations',
        matchScore: 70,
        salary: '$35k-55k',
        requirements: ['Organization', 'Communication', 'Computer Skills'],
        growth: 'low',
      },
      {
        id: 'alt2',
        title: 'Customer Service Representative',
        description: 'Assist customers with inquiries',
        matchScore: 75,
        salary: '$30k-50k',
        requirements: ['Communication', 'Problem Solving', 'Patience'],
        growth: 'low',
      },
      {
        id: 'alt3',
        title: 'Sales Associate',
        description: 'Sell products or services',
        matchScore: 65,
        salary: '$35k-65k',
        requirements: ['Sales', 'Communication', 'Persuasion'],
        growth: 'medium',
      },
    ]
  }

  // Legacy method for backward compatibility - delegates to new enhanced method
  static async generateCareerPath(
    profile: UserProfile
  ): Promise<CareerRecommendation> {
    try {
      // Convert UserProfile to RoadmapRequest format
      const request: RoadmapRequest = {
        domain: this.extractDomainFromProfile(profile),
        jobRole: profile.careerInterest || 'Professional',
        experienceLevel: this.mapEducationToExperience(profile.educationLevel),
        skills: profile.skills || [],
        educationLevel: profile.educationLevel,
        age: profile.age,
        name: profile.name,
      }

      return await this.generateCareerRoadmap(request)
    } catch (error) {
      console.error('Error in legacy generateCareerPath:', error)
      return this.getFallbackRecommendation(profile)
    }
  }

  /**
   * Extract domain from user profile (Requirements 5.2)
   */
  private static extractDomainFromProfile(profile: UserProfile): string {
    const careerInterest = profile.careerInterest?.toLowerCase() || ''

    // Map career interests to domains
    if (
      careerInterest.includes('software') ||
      careerInterest.includes('programming') ||
      careerInterest.includes('developer') ||
      careerInterest.includes('tech')
    ) {
      return 'Technology & Computer Science'
    }
    if (
      careerInterest.includes('business') ||
      careerInterest.includes('management')
    ) {
      return 'Business & Management'
    }
    if (
      careerInterest.includes('design') ||
      careerInterest.includes('creative')
    ) {
      return 'Design & Creative Industries'
    }
    if (
      careerInterest.includes('health') ||
      careerInterest.includes('medical')
    ) {
      return 'Healthcare & Medicine'
    }
    if (
      careerInterest.includes('education') ||
      careerInterest.includes('teaching')
    ) {
      return 'Education & Training'
    }

    return 'Technology & Computer Science' // Default domain
  }

  /**
   * Map education level to experience level (Requirements 5.2)
   */
  private static mapEducationToExperience(
    educationLevel: string
  ): 'entry' | 'junior' | 'mid' | 'senior' | 'expert' {
    switch (educationLevel) {
      case 'high-school':
        return 'entry'
      case 'associates':
      case 'bachelors':
        return 'junior'
      case 'masters':
        return 'mid'
      case 'phd':
        return 'senior'
      default:
        return 'entry'
    }
  }

  /**
   * Enhanced career recommendations with caching (Requirements 5.1, 10.1, 10.2)
   */
  static async generateCareerRecommendations(prompt: string): Promise<string> {
    try {
      this.validateConfiguration()

      // Create cache key for the prompt
      const cacheKey = btoa(prompt.substring(0, 100)).replace(
        /[^a-zA-Z0-9]/g,
        ''
      )
      const cachedResult = this.getCachedResponse<string>(cacheKey)
      if (cachedResult) {
        return cachedResult
      }

      console.log('🚀 Generating career recommendations with Gemini AI')

      const result = await this.withRetry(async () => {
        const response = await Promise.race([
          model.generateContent(prompt),
          new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error('Request timeout')),
              geminiConfig.timeout
            )
          ),
        ])

        const textResponse = await response.response
        return textResponse.text()
      }, 'career recommendations')

      // Cache the result
      this.setCachedResponse(cacheKey, result)

      return result
    } catch (error) {
      console.error('Error generating career recommendations:', error)
      throw new Error(
        'Failed to generate career recommendations. Please try again later.'
      )
    }
  }

  /**
   * Enhanced alternative career suggestions (Requirements 5.1, 5.3, 10.1)
   */
  static async suggestAlternatives(
    profile: UserProfile
  ): Promise<AlternativeCareer[]> {
    try {
      this.validateConfiguration()

      // Convert to roadmap request for consistency
      const request: RoadmapRequest = {
        domain: this.extractDomainFromProfile(profile),
        jobRole: profile.careerInterest || 'Professional',
        experienceLevel: this.mapEducationToExperience(profile.educationLevel),
        skills: profile.skills || [],
        educationLevel: profile.educationLevel,
        age: profile.age,
        name: profile.name,
      }

      const cacheKey = `alternatives_${this.generateCacheKey(request)}`
      const cachedResult = this.getCachedResponse<AlternativeCareer[]>(cacheKey)
      if (cachedResult) {
        return cachedResult
      }

      console.log('🚀 Generating alternative careers with Gemini AI')

      const alternatives = await this.withRetry(async () => {
        const prompt = this.buildAlternativesPrompt(request)

        const result = await Promise.race([
          model.generateContent(prompt),
          new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error('Request timeout')),
              geminiConfig.timeout
            )
          ),
        ])

        const response = await result.response
        const text = response.text()

        return this.parseAlternativesResponse(text)
      }, 'alternative careers')

      // Cache the result
      this.setCachedResponse(cacheKey, alternatives)

      return alternatives
    } catch (error) {
      console.error('Error generating alternatives:', error)
      return this.getFallbackAlternatives(profile)
    }
  }

  /**
   * Build alternatives prompt (Requirements 5.3)
   */
  private static buildAlternativesPrompt(request: RoadmapRequest): string {
    return `
You are a career advisor specializing in alternative career paths. Based on the user's profile, suggest 3 diverse and relevant alternative careers.

**User Profile:**
- Current Interest: ${request.jobRole}
- Domain: ${request.domain}
- Experience Level: ${request.experienceLevel}
- Skills: ${request.skills.join(', ')}
- Education: ${request.educationLevel}

**Requirements:**
1. Suggest careers that leverage the user's existing skills
2. Include both traditional and emerging roles
3. Consider the user's experience level for realistic transitions
4. Avoid generic suggestions like "Software Developer" or "Data Analyst"
5. Focus on specific, actionable career paths

**Output Format:**
Provide exactly 3 alternative careers in JSON format:

[
  {
    "id": "alt1",
    "title": "Specific Career Title",
    "description": "Detailed description explaining why this fits the user's profile and how their skills transfer",
    "matchScore": 85,
    "salary": "$XX,XXX-$XX,XXX",
    "requirements": ["Skill 1", "Skill 2", "Skill 3"],
    "growth": "high|medium|low"
  },
  {
    "id": "alt2",
    "title": "Another Career Title",
    "description": "Another detailed description",
    "matchScore": 75,
    "salary": "$XX,XXX-$XX,XXX",
    "requirements": ["Skill 1", "Skill 2", "Skill 3"],
    "growth": "high|medium|low"
  },
  {
    "id": "alt3",
    "title": "Third Career Title",
    "description": "Third detailed description",
    "matchScore": 70,
    "salary": "$XX,XXX-$XX,XXX",
    "requirements": ["Skill 1", "Skill 2", "Skill 3"],
    "growth": "high|medium|low"
  }
]

Make sure each alternative is realistic for someone with ${
      request.experienceLevel
    } experience level and includes specific salary ranges appropriate for that level.
    `
  }

  /**
   * Parse alternatives response (Requirements 5.4, 10.4)
   */
  private static parseAlternativesResponse(text: string): AlternativeCareer[] {
    try {
      const jsonMatch = text.match(/\[[\s\S]*\]/)
      if (!jsonMatch) {
        throw new Error('No valid JSON array found in alternatives response')
      }

      const alternatives = JSON.parse(jsonMatch[0])

      // Validate structure
      if (!Array.isArray(alternatives) || alternatives.length === 0) {
        throw new Error('Invalid alternatives structure')
      }

      return alternatives.map((alt: any) => ({
        id: alt.id || `alt_${Date.now()}_${Math.random()}`,
        title: alt.title || 'Alternative Career',
        description: alt.description || 'Career alternative description',
        matchScore: alt.matchScore || 70,
        salary: alt.salary || '$50k-80k',
        requirements: alt.requirements || [],
        growth: alt.growth || 'medium',
      }))
    } catch (error) {
      console.error('Error parsing alternatives response:', error)
      throw new Error('Failed to parse alternative careers')
    }
  }

  /**
   * Clear cache manually (Requirements 10.2, 10.3)
   */
  static clearCache(): void {
    this.cache.clear()
    console.log('🧹 Gemini AI cache cleared')
  }

  /**
   * Get cache statistics (Requirements 10.2)
   */
  static getCacheStats(): { size: number; entries: string[] } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys()),
    }
  }

  /**
   * Check service health (Requirements 10.4)
   */
  static async checkHealth(): Promise<{
    status: 'healthy' | 'unhealthy'
    details: any
  }> {
    try {
      this.validateConfiguration()

      // Test with a simple prompt
      const testPrompt = 'Respond with "OK" if you can process this request.'
      const result = await Promise.race([
        model.generateContent(testPrompt),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Health check timeout')), 5000)
        ),
      ])

      const response = await result.response
      const text = response.text()

      return {
        status: 'healthy',
        details: {
          apiKey: !!geminiConfig.apiKey,
          model: geminiConfig.model,
          cacheEnabled: geminiConfig.cacheEnabled,
          cacheSize: this.cache.size,
          testResponse: text.substring(0, 50),
        },
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
          apiKey: !!geminiConfig.apiKey,
          model: geminiConfig.model,
        },
      }
    }
  }

  // Keep the original method signature for backward compatibility
  private static async generateCareerPathLegacy(
    profile: UserProfile
  ): Promise<CareerRecommendation> {
    // Delegate to the new enhanced method
    return this.generateCareerPath(profile)
  }

  private static getFallbackRecommendation(
    profile: UserProfile
  ): CareerRecommendation {
    // Fallback to mock data if API fails
    const mockPaths = {
      'software-developer': {
        nodes: [
          {
            id: '1',
            type: 'course' as const,
            title: 'Learn JavaScript',
            description: 'Master the fundamentals of JavaScript programming',
            duration: '3 months',
            difficulty: 'beginner' as const,
            position: { x: 100, y: 100 },
          },
          {
            id: '2',
            type: 'course' as const,
            title: 'React Development',
            description: 'Build modern web applications with React',
            duration: '4 months',
            difficulty: 'intermediate' as const,
            position: { x: 300, y: 100 },
          },
          {
            id: '3',
            type: 'internship' as const,
            title: 'Frontend Internship',
            description: '6-month internship at a tech startup',
            duration: '6 months',
            position: { x: 500, y: 100 },
          },
          {
            id: '4',
            type: 'job' as const,
            title: 'Junior Developer',
            description: 'Entry-level software developer position',
            salary: '$60k-80k',
            position: { x: 700, y: 100 },
          },
          {
            id: '5',
            type: 'job' as const,
            title: 'Senior Developer',
            description: 'Lead development projects and mentor juniors',
            salary: '$90k-120k',
            position: { x: 900, y: 100 },
          },
          {
            id: '6',
            type: 'company' as const,
            title: 'Google',
            description: 'Work at one of the top tech companies',
            position: { x: 1100, y: 100 },
          },
          {
            id: '7',
            type: 'skill' as const,
            title: 'TypeScript',
            description: 'Advanced JavaScript with type safety',
            position: { x: 100, y: 300 },
          },
          {
            id: '8',
            type: 'skill' as const,
            title: 'Node.js',
            description: 'Backend development with JavaScript',
            position: { x: 300, y: 300 },
          },
        ],
        edges: [
          {
            id: 'e1-2',
            source: '1',
            target: '2',
            sourceHandle: 'bottom',
            targetHandle: 'top',
            type: 'smoothstep' as const,
            animated: true,
          },
          {
            id: 'e2-3',
            source: '2',
            target: '3',
            sourceHandle: 'bottom',
            targetHandle: 'top',
            type: 'smoothstep' as const,
            animated: true,
          },
          {
            id: 'e3-4',
            source: '3',
            target: '4',
            sourceHandle: 'bottom',
            targetHandle: 'top',
            type: 'smoothstep' as const,
            animated: true,
          },
          {
            id: 'e4-5',
            source: '4',
            target: '5',
            sourceHandle: 'bottom',
            targetHandle: 'top',
            type: 'smoothstep' as const,
            animated: true,
          },
          {
            id: 'e5-6',
            source: '5',
            target: '6',
            sourceHandle: 'bottom',
            targetHandle: 'top',
            type: 'smoothstep' as const,
            animated: true,
          },
          {
            id: 'e1-7',
            source: '1',
            target: '7',
            sourceHandle: 'right',
            targetHandle: 'left',
            type: 'smoothstep' as const,
          },
          {
            id: 'e2-8',
            source: '2',
            target: '8',
            sourceHandle: 'right',
            targetHandle: 'left',
            type: 'smoothstep' as const,
          },
        ],
      },
    }

    const pathData = mockPaths['software-developer']
    return {
      id: `fallback_career_${Date.now()}`,
      title: 'AI Solutions Engineer',
      description:
        'Bridge the gap between AI research and practical applications by designing, implementing, and optimizing AI systems for real-world problems.',
      fitScore: 75,
      salaryRange: {
        min: 60000,
        max: 120000,
        currency: 'USD',
        period: 'yearly',
      },
      growthProspects: 'high' as const,
      requiredSkills: [],
      recommendedPath: {
        id: 'fallback_path',
        title: 'Software Developer Learning Path',
        description: 'Comprehensive learning path for software development',
        totalDuration: '6-12 months',
        phases: [
          {
            id: 'phase1',
            title: 'Foundation Skills',
            description: 'Learn the basics of programming and web development',
            duration: '3 months',
            priority: 'critical' as const,
            order: 1,
            skills: ['JavaScript', 'HTML', 'CSS'],
            resources: [
              {
                id: 'js-basics',
                title: 'JavaScript Fundamentals',
                description:
                  'Master the core concepts of JavaScript programming',
                type: 'course' as const,
                provider: 'Multiple Platforms',
                duration: '4 weeks',
                cost: 50,
                difficulty: 'beginner' as const,
                skills: ['JavaScript', 'Programming Basics', 'Web Development'],
              },
              {
                id: 'html-css',
                title: 'HTML & CSS Complete Course',
                description: 'Build beautiful and responsive websites',
                type: 'course' as const,
                provider: 'Multiple Platforms',
                duration: '3 weeks',
                cost: 40,
                difficulty: 'beginner' as const,
                skills: ['HTML', 'CSS', 'Responsive Design'],
              },
            ],
          },
          {
            id: 'phase2',
            title: 'Advanced Development',
            description: 'Learn modern frameworks and tools',
            duration: '4 months',
            priority: 'important' as const,
            order: 2,
            skills: ['React', 'Node.js', 'Databases'],
            resources: [
              {
                id: 'react-course',
                title: 'React - The Complete Guide',
                description: 'Build modern web applications with React',
                type: 'course' as const,
                provider: 'Multiple Platforms',
                duration: '6 weeks',
                cost: 80,
                difficulty: 'intermediate' as const,
                skills: ['React', 'JavaScript', 'Frontend Development'],
              },
            ],
          },
        ],
        estimatedCost: 2000,
        difficulty: 'intermediate' as const,
        prerequisites: ['Basic computer skills', 'Problem-solving mindset'],
        outcomes: [
          'Build web applications',
          'Understand programming concepts',
          'Ready for junior developer roles',
        ],
      },
      jobMarketData: {
        demand: 'high' as const,
        competitiveness: 'medium' as const,
        locations: ['Remote', 'Major Cities'],
        industryGrowth: 15,
        averageSalary: 90000,
      },
      primaryCareer: 'AI Solutions Engineer',
      relatedRoles: [
        'Machine Learning Engineer',
        'AI Research Scientist',
        'Computer Vision Engineer',
        'NLP Specialist',
      ],
      careerPath: {
        nodes: pathData.nodes,
        edges: pathData.edges,
      },
      alternatives: this.getFallbackAlternatives(profile),
      summary: `Based on your interest in ${
        profile.careerInterest
      } and skills in ${profile.skills.join(
        ', '
      )}, a career in AI Solutions Engineering would be perfect for you. This emerging field combines technical expertise with practical problem-solving to create impactful AI applications.`,
    }
  }

  private static getFallbackAlternatives(
    _profile: UserProfile
  ): AlternativeCareer[] {
    return [
      {
        id: 'alt1',
        title: 'AI Ethics Specialist',
        description: 'Ensure responsible AI development and deployment',
        matchScore: 85,
        salary: '$80k-120k',
        requirements: ['AI/ML Knowledge', 'Ethics', 'Policy Development'],
        growth: 'high',
      },
      {
        id: 'alt2',
        title: 'Blockchain Solutions Architect',
        description: 'Design decentralized systems and smart contracts',
        matchScore: 75,
        salary: '$90k-140k',
        requirements: ['Blockchain', 'Solidity', 'System Design'],
        growth: 'high',
      },
      {
        id: 'alt3',
        title: 'Climate Tech Engineer',
        description:
          'Develop technology solutions for environmental challenges',
        matchScore: 70,
        salary: '$70k-110k',
        requirements: [
          'Environmental Science',
          'Engineering',
          'Sustainability',
        ],
        growth: 'high',
      },
    ]
  }
}
