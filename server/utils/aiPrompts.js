/**
 * System instruction to enforce JSON output.
 */
export const JSON_SYSTEM_INSTRUCTION = 
  "You are an expert ATS (Applicant Tracking System) optimizer and career consultant. " +
  "You MUST return ONLY valid raw JSON. Do not include markdown block codes like ```json or any introductory/concluding text. " +
  "Analyze the provided text carefully and accurately.";

/**
 * Prompt to extract resume details.
 * @param {string} rawText 
 */
export const getExtractPrompt = (rawText) => `
Analyze the following resume text and extract key structural parameters.
Return a JSON object conforming EXACTLY to the following structure:
{
  "skills": ["Skill1", "Skill2", ...],
  "experienceYears": 5, // Estimate total years of professional experience as a number
  "education": ["Degree/Certification 1", ...],
  "jobTitles": ["Title 1", "Title 2", ...]
}

Resume Text:
"""
${rawText}
"""
`;

/**
 * Prompt to calculate ATS score.
 * @param {string} rawText 
 */
export const getAtsScorePrompt = (rawText) => `
Evaluate the parseability and ATS compatibility of the following resume text.
Calculate scores for the following categories (each on a scale of 0 to 20, where 20 is perfect):
1. formatting: Is the text clean and layout parser-friendly? (e.g. no symbols, text structures that would break parser).
2. sectionHeaders: Are standard headers like "Experience", "Education", "Skills", "Projects" present?
3. keywordDensity: Is there a healthy density of standard industry keywords?
4. quantifiedAchievements: Are there numbers, percentages, or dollar amounts representing impact?
5. contactInfo: Are basic details present (email, phone, linkedin/github link)?

Sum these up for the overall score (0 to 100).
Return a JSON object conforming EXACTLY to this structure:
{
  "score": 85,
  "breakdown": {
    "formatting": 18,
    "sectionHeaders": 17,
    "keywordDensity": 16,
    "quantifiedAchievements": 17,
    "contactInfo": 17,
    "details": "Provide a brief narrative review explaining the strengths and shortcomings of the resume format and content."
  }
}

Resume Text:
"""
${rawText}
"""
`;

/**
 * Prompt to match resume with a Job Description.
 * @param {string} rawText 
 * @param {string} jobDescription 
 */
export const getJobMatchPrompt = (rawText, jobDescription) => `
Compare the following resume text with the job description.
Determine the percentage match score (0 to 100), identify matched keywords/skills, and identify missing keywords/skills that are highly relevant to the role described.

Return a JSON object conforming EXACTLY to this structure:
{
  "matchScore": 75,
  "matchedKeywords": ["React", "Tailwind", "JavaScript"],
  "missingKeywords": ["Node.js", "Docker", "AWS"]
}

Resume Text:
"""
${rawText}
"""

Job Description:
"""
${jobDescription}
"""
`;

/**
 * Prompt to generate improvement suggestions.
 * @param {string} rawText 
 * @param {string} jobDescription (optional)
 */
export const getSuggestionsPrompt = (rawText, jobDescription = '') => {
  let jdSection = '';
  if (jobDescription) {
    jdSection = `
Here is the Job Description the user is matching against:
"""
${jobDescription}
"""
Please include keyword alignment suggestions (e.g. "Missing keyword 'Docker' which appears multiple times in the job description").
`;
  }

  return `
Analyze the following resume text and provide concrete, highly specific, actionable improvement suggestions.
Avoid generic advice. Focus on:
1. Adding metrics or numbers to bullet points (e.g., "Add a metric to your 'Led frontend team' bullet - how many people did you lead? What percentage speed improvement did you achieve?").
2. Re-writing passive statements or weak verbs.
3. Aligning with standard headings.
${jdSection}

Return a JSON object with a single field "suggestions" containing an array of strings (the suggestions):
{
  "suggestions": [
    "Detail the impact in your second bullet under Company X: include size of team or percentage growth.",
    "..."
  ]
}

Resume Text:
"""
${rawText}
"""
`;
};
