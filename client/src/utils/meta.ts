interface MetaTagsOptions {
  title?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  ogType?: 'website' | 'article';
  twitterCard?: 'summary' | 'summary_large_image';
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
}

export function updateMetaTags(options: MetaTagsOptions) {
  // Update document title
  if (options.title) {
    document.title = options.title;
  }

  // Helper to update or create meta tag
  const setMetaTag = (property: string, content: string, useProperty = true) => {
    const selector = useProperty ? `meta[property="${property}"]` : `meta[name="${property}"]`;
    let meta = document.querySelector(selector) as HTMLMetaElement;
    
    if (!meta) {
      meta = document.createElement('meta');
      if (useProperty) {
        meta.setAttribute('property', property);
      } else {
        meta.setAttribute('name', property);
      }
      document.head.appendChild(meta);
    }
    
    meta.setAttribute('content', content);
  };

  // Basic meta tags
  if (options.description) {
    setMetaTag('description', options.description, false);
  }

  // Open Graph tags
  if (options.ogTitle || options.title) {
    setMetaTag('og:title', options.ogTitle || options.title || '');
  }
  
  if (options.ogDescription || options.description) {
    setMetaTag('og:description', options.ogDescription || options.description || '');
  }
  
  if (options.ogImage) {
    setMetaTag('og:image', options.ogImage);
  }
  
  if (options.ogUrl) {
    setMetaTag('og:url', options.ogUrl);
  }
  
  if (options.ogType) {
    setMetaTag('og:type', options.ogType);
  }

  // Twitter Card tags
  if (options.twitterCard) {
    setMetaTag('twitter:card', options.twitterCard, false);
  }
  
  if (options.twitterTitle || options.ogTitle || options.title) {
    setMetaTag('twitter:title', options.twitterTitle || options.ogTitle || options.title || '', false);
  }
  
  if (options.twitterDescription || options.ogDescription || options.description) {
    setMetaTag('twitter:description', options.twitterDescription || options.ogDescription || options.description || '', false);
  }
  
  if (options.twitterImage || options.ogImage) {
    setMetaTag('twitter:image', options.twitterImage || options.ogImage || '', false);
  }
}

// Utility to get current base URL
export function getBaseUrl(): string {
  return `${window.location.protocol}//${window.location.host}`;
}