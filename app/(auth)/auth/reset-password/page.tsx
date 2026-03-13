'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ResetPasswordPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/auth/login');
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
      <p className="text-sm text-muted-foreground">
        Redirecting you to sign in to complete your password reset...
      </p>
    </div>
  );
}
