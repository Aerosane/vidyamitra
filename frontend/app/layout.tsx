import { ClerkProvider } from "@clerk/nextjs";
import NavBar from "../components/navbar";
import FloatingChatbot from "../components/FloatingChatbot";
import './globals.css';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'The Resume Hub',
  description: 'Your personalized career journey starts here',
  icons: {
    icon: '/logo.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      signInFallbackRedirectUrl="/"
      signUpFallbackRedirectUrl="/"
    >
      <html lang="en">
        <body>
          <div className="flex"><NavBar /> </div>
          <main className="mt-5">{children}</main>
          <FloatingChatbot />
        </body>
      </html>
    </ClerkProvider>
  );
}