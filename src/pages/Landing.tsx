import { Link } from 'react-router-dom';
import { NBCard } from '../components/NBCard';
import { NBButton } from '../components/NBButton';
import { BGPattern } from '../components/ui/bg-pattern';
import { ArrowRight, Target, Map, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

export const Landing = () => {
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  return (
    <div 
      className="min-h-screen light-rays-bg"
      style={{
        backgroundImage: "url('/bg-image.svg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <style jsx>{`
        .custom-button {
          width: 200px;
          height: 60px;
          background-color: white;
          color: #568fa6;
          position: relative;
          overflow: hidden;
          font-size: 16px;
          letter-spacing: 1px;
          font-weight: 500;
          text-transform: uppercase;
          transition: all 0.3s ease;
          cursor: pointer;
          border: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }
        
        .custom-button:before, .custom-button:after {
          content: "";
          position: absolute;
          width: 0;
          height: 2px;
          background-color: #44d8a4;
          transition: all 0.3s cubic-bezier(0.35, 0.1, 0.25, 1);
        }
        
        .custom-button:before {
          right: 0;
          top: 0;
          transition: all 0.5s cubic-bezier(0.35, 0.1, 0.25, 1);
        }
        
        .custom-button:after {
          left: 0;
          bottom: 0;
        }
        
        .custom-button .button-span {
          width: 100%;
          height: 100%;
          position: absolute;
          left: 0;
          top: 0;
          margin: 0;
          padding: 0;
          z-index: 1;
        }
        
        .custom-button .button-span:before, .custom-button .button-span:after {
          content: "";
          position: absolute;
          width: 2px;
          height: 0;
          background-color: #44d8a4;
          transition: all 0.3s cubic-bezier(0.35, 0.1, 0.25, 1);
        }
        
        .custom-button .button-span:before {
          right: 0;
          top: 0;
          transition: all 0.5s cubic-bezier(0.35, 0.1, 0.25, 1);
        }
        
        .custom-button .button-span:after {
          left: 0;
          bottom: 0;
        }
        
        .custom-button .button-text {
          padding: 0;
          margin: 0;
          transition: all 0.4s cubic-bezier(0.35, 0.1, 0.25, 1);
          position: absolute;
          width: 100%;
          height: 100%;
        }
        
        .custom-button .button-text:before, .custom-button .button-text:after {
          position: absolute;
          width: 100%;
          transition: all 0.4s cubic-bezier(0.35, 0.1, 0.25, 1);
          z-index: 1;
          left: 0;
        }
        
        .custom-button .button-text:before {
          content: "Start Journey";
          top: 50%;
          transform: translateY(-50%);
        }
        
        .custom-button .button-text:after {
          content: "Let's Go!";
          top: 150%;
          color: #44d8a4;
        }
        
        .custom-button:hover:before, .custom-button:hover:after {
          width: 100%;
        }
        
        .custom-button:hover .button-span {
          z-index: 1;
        }
        
        .custom-button:hover .button-span:before, .custom-button:hover .button-span:after {
          height: 100%;
        }
        
        .custom-button:hover .button-text:before {
          top: -50%;
          transform: rotate(5deg);
        }
        
        .custom-button:hover .button-text:after {
          top: 50%;
          transform: translateY(-50%);
        }
      `}</style>
      {/* Hero Section */}
      <section className="py-32 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10"></div>
        <BGPattern variant="grid" mask="fade-edges" size={40} fill="rgba(139, 92, 246, 0.08)" />
        <BGPattern variant="dots" mask="fade-center" size={60} fill="rgba(34, 197, 94, 0.05)" />
        <div className="max-w-7xl mx-auto text-center relative">
          
          {/* Main Title */}
          <div className="mb-12">
            <h1 className="text-6xl md:text-8xl font-bold text-gray-800 mb-6">
              SmartApply AI
            </h1>
            <p className="text-2xl md:text-3xl text-gray-600 font-light mb-8">
              Your AI-Powered Career Mentor
            </p>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground leading-tight">
              Map your future, one skill at a time
            </h2>
          </div>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Get personalized career advice powered by AI. Upload your resume for automatic 
            skill extraction, visualize your career path, discover new opportunities, and 
            bridge skill gaps with our interactive flowchart.
          </p>
          <div className="flex justify-center">
            <Link to="/details">
              <button className="custom-button">
                <span className="button-span"></span>
                <div className="button-text"></div>
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-card/30 backdrop-blur-sm relative border-t border-border/20">
        <BGPattern variant="dots" mask="fade-y" size={24} fill="rgba(34, 197, 94, 0.06)" />
        <div className="max-w-7xl mx-auto relative">
          <h2 className="text-4xl font-bold text-foreground text-center mb-16">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <NBCard className="text-center group hover:scale-105 transition-all duration-300 hover:shadow-xl border-border/50 bg-card/50 backdrop-blur-sm p-8">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <span className="text-3xl font-bold text-white">1</span>
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors">
                Enter Your Details
              </h3>
              <p className="text-muted-foreground">
                Tell us about your skills, education, interests, and career goals. 
                Upload your resume for automatic skill extraction and experience analysis. 
                The more details you provide, the better our recommendations.
              </p>
            </NBCard>

            <NBCard className="text-center group hover:scale-105 transition-all duration-300 hover:shadow-xl border-border/50 bg-card/50 backdrop-blur-sm p-8">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <span className="text-3xl font-bold text-primary-foreground">2</span>
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors">
                See Your Career Path
              </h3>
              <p className="text-muted-foreground">
                Get a personalized flowchart showing your recommended career journey, 
                including courses, internships, and job opportunities.
              </p>
            </NBCard>

            <NBCard className="text-center group hover:scale-105 transition-all duration-300 hover:shadow-xl border-border/50 bg-card/50 backdrop-blur-sm p-8">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <span className="text-3xl font-bold text-white">3</span>
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors">
                Explore Opportunities
              </h3>
              <p className="text-muted-foreground">
                Discover alternative career paths, skill requirements, and real-world 
                opportunities that match your profile and interests.
              </p>
            </NBCard>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 relative">
        <BGPattern variant="grid" mask="fade-center" size={32} fill="rgba(139, 92, 246, 0.05)" />
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-accent/10 to-primary/10 border border-accent/20 px-6 py-3 rounded-full text-sm font-medium text-accent mb-8">
              🙋 FREQUENTLY ASKED QUESTIONS
            </div>
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Got Questions? We've Got Answers
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Everything you need to know about SmartApply AI
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-4">
            {[
              {
                question: "Q1. How does SmartApply AI calculate the Resume–Job Fit Score?",
                answer: "SmartApply AI uses advanced Natural Language Processing (NLP) and embeddings to compare your resume with the job description. It looks at skills, keywords, experience, and role-specific context to generate a match score."
              },
              {
                question: "Q2. Does SmartApply AI guarantee I'll get shortlisted or hired?", 
                answer: "No. The tool provides data-driven insights to improve your resume, but final hiring decisions depend on recruiters, interviews, and company-specific factors."
              },
              {
                question: "Q3. What file formats are supported for resumes?",
                answer: "Currently, we support PDF and DOCX formats. Other formats (like images or plain text) may be added in future updates."
              },
              {
                question: "Q4. Will SmartApply AI rewrite my resume automatically?",
                answer: "Not directly. Instead, it highlights what to add or adjust (e.g., missing skills, keyword density) so you can make informed edits while keeping your resume authentic."
              },
              {
                question: "Q5. Is my resume data safe?",
                answer: "Yes. Your resume and job description are only processed to generate insights — they are not stored or shared with third parties."
              },
              {
                question: "Q6. What makes SmartApply AI different from other resume tools?",
                answer: "Unlike generic resume builders, SmartApply AI is focused on personalized job-fit analysis using AI embeddings and vector search — helping you apply smarter, not just faster."
              },
              {
                question: "Q7. Is this tool free to use?",
                answer: "The basic version is free. Premium features like detailed keyword analysis, tailored resume drafts, and recruiter insights may be part of a paid plan in the future."
              }
            ].map((faq, index) => (
              <NBCard key={index} className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-primary/5 transition-colors"
                >
                  <h3 className="text-lg font-bold text-foreground">{faq.question}</h3>
                  <div className="ml-4 flex-shrink-0">
                    {expandedFAQ === index ? (
                      <ChevronUp className="w-5 h-5 text-primary" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                </button>
                {expandedFAQ === index && (
                  <div className="px-6 pb-6">
                    <p className="text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </NBCard>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/20 bg-card/50 backdrop-blur-sm py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-accent rounded-lg flex items-center justify-center">
                <Target className="w-4 h-4 text-accent-foreground" />
              </div>
              <span className="text-foreground font-bold">© 2025 SmartApply AI (demo)</span>
            </div>
            <div className="flex space-x-6">
              <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
                About
              </Link>
              <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
                FAQ
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
