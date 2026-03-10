'use client';

import { useForm } from 'react-hook-form';
import Typography from '@mui/material/Typography';
import { apiFetch } from '../../lib/api-client.js';
import { useState } from 'react';

export default function OrganizationForm({ organization, onSuccess }) {
  const isEdit = !!organization;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: organization?.name || ``,
      slug: organization?.slug || ``,
      description: organization?.description || ``,
      website: organization?.website || ``,
    },
  });

  async function onSubmit(data) {
    setSaving(true);
    setError(null);
    try {
      const result = isEdit
        ? await apiFetch(`/api/organizations/${organization.slug}`, { method: `PUT`, body: data })
        : await apiFetch(`/api/organizations`, { method: `POST`, body: data });
      onSuccess?.(result);
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
        <label htmlFor={`name`}>Name</label>
        <input
          id={`name`}
          {...register(`name`, { required: `Name is required` })}
        />
        {errors.name && <span>{errors.name.message}</span>}
      </div>

      <div>
        <label htmlFor={`slug`}>Slug</label>
        <input
          id={`slug`}
          {...register(`slug`, {
            required: `Slug is required`,
            pattern: {
              value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
              message: `Lowercase alphanumeric with hyphens only`,
            },
          })}
          disabled={isEdit}
        />
        {errors.slug && <span>{errors.slug.message}</span>}
      </div>

      <div>
        <label htmlFor={`description`}>Description</label>
        <textarea id={`description`} {...register(`description`)} />
      </div>

      <div>
        <label htmlFor={`website`}>Website</label>
        <input id={`website`} type={`url`} {...register(`website`)} />
      </div>

      <button type={`submit`} disabled={saving}>
        {saving ? `Saving...` : isEdit ? `Update` : `Create`}
      </button>
    </form>
  );
}
