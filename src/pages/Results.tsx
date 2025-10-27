import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NBCard } from '../components/NBCard';
import { NBButton } from '../components/NBButton';
import { FlowChart } from '../components/FlowChart';
import { SummaryPanel } from '../components/SummaryPanel';
import { GridBackground } from '../components/ui/grid-background';
import { DotBackground } from '../components/ui/dot-background';
import { useUserStore } from '../lib/stores/userStore';
import { CareerService } from '../lib/services/careerService';
import { EnhancedProfileService } from '../lib/services/enhancedProfileService';
import { AlternativeCareer } from '../lib/types';
import { toast } from 'sonner';
import { ArrowLeft, RefreshCw, Loader2, Target } from 'lucide-react';

export const Results = () => {
  const navigate = useNavigate();
  const { profile, results, setResults, clearData, setEnhancedProfile, enhancedProfile } = useUserStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedAlternative, setSelectedAlternative] = useState<string | null>(null);
  const [originalResults, setOriginalResults] = useState(results);
  const [profileCreated, setProfileCreated] = useState(false);

  // Manual function to create enhanced profile
  const createEnhancedProfile = async () => {
    if (!profile || !results) return;
    
    console.log('Creating enhanced profile from results page:');
    console.log('=== MANUALLY CREATING ENHANCED PROFILE ===');
    console.log('Current profile:', profile);
    console.log('Current results:', results);
    
    const newEnhancedProfile = {
      ...profile,
      careerRecommendations: results ? [results] : [],
      progressData: {
        overallProgress: 0,
        skillProgress: {},
        milestoneProgress: {},
        learningActivities: [],
        lastUpdated: new Date()
      },
      achievements: [],
      currentMilestones: [],
      level: 1,
      experiencePoints: 0,
      badges: [],
      streaks: {
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: new Date(),
        streakType: 'daily' as const,
        streakGoal: 7
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log('New enhanced profile to save:', newEnhancedProfile);
    
    try {
      // Save to database first
      console.log('Saving enhanced profile to database...');
      const savedProfile = await EnhancedProfileService.saveEnhancedProfile(newEnhancedProfile);
      console.log('Enhanced profile saved to database successfully:', savedProfile);
      
      // Then update local store
      setEnhancedProfile(savedProfile);
      setProfileCreated(true);
      toast.success('Profile saved to database! You can now go to dashboard.');
    } catch (error) {
      console.error('Failed to save enhanced profile to database:', error);
      
      // Fallback to local storage only
      setEnhancedProfile(newEnhancedProfile);
      setProfileCreated(true);
      toast.warning('Profile saved locally. Database sync will retry later.');
    }
  };

  useEffect(() => {
    console.log('=== RESULTS PAGE USEEFFECT ===');
    console.log('Profile:', profile);
    console.log('Results:', results);
    console.log('Enhanced Profile:', enhancedProfile);
    console.log('Profile Created State:', profileCreated);
    
    if (!profile || !results) {
      console.log('Missing profile or results, redirecting to details');
      navigate('/details');
      return;
    }
    
    // Check if enhanced profile has the required gamification fields
    const hasGamificationFields = enhancedProfile && 
      'achievements' in enhancedProfile && 
      'badges' in enhancedProfile && 
      'level' in enhancedProfile;
    
    console.log('Has gamification fields?', hasGamificationFields);
    
    // Create enhanced profile if it doesn't have gamification fields
    if (!profileCreated && !hasGamificationFields) {
      console.log('Creating enhanced profile from results page:');
      console.log('Creating enhanced profile automatically...');
      createEnhancedProfile();
    }
    
    // Store original results when first loaded
    if (!originalResults) {
      setOriginalResults(results);
    }
    
    // Show success toast
    if (profileCreated) {
      toast.success('Career path generated and profile saved!');
    }
  }, [profile, results, navigate, originalResults, profileCreated, enhancedProfile]);

  const handleStartOver = () => {
    clearData();
    navigate('/details');
  };

  const handleBackToOriginal = () => {
    if (originalResults) {
      setResults(originalResults);
      toast.success('Returned to original career path');
    }
  };

  const handleAlternativeCareerClick = async (alternative: AlternativeCareer) => {
    if (!profile || isGenerating) return;

    setSelectedAlternative(alternative.id);
    setIsGenerating(true);

    try {
      // Create a modified profile with the alternative career as the main interest
      const modifiedProfile = {
        ...profile,
        careerInterest: alternative.title,
        skills: [...profile.skills, ...alternative.requirements]
      };

      // Generate new career path for the selected alternative
      const newResults = await CareerService.generatePath(modifiedProfile);
      setResults(newResults);
      
      toast.success(`Generated career path for ${alternative.title}!`);
    } catch (error) {
      console.error('Error generating alternative career path:', error);
      toast.error('Failed to generate career path for this alternative. Please try again.');
    } finally {
      setIsGenerating(false);
      setSelectedAlternative(null);
    }
  };

  if (!profile || !results) {
    return null;
  }

  return (
    <div className="min-h-screen light-rays-bg relative">
      {/* Header */}
      <header className="border-b border-border/20 bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="p-2 hover:bg-accent/20 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-foreground" />
              </button>
              <h1 className="text-2xl font-bold text-foreground">
                Your Career Path
              </h1>
            </div>
            <div className="flex space-x-2">
              {!enhancedProfile && (
                <NBButton
                  onClick={createEnhancedProfile}
                  className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
                >
                  <Target className="w-4 h-4" />
                  <span>Save Profile & Continue</span>
                </NBButton>
              )}
              {enhancedProfile && (
                <NBButton
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center space-x-2"
                >
                  <Target className="w-4 h-4" />
                  <span>Go to Dashboard</span>
                </NBButton>
              )}
              {originalResults && results !== originalResults && (
                <NBButton
                  variant="secondary"
                  onClick={handleBackToOriginal}
                  className="flex items-center space-x-2 border-border/50"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Original</span>
                </NBButton>
              )}
              <NBButton
                variant="secondary"
                onClick={handleStartOver}
                className="flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Start Over</span>
              </NBButton>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="py-8 px-4 relative">
        <GridBackground 
          size={40} 
          lineColor="rgba(139, 92, 246, 0.15)" 
          opacity={0.2}
          className="absolute inset-0"
        >
          <div />
        </GridBackground>
        <DotBackground 
          size={60} 
          dotColor="rgba(34, 197, 94, 0.1)" 
          opacity={0.3}
          className="absolute inset-0"
        >
          <div />
        </DotBackground>
        <div className="max-w-7xl mx-auto relative">
          {/* Summary Panel - Full Width */}
          <div className="mb-8">
            <SummaryPanel 
              recommendation={results} 
              userName={profile.name} 
            />
          </div>

          {/* Flow Chart - Full Width Below */}
          <div className="w-full">
            <NBCard className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm">
              <div className="p-6 pb-4">
                <h3 className="text-2xl font-bold text-foreground mb-3">
                  Your Career Journey
                </h3>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  Explore your AI-generated career path. Click and drag to navigate, 
                  zoom in/out to see details, and discover the connections between 
                  different opportunities.
                </p>
              </div>
              <div className="px-6 pb-6">
                <FlowChart 
                  nodes={results.careerPath.nodes}
                  edges={results.careerPath.edges}
                  className="w-full"
                  height="600px"
                />
              </div>
            </NBCard>
          </div>

          {/* Legend */}
          <div className="mt-8">
            <NBCard className="border-border/50 bg-card/50 backdrop-blur-sm">
              <h4 className="text-lg font-bold text-foreground mb-6">
                Career Path Legend
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                <div className="flex items-center space-x-3 group">
                  <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-sm group-hover:scale-110 transition-transform"></div>
                  <span className="text-sm font-medium text-foreground">Courses</span>
                </div>
                <div className="flex items-center space-x-3 group">
                  <div className="w-5 h-5 bg-gradient-to-br from-primary to-primary/80 rounded-lg shadow-sm group-hover:scale-110 transition-transform"></div>
                  <span className="text-sm font-medium text-foreground">Internships</span>
                </div>
                <div className="flex items-center space-x-3 group">
                  <div className="w-5 h-5 bg-gradient-to-br from-accent to-green-600 rounded-lg shadow-sm group-hover:scale-110 transition-transform"></div>
                  <span className="text-sm font-medium text-foreground">Jobs</span>
                </div>
                <div className="flex items-center space-x-3 group">
                  <div className="w-5 h-5 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-sm group-hover:scale-110 transition-transform"></div>
                  <span className="text-sm font-medium text-foreground">Companies</span>
                </div>
                <div className="flex items-center space-x-3 group">
                  <div className="w-5 h-5 bg-gradient-to-br from-slate-500 to-slate-600 rounded-lg shadow-sm group-hover:scale-110 transition-transform"></div>
                  <span className="text-sm font-medium text-foreground">Skills</span>
                </div>
              </div>
            </NBCard>
          </div>
        </div>
      </div>
    </div>
  );
};
