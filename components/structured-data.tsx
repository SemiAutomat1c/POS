export function WebApplicationJsonLd() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "GadgetTrack POS",
    "description": "Your complete solution for inventory and point-of-sale management",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Windows, macOS, Android, iOS",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData)
      }}
    />
  );
}

export function OrganizationJsonLd() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "GadgetTrack",
    "description": "Inventory and POS management software for gadget stores",
    "url": "https://example.com", // Replace with your actual domain
    "logo": "https://example.com/icons/icon-512x512.png", // Replace with your actual logo URL
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData)
      }}
    />
  );
} 