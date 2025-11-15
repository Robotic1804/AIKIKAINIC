import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Pipe({
  name: 'sanitizeUrl',
  standalone: true,
})
export class SanitizeUrlPipe implements PipeTransform {
  private sanitizer = inject(DomSanitizer);

  // Whitelist of trusted URL patterns
  private readonly TRUSTED_PATTERNS = [
    /^https:\/\/(www\.)?google\.com\/maps\//i,
    /^https:\/\/(www\.)?maps\.google\.com\//i,
    /^https:\/\/(www\.)?youtube\.com\/embed\//i,
    /^https:\/\/(www\.)?youtube-nocookie\.com\/embed\//i,
    /^https:\/\/(www\.)?vimeo\.com\/video\//i,
    /^https:\/\/player\.vimeo\.com\/video\//i,
  ];

  transform(url: string | null | undefined): SafeResourceUrl | null {
    // Handle null/undefined
    if (!url) {
      return null;
    }

    // Validate URL format
    if (!this.isValidUrl(url)) {
      return null;
    }

    // Check against whitelist
    if (!this.isTrustedUrl(url)) {
      return null;
    }

    // Bypass security only for trusted URLs
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  private isValidUrl(url: string): boolean {
    try {
      const parsedUrl = new URL(url);
      // Only allow https protocol
      return parsedUrl.protocol === 'https:';
    } catch {
      return false;
    }
  }

  private isTrustedUrl(url: string): boolean {
    return this.TRUSTED_PATTERNS.some(pattern => pattern.test(url));
  }
}
