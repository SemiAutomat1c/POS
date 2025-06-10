import Script from 'next/script'

export function generateStructuredData() {
  const webAppData = {
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

  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "GadgetTrack",
    "description": "Inventory and POS management software for gadget stores",
    "url": "https://example.com", // Replace with your actual domain
    "logo": "https://example.com/icons/icon-512x512.png" // Replace with your actual logo URL
  };

  return {
    webApp: JSON.stringify(webAppData),
    organization: JSON.stringify(organizationData)
  };
}

export default function StructuredData() {
  const data = generateStructuredData();
  
  return (
    <>
      <Script 
        id="web-application-jsonld" 
        type="application/ld+json" 
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: data.webApp }} 
      />
      <Script 
        id="organization-jsonld" 
        type="application/ld+json" 
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: data.organization }} 
      />
    </>
  );
} 
 