import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LearningResourcesDashboard } from '@/components/learning/LearningResourcesDashboard';
import { useUserStore } from '@/lib/stores/userStore';
import { CAREER_DOMAINS } from '@/lib/data/careerDomainsData';

export const LearningResourcesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { enhancedProfile } = useUserStore();
  
  // Get parameters from URL or profile
  const domainParam = searchParams.get('domain');
  const subfieldParam = searchParams.get('subfield');
  const roleParam = searchParams.get('role');

  // Determine domain, subfield, and role from profile or URL params
  const [domain, setDomain] = useState<string>('');
  const [subfield, setSubfield] = useState<string>('');
  const [targetRole, setTargetRole] = useState<string>('');

  useEffect(() => {
    // Priority: URL params > profile data > defaults
    let determinedDomain = domainParam;
    let determinedSubfield = subfieldParam;
    let determinedRole = roleParam;

    if (!determinedDomain && enhancedProfile) {
      // Try to determine domain from career recommendations
      const primaryCareer = enhancedProfile.careerRecommendations?.[0]?.primaryCareer;
      if (primaryCareer) {
        if (primaryCareer.toLowerCase().includes('software') || 
            primaryCareer.toLowerCase().includes('developer') ||
            primaryCareer.toLowerCase().includes('engineer')) {
          determinedDomain = 'technology-computer-science';
          determinedSubfield = 'software-development';
        } else if (primaryCareer.toLowerCase().includes('data') ||
                   primaryCareer.toLowerCase().includes('analyst')) {
          determinedDomain = 'technology-computer-science';
          determinedSubfield = 'data-science-analytics';
        } else if (primaryCareer.toLowerCase().includes('business') ||
                   primaryCareer.toLowerCase().includes('management')) {
          determinedDomain = 'business-management';
          determinedSubfield = 'business-analysis';
        } else if (primaryCareer.toLowerCase().includes('design') ||
                   primaryCareer.toLowerCase().includes('ux')) {
          determinedDomain = 'design-creative';
          determinedSubfield = 'user-experience-design';
        }
        
        if (!determinedRole) {
          determinedRole = primaryCareer;
        }
      }
      
      // Fallback to career interest
      if (!determinedDomain && enhancedProfile.careerInterest) {
        const interest = enhancedProfile.careerInterest.toLowerCase();
        if (interest.includes('technology') || interest.includes('software')) {
          determinedDomain = 'technology-computer-science';
        } else if (interest.includes('business')) {
          determinedDomain = 'business-management';
        } else if (interest.includes('design')) {
          determinedDomain = 'design-creative';
        }
      }
    }

    // Set defaults if still not determined
    setDomain(determinedDomain || 'technology-computer-science');
    setSubfield(determinedSubfield || '');
    setTargetRole(determinedRole || '');
  }, [domainParam, subfieldParam, roleParam, enhancedProfile]);

  const getDomainDisplayName = (domainId: string): string => {
    const domainData = CAREER_DOMAINS.find(d => d.id === domainId);
    return domainData?.name || domainId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  if (!enhancedProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">
            Complete Your Assessment
          </h2>
          <p className="text-gray-500 mb-4">
            Please complete your career assessment to access personalized learning resources.
          </p>
          <Button onClick={() => navigate('/assessment')}>
            Start Assessment
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={handleBackToDashboard}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
              
              <div className="h-6 w-px bg-gray-300" />
              
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Learning Resources
                </h1>
                <p className="text-sm text-gray-600">
                  {getDomainDisplayName(domain)}
                  {subfield && ` • ${subfield.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                Welcome, {enhancedProfile.name}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <LearningResourcesDashboard
          domain={domain}
          subfield={subfield}
          targetRole={targetRole}
        />
      </div>
    </div>
  );
};