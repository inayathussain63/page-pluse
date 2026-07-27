/**
 * Calculates an approximate word count from raw HTML or extracted text content.
 * Filters out script content, style tags, and extra whitespace.
 */
export const countWords = (text: string): number => {
  if (!text || typeof text !== 'string') {
    return 0;
  }

  // Remove script and style elements content
  const cleanedText = text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ') // Strip HTML tags
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim();

  if (!cleanedText) {
    return 0;
  }

  const words = cleanedText.split(' ').filter((word) => word.length > 0);
  return words.length;
};
