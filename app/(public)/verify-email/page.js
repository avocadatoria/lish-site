'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import AuthCard from '../../../components/auth/AuthCard';
import WrappedMUIButton from '../../../components/ui/WrappedMUIButton';
import WrappedMUIAlert from '../../../components/ui/WrappedMUIAlert';
import WrappedMUICircularProgress from '../../../components/ui/WrappedMUICircularProgress';
import { useAuth } from '../../../hooks/useAuth';
import { apiFetch } from '../../../lib/api-client';

export default function VerifyEmailPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [resendStatus, setResendStatus] = useState(null); // 'sending' | 'sent' | 'error'
  const [checkStatus, setCheckStatus] = useState(null); // 'checking' | 'not-yet' | 'error'

  // If not logged in, send to login
  if (!authLoading && !user) {
    router.replace(`/login`);
    return null;
  }

  // If already verified, send to dashboard
  if (!authLoading && user?.emailVerified) {
    router.replace(`/dashboard`);
    return null;
  }

  const handleResend = async () => {
    setResendStatus(`sending`);
    try {
      await apiFetch(`/api/auth/resend-verification`, { method: `POST` });
      setResendStatus(`sent`);
    } catch {
      setResendStatus(`error`);
    }
  };

  const handleCheckVerification = async () => {
    setCheckStatus(`checking`);
    try {
      const result = await apiFetch(`/api/auth/check-verification`, { method: `POST` });
      if (result.emailVerified) {
        router.push(`/dashboard`);
      } else {
        setCheckStatus(`not-yet`);
      }
    } catch {
      setCheckStatus(`error`);
    }
  };

  if (authLoading) return null;

  return (
    <AuthCard title={`Verify your email`}>
      <WrappedMUIAlert severity={`info`} sx={{ mb: 3 }}>
        We sent a verification email to <strong>{user?.email}</strong>.
        Click the link in the email to verify your account.
      </WrappedMUIAlert>

      {resendStatus === `sent` && (
        <WrappedMUIAlert severity={`success`} sx={{ mb: 2 }}>
          Verification email sent. Check your inbox.
        </WrappedMUIAlert>
      )}

      {resendStatus === `error` && (
        <WrappedMUIAlert severity={`error`} sx={{ mb: 2 }}>
          Failed to resend. Please try again.
        </WrappedMUIAlert>
      )}

      {checkStatus === `not-yet` && (
        <WrappedMUIAlert severity={`warning`} sx={{ mb: 2 }}>
          Email not verified yet. Please check your inbox and click the verification link.
        </WrappedMUIAlert>
      )}

      {checkStatus === `error` && (
        <WrappedMUIAlert severity={`error`} sx={{ mb: 2 }}>
          Could not check verification status. Please try again.
        </WrappedMUIAlert>
      )}

      <Box sx={{ display: `flex`, flexDirection: `column`, gap: 1.5 }}>
        <WrappedMUIButton
          variant={`contained`}
          fullWidth
          onClick={handleCheckVerification}
          disabled={checkStatus === `checking`}
        >
          {checkStatus === `checking`
            ? <WrappedMUICircularProgress size={24} color={`inherit`} />
            : `I've verified my email`}
        </WrappedMUIButton>

        <WrappedMUIButton
          variant={`outlined`}
          fullWidth
          onClick={handleResend}
          disabled={resendStatus === `sending`}
        >
          {resendStatus === `sending`
            ? <WrappedMUICircularProgress size={24} color={`inherit`} />
            : `Resend verification email`}
        </WrappedMUIButton>
      </Box>

      <Typography variant={`body2`} align={`center`} sx={{ mt: 2 }}>
        Wrong account? <Link href={`/login`}>Sign in with a different account</Link>
      </Typography>
    </AuthCard>
  );
}
