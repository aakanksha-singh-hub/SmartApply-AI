import React, { useState, useEffect } from 'react'
import axios from '@/utility/axiosInterceptor'
import { authenticate } from '@/utility/helper'
import { useNavigate, Link } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { NBCard } from '@/components/NBCard'
import { NBButton } from '@/components/NBButton'
import { BGPattern } from '@/components/ui/bg-pattern'
import { useUserStore } from '@/lib/stores/userStore'
import { EnhancedProfileService } from '@/lib/services/enhancedProfileService'

const SignIn: React.FC = () => {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const { enhancedProfile, setEnhancedProfile } = useUserStore()

    // Force reload enhanced profile from localStorage on component mount
    useEffect(() => {
        console.log('=== SignIn Component Mounted ===')
        console.log('Current enhanced profile in store:', enhancedProfile)
        
        // Force reload from localStorage to ensure we have the latest data
        try {
            const storedData = localStorage.getItem('career-mentor-store')
            if (storedData) {
                const parsed = JSON.parse(storedData)
                if (parsed.enhancedProfile && !enhancedProfile) {
                    console.log('Found enhanced profile in localStorage, loading into store:', parsed.enhancedProfile)
                    setEnhancedProfile(parsed.enhancedProfile)
                }
            }
        } catch (error) {
            console.error('Error loading enhanced profile from localStorage:', error)
        }
    }, [])

    const submit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        
        console.log('=== Authentication Process Started ===')
        console.log('Attempting to authenticate user:', username)
        
        try {
            const res = await axios.post('/auth/login', { username, password })
            console.log('✓ Authentication API call successful:', res.data)
            
            // Store authentication data
            authenticate({ ...(res.data), token: res.data.token, data: res.data.user })
            console.log('✓ Authentication data stored successfully in localStorage')
            console.log('User data:', res.data.user)
            console.log('Token stored:', !!res.data.token)
            
            // Fetch enhanced profile from database after authentication
            const checkEnhancedProfile = async () => {
                console.log('=== Enhanced Profile Detection Process ===')
                console.log('Checking for existing enhanced profile after authentication...')
                
                // Function to check if a profile is complete
                const isProfileComplete = (profile: any) => {
                    if (!profile) return false
                    
                    // Check for essential fields that indicate a completed assessment
                    const hasEssentialFields = !!(
                        profile.achievements !== undefined &&
                        profile.badges !== undefined &&
                        profile.level !== undefined &&
                        profile.careerRecommendations !== undefined &&
                        profile.progressData !== undefined
                    )
                    
                    // Also check if they have at least one career recommendation (indicates completed assessment)
                    const hasCareerData = !!(
                        profile.careerRecommendations && 
                        profile.careerRecommendations.length > 0
                    )
                    
                    return hasEssentialFields && hasCareerData
                }
                
                let hasEnhancedProfile = false
                let profileData = null
                
                try {
                    // First, try to fetch enhanced profile from database
                    console.log('Fetching enhanced profile from database...')
                    const databaseProfile = await EnhancedProfileService.loadEnhancedProfile()
                    
                    if (databaseProfile && isProfileComplete(databaseProfile)) {
                        console.log('✓ Complete enhanced profile found in database:', databaseProfile)
                        hasEnhancedProfile = true
                        profileData = databaseProfile
                        
                        // Load into store
                        setEnhancedProfile(databaseProfile)
                        console.log('Enhanced profile loaded into store from database')
                    } else if (databaseProfile) {
                        console.log('✗ Enhanced profile found in database but incomplete:', {
                            hasAchievements: databaseProfile.achievements !== undefined,
                            hasBadges: databaseProfile.badges !== undefined,
                            hasLevel: databaseProfile.level !== undefined,
                            hasRecommendations: databaseProfile.careerRecommendations !== undefined,
                            hasProgressData: databaseProfile.progressData !== undefined,
                            recommendationsCount: databaseProfile.careerRecommendations?.length || 0
                        })
                    } else {
                        console.log('✗ No enhanced profile found in database')
                    }
                } catch (error) {
                    console.error('Error fetching enhanced profile from database:', error)
                    
                    // Fallback to localStorage check
                    console.log('⚠ Falling back to localStorage check...')
                    const storedProfile = localStorage.getItem('career-mentor-store')
                    
                    if (storedProfile) {
                        try {
                            const parsed = JSON.parse(storedProfile)
                            const enhancedProfileData = parsed?.enhancedProfile
                            
                            hasEnhancedProfile = isProfileComplete(enhancedProfileData)
                            profileData = enhancedProfileData
                            
                            if (hasEnhancedProfile) {
                                console.log('✓ Complete enhanced profile found in localStorage:', profileData)
                                // Load into store
                                setEnhancedProfile(enhancedProfileData)
                            } else {
                                console.log('✗ Enhanced profile incomplete in localStorage')
                            }
                        } catch (parseError) {
                            console.error('✗ Error parsing localStorage data:', parseError)
                            hasEnhancedProfile = false
                        }
                    }
                }
                
                // Also check Zustand store as final fallback
                if (!hasEnhancedProfile && enhancedProfile) {
                    console.log('⚠ Checking Zustand store as final fallback...')
                    hasEnhancedProfile = isProfileComplete(enhancedProfile)
                    
                    if (hasEnhancedProfile) {
                        console.log('✓ Complete enhanced profile found in Zustand store:', enhancedProfile)
                        profileData = enhancedProfile
                    }
                }
                
                // Make routing decision based on enhanced profile existence
                console.log('=== Routing Decision ===')
                if (hasEnhancedProfile) {
                    console.log('✓ Enhanced profile detected - user has completed assessment')
                    console.log('→ Redirecting to dashboard (Requirements 4.3, 4.5)')
                    navigate('/dashboard')
                } else {
                    console.log('✗ No enhanced profile found - user needs to complete assessment')
                    console.log('→ Redirecting to assessment (Requirements 4.3, 4.5)')
                    navigate('/assessment')
                }
                console.log('=== End Profile Detection ===')
            }
            
            // Small delay to ensure localStorage is updated, then check profile
            setTimeout(checkEnhancedProfile, 100)
        } catch (err: any) {
            console.log('=== Authentication Failed ===')
            console.error('✗ Authentication error:', err)
            
            if (err.response?.status === 401) {
                console.log('✗ Authentication error: Invalid credentials (401)')
                alert('Invalid username or password. Please try again.')
            } else if (err.response?.data?.error) {
                console.log('✗ Authentication error from server:', err.response.data.error)
                alert(`Login failed: ${err.response.data.error}`)
            } else {
                console.log('✗ Authentication error: Unknown error')
                console.error('Full error details:', err)
                alert('Login failed. Please try again.')
            }
        } finally {
            setLoading(false)
            console.log('=== Authentication Process Complete ===')
        }
    }

    return (
        <Layout showNavbar={false} showFooter={false}>
            <div className="min-h-screen light-rays-bg relative overflow-hidden">
                <BGPattern variant="grid" mask="fade-edges" size={40} fill="rgba(139, 92, 246, 0.06)" />
                <BGPattern variant="dots" mask="fade-center" size={60} fill="rgba(34, 197, 94, 0.03)" />
                <div className="min-h-screen flex items-center justify-center">
                    <NBCard className="w-full max-w-lg p-8">
                        <div className="mb-6 text-center">
                            <h2 className="text-3xl font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>Welcome back</h2>
                            <p className="text-sm text-muted-foreground">Sign in to continue to SmartApply AI</p>
                        </div>

                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium">Username</label>
                                <input required value={username} onChange={(e) => setUsername(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded-md" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium">Password</label>
                                <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded-md" />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="text-sm">
                                    <Link to="/signup" className="text-primary hover:underline">Create account</Link>
                                </div>
                            </div>

                            <div>
                                <NBButton type="submit" className="w-full" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</NBButton>
                            </div>
                        </form>
                    </NBCard>
                </div>
            </div>
        </Layout>
    )
}

export default SignIn
