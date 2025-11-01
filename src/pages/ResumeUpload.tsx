import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../lib/stores/userStore';
import { FileUploader } from '../components/resume/FileUploader';
import { NBButton } from '../components/NBButton';
import { NBCard } from '../components/NBCard';
import { ArrowLeft, Upload, Loader2, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { EnhancedResumeVersion } from '../lib/types';
import { GeminiService } from '../lib/services/geminiService';
import { DepartmentService } from '../lib/services/departmentService';

export const ResumeUpload: React.FC = () => {
  const navigate = useNavigate();
  const { enhancedProfile, setEnhancedProfile } = useUserStore();

  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [useDefaultJobDescription, setUseDefaultJobDescription] = useState(false);
  const [selectedJobRole, setSelectedJobRole] = useState('');
  const [availableJobs, setAvailableJobs] = useState<any[]>([]);

  // Check authentication on component mount
  useEffect(() => {
    if (!enhancedProfile) {
      toast.info('Please complete your career assessment first');
      navigate('/assessment');
      return;
    }

    // Load available job roles
    const allJobs = DepartmentService.searchJobs('');
    setAvailableJobs(allJobs);

    // Auto-fill job title from user's career recommendation
    const userCareerRole = enhancedProfile.careerRecommendations?.[0]?.title;
    if (userCareerRole) {
      setSelectedJobRole(userCareerRole);
    }
  }, [enhancedProfile, navigate]);

  const generateJobDescription = async (jobTitle: string): Promise<string> => {
    try {
      const prompt = `Generate a comprehensive, industry-standard job description for a ${jobTitle} position. 

Include:
1. Job Summary (2-3 sentences)
2. Key Responsibilities (5-7 bullet points)
3. Required Skills and Qualifications (technical and soft skills)
4. Preferred Qualifications
5. Experience Level requirements

Make it realistic and based on current industry standards. Format it as a professional job posting.`;

      const response = await GeminiService.generateContent(prompt);
      return response;
    } catch (error) {
      console.error('Error generating job description:', error);
      return `Job Description for ${jobTitle}

We are seeking a talented ${jobTitle} to join our dynamic team. The ideal candidate will have strong technical skills and experience in relevant technologies.

Key Responsibilities:
• Develop and maintain high-quality software solutions
• Collaborate with cross-functional teams
• Participate in code reviews and technical discussions
• Contribute to system architecture and design decisions
• Stay updated with industry best practices

Required Skills:
• Strong programming skills
• Problem-solving abilities
• Team collaboration
• Communication skills
• Attention to detail

Experience: 2+ years of relevant experience preferred.`;
    }
  };

  const handleJobRoleChange = async (jobTitle: string) => {
    setSelectedJobRole(jobTitle);
    
    if (useDefaultJobDescription && jobTitle) {
      setStatusText('Generating job description...');
      try {
        const generatedDescription = await generateJobDescription(jobTitle);
        const jobDescriptionTextarea = document.getElementById('jobDescription') as HTMLTextAreaElement;
        if (jobDescriptionTextarea) {
          jobDescriptionTextarea.value = generatedDescription;
        }
      } catch (error) {
        toast.error('Failed to generate job description');
      } finally {
        setStatusText('');
      }
    }
  };

  const handleUseDefaultToggle = async (checked: boolean) => {
    setUseDefaultJobDescription(checked);
    
    if (checked && selectedJobRole) {
      setStatusText('Generating job description...');
      try {
        const generatedDescription = await generateJobDescription(selectedJobRole);
        const jobDescriptionTextarea = document.getElementById('jobDescription') as HTMLTextAreaElement;
        if (jobDescriptionTextarea) {
          jobDescriptionTextarea.value = generatedDescription;
        }
      } catch (error) {
        toast.error('Failed to generate job description');
      } finally {
        setStatusText('');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!file) {
      toast.error('Please select a resume file');
      return;
    }

    const formData = new FormData(e.currentTarget);
    const companyName = formData.get('companyName') as string;
    const jobTitle = formData.get('jobTitle') as string;
    let jobDescription = formData.get('jobDescription') as string;

    if (!companyName || !jobTitle) {
      toast.error('Please fill in company name and job title');
      return;
    }

    // Generate job description if using default and not provided
    if (useDefaultJobDescription && !jobDescription) {
      try {
        jobDescription = await generateJobDescription(jobTitle);
      } catch (error) {
        toast.error('Failed to generate job description');
        return;
      }
    }

    if (!jobDescription) {
      toast.error('Please provide a job description or use the default option');
      return;
    }

    setIsAnalyzing(true);
    setStatusText('Preparing analysis...');

    try {
      // Create resume analysis object
      const analysisId = `resume_${Date.now()}`;
      const resumeAnalysis: EnhancedResumeVersion = {
        id: analysisId,
        name: `${companyName} - ${jobTitle}`,
        description: `Resume analysis for ${jobTitle} at ${companyName}`,
        resumeData: {
          file: file,
          extractedText: '', // Will be populated by AI
          extractedInfo: {
            skills: [],
            experience: [],
            education: []
          }
        },
        companyName,
        jobTitle,
        jobDescription,
        resumeUrl: URL.createObjectURL(file),
        createdAt: new Date(),
        isActive: true,
        status: 'analyzing'
      };

      setStatusText('Analyzing resume content...');

      // Simulate AI analysis (replace with actual AI service call)
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Mock feedback (replace with actual AI analysis)
      const mockFeedback = {
        overallScore: Math.floor(Math.random() * 30) + 70, // 70-100
        ATS: {
          score: Math.floor(Math.random() * 20) + 75,
          tips: [
            { type: "good" as const, tip: "Good use of industry keywords" },
            { type: "improve" as const, tip: "Add more quantifiable achievements" }
          ]
        },
        toneAndStyle: {
          score: Math.floor(Math.random() * 25) + 70,
          tips: [
            {
              type: "good" as const,
              tip: "Professional tone maintained",
              explanation: "Your resume maintains a professional and confident tone throughout."
            },
            {
              type: "improve" as const,
              tip: "Use stronger action verbs",
              explanation: "Replace weak verbs like 'responsible for' with stronger alternatives like 'managed', 'led', or 'implemented'."
            }
          ]
        },
        content: {
          score: Math.floor(Math.random() * 25) + 65,
          tips: [
            {
              type: "good" as const,
              tip: "Relevant experience highlighted",
              explanation: "Your work experience aligns well with the target role."
            },
            {
              type: "improve" as const,
              tip: "Add more quantified results",
              explanation: "Include specific numbers, percentages, or metrics to demonstrate your impact."
            }
          ]
        },
        structure: {
          score: Math.floor(Math.random() * 20) + 75,
          tips: [
            {
              type: "good" as const,
              tip: "Clear section organization",
              explanation: "Your resume sections are well-organized and easy to follow."
            }
          ]
        },
        skills: {
          score: Math.floor(Math.random() * 25) + 70,
          tips: [
            {
              type: "improve" as const,
              tip: "Include more technical skills",
              explanation: "Add specific technical skills mentioned in the job description."
            }
          ]
        }
      };

      resumeAnalysis.feedback = mockFeedback;
      resumeAnalysis.status = 'completed';

      // Update user profile with resume analysis
      const currentProfile = enhancedProfile || {
        id: `profile_${Date.now()}`,
        resumeVersions: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const updatedProfile = {
        ...currentProfile,
        resumeVersions: [...(currentProfile.resumeVersions || []), resumeAnalysis],
        updatedAt: new Date()
      };
      // ensure the object matches EnhancedUserProfile shape
      const { ensureEnhancedProfile } = await import('../lib/utils/profileHelpers')
      setEnhancedProfile(ensureEnhancedProfile(updatedProfile));

      setStatusText('Analysis complete! Redirecting...');
      toast.success('Resume analysis completed successfully!');

      // Navigate to results page
      setTimeout(() => {
        navigate(`/resume-analysis/${analysisId}`);
      }, 1000);

    } catch (error) {
      console.error('Resume analysis failed:', error);
      setStatusText('');
      setIsAnalyzing(false);
      toast.error('Failed to analyze resume. Please try again.');
    }
  };

  return (
    <div className="min-h-screen">
      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-24">{/* Added more top padding to account for navbar */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">AI Resume Analyzer</h1>
          <p className="text-muted-foreground">
            Get instant feedback and ATS optimization suggestions
          </p>
        </div>

        {isAnalyzing ? (
          <NBCard className="p-8 text-center">
            <div className="space-y-6">
              <Loader2 className="w-16 h-16 mx-auto text-primary animate-spin" />
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  Analyzing Your Resume
                </h2>
                <p className="text-muted-foreground">{statusText}</p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-primary h-2 rounded-full animate-pulse" style={{ width: '60%' }} />
              </div>
            </div>
          </NBCard>
        ) : (
          <NBCard className="p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Upload Your Resume for Analysis
              </h2>
              <p className="text-muted-foreground">
                Get AI-powered feedback on your resume's ATS compatibility, content quality,
                and optimization suggestions tailored to your target job.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Job Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-foreground mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    id="companyName"
                    name="companyName"
                    placeholder="e.g., Google, Microsoft, Apple"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="jobTitle" className="block text-sm font-medium text-foreground mb-2">
                    Job Title
                    {enhancedProfile?.careerRecommendations?.[0]?.title && (
                      <span className="text-sm text-gray-500 ml-2">
                        (Auto-filled from your assessment)
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <select
                      id="jobTitle"
                      name="jobTitle"
                      value={selectedJobRole}
                      onChange={(e) => handleJobRoleChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent appearance-none bg-white"
                      required
                    >
                      <option value="">Select a job role</option>
                      {availableJobs.map((job) => (
                        <option key={job.id} value={job.title}>
                          {job.title}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                  <input
                    type="text"
                    placeholder="Or type a custom job title"
                    value={selectedJobRole}
                    onChange={(e) => setSelectedJobRole(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent mt-2"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="jobDescription" className="block text-sm font-medium text-foreground">
                    Job Description
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="useDefault"
                      checked={useDefaultJobDescription}
                      onChange={(e) => handleUseDefaultToggle(e.target.checked)}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor="useDefault" className="text-sm text-gray-600">
                      Use AI-generated default
                    </label>
                  </div>
                </div>
                <textarea
                  id="jobDescription"
                  name="jobDescription"
                  rows={8}
                  placeholder={useDefaultJobDescription 
                    ? "AI will generate a job description based on the selected role..." 
                    : "Paste the specific job description here for more targeted feedback..."
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  disabled={useDefaultJobDescription}
                />
                {statusText && (
                  <p className="text-sm text-blue-600 mt-1">{statusText}</p>
                )}
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Resume File
                </label>
                <FileUploader onFileSelect={setFile} />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <NBButton
                  type="submit"
                  disabled={!file}
                  className="flex items-center space-x-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>Analyze Resume</span>
                </NBButton>
              </div>
            </form>
          </NBCard>
        )}
      </main>
    </div>
  );
};