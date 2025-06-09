import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          
          {/* Primary Meta Tags */}
          <meta name="title" content="Know Your DIGIPIN - India Post Digital Postal Index Number Generator & Locator" />
          <meta name="description" content="Find your DIGIPIN, generate DIGIPIN code for any location in India. Official DIGIPIN locator tool for India Post's Digital Postal Index Number system. Know your DIGIPIN instantly with our interactive map." />
          <meta name="keywords" content="know your digipin, digipin, india digipin, india post digipin, my digipin, what is digipin, digipin of my location, digipin code, find digipin, search digipin, digi pin, know my digipin, postal digipin, how to find digipin, my digipin home, post office digipin, find my digipin, digipin full form, digipin website, digipin generation, digital postal index number, india post, geocoding, location finder" />
          <meta name="author" content="Agnik Misra" />
          <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
          <meta name="language" content="English" />
          <meta name="revisit-after" content="7 days" />
          <meta name="distribution" content="global" />
          <meta name="rating" content="general" />
          
          {/* Open Graph / Facebook */}
          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://digipinlocator.vercel.app/" />
          <meta property="og:title" content="Know Your DIGIPIN - India Post Digital Postal Index Number Generator" />
          <meta property="og:description" content="Find your DIGIPIN instantly! Generate and locate DIGIPIN codes for any location in India. Official tool for India Post's Digital Postal Index Number system." />
          <meta property="og:image" content="https://digipinlocator.vercel.app/og-image.jpg" />
          <meta property="og:site_name" content="DIGIPIN Locator" />
          <meta property="og:locale" content="en_IN" />
          
          {/* Twitter */}
          <meta property="twitter:card" content="summary_large_image" />
          <meta property="twitter:url" content="https://digipinlocator.vercel.app/" />
          <meta property="twitter:title" content="Know Your DIGIPIN - India Post Digital Postal Index Number" />
          <meta property="twitter:description" content="Find your DIGIPIN instantly! Generate DIGIPIN codes for any location in India with our interactive map tool." />
          <meta property="twitter:image" content="https://digipinlocator.vercel.app/twitter-image.jpg" />
          <meta property="twitter:creator" content="@agnikmisra" />
          
          {/* Additional SEO Meta Tags */}
          <meta name="geo.region" content="IN" />
          <meta name="geo.country" content="India" />
          <meta name="geo.placename" content="India" />
          <meta name="ICBM" content="20.5937, 78.9629" />
          
          {/* Canonical URL */}
          <link rel="canonical" href="https://digipinlocator.vercel.app/" />
          
          {/* Preconnect for performance */}
          <link rel="preconnect" href="https://api.olamaps.io" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          
          {/* Favicon and Icons */}
          <link rel="icon" type="image/x-icon" href="/favicon.ico" />
          <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
          <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
          <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
          <link rel="manifest" href="/site.webmanifest" />
          
          {/* Schema.org structured data */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "WebApplication",
                "name": "DIGIPIN Locator",
                "description": "Find your DIGIPIN, generate DIGIPIN code for any location in India. Official DIGIPIN locator tool for India Post's Digital Postal Index Number system.",
                "url": "https://digipinlocator.vercel.app/",
                "applicationCategory": "UtilitiesApplication",
                "operatingSystem": "Web Browser",
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "INR"
                },
                "creator": {
                  "@type": "Person",
                  "name": "Agnik Misra",
                  "url": "https://linkedin.com/in/agnikmisra"
                },
                "publisher": {
                  "@type": "Organization",
                  "name": "DIGIPIN Locator",
                  "url": "https://digipinlocator.vercel.app/"
                },
                "datePublished": "2025-06-09",
                "dateModified": "2025-06-09",
                "inLanguage": "en-IN",
                "isAccessibleForFree": true,
                "keywords": "know your digipin, digipin, india digipin, india post digipin, digipin code, find digipin",
                "audience": {
                  "@type": "Audience",
                  "geographicArea": {
                    "@type": "Country",
                    "name": "India"
                  }
                }
              })
            }}
          />
          
          {/* Local Business Schema */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "SoftwareApplication",
                "name": "Know Your DIGIPIN",
                "alternateName": ["DIGIPIN Locator", "India Post DIGIPIN"],
                "description": "Find your DIGIPIN instantly with our interactive map. Generate DIGIPIN codes for any location in India using India Post's Digital Postal Index Number system.",
                "url": "https://digipinlocator.vercel.app/",
                "applicationCategory": "MapApplication",
                "operatingSystem": "Web Browser",
                "downloadUrl": "https://digipinlocator.vercel.app/",
                "softwareVersion": "1.0",
                "releaseNotes": "Initial release with DIGIPIN generation and location finding capabilities",
                "screenshot": "https://digipinlocator.vercel.app/screenshot.jpg",
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "INR"
                },
                "featureList": [
                  "Generate DIGIPIN from coordinates",
                  "Decode DIGIPIN to location",
                  "Interactive map interface",
                  "Auto-detect current location",
                  "Copy DIGIPIN to clipboard",
                  "Open in Google Maps"
                ]
              })
            }}
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
