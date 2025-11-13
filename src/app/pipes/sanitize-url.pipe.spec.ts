import { TestBed } from '@angular/core/testing';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { SanitizeUrlPipe } from './sanitize-url.pipe';

describe('SanitizeUrlPipe', () => {
  let pipe: SanitizeUrlPipe;
  let sanitizer: DomSanitizer;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SanitizeUrlPipe, DomSanitizer],
    });

    pipe = TestBed.inject(SanitizeUrlPipe);
    sanitizer = TestBed.inject(DomSanitizer);
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  // ==================== NULL/UNDEFINED HANDLING ====================

  describe('null/undefined inputs', () => {
    it('should return null for null input', () => {
      const result = pipe.transform(null);
      expect(result).toBeNull();
    });

    it('should return null for undefined input', () => {
      const result = pipe.transform(undefined);
      expect(result).toBeNull();
    });

    it('should return null for empty string', () => {
      const result = pipe.transform('');
      expect(result).toBeNull();
    });
  });

  // ==================== GOOGLE MAPS URLS ====================

  describe('Google Maps URLs', () => {
    it('should sanitize valid google.com/maps URL', () => {
      const url = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3';
      const result = pipe.transform(url);

      expect(result).not.toBeNull();
      expect(result).toBeTruthy();
    });

    it('should sanitize google.com/maps without www', () => {
      const url = 'https://google.com/maps/place/Tokyo';
      const result = pipe.transform(url);

      expect(result).not.toBeNull();
    });

    it('should sanitize maps.google.com URL', () => {
      const url = 'https://maps.google.com/maps?q=Tokyo';
      const result = pipe.transform(url);

      expect(result).not.toBeNull();
    });

    it('should sanitize www.maps.google.com URL', () => {
      const url = 'https://www.maps.google.com/maps?q=Tokyo';
      const result = pipe.transform(url);

      expect(result).not.toBeNull();
    });

    it('should reject HTTP google maps URL', () => {
      spyOn(console, 'warn');
      const url = 'http://www.google.com/maps/embed?pb=123';
      const result = pipe.transform(url);

      expect(result).toBeNull();
      expect(console.warn).toHaveBeenCalled();
    });
  });

  // ==================== YOUTUBE URLS ====================

  describe('YouTube URLs', () => {
    it('should sanitize valid youtube.com/embed URL', () => {
      const url = 'https://www.youtube.com/embed/dQw4w9WgXcQ';
      const result = pipe.transform(url);

      expect(result).not.toBeNull();
    });

    it('should sanitize youtube.com/embed without www', () => {
      const url = 'https://youtube.com/embed/videoId123';
      const result = pipe.transform(url);

      expect(result).not.toBeNull();
    });

    it('should sanitize youtube-nocookie.com/embed', () => {
      const url = 'https://www.youtube-nocookie.com/embed/videoId123';
      const result = pipe.transform(url);

      expect(result).not.toBeNull();
    });

    it('should reject youtube.com/watch URL (not in whitelist)', () => {
      spyOn(console, 'warn');
      const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
      const result = pipe.transform(url);

      expect(result).toBeNull();
      expect(console.warn).toHaveBeenCalledWith(
        '[SanitizeUrlPipe] URL not in whitelist:',
        url
      );
    });
  });

  // ==================== VIMEO URLS ====================

  describe('Vimeo URLs', () => {
    it('should sanitize player.vimeo.com/video URL', () => {
      const url = 'https://player.vimeo.com/video/123456789';
      const result = pipe.transform(url);

      expect(result).not.toBeNull();
    });

    it('should sanitize vimeo.com/video URL', () => {
      const url = 'https://www.vimeo.com/video/123456789';
      const result = pipe.transform(url);

      expect(result).not.toBeNull();
    });

    it('should sanitize vimeo.com/video without www', () => {
      const url = 'https://vimeo.com/video/987654321';
      const result = pipe.transform(url);

      expect(result).not.toBeNull();
    });

    it('should reject regular vimeo.com URL (not video path)', () => {
      spyOn(console, 'warn');
      const url = 'https://vimeo.com/123456789';
      const result = pipe.transform(url);

      expect(result).toBeNull();
      expect(console.warn).toHaveBeenCalled();
    });
  });

  // ==================== INVALID/MALICIOUS URLS ====================

  describe('invalid and malicious URLs', () => {
    it('should reject HTTP URLs', () => {
      spyOn(console, 'warn');
      const url = 'http://example.com';
      const result = pipe.transform(url);

      expect(result).toBeNull();
      expect(console.warn).toHaveBeenCalledWith(
        '[SanitizeUrlPipe] Invalid URL format:',
        url
      );
    });

    it('should reject javascript: URLs', () => {
      spyOn(console, 'warn');
      const url = 'javascript:alert("XSS")';
      const result = pipe.transform(url);

      expect(result).toBeNull();
      expect(console.warn).toHaveBeenCalled();
    });

    it('should reject data: URLs', () => {
      spyOn(console, 'warn');
      const url = 'data:text/html,<script>alert("XSS")</script>';
      const result = pipe.transform(url);

      expect(result).toBeNull();
    });

    it('should reject file: URLs', () => {
      spyOn(console, 'warn');
      const url = 'file:///etc/passwd';
      const result = pipe.transform(url);

      expect(result).toBeNull();
    });

    it('should reject malformed URLs', () => {
      spyOn(console, 'warn');
      const url = 'not-a-valid-url';
      const result = pipe.transform(url);

      expect(result).toBeNull();
      expect(console.warn).toHaveBeenCalledWith(
        '[SanitizeUrlPipe] Invalid URL format:',
        url
      );
    });

    it('should reject HTTPS URL not in whitelist', () => {
      spyOn(console, 'warn');
      const url = 'https://evil.com/malicious';
      const result = pipe.transform(url);

      expect(result).toBeNull();
      expect(console.warn).toHaveBeenCalledWith(
        '[SanitizeUrlPipe] URL not in whitelist:',
        url
      );
    });

    it('should reject subdomain attack attempt', () => {
      spyOn(console, 'warn');
      const url = 'https://evil.google.com.attacker.com/maps/fake';
      const result = pipe.transform(url);

      expect(result).toBeNull();
    });

    it('should reject path traversal attempt', () => {
      spyOn(console, 'warn');
      const url = 'https://www.google.com/../../../evil';
      const result = pipe.transform(url);

      expect(result).toBeNull();
    });
  });

  // ==================== CASE INSENSITIVITY ====================

  describe('case insensitivity', () => {
    it('should handle uppercase HTTPS', () => {
      // URL constructor normalizes protocol to lowercase
      const url = 'https://WWW.GOOGLE.COM/MAPS/place';
      const result = pipe.transform(url);

      expect(result).not.toBeNull();
    });

    it('should handle mixed case domain', () => {
      const url = 'https://www.YouTube.com/embed/videoId';
      const result = pipe.transform(url);

      expect(result).not.toBeNull();
    });
  });

  // ==================== EDGE CASES ====================

  describe('edge cases', () => {
    it('should handle URLs with query parameters', () => {
      const url =
        'https://www.google.com/maps/embed?pb=!1m18&param2=value';
      const result = pipe.transform(url);

      expect(result).not.toBeNull();
    });

    it('should handle URLs with hash fragments', () => {
      const url = 'https://www.google.com/maps/place/Tokyo#details';
      const result = pipe.transform(url);

      expect(result).not.toBeNull();
    });

    it('should handle URLs with port numbers', () => {
      spyOn(console, 'warn');
      const url = 'https://www.google.com:8080/maps/place';
      const result = pipe.transform(url);

      // Port numbers should still work if URL is valid
      expect(result).not.toBeNull();
    });

    it('should preserve URL integrity after sanitization', () => {
      const url = 'https://www.google.com/maps/embed?pb=12345&q=Tokyo';
      const result = pipe.transform(url) as SafeResourceUrl;

      expect(result).toBeTruthy();
      // The sanitized URL should be trusted
      expect(typeof result).toBe('object');
    });
  });

  // ==================== CONSOLE WARNINGS ====================

  describe('console warnings', () => {
    it('should warn when URL format is invalid', () => {
      spyOn(console, 'warn');
      pipe.transform('invalid-url');

      expect(console.warn).toHaveBeenCalledWith(
        '[SanitizeUrlPipe] Invalid URL format:',
        'invalid-url'
      );
    });

    it('should warn when URL is not in whitelist', () => {
      spyOn(console, 'warn');
      pipe.transform('https://untrusted-site.com/video');

      expect(console.warn).toHaveBeenCalledWith(
        '[SanitizeUrlPipe] URL not in whitelist:',
        'https://untrusted-site.com/video'
      );
    });

    it('should not warn for valid trusted URLs', () => {
      spyOn(console, 'warn');
      pipe.transform('https://www.google.com/maps/embed');

      expect(console.warn).not.toHaveBeenCalled();
    });
  });

  // ==================== INTEGRATION WITH DOMSANITIZER ====================

  describe('DomSanitizer integration', () => {
    it('should call bypassSecurityTrustResourceUrl for trusted URLs', () => {
      spyOn(sanitizer, 'bypassSecurityTrustResourceUrl').and.callThrough();
      const url = 'https://www.google.com/maps/embed';

      pipe.transform(url);

      expect(sanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith(url);
    });

    it('should not call bypassSecurityTrustResourceUrl for untrusted URLs', () => {
      spyOn(sanitizer, 'bypassSecurityTrustResourceUrl');
      spyOn(console, 'warn');

      pipe.transform('https://evil.com');

      expect(sanitizer.bypassSecurityTrustResourceUrl).not.toHaveBeenCalled();
    });
  });
});
