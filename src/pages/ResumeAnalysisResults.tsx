import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUserStore } from '../lib/stores/userStore';
import { ResumeSummary } from '../components/resume/ResumeSummary';
import { ATSScore } from '../components/resume/ATSScore';
import { DetailedFeedback } from '../components/resume/DetailedFeedback';
import { ResumeOptimizerService } from '../lib/services/resumeOptimizerService';
import { NBButton } from '../components/NBButton';
import { NBCard } from '../components/NBCard';
import { ArrowLeft, Download, FileText, Building, Briefcase, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { EnhancedResumeVersion } from '../lib/types';

export const ResumeAnalysisResults: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { enhancedProfile } = useUserStore();
  const [isGeneratingOptimized, setIsGeneratingOptimized] = useState(false);

  // Find the resume analysis
  const resumeAnalysis = enhancedProfile?.resumeVersions?.find(
    version => version.id === id
  ) as EnhancedResumeVersion | undefined;

  if (!resumeAnalysis) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <NBCard className="p-8 text-center max-w-md">
          <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Resume Analysis Not Found
          </h2>
          <p className="text-muted-foreground mb-4">
            The requested resume analysis could not be found.
          </p>
          <NBButton onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </NBButton>
        </NBCard>
      </div>
    );
  }

  if (!resumeAnalysis.feedback) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <NBCard className="p-8 text-center max-w-md">
          <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Analysis In Progress
          </h2>
          <p className="text-muted-foreground mb-4">
            Your resume is still being analyzed. Please check back in a few moments.
          </p>
          <NBButton onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </NBButton>
        </NBCard>
      </div>
    );
  }

  const handleDownloadResume = () => {
    if (resumeAnalysis.resumeUrl) {
      const link = document.createElement('a');
      link.href = resumeAnalysis.resumeUrl;
      link.download = `${resumeAnalysis.companyName}_${resumeAnalysis.jobTitle}_Resume.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Resume downloaded successfully!');
    }
  };

  const handleDownloadOptimizedResume = async () => {
    if (!resumeAnalysis.feedback) {
      toast.error('No feedback available to optimize resume');
      return;
    }

    setIsGeneratingOptimized(true);
    try {
      toast.loading('Generating optimized resume...', { id: 'optimize' });
      
      // Generate optimized resume content
      const optimizedContent = await ResumeOptimizerService.generateOptimizedResume(
        'Original resume content', // In a real app, you'd have the original content
        resumeAnalysis.feedback,
        resumeAnalysis.companyName || 'Target Company',
        resumeAnalysis.jobTitle || 'Target Position'
      );

      // Download the optimized resume
      ResumeOptimizerService.downloadOptimizedResume(
        optimizedContent,
        resumeAnalysis.companyName || 'Target_Company',
        resumeAnalysis.jobTitle || 'Target_Position'
      );

      toast.success('Optimized resume downloaded successfully!', { id: 'optimize' });
    } catch (error) {
      console.error('Error generating optimized resume:', error);
      toast.error('Failed to generate optimized resume. Please try again.', { id: 'optimize' });
    } finally {
      setIsGeneratingOptimized(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Resume Analysis Results</h1>
              <div className="flex items-center space-x-4 mt-1">
                {resumeAnalysis.companyName && (
                  <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                    <Building className="w-4 h-4" />
                    <span>{resumeAnalysis.companyName}</span>
                  </div>
                )}
                {resumeAnalysis.jobTitle && (
                  <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                    <Briefcase className="w-4 h-4" />
                    <span>{resumeAnalysis.jobTitle}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-3">
              <NBButton
                onClick={handleDownloadOptimizedResume}
                disabled={isGeneratingOptimized}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none hover:from-purple-600 hover:to-pink-600 flex items-center space-x-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isGeneratingOptimized ? 'Generating...' : 'Download Optimized Resume'}</span>
              </NBButton>
              <NBButton
                variant="secondary"
                onClick={handleDownloadResume}
                className="flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Download Original</span>
              </NBButton>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Resume Preview */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <NBCard className="p-4">
                <h3 className="font-semibold text-foreground mb-4">Resume Preview</h3>
                {resumeAnalysis.resumeUrl ? (
                  <div className="aspect-[8.5/11] bg-gray-100 rounded-lg overflow-hidden">
                    <iframe
                      src={resumeAnalysis.resumeUrl}
                      className="w-full h-full"
                      title="Resume Preview"
                    />
                  </div>
                ) : (
                  <div className="aspect-[8.5/11] bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <FileText className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">Resume preview not available</p>
                    </div>
                  </div>
                )}
              </NBCard>
            </div>
          </div>

          {/* Analysis Results */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overall Summary */}
            <ResumeSummary feedback={resumeAnalysis.feedback} />

            {/* ATS Score Highlight */}
            <ATSScore 
              score={resumeAnalysis.feedback.ATS.score}
              suggestions={resumeAnalysis.feedback.ATS.tips}
            />

            {/* Detailed Feedback */}
            <DetailedFeedback feedback={resumeAnalysis.feedback} />
          </div>
        </div>
      </main>
    </div>
  );
};