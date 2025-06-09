import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { ThemeProvider } from 'next-themes';
import { useEffect } from 'react';
import Head from 'next/head';

export default function App({ Component, pageProps }: AppProps) {
  // Parse and apply URL parameters if available
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const digipin = params.get('digipin');
      const lat = params.get('lat');
      const lon = params.get('lon');
      
      // You can handle the params accordingly
      // This is just a placeholder for URL parameter handling
      if (digipin || (lat && lon)) {
        console.log('URL params detected:', { digipin, lat, lon });
        // Implement your handling logic here
      }
    }
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="system">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="DIGIPIN - Digital Postal Index Number for India" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icon.jpeg" type="image/jpeg" />
        <meta name="theme-color" content="#f97316" />
        {/* Add geolocation permission meta tag */}
        <meta http-equiv="Permissions-Policy" content="geolocation=(), interest-cohort=()" />
      </Head>
      <Component {...pageProps} />
    </ThemeProvider>
  );
}
