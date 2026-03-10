'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import WrappedMUIButton from '../../../components/ui/WrappedMUIButton.jsx';
import WrappedMUIAlert from '../../../components/ui/WrappedMUIAlert.jsx';
import { useAuth } from '../../../hooks/useAuth.js';
import { apiFetch } from '../../../lib/api-client.js';

const CONFIRM_PHRASE = `permanently delete`;

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState(`idle`);
  const [confirmText, setConfirmText] = useState(``);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);
    try {
      await apiFetch(`/api/users/me`, { method: `DELETE` });
      await logout(`account_deleted`);
    } catch (err) {
      if (err.data?.error === `FRESH_AUTH_REQUIRED`) {
        router.push(`/login?redirect=/settings&reason=delete_account`);
        return;
      }
      setError(err.message || `Failed to delete account`);
      setDeleting(false);
    }
  };

  const resetAll = () => {
    setStep(`idle`);
    setConfirmText(``);
    setError(null);
    setDeleting(false);
  };

  return (
    <main>
      <Typography variant="h4" component="h1" gutterBottom>Settings</Typography>
      <Typography>Email: {user?.email}</Typography>
      <Typography>Name: {user?.firstName} {user?.lastName}</Typography>

      <Divider sx={{ my: 4 }} />

      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" color="error" gutterBottom>
          Danger Zone
        </Typography>

        {step === `idle` && (
          <WrappedMUIButton
            variant="outlined"
            color="error"
            onClick={() => setStep(`confirm`)}
          >
            Delete my account
          </WrappedMUIButton>
        )}

        {step === `confirm` && (
          <Box sx={{ mt: 2, maxWidth: 480 }}>
            <WrappedMUIAlert severity="warning" sx={{ mb: 2 }}>
              This will permanently delete your account and all associated data.
              This action cannot be undone. You may be asked to sign in again to confirm.
            </WrappedMUIAlert>

            {error && (
              <WrappedMUIAlert severity="error" sx={{ mb: 2 }}>
                {error}
              </WrappedMUIAlert>
            )}

            <Typography variant="body2" sx={{ mb: 2 }}>
              To confirm, type <strong>{CONFIRM_PHRASE}</strong> below.
            </Typography>

            <TextField
              label="Type to confirm"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={CONFIRM_PHRASE}
              size="small"
              autoComplete="off"
              sx={{ mb: 2, width: 300 }}
            />

            <Box sx={{ display: `flex`, gap: 2 }}>
              <WrappedMUIButton
                variant="contained"
                color="error"
                onClick={handleDelete}
                disabled={deleting || confirmText.toLowerCase() !== CONFIRM_PHRASE}
              >
                {deleting ? `Deleting…` : `Permanently delete my account`}
              </WrappedMUIButton>
              <WrappedMUIButton
                variant="outlined"
                onClick={resetAll}
                disabled={deleting}
              >
                Cancel
              </WrappedMUIButton>
            </Box>
          </Box>
        )}
      </Box>
    </main>
  );
}
