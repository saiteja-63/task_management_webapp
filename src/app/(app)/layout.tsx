"use client";

import "./globals.css";
import ProtectedLayout from "./(protected)/layout";
import { AuthProvider, useAuth } from '../../lib/auth';
import LoginPage from './(auth)/login/page';
import SignupPage from './(auth)/signup/page';
import { usePathname } from 'next/navigation';

function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();

  if (!user) {
    if (pathname === '/signup') {
      return <SignupPage />;
    }
    return <LoginPage />;
  }

  return <ProtectedLayout>{children}</ProtectedLayout>;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <AppLayout>
            {children}
          </AppLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
