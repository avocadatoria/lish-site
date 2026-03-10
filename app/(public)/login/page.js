'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Link from 'next/link';
import AuthCard from '../../../components/auth/AuthCard';
import SocialLoginButtons from '../../../components/auth/SocialLoginButtons';
import WrappedMUITextField from '../../../components/ui/form-els/WrappedMUITextField';
import WrappedMUIPasswordField from '../../../components/ui/form-els/WrappedMUIPasswordField';
import WrappedMUIButton from '../../../components/ui/WrappedMUIButton';
import WrappedMUIDialog from '../../../components/ui/WrappedMUIDialog';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import WrappedMUICircularProgress from '../../../components/ui/WrappedMUICircularProgress';
import { useAuth } from '../../../hooks/useAuth';
import { useAppContext } from '../../../hooks/useAppContext';
import { useNavigateWithEmail } from '../../../hooks/useNavigateWithEmail';
import { EMAIL_RULES } from '../../../common/email-mangling';
import { AUTH_ERRORS } from '../../../common/error-codes';
import { ROUTES } from '../../../common/routes';
import { AUTH_PROVIDERS, EMAIL_OTP_ENABLED, authProviderLabel } from '../../../common/auth-providers';

function buildConflictMessage(email, provider) {
  const label = authProviderLabel(provider);
  const emailPart = email
    ? <>{`An account for `}<strong>{email}</strong></>
    : `An account with this email`;
  const methodPart = provider === `password`
    ? <>{` already uses email-and-password login. Please log in that way.`}</>
    : <>{` already uses ${label} login. Click `}<strong>{`Continue with ${label}`}</strong>{` to sign in.`}</>;
  return <>{emailPart}{methodPart}</>;
}

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    user, loading: authLoading,
    loginWithCredentials, loginWithProvider, startOtp, verifyOtp,
  } = useAuth();
  const { take } = useAppContext();

  const [mode, setMode] = useState(`credentials`); // 'credentials' | 'otp-email' | 'otp-verify'
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [otpEmail, setOtpEmail] = useState(``);

  // Credentials form
  const { control: credControl, handleSubmit: handleCredSubmit, getValues: getCredValues } = useForm({
    defaultValues: { email: take(`prefillEmail`) || ``, password: `` },
  });

  // OTP email form
  const { control: otpEmailControl, handleSubmit: handleOtpEmailSubmit, setValue: setOtpEmailValue } = useForm({
    defaultValues: { email: `` },
  });

  // OTP code form
  const { control: otpCodeControl, handleSubmit: handleOtpCodeSubmit } = useForm({
    defaultValues: { otp: `` },
  });

  const navigateWithEmail = useNavigateWithEmail(() => getCredValues(`email`));

  // Handle callback errors (e.g. email_conflict from social login)
  useEffect(() => {
    const callbackError = searchParams.get(`error`);
    if (callbackError === `email_conflict`) {
      const provider = searchParams.get(`provider`);
      setError(buildConflictMessage(null, provider));
    } else if (callbackError === `missing_email`) {
      setError(`Your account doesn't have a public email address. Please update your email settings on the provider (e.g. GitHub) and try again.`);
    }

    const noticeParam = searchParams.get(`notice`);
    if (noticeParam === `logged_out`) {
      setNotice({ type: `logged_out`, title: `Signed out`, message: `You've been signed out.` });
    } else if (noticeParam === `account_deleted`) {
      setNotice({ type: `account_deleted`, title: `Account deleted`, message: `Your account has been successfully deleted.` });
    }
  }, [searchParams]);

  const redirectTo = searchParams.get(`redirect`);

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      router.replace(user.emailVerified ? (redirectTo || ROUTES.DASHBOARD) : ROUTES.VERIFY_EMAIL);
    }
  }, [authLoading, user, router, redirectTo]);

  const onCredentialsSubmit = async (data) => {
    setError(null);
    setSubmitting(true);
    try {
      const result = await loginWithCredentials(data.email, data.password);
      router.push(result.user?.emailVerified === false ? ROUTES.VERIFY_EMAIL : (redirectTo || ROUTES.DASHBOARD));
    } catch (err) {
      if (err.data?.error === AUTH_ERRORS.EMAIL_CONFLICT) {
        setError(buildConflictMessage(data.email, err.data.provider));
      } else {
        setError(err.data?.message || `Invalid email or password`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const onOtpEmailSubmit = async (data) => {
    setError(null);
    setSubmitting(true);
    try {
      await startOtp(data.email);
      setOtpEmail(data.email);
      setMode(`otp-verify`);
    } catch (err) {
      setError(err.data?.message || `Failed to send code. Please try again.`);
    } finally {
      setSubmitting(false);
    }
  };

  const onOtpCodeSubmit = async (data) => {
    setError(null);
    setSubmitting(true);
    try {
      const result = await verifyOtp(otpEmail, data.otp);
      router.push(result.user?.emailVerified === false ? ROUTES.VERIFY_EMAIL : (redirectTo || ROUTES.DASHBOARD));
    } catch (err) {
      setError(err.data?.message || `Invalid or expired code`);
    } finally {
      setSubmitting(false);
    }
  };

  const switchToOtp = () => {
    setOtpEmailValue(`email`, getCredValues(`email`));
    setMode(`otp-email`);
    setError(null);
  };

  if (authLoading || user) return null;

  return (
    <AuthCard title={`Sign in`} subtitle={`Choose how you'd like to sign in.`}>
      <WrappedMUIDialog
        open={!!error}
        onClose={() => setError(null)}
        title={
          <Box sx={{ display: `flex`, alignItems: `center`, gap: 1 }}>
            <ErrorOutlineIcon />
            Sign in error
          </Box>
        }
        draggable={false}
        titleSx={{ bgcolor: `error.main`, color: `error.contrastText` }}
        actions={
          <WrappedMUIButton color={`error`} autoFocus onClick={() => setError(null)}>OK</WrappedMUIButton>
        }
      >
        <Typography sx={{ mt: 1 }}>{error}</Typography>
      </WrappedMUIDialog>

      <WrappedMUIDialog
        open={!!notice}
        onClose={() => setNotice(null)}
        title={
          <Box sx={{ display: `flex`, alignItems: `center`, gap: 1 }}>
            <CheckCircleOutlineIcon />
            {notice?.title}
          </Box>
        }
        draggable={false}
        actions={
          <WrappedMUIButton autoFocus onClick={() => setNotice(null)}>OK</WrappedMUIButton>
        }
      >
        <Typography sx={{ mt: 1 }}>{notice?.message}</Typography>
      </WrappedMUIDialog>

      {/* Third-party provider buttons */}
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

      {/* Credentials mode */}
      {mode === `credentials` && (
        <Box component={`form`} onSubmit={handleCredSubmit(onCredentialsSubmit)} noValidate>
          <WrappedMUITextField
            name={`email`}
            control={credControl}
            label={`Email`}
            type={`email`}
            rules={EMAIL_RULES}
            autoComplete={`email`}
            autoFocus
            sx={{ mb: 2 }}
          />

          <WrappedMUIPasswordField
            name={`password`}
            control={credControl}
            label={`Password`}
            rules={{ required: `Password is required` }}
            autoComplete={`current-password`}
            sx={{ mb: 3 }}
          />

          <WrappedMUIButton
            type={`submit`}
            variant={`contained`}
            fullWidth
            disabled={submitting}
            sx={{ mb: 2 }}
          >
            {submitting ? <WrappedMUICircularProgress size={24} color={`inherit`} /> : `Sign in`}
          </WrappedMUIButton>
        </Box>
      )}

      {/* OTP email entry */}
      {mode === `otp-email` && (
        <Box component={`form`} onSubmit={handleOtpEmailSubmit(onOtpEmailSubmit)} noValidate>
          <WrappedMUITextField
            name={`email`}
            control={otpEmailControl}
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
            {submitting ? <WrappedMUICircularProgress size={24} color={`inherit`} /> : `Send code`}
          </WrappedMUIButton>
        </Box>
      )}

      {/* OTP code verification */}
      {mode === `otp-verify` && (
        <Box component={`form`} onSubmit={handleOtpCodeSubmit(onOtpCodeSubmit)} noValidate>
          <Typography variant={`body2`} color={`text.secondary`} sx={{ mb: 2 }}>
            If an account exists for <strong>{otpEmail}</strong>, we've sent a 6-digit code to that address.
          </Typography>

          <WrappedMUITextField
            name={`otp`}
            control={otpCodeControl}
            label={`Verification code`}
            rules={{
              required: `Code is required`,
              pattern: { value: /^\d{6}$/, message: `Enter a 6-digit code` },
            }}
            autoComplete={`one-time-code`}
            inputProps={{ inputMode: `numeric` }}
            autoFocus
            sx={{ mb: 3 }}
          />

          <WrappedMUIButton
            type={`submit`}
            variant={`contained`}
            fullWidth
            disabled={submitting}
            sx={{ mb: 1 }}
          >
            {submitting ? <WrappedMUICircularProgress size={24} color={`inherit`} /> : `Verify code`}
          </WrappedMUIButton>

          <WrappedMUIButton
            variant={`text`}
            fullWidth
            size={`small`}
            onClick={() => { setMode(`otp-email`); setError(null); }}
          >
            Use a different email
          </WrappedMUIButton>
        </Box>
      )}

      {/* Mode toggle + bottom links */}
      <Box sx={{ display: `flex`, justifyContent: `space-between`, alignItems: `center`, mt: 1 }}>
        <Typography variant={`body2`}>
          <Link href={ROUTES.FORGOT_PASSWORD} onClick={(e) => { e.preventDefault(); navigateWithEmail(ROUTES.FORGOT_PASSWORD); }}>
            Forgot password?
          </Link>
        </Typography>
        {EMAIL_OTP_ENABLED && mode === `credentials` && (
          <Typography
            variant={`body2`}
            sx={{ cursor: `pointer`, color: `primary.main`, '&:hover': { textDecoration: `underline` } }}
            onClick={switchToOtp}
          >
            Sign in with email code
          </Typography>
        )}
        {mode !== `credentials` && (
          <Typography
            variant={`body2`}
            sx={{ cursor: `pointer`, color: `primary.main`, '&:hover': { textDecoration: `underline` } }}
            onClick={() => { setMode(`credentials`); setError(null); }}
          >
            Sign in with password
          </Typography>
        )}
      </Box>

      <Typography variant={`body2`} align={`center`} sx={{ mt: 2 }}>
        <Link href={ROUTES.SIGNUP} onClick={(e) => { e.preventDefault(); navigateWithEmail(ROUTES.SIGNUP); }}>
          Create an account
        </Link>
      </Typography>
    </AuthCard>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  );
}
