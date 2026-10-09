/**
 * Case Number Parser for Kenyan Court Cases
 * 
 * Parses Kenyan case number formats into structured data.
 * Tolerates differences in:
 * - Letter case (civil appeal No. e123 of 2024)
 * - Spacing (Civil Appeal No. E123 of 2024 vs Civil Appeal No.E123 of 2024)
 * - "No." versus "No" (with or without period)
 * - "E" prefix before the case number
 * 
 * Supported formats include:
 * - Civil Appeal No. E123 of 2024
 * - ELC Case No. 45 of 2023
 * - Succession Cause No. 12 of 2022
 * - CR Case No. 100 of 2021
 * - MA Criminal Case No. 50 of 2020
 * - Civil Appeal No. 123 of 2024 (without E prefix)
 */

export interface ParsedCaseNumber {
  court: string;       // e.g., "High Court", "Environment and Land Court"
  caseType: string;    // e.g., "Civil Appeal", "Civil Case", "Succession Cause"
  number: number;      // the case number (without E prefix and without "of YEAR")
  year: number;        // the year
  original: string;    // the original input string
}

/**
 * Normalizes a case number string by removing extra whitespace and standardizing
 */
const normalize = (str: string): string => {
  return str
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\.([A-Z])/g, '$1') // Remove dot before capital letters: "No. E" -> "No E"
    .replace(/\bNo\b/gi, 'No')   // Normalize "no." or "NO" to "No"
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Extracts the year from a case number string.
 * Looks for "of YEAR" pattern at the end.
 */
const extractYear = (normalized: string): number | null => {
  const yearMatch = normalized.match(/of\s+(\d{4})\s*$/i);
  if (yearMatch) {
    const year = parseInt(yearMatch[1], 10);
    if (year >= 1900 && year <= 2100) {
      return year;
    }
  }
  return null;
};

/**
 * Extracts the case number (digits) from a case number string.
 */
const extractCaseNumber = (normalized: string): number | null => {
  // Match the number that typically comes after "No." or "No" and before "of"
  // Handles both "No. E123" and "No E123" and "No.123" patterns
  const numberMatch = normalized.match(/(?:No\.?\s*E?\s*)?(\d+)(?:\s+of\s)/i);
  if (numberMatch) {
    return parseInt(numberMatch[1], 10);
  }

  // Fallback: just find the first number sequence that looks like a case number
  const fallbackMatch = normalized.match(/(?<!\d)(\d{2,5})(?!\d)/);
  if (fallbackMatch) {
    return parseInt(fallbackMatch[1], 10);
  }

  return null;
};

/**
 * Extracts the case type from a case number string.
 * e.g., "Civil Appeal", "ELC Case", "Succession Cause"
 */
const extractCaseType = (normalized: string): string | null => {
  // Remove the year part first
  const withoutYear = normalized.replace(/\s+of\s+\d{4}\s*$/i, '').trim();

  // Common patterns: "Civil Appeal", "ELC Case", "Succession Cause", "CR Case", "MA Criminal"
  const typeMatch = withoutYear.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+No/i);
  if (typeMatch) {
    return typeMatch[1].trim();
  }

  // Also handle "No." at the very start (unusual but possible)
  const typeMatch2 = withoutYear.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+No\.?/i);
  if (typeMatch2) {
    return typeMatch2[1].trim();
  }

  return null;
};

/**
 * Parses a Kenyan court case number into structured components.
 * 
 * @param caseNumber - The case number string to parse
 * @returns Parsed case number or null if cannot parse
 */
export const parseCaseNumber = (caseNumber: string): ParsedCaseNumber | null => {
  if (!caseNumber || typeof caseNumber !== 'string') {
    return null;
  }

  const original = caseNumber.trim();
  if (original.length === 0) {
    return null;
  }

  const normalized = normalize(original);
  const year = extractYear(normalized);
  const number = extractCaseNumber(normalized);
  const caseType = extractCaseType(normalized);

  if (!year || !number || !caseType) {
    return null;
  }

  // Determine court from the case type
  const court = determineCourt(caseType);

  return {
    court,
    caseType,
    number,
    year,
    original,
  };
};

/**
 * Determines the court division from the case type.
 */
const determineCourt = (caseType: string): string => {
  const typeLower = caseType.toLowerCase();

  // Exact matches first
  if (typeLower === 'small claims' || typeLower === 'small claims court') {
    return 'Small Claims Court';
  }
  if (typeLower === 'employment and labour relations' || typeLower === 'labour relations') {
    return 'Employment and Labour Relations Court';
  }
  if (typeLower === 'environment and land court' || typeLower === 'land court') {
    return 'Environment and Land Court';
  }
  if (typeLower === 'magistrates court') {
    return 'Magistrates Court';
  }
  if (typeLower === 'high court') {
    return 'High Court';
  }
  if (typeLower === 'court of appeal') {
    return 'Court of Appeal';
  }
  if (typeLower === 'supreme court') {
    return 'Supreme Court';
  }
  if (typeLower === 'kadhi court') {
    return 'Kadhis Court';
  }

  // Contains checks for partial matches
  if (typeLower.includes('small claims')) {
    return 'Small Claims Court';
  }
  if (typeLower.includes('employment and labour relations') || typeLower.includes('labour relations')) {
    return 'Employment and Labour Relations Court';
  }
  if (typeLower.includes('environment and land') || typeLower.includes('land court') || typeLower.includes('elc')) {
    return 'Environment and Land Court';
  }
  if (typeLower.includes('magistrate')) {
    return 'Magistrates Court';
  }
  if (typeLower.includes('high')) {
    return 'High Court';
  }
  if (typeLower.includes('court of appeal')) {
    return 'Court of Appeal';
  }
  if (typeLower.includes('supreme')) {
    return 'Supreme Court';
  }
  if (typeLower.includes('kadhi')) {
    return 'Kadhis Court';
  }

  // Default fallback based on case type keywords
  if (typeLower.includes('criminal') && typeLower.includes('appeal')) {
    return 'Court of Appeal';
  }
  if (typeLower.includes('criminal') && !typeLower.includes('appeal')) {
    return 'Magistrates Court';
  }
  if (typeLower.includes('civil')) {
    return 'High Court';
  }
  if (typeLower.includes('appeal')) {
    return 'Court of Appeal';
  }

  return 'Unknown Court';
};

/**
 * Validates whether a string looks like a Kenyan case number.
 */
export const isValidCaseNumber = (value: string): boolean => {
  if (!value || typeof value !== 'string') {
    return false;
  }
  return parseCaseNumber(value) !== null;
};

/**
 * Generates a normalized case number for storage with unique constraint.
 * Format: [CourtCode]-[CaseTypeCode]-[Number]-[Year]
 * e.g.: HIGHCTL-CIVAPPEAL-123-2024
 */
export const generateNormalizedCaseNumber = (
  court: string,
  caseType: string,
  number: number,
  year: number
): string => {
  const courtCode = court
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .substring(0, 6);
  const caseTypeCode = caseType
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .replace(/APPEAL/, 'AP')
    .replace(/CASE/, 'CS')
    .replace(/CAUSE/, 'CU')
    .substring(0, 4);
  return `${courtCode}-${caseTypeCode}-${number}-${year}`;
};

export default { parseCaseNumber, isValidCaseNumber, generateNormalizedCaseNumber };