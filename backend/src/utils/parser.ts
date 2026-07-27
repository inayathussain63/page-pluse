import * as cheerio from 'cheerio';
import { ExtractedMetrics } from '../types/audit.types';
import { countWords } from './wordCounter';

/**
 * Parses raw HTML string and extracts core SEO metrics using Cheerio.
 * Handles missing nodes gracefully without throwing exceptions.
 */
export const parseHtml = (htmlContent: string): ExtractedMetrics => {
  if (!htmlContent || typeof htmlContent !== 'string') {
    return {
      title: '',
      metaDescription: '',
      h1Count: 0,
      imagesWithoutAlt: 0,
      wordCount: 0,
    };
  }

  const $ = cheerio.load(htmlContent);

  // 1. Extract HTML Title
  const rawTitle = $('title').first().text().trim();
  const metaOgTitle = $('meta[property="og:title"]').attr('content')?.trim() || '';
  const title = rawTitle || metaOgTitle;

  // 2. Extract Meta Description
  const metaDescription =
    $('meta[name="description"]').attr('content')?.trim() ||
    $('meta[property="og:description"]').attr('content')?.trim() ||
    '';

  // 3. Count H1 tags
  const h1Count = $('h1').length;

  // 4. Count img elements missing alt attribute or having empty/whitespace-only alt
  let imagesWithoutAlt = 0;
  $('img').each((_, element) => {
    const alt = $(element).attr('alt');
    if (alt === undefined || alt === null || alt.trim() === '') {
      imagesWithoutAlt++;
    }
  });

  // 5. Approximate Word Count from body text
  // Clone body to avoid mutating original, remove non-visible text elements
  const bodyClone = $('body').clone();
  bodyClone.find('script, style, noscript, svg, iframe').remove();
  const bodyText = bodyClone.text();
  const wordCount = countWords(bodyText);

  return {
    title,
    metaDescription,
    h1Count,
    imagesWithoutAlt,
    wordCount,
  };
};
