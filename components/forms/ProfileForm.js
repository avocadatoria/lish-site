'use client';

import { useForm } from 'react-hook-form';
import Typography from '@mui/material/Typography';
import { apiFetch } from '../../lib/api-client.js';
import { useState } from 'react';

export default function ProfileForm({ user, onSuccess }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      firstName: user?.firstName || ``,
      lastName: user?.lastName || ``,
      profileImage: user?.profileImage || ``,
    },
  });

  async function onSubmit(data) {
    setSaving(true);
    setError(null);
    try {
      const updated = await apiFetch(`/api/users/me`, {
        method: `PUT`,
        body: data,
      });
      onSuccess?.(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {error && <Typography color="error">{error}</Typography>}

      <div>
        <label htmlFor={`firstName`}>First Name</label>
        <input
          id={`firstName`}
          {...register(`firstName`, { required: `First name is required` })}
        />
        {errors.firstName && <span>{errors.firstName.message}</span>}
      </div>

      <div>
        <label htmlFor={`lastName`}>Last Name</label>
        <input
          id={`lastName`}
          {...register(`lastName`, { required: `Last name is required` })}
        />
        {errors.lastName && <span>{errors.lastName.message}</span>}
      </div>

      <div>
        <label htmlFor={`profileImage`}>Profile Image URL</label>
        <input id={`profileImage`} {...register(`profileImage`)} />
      </div>

      <button type={`submit`} disabled={saving}>
        {saving ? `Saving...` : `Save Profile`}
      </button>
    </form>
  );
}
