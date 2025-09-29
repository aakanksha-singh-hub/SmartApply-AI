import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NBCard } from '../components/NBCard';
import { NBButton } from '../components/NBButton';
import { DepartmentService, Department, Subdepartment, RelatedJob } from '../lib/services/departmentService';
import { ArrowLeft, Briefcase, ChevronRight } from 'lucide-react';

export const CareerAssessment = () => {
  const navigate = useNavigate();
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [selectedSubdepartment, setSelectedSubdepartment] = useState<Subdepartment | null>(null);
  
  const departments = DepartmentService.getDepartments();

  const handleDepartmentSelect = (department: Department) => {
    setSelectedDepartment(department);
    setSelectedSubdepartment(null);
  };

  const handleSubdepartmentSelect = (subdepartment: Subdepartment) => {
    setSelectedSubdepartment(subdepartment);
  };

  const handleBack = () => {
    if (selectedSubdepartment) {
      setSelectedSubdepartment(null);
    } else if (selectedDepartment) {
      setSelectedDepartment(null);
    }
  };

  const handleJobSelect = (job: RelatedJob) => {
    // Store the selected career for later use and navigate to details page
    localStorage.setItem('selectedCareer', JSON.stringify({
      title: job.title,
      description: job.description,
      department: selectedDepartment?.name,
      subdepartment: selectedSubdepartment?.name,
      averageSalary: job.averageSalary,
      keySkills: job.keySkills
    }));
    
    navigate('/details');
  };

  if (selectedSubdepartment) {
    return (
      <div className="min-h-screen pt-20">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <NBCard className="p-8">
            <button
              onClick={handleBack}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to {selectedDepartment?.name}</span>
            </button>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{selectedSubdepartment.name}</h1>
            <p className="text-gray-600 text-lg mb-6">{selectedSubdepartment.description}</p>

            <div className="grid gap-6">
              {selectedSubdepartment.relatedJobs.map((job) => (
                <div key={job.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{job.title}</h3>
                  <p className="text-gray-600 mb-4">{job.description}</p>
                  
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <span className="text-green-600 font-semibold text-lg">{job.averageSalary}</span>
                      <p className="text-sm text-gray-500">Average Salary</p>
                    </div>
                    <div>
                      <span className="text-blue-600 font-semibold">{job.growthOutlook}</span>
                      <p className="text-sm text-gray-500">Growth Outlook</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Key Skills Required</h4>
                    <div className="flex flex-wrap gap-2">
                      {job.keySkills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">Education: {job.educationLevel}</p>
                      <p className="text-sm text-gray-600">Experience: {job.experienceLevel}</p>
                    </div>
                    <NBButton onClick={() => handleJobSelect(job)}>
                      <Briefcase className="w-4 h-4 mr-2" />
                      Choose Career
                    </NBButton>
                  </div>
                </div>
              ))}
            </div>
          </NBCard>
        </div>
      </div>
    );
  }

  if (selectedDepartment) {
    return (
      <div className="min-h-screen pt-20">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <NBCard className="p-8">
            <button
              onClick={handleBack}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Departments</span>
            </button>
            
            <div className="text-center mb-8">
              <div className="text-4xl mb-4">{selectedDepartment.icon}</div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{selectedDepartment.name}</h1>
              <p className="text-gray-600 text-lg">{selectedDepartment.description}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {selectedDepartment.subdepartments.map((subdepartment) => (
                <button
                  key={subdepartment.id}
                  onClick={() => handleSubdepartmentSelect(subdepartment)}
                  className="text-left p-6 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-lg transition-all"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">{subdepartment.name}</h3>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                  <p className="text-gray-600 mb-3">{subdepartment.description}</p>
                  <span className="text-blue-600 text-sm">
                    {subdepartment.relatedJobs.length} career options
                  </span>
                </button>
              ))}
            </div>
          </NBCard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <NBCard className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-blue-900 mb-4" style={{fontFamily: 'Playfair Display, serif'}}>
              Career Discovery
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Explore different career departments and discover opportunities that match your interests.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {departments.map((department) => (
              <button
                key={department.id}
                onClick={() => handleDepartmentSelect(department)}
                className="text-left p-8 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-xl transition-all"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div>
                    <h3 className="text-2xl font-semibold text-gray-900">{department.name}</h3>
                    <p className="text-gray-600">{department.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-blue-800">
                  <Briefcase className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {department.subdepartments.length} specializations
                  </span>
                </div>
              </button>
            ))}
          </div>
        </NBCard>
      </div>
    </div>
  );
};
