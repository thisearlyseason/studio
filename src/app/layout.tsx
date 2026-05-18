import type {Metadata} from 'next';
import './globals.css';
import { Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster"
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { TeamProvider } from '@/components/providers/team-provider';
import { TooltipProvider } from "@/components/ui/tooltip";
import BugReporter from '@/components/BugReporter';

export const metadata: Metadata = {
  metadataBase: new URL('https://thesquad.pro'),
  title: {
    default: 'The Squad — Elite Sports Team Management Platform',
    template: '%s | The Squad',
  },
  description:
    'The all-in-one institutional platform for elite sports organizations. Coordinate rosters, automate tournament brackets, verify film compliance, and recruit athletes — all in one tactical hub.',
  keywords: [
    'sports team management',
    'athletic coordination platform',
    'tournament bracket generator',
    'team scheduling software',
    'athlete recruiting portfolio',
    'school athletic director software',
    'sports organization hub',
    'the squad',
  ],
  authors: [{ name: 'The Squad', url: 'https://thesquad.pro' }],
  creator: 'The Squad',
  publisher: 'The Squad',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: 'https://thesquad.pro',
  },
  openGraph: {
    type: 'website',
    url: 'https://thesquad.pro',
    title: 'The Squad — Elite Sports Team Management Platform',
    description:
      'Coordinate rosters, automate brackets, verify film compliance, and recruit athletes — all in one institutional sports hub.',
    siteName: 'The Squad',
    images: [
      {
        url: '/favicon-512.png',
        width: 512,
        height: 512,
        alt: 'The Squad — Elite Sports Team Management',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Squad — Elite Sports Team Management Platform',
    description:
      'The all-in-one institutional platform for elite sports organizations.',
    images: ['/favicon-512.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-192.png', type: 'image/png', sizes: '192x192' },
    ],
    apple: [{ url: '/favicon-192.png', sizes: '192x192', type: 'image/png' }],
    shortcut: '/favicon.ico',
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Font: preconnect for handshake, display=optional avoids render-blocking */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=optional" rel="stylesheet" />
        {/* DNS prefetch for Firebase services — resolves hostnames before JS fires */}
        <link rel="dns-prefetch" href="https://firestore.googleapis.com" />
        <link rel="dns-prefetch" href="https://identitytoolkit.googleapis.com" />
        <link rel="dns-prefetch" href="https://storage.googleapis.com" />
        <link rel="preconnect" href="https://storage.googleapis.com" />
      {/* Note: Firebase SDK error suppression is handled in FirebaseClientProvider (client-only) */}
    </head>
      <body className="font-body antialiased min-h-screen bg-background text-foreground selection:bg-primary/20" suppressHydrationWarning>
        <FirebaseClientProvider>
          <Suspense fallback={null}>
            <TooltipProvider delayDuration={0}>
              <TeamProvider>
                {children}
                <BugReporter />
                <Toaster />
              </TeamProvider>
            </TooltipProvider>
          </Suspense>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}

