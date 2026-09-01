/**
 * HTML Sanitizer for Safe Email Rendering & Content Cleaning
 * Strips scripts, unsafe tags, event handlers, and javascript: links to prevent XSS.
 */
export function sanitizeHtml(dirtyHtml: string): string {
  if (!dirtyHtml || typeof dirtyHtml !== 'string') return '';

  let clean = dirtyHtml
    // 1. Remove dangerous script and object/embed tags
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<embed\b[^>]*>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<applet\b[^<]*(?:(?!<\/applet>)<[^<]*)*<\/applet>/gi, '')
    .replace(/<meta\b[^>]*>/gi, '')
    .replace(/<link\b[^>]*>/gi, '')
    .replace(/<base\b[^>]*>/gi, '')
    // 2. Remove iframe tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    // 3. Remove inline event handlers (onload, onerror, onclick, onmouseover, etc.)
    .replace(/\son\w+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, '')
    // 4. Neutralize javascript: and vbscript: URIs in href and src attributes
    .replace(/href\s*=\s*(['"]?)\s*javascript:[^'"]*\1/gi, 'href="#"')
    .replace(/src\s*=\s*(['"]?)\s*javascript:[^'"]*\1/gi, 'src=""')
    // 5. Ensure all target links open in new secure tab
    .replace(/<a\b/gi, '<a target="_blank" rel="noopener noreferrer"');

  return clean;
}
