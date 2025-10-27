import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CareerRecommendationsList } from '../components/CareerRecommendationsList';
import { ProgressDashboard } from '../components/ProgressDashboard';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { GridBackgroundSmall } from '../components/ui/grid-background';
import { DotBackground } from '../components/ui/dot-background';
import { NBCard } from '../components/NBCard';
import { NBButton } from '../components/NBButton';
import { useUserStore } from '../lib/stores/userStore';
import { CareerService } from '../lib/services/careerService';
import { AssessmentService } from '../lib/services/assessmentService';
import { EnhancedProfileService } from '../lib/services/enhancedProfileService';
import { CareerRecommendation } from '../lib/types';
import { toast } from 'sonner';
import { 
  RefreshCw, 
  User, 
  Target, 
  Bookmark,
  TrendingUp,
  BarChart3,
  Settings,
  Download,
  BookOpen,
  Activity,
  GitBranch,
  HelpCircle
} from 'lucide-react';

export const CareerDashboard = () => {
  const navigate = useNavigate();
  const { profile, enhancedProfile, setEnhancedProfile } = useUserStore();
  const [recommendations, setRecommendations] = useState<CareerRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [savedCareerIds, setSavedCareerIds] = useState<string[]>([]);
  const [selectedCareerId, setSelectedCareerId] = useState<string | undefined>();

  useEffect(() => {
    console.log('=== CareerDashboard useEffect ===');
    console.log('Enhanced profile in store:', enhancedProfile);
    
    // Check for enhanced profile in database, localStorage, and store
    let hasValidProfile = !!enhancedProfile;
    
    const loadEnhancedProfile = async () => {
      if (hasValidProfile) return;
      
      try {
        // First try to load from database
        console.log('No enhanced profile in store, checking database...');
        const databaseProfile = await EnhancedProfileService.loadEnhancedProfile();
        
        if (databaseProfile && 
            databaseProfile.achievements !== undefined &&
            databaseProfile.badges !== undefined &&
            databaseProfile.level !== undefined &&
            databaseProfile.careerRecommendations !== undefined &&
            databaseProfile.careerRecommendations.length > 0) {
          
          console.log('Found complete enhanced profile in database, loading into store...');
          setEnhancedProfile(databaseProfile);
          hasValidProfile = true;
          return;
        }
      } catch (error) {
        console.error('Error loading enhanced profile from database:', error);
      }
      
      // Fallback to localStorage
      if (!hasValidProfile) {
        console.log('No enhanced profile in database, checking localStorage...');
        try {
          const storedData = localStorage.getItem('career-mentor-store');
          if (storedData) {
            const parsed = JSON.parse(storedData);
            const storedProfile = parsed?.enhancedProfile;
            
            // Check if stored profile is complete
            if (storedProfile && 
                storedProfile.achievements !== undefined &&
                storedProfile.badges !== undefined &&
                storedProfile.level !== undefined &&
                storedProfile.careerRecommendations !== undefined &&
                storedProfile.careerRecommendations.length > 0) {
              
              console.log('Found complete enhanced profile in localStorage, loading into store...');
              setEnhancedProfile(storedProfile);
              hasValidProfile = true;
            }
          }
        } catch (error) {
          console.error('Error checking localStorage for enhanced profile:', error);
        }
      }
    };
    
    // Load enhanced profile if not available
    if (!hasValidProfile) {
      loadEnhancedProfile();
    }
    
    // Only redirect if we definitely don't have a valid profile
    if (!hasValidProfile) {
      const token = localStorage.getItem('jwt');
      if (token) {
        // User is logged in but hasn't completed assessment
        console.log('No valid enhanced profile found, redirecting to assessment');
        toast.info('Please complete your career assessment first');
        navigate('/assessment');
      } else {
        // User not logged in
        console.log('No token found, redirecting to signin');
        navigate('/signin');
      }
      return;
    }

    // Set selected career from profile (use current enhanced profile or the one we just loaded)
    const currentProfile = enhancedProfile || (hasValidProfile ? JSON.parse(localStorage.getItem('career-mentor-store') || '{}')?.enhancedProfile : null);
    if (currentProfile) {
      setSelectedCareerId(currentProfile.selectedCareerPath);
    }
    
    // Load recommendations
    loadRecommendations();
  }, [enhancedProfile, navigate]);

  const loadRecommendations = async () => {
    if (!enhancedProfile) return;
    
    setIsLoading(true);
    try {
      const careerRecs = await CareerService.generateRecommendations(enhancedProfile);
      setRecommendations(careerRecs);
    } catch (error) {
      console.error('Failed to load career recommendations:', error);
      // Load fallback recommendations
      try {
        const fallbackRecs: CareerRecommendation[] = [];
        setRecommendations(fallbackRecs);
        toast.info('Loaded basic recommendations');
      } catch (fallbackError) {
        console.error('Failed to load fallback recommendations:', fallbackError);
        toast.error('Failed to load recommendations');
        setRecommendations([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectCareer = async (recommendation: CareerRecommendation) => {
    setSelectedCareerId(recommendation.id);
    
    if (enhancedProfile) {
      try {
        toast.loading('Setting up your career path...', { id: 'career-setup' });
        
        // Update profile with selected career
        const updatedProfile = {
          ...enhancedProfile,
          selectedCareerPath: recommendation.id,
          updatedAt: new Date()
        };
        
        setEnhancedProfile(updatedProfile);
        
        // Award gamification points
        const { useUserStore } = await import('../lib/stores/userStore');
        const store = useUserStore.getState();
        
        store.awardExperience(100, `Selected career path: ${recommendation.title}`);
        store.checkAndAwardAchievements('career_selected', { career: recommendation });
        store.updateMilestoneProgress();
        
        toast.success(`🎉 Career path set up successfully!`, { id: 'career-setup' });
        toast.info('Check out your personalized learning roadmap!');
        
        setTimeout(() => {
          navigate('/learning-roadmap');
        }, 2000);
        
      } catch (error) {
        console.error('Career selection failed:', error);
        toast.error('Failed to set up career path. Please try again.', { id: 'career-setup' });
      }
    } else {
      toast.error('Please complete your profile first');
      navigate('/career-assessment');
    }
  };

  const handleSaveCareer = (recommendation: CareerRecommendation) => {
    setSavedCareerIds(prev => {
      if (prev.includes(recommendation.id)) {
        toast.info(`Removed ${recommendation.title} from saved careers`);
        return prev.filter(id => id !== recommendation.id);
      } else {
        toast.success(`Saved ${recommendation.title} to your bookmarks`);
        return [...prev, recommendation.id];
      }
    });
  };

  const refreshRecommendations = () => {
    loadRecommendations();
    toast.info('Refreshing recommendations...');
  };

  if (!enhancedProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <NBCard className="p-8 text-center max-w-md">
          <User className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2">Complete Your Assessment</h3>
          <p className="text-gray-600 mb-4">Please complete the career assessment first to get personalized recommendations.</p>
          <NBButton onClick={() => navigate('/career-assessment')}>
            Start Assessment
          </NBButton>
        </NBCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <DotBackground>
        <></>
      </DotBackground>
      <GridBackgroundSmall>
        <></>
      </GridBackgroundSmall>
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Career Dashboard
            </h1>
            <p className="text-lg text-gray-600">
              Welcome back, {enhancedProfile.name}! Here's your personalized career guidance.
            </p>
          </div>
          
          <div className="flex gap-3 mt-4 md:mt-0">
            <NBButton 
              variant="primary"
              onClick={() => navigate('/career-path-generator')}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none hover:from-purple-600 hover:to-pink-600"
            >
              <GitBranch className="h-4 w-4 mr-2" />
              Build Personalised Career Roadmap
            </NBButton>
            <NBButton 
              variant="ghost"
              onClick={refreshRecommendations}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </NBButton>
            <NBButton onClick={() => navigate('/achievements')}>
              <Target className="h-4 w-4 mr-2" />
              Achievements
            </NBButton>
          </div>
        </div>

        {/* Confused About Career Section */}
        <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
          <div className="text-center">
            <HelpCircle className="h-8 w-8 mx-auto mb-3 text-blue-500" />
            <p className="text-sm text-gray-600 mb-4">Confused about your career?</p>
            <NBButton 
              variant="primary"
              onClick={() => navigate('/assessment')}
              className="bg-blue-500 text-white border-none hover:bg-blue-600"
            >
              Take Career Assessment
            </NBButton>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <NBCard className="p-6 text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-purple-500" />
            <div className="text-2xl font-bold text-purple-600">{recommendations.length}</div>
            <p className="text-sm text-gray-600">Career Matches</p>
          </NBCard>
          
          <NBCard className="p-6 text-center">
            <Bookmark className="h-8 w-8 mx-auto mb-2 text-pink-500" />
            <div className="text-2xl font-bold text-pink-600">{savedCareerIds.length}</div>
            <p className="text-sm text-gray-600">Saved Careers</p>
          </NBCard>
          
          <NBCard className="p-6 text-center">
            <BarChart3 className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <div className="text-2xl font-bold text-blue-600">{enhancedProfile.level}</div>
            <p className="text-sm text-gray-600">Current Level</p>
          </NBCard>
          
          <NBCard className="p-6 text-center">
            <Activity className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold text-green-600">{enhancedProfile.experiencePoints}</div>
            <p className="text-sm text-gray-600">Experience Points</p>
          </NBCard>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Career Recommendations */}
          <div className="lg:col-span-2">
            <NBCard className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">Career Recommendations</h2>
                <NBButton 
                  variant="ghost" 
                  onClick={() => navigate('/career-assessment')}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Update Preferences
                </NBButton>
              </div>
              
              <CareerRecommendationsList
                recommendations={recommendations}
                onSelectCareer={handleSelectCareer}
                onSaveCareer={handleSaveCareer}
                savedCareerIds={savedCareerIds}
                selectedCareerId={selectedCareerId}
              />
            </NBCard>
          </div>

          {/* Progress Dashboard */}
          <div>
            <NBCard className="p-6">
              <h2 className="text-xl font-semibold mb-4">Your Progress</h2>
              <ErrorBoundary fallback={
                <div className="text-center py-8 text-gray-500">
                  <p>Unable to load progress dashboard</p>
                  <p className="text-sm">Please try refreshing the page</p>
                </div>
              }>
                <ProgressDashboard />
              </ErrorBoundary>
              
              <div className="mt-6 space-y-3">
                <NBButton 
                  className="w-full" 
                  onClick={() => navigate('/learning-roadmap')}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Learning Roadmap
                </NBButton>
                
                <NBButton 
                  variant="ghost" 
                  className="w-full" 
                  onClick={() => navigate('/resume-upload')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Resume Analysis
                </NBButton>
              </div>
            </NBCard>
          </div>
        </div>
      </div>
    </div>
  );
};