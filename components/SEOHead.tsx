import { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'product' | 'article';
  productData?: {
    name: string;
    price: number;
    currency?: string;
    availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
    image: string;
    description: string;
    sku?: string;
  };
}

const BASE_URL = 'https://marishandmade.co.uk';
const DEFAULT_IMAGE = `${BASE_URL}/images/og-image.jpg`;

export const SEOHead = ({
  title = "Mari's Handmade Candles | Luxury Sculptural Candles UK",
  description = "Discover exquisite handcrafted sculptural candles from Mari's Handmade. Luxury artisan candles hand-poured in the UK. Perfect for gifts, weddings, and home decor.",
  keywords = "handmade candles UK, luxury candles, sculptural candles, artisan candles",
  image = DEFAULT_IMAGE,
  url = BASE_URL,
  type = 'website',
  productData,
}: SEOHeadProps) => {
  useEffect(() => {
    // Update document title
    document.title = title;

    // Helper function to update or create meta tags
    const updateMetaTag = (selector: string, content: string, attribute = 'content') => {
      let element = document.querySelector(selector) as HTMLMetaElement;
      if (element) {
        element.setAttribute(attribute, content);
      } else {
        element = document.createElement('meta');
        const [attrName, attrValue] = selector.replace('meta[', '').replace(']', '').split('=');
        element.setAttribute(attrName.replace(/"/g, ''), attrValue?.replace(/"/g, '') || '');
        element.setAttribute(attribute, content);
        document.head.appendChild(element);
      }
    };

    // Update primary meta tags
    updateMetaTag('meta[name="description"]', description);
    updateMetaTag('meta[name="keywords"]', keywords);

    // Update Open Graph tags
    updateMetaTag('meta[property="og:title"]', title);
    updateMetaTag('meta[property="og:description"]', description);
    updateMetaTag('meta[property="og:image"]', image);
    updateMetaTag('meta[property="og:url"]', url);
    updateMetaTag('meta[property="og:type"]', type);

    // Update Twitter tags
    updateMetaTag('meta[name="twitter:title"]', title);
    updateMetaTag('meta[name="twitter:description"]', description);
    updateMetaTag('meta[name="twitter:image"]', image);
    updateMetaTag('meta[name="twitter:url"]', url);

    // Update canonical URL
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (canonical) {
      canonical.href = url;
    }

    // Add Product structured data if product page
    if (productData) {
      // Remove existing product schema
      const existingSchema = document.querySelector('script[data-schema="product"]');
      if (existingSchema) {
        existingSchema.remove();
      }

      const productSchema = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: productData.name,
        description: productData.description,
        image: productData.image,
        sku: productData.sku || productData.name.toLowerCase().replace(/\s+/g, '-'),
        brand: {
          '@type': 'Brand',
          name: "Mari's Handmade",
        },
        offers: {
          '@type': 'Offer',
          price: productData.price,
          priceCurrency: productData.currency || 'GBP',
          availability: `https://schema.org/${productData.availability || 'InStock'}`,
          seller: {
            '@type': 'Organization',
            name: "Mari's Handmade",
          },
        },
      };

      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-schema', 'product');
      script.textContent = JSON.stringify(productSchema);
      document.head.appendChild(script);

      return () => {
        script.remove();
      };
    }
  }, [title, description, keywords, image, url, type, productData]);

  return null;
};

// Hook for easy page-level SEO
export const usePageSEO = (props: SEOHeadProps) => {
  useEffect(() => {
    // This runs the same logic as SEOHead
    const { title, description } = props;
    if (title) document.title = title;

    const descMeta = document.querySelector('meta[name="description"]');
    if (descMeta && description) {
      descMeta.setAttribute('content', description);
    }
  }, [props]);
};
