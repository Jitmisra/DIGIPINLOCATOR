import React, { ReactNode } from 'react';
import Head from 'next/head';
import Navbar from './Navbar';

type LayoutProps = {
  children: ReactNode;
  title?: string;
};

const Layout: React.FC<LayoutProps> = ({ children, title = 'DIGIPIN - Encode and Decode Geographic Coordinates' }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Head>
        <title>{title}</title>
        <meta name="description" content="DIGIPIN - A tool to encode and decode geographic coordinates" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
      
      <footer className="container mx-auto px-4 py-6 mt-12 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-orange-500">DIGI</span>
              <span className="text-2xl font-bold text-gray-800 dark:text-white">PIN</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Encode and decode geographic coordinates</p>
          </div>
          <p className="text-center text-gray-600 dark:text-gray-400">
            © {new Date().getFullYear()} DIGIPIN. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
