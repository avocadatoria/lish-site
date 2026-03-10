'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import AuthCard from '../../../components/auth/AuthCard';
import WrappedMUITextField from '../../../components/ui/form-els/WrappedMUITextField';
import WrappedMUIButton from '../../../components/ui/WrappedMUIButton';
import WrappedMUIAlert from '../../../components/ui/WrappedMUIAlert';
import WrappedMUICircularProgress from '../../../components/ui/WrappedMUICircularProgress';
import { EMAIL_RULES } from '../../../common/email-mangling';
import { ROUTES } from '../../../common/routes';
import { apiFetch } from '../../../lib/api-client';
import { useAppContext } from '../../../hooks/useAppContext';
import { useNavigateWithEmail } from '../../../hooks/useNavigateWithEmail';

export default function ForgotPasswordPage() {
  const { take } = useAppContext();
  const [sent, setSent] = useState(false);
  const [sentEmail, setSentEmail] = useState(``);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { control, handleSubmit, getValues } = useForm({
    defaultValues: { email: take(`prefillEmail`) || `` },
  });

  const navigateWithEmail = useNavigateWithEmail(() => getValues(`email`) || sentEmail);

  const onSubmit = async (data) => {
    setError(null);
    setSubmitting(true);

    try {
      await apiFetch(`/api/auth/forgot-password`, {
        method: `POST`,
        body: { email: data.email },
      });
      setSentEmail(data.email);
      setSent(true);
    } catch (err) {
      setError(err.data?.message || `Something went wrong. Please try again.`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    setSubmitting(true);
    try {
      await apiFetch(`/api/auth/forgot-password`, {
        method: `POST`,
        body: { email: sentEmail },
      });
    } catch {
      // Silently handle — server always returns success anyway
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <AuthCard title={`Check your email`}>
        <WrappedMUIAlert severity={`success`} sx={{ mb: 3 }}>
          If an account exists for <strong>{sentEmail}</strong>, we sent a password reset link.
          Check your inbox and spam folder.
        </WrappedMUIAlert>

        <WrappedMUIButton
          variant={`outlined`}
          fullWidth
          onClick={handleResend}
          disabled={submitting}
          sx={{ mb: 2 }}
        >
          {submitting ? <WrappedMUICircularProgress size={24} color={`inherit`} /> : `Send another link`}
        </WrappedMUIButton>

        <Typography variant={`body2`} align={`center`}>
          <Link href={ROUTES.LOGIN} onClick={(e) => {
            e.preventDefault();
            navigateWithEmail(ROUTES.LOGIN);
          }}>Back to sign in</Link>
        </Typography>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title={`Forgot password?`}
      subtitle={`Enter your email and we'll send you a reset link.`}
    >
      <WrappedMUIAlert severity={`error`} show={!!error} sx={{ mb: 2 }}>
        {error}
      </WrappedMUIAlert>

      <Box component={`form`} onSubmit={handleSubmit(onSubmit)} noValidate>
        <WrappedMUITextField
          name={`email`}
          control={control}
          label={`Email`}
          type={`email`}
          rules={EMAIL_RULES}
          autoComplete={`email`}
          autoFocus
          sx={{ mb: 3 }}
        />

        <WrappedMUIButton
          type={`submit`}
          variant={`contained`}
          fullWidth
          disabled={submitting}
          sx={{ mb: 2 }}
        >
          {submitting ? <WrappedMUICircularProgress size={24} color={`inherit`} /> : `Send reset link`}
        </WrappedMUIButton>

        <Typography variant={`body2`} align={`center`}>
          <Link href={ROUTES.LOGIN} onClick={(e) => {
            e.preventDefault();
            navigateWithEmail(ROUTES.LOGIN);
          }}>Back to sign in</Link>
        </Typography>
      </Box>
    </AuthCard>
  );
}
