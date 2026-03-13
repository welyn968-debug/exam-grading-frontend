"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { usePathname } from "next/navigation";
import { AuthProvider } from "@/hooks/useAuth";

interface AuthLayoutProps {
  children: ReactNode;
}

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
}

type RedirectDecision = {
  redirectTo: string | null;
  blockRender: boolean;
};

function getRedirectDecision({
  isLoading,
  isAuthenticated,
  requireAuth,
  pathname,
}: {
  isLoading: boolean;
  isAuthenticated: boolean;
  requireAuth: boolean;
  pathname: string | null;
}): RedirectDecision {
  if (isLoading) {
    return { redirectTo: null, blockRender: true };
  }

  if (requireAuth && !isAuthenticated) {
    return { redirectTo: "/auth/login", blockRender: true };
  }

  if (!requireAuth && isAuthenticated) {
    if (pathname === "/auth/authorize") {
      return { redirectTo: null, blockRender: false };
    }
    return { redirectTo: "/dashboard", blockRender: true };
  }

  return { redirectTo: null, blockRender: false };
}

const ProtectedRoute = ({
  children,
  requireAuth = true,
}: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const decision = getRedirectDecision({
    isLoading,
    isAuthenticated,
    requireAuth,
    pathname,
  });

  useEffect(() => {
    if (decision.redirectTo) {
      router.push(decision.redirectTo);
    }
  }, [decision.redirectTo, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (decision.blockRender) {
    return null;
  }

  return <>{children}</>;
};

export default function AuthLayout({ children }: AuthLayoutProps) {
  const pathname = usePathname();

  // For login, signup, and forgot-password pages, don't require authentication
  // For other auth pages, require authentication

  const publicPaths = [
    '/auth/login',
    '/auth/signup',
    '/auth/forgot-password',
    '/auth/callback',
    '/auth/reset-password',
    '/auth/sso',
    '/auth/authorize',
    '/terms',
    '/privacy',
  ];
  const isAuthPage =
    publicPaths.includes(pathname) ||
    (pathname?.startsWith('/auth/invite/') ?? false);


  return (
    <AuthProvider>
      <div className="min-h-screen">
        <ProtectedRoute requireAuth={!isAuthPage}>
          {children}
        </ProtectedRoute>
      </div>
    </AuthProvider>
  );
}
