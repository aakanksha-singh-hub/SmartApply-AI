import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { NBCard } from '@/components/NBCard'
import { NBButton } from '@/components/NBButton'
import { BGPattern } from '@/components/ui/bg-pattern'
import { AuthService } from '@/lib/services/authService'
import { toast } from 'sonner'

const SignUp: React.FC = () => {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const submit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        setLoading(true)
        console.log('=== Sign Up Process Started ===')
        console.log('Creating account for user:', username)
        
        try {
            toast.loading('Creating your account...', { id: 'signup-process' });
            
            // Use AuthService for sign up (Requirements 1.2, 1.3)
            const result = await AuthService.signUp({ username, password, confirm });
            
            if (!result.success) {
                toast.dismiss('signup-process');
                return; // Error handling is done in AuthService
            }
            
            toast.success('Account created successfully! Welcome to SmartApply AI!', { 
                id: 'signup-process',
                duration: 4000
            });
            
            console.log('✓ Account created successfully for:', username);
            
            // New users always go to assessment first (Requirement 1.4)
            setTimeout(() => {
                navigate('/assessment')
            }, 1000);
            
        } catch (error) {
            console.error('❌ Sign up failed:', error)
            toast.dismiss('signup-process');
        } finally {
            setLoading(false)
            console.log('=== Sign Up Process Complete ===')
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
                            <h2 className="text-3xl font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>Create your account</h2>
                            <p className="text-sm text-muted-foreground">Start your career journey with SmartApply AI</p>
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

                            <div>
                                <label className="block text-sm font-medium">Confirm password</label>
                                <input required type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded-md" />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="text-sm">
                                    <Link to="/signin" className="text-primary hover:underline">Already have an account?</Link>
                                </div>
                            </div>

                            <div>
                                <NBButton type="submit" className="w-full" disabled={loading}>{loading ? 'Creating...' : 'Create account'}</NBButton>
                            </div>
                        </form>
                    </NBCard>
                </div>
            </div>
        </Layout>
    )
}

export default SignUp
