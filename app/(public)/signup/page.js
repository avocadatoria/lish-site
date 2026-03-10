'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Link from 'next/link';
import AuthCard from '../../../components/auth/AuthCard';
import SocialLoginButtons from '../../../components/auth/SocialLoginButtons';
import WrappedMUITextField from '../../../components/ui/form-els/WrappedMUITextField';
import WrappedMUIPasswordField from '../../../components/ui/form-els/WrappedMUIPasswordField';
import WrappedMUICheckbox from '../../../components/ui/form-els/WrappedMUICheckbox';
import WrappedMUIButton from '../../../components/ui/WrappedMUIButton';
import WrappedMUIAlert from '../../../components/ui/WrappedMUIAlert';
import WrappedMUICircularProgress from '../../../components/ui/WrappedMUICircularProgress';
import { useAuth } from '../../../hooks/useAuth';
import { useAppContext } from '../../../hooks/useAppContext';
import { useNavigateWithEmail } from '../../../hooks/useNavigateWithEmail';
import { validatePassword } from '../../../common/password-rules';
import { EMAIL_RULES } from '../../../common/email-mangling';
import { ROUTES } from '../../../common/routes';
import { AUTH_PROVIDERS } from '../../../common/auth-providers';

export default function SignupPage() {
  const router = useRouter();
  const { take } = useAppContext();
  const { user, loading: authLoading, signup, loginWithProvider } = useAuth();
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { control, handleSubmit, watch, getValues } = useForm({
    defaultValues: {
      email: take(`prefillEmail`) || ``,
      password: ``,
      agreeToTerms: false,
    },
  });

  const navigateWithEmail = useNavigateWithEmail(() => getValues(`email`));

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      router.replace(user.emailVerified ? ROUTES.DASHBOARD : ROUTES.VERIFY_EMAIL);
    }
  }, [authLoading, user, router]);

  const onSubmit = async (data) => {
    setError(null);
    setSubmitting(true);

    try {
      const result = await signup({
        email: data.email,
        password: data.password,
      });

      if (result.user && !result.user.emailVerified) {
        router.push(ROUTES.VERIFY_EMAIL);
      } else {
        router.push(ROUTES.DASHBOARD);
      }
    } catch (err) {
      setError(err.data?.message || `Account creation failed. Please try again.`);
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || user) return null;

  return (
    <AuthCard title={`Create an account`} subtitle={`Fill in your details to get started.`}>
      <WrappedMUIAlert severity={`error`} show={!!error} sx={{ mb: 2 }}>
        {error}
      </WrappedMUIAlert>

      {AUTH_PROVIDERS.length > 0 && (
        <>
          <SocialLoginButtons
            providers={AUTH_PROVIDERS}
            onProviderClick={(connection) => loginWithProvider(connection)}
            disabled={submitting}
          />
          <Divider sx={{ my: 3 }}>or</Divider>
        </>
      )}

      <Box component={`form`} onSubmit={handleSubmit(onSubmit)} noValidate>
        <WrappedMUITextField
          name={`email`}
          control={control}
          label={`Email`}
          type={`email`}
          rules={EMAIL_RULES}
          autoComplete={`email`}
          autoFocus
          sx={{ mb: 2 }}
        />

        <WrappedMUIPasswordField
          name={`password`}
          control={control}
          label={`Password`}
          rules={{
            required: `Password is required`,
            validate: (value) => {
              const errors = validatePassword(value, watch(`email`));
              return errors.length === 0 || errors[0];
            },
          }}
          autoComplete={`new-password`}
          sx={{ mb: 2 }}
        />

        <WrappedMUICheckbox
          name={`agreeToTerms`}
          control={control}
          label={
            <Typography variant={`body2`}>
              I agree to the{` `}
              <a href={`/terms-of-use`} target={`_blank`} rel={`noopener noreferrer`}>
                Terms of Use
              </a>
            </Typography>
          }
          rules={{ validate: (v) => v === true || `You must agree to the terms` }}
          sx={{ mb: 2 }}
        />

        <WrappedMUIButton
          type={`submit`}
          variant={`contained`}
          fullWidth
          disabled={submitting}
          sx={{ mb: 2 }}
        >
          {submitting ? <WrappedMUICircularProgress size={24} color={`inherit`} /> : `Create account`}
        </WrappedMUIButton>

        <Typography variant={`body2`} align={`center`}>
          Already have an account?{` `}
          <Link href={ROUTES.LOGIN} onClick={(e) => {
            e.preventDefault();
            navigateWithEmail(ROUTES.LOGIN);
          }}>Sign in</Link>
        </Typography>
      </Box>
    </AuthCard>
  );
}
