import React, { useState } from 'react';
import { useDomainSearch, useJobRoleSearch } from '../lib/hooks/useCareerDomains';
import { ExperienceLevel } from '../lib/types/careerDomainTypes';

interface CareerDomainSearchProps {
  onDomainSelect?: (domainId: string) => void;
  onJobRoleSelect?: (jobRole: string) => void;
  selectedDomain?: string;
}

/**
 * Career Domain Search Component
 * Provides search functionality for career domains and job roles
 */
export const CareerDomainSearch: React.FC<CareerDomainSearchProps> = ({
  onDomainSelect,
  onJobRoleSelect,
  selectedDomain
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExperienceLevel, setSelectedExperienceLevel] = useState<ExperienceLevel>('entry');
  
  // Domain search hook
  const {
    searchResults,
    isSearching,
    searchError,
    updateFilters,
    resetFilters
  } = useDomainSearch();

  // Job role search hook
  const {
    query: jobRoleQuery,
    setQuery: setJobRoleQuery,
    results: jobRoleResults,
    isSearching: isSearchingJobRoles
  } = useJobRoleSearch(selectedDomain);

  // Handle search query change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    updateFilters({ query });
  };

  // Handle experience level change
  const handleExperienceLevelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const level = e.target.value as ExperienceLevel;
    setSelectedExperienceLevel(level);
    updateFilters({ experienceLevels: [level] });
  };

  // Handle domain selection
  const handleDomainSelect = (domainId: string) => {
    onDomainSelect?.(domainId);
  };

  // Handle job role selection
  const handleJobRoleSelect = (jobRole: string) => {
    onJobRoleSelect?.(jobRole);
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchQuery('');
    setJobRoleQuery('');
    resetFilters();
  };

  return (
    <div className="career-domain-search space-y-6">
      {/* Search Header */}
      <div className="search-header">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Explore Career Domains
        </h2>
        <p className="text-gray-600 mb-6">
          Search through 15+ comprehensive career domains to find your perfect career path.
        </p>
      </div>

      {/* Search Controls */}
      <div className="search-controls grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search Input */}
        <div className="search-input">
          <label htmlFor="domain-search" className="block text-sm font-medium text-gray-700 mb-2">
            Search Domains & Careers
          </label>
          <input
            id="domain-search"
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="e.g., software development, data science, design..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Experience Level Filter */}
        <div className="experience-filter">
          <label htmlFor="experience-level" className="block text-sm font-medium text-gray-700 mb-2">
            Experience Level
          </label>
          <select
            id="experience-level"
            value={selectedExperienceLevel}
            onChange={handleExperienceLevelChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="internship">Internship</option>
            <option value="entry">Entry Level</option>
            <option value="mid">Mid Level</option>
            <option value="senior">Senior Level</option>
            <option value="executive">Executive</option>
          </select>
        </div>

        {/* Clear Button */}
        <div className="clear-button flex items-end">
          <button
            onClick={handleClearSearch}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Clear Search
          </button>
        </div>
      </div>

      {/* Search Results */}
      <div className="search-results">
        {/* Loading State */}
        {isSearching && (
          <div className="loading text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Searching career domains...</p>
          </div>
        )}

        {/* Error State */}
        {searchError && (
          <div className="error bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">Error: {searchError}</p>
          </div>
        )}

        {/* Results */}
        {!isSearching && !searchError && searchResults.results.length > 0 && (
          <div className="results">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Search Results ({searchResults.totalCount})
            </h3>
            <div className="results-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResults.results.map((result) => (
                <div
                  key={`${result.type}-${result.id}`}
                  className="result-card bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => {
                    if (result.type === 'domain') {
                      handleDomainSelect(result.id);
                    }
                  }}
                >
                  <div className="result-header flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{result.title}</h4>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      result.type === 'domain' ? 'bg-blue-100 text-blue-800' :
                      result.type === 'subfield' ? 'bg-green-100 text-green-800' :
                      result.type === 'career' ? 'bg-purple-100 text-purple-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {result.type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{result.description}</p>
                  {result.parentDomain && (
                    <p className="text-xs text-gray-500">
                      Domain: {result.parentDomain}
                    </p>
                  )}
                  {result.matchedKeywords.length > 0 && (
                    <div className="matched-keywords mt-2">
                      <p className="text-xs text-gray-500 mb-1">Matched keywords:</p>
                      <div className="flex flex-wrap gap-1">
                        {result.matchedKeywords.slice(0, 3).map((keyword) => (
                          <span
                            key={keyword}
                            className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {!isSearching && !searchError && searchQuery && searchResults.results.length === 0 && (
          <div className="no-results text-center py-8">
            <p className="text-gray-600 mb-4">No results found for "{searchQuery}"</p>
            {searchResults.suggestions.length > 0 && (
              <div className="suggestions">
                <p className="text-sm text-gray-500 mb-2">Try searching for:</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {searchResults.suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => {
                        setSearchQuery(suggestion);
                        updateFilters({ query: suggestion });
                      }}
                      className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Job Role Search (when domain is selected) */}
      {selectedDomain && (
        <div className="job-role-search border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Search Job Roles
          </h3>
          <div className="job-role-input mb-4">
            <input
              type="text"
              value={jobRoleQuery}
              onChange={(e) => setJobRoleQuery(e.target.value)}
              placeholder="Search for specific job roles..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          {isSearchingJobRoles && (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          )}

          {!isSearchingJobRoles && jobRoleResults.length > 0 && (
            <div className="job-role-results">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {jobRoleResults.map((jobRole) => (
                  <button
                    key={jobRole}
                    onClick={() => handleJobRoleSelect(jobRole)}
                    className="text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    {jobRole}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};