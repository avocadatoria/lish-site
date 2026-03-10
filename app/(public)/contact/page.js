'use client';

import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import WrappedMUITextField from '../../../components/ui/form-els/WrappedMUITextField.jsx';
import WrappedMUISelect from '../../../components/ui/form-els/WrappedMUISelect.jsx';
import WrappedMUIButton from '../../../components/ui/WrappedMUIButton.jsx';
import WrappedMUIAlert from '../../../components/ui/WrappedMUIAlert.jsx';
import { useAuth } from '../../../hooks/useAuth.js';
import { apiFetch } from '../../../lib/api-client.js';

const CATEGORIES = [
  `General Inquiry`,
  `Technical Support`,
  `Billing`,
  `Feedback`,
  `Partnership`,
  `Other`,
];

export default function ContactPage() {
  const { user } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const { control, handleSubmit, formState: { isSubmitting }, reset } = useForm({
    defaultValues: {
      name: ``,
      email: ``,
      phone: ``,
      category: ``,
      message: ``,
    },
  });

  useEffect(() => {
    if (!user) return;
    reset((prev) => ({
      ...prev,
      name: [user.firstName, user.lastName].filter(Boolean).join(` `),
      email: user.email || ``,
    }));
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  async function onSubmit(data) {
    setSubmitError(null);

    const payload = {
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      subject: data.category,
      message: data.message,
    };

    try {
      await apiFetch(`/api/inquiries`, { method: `POST`, body: payload });
      setSubmitted(true);
      reset();
    } catch (err) {
      setSubmitError(err.message || `Something went wrong. Please try again.`);
    }
  }

  if (submitted) {
    return (
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Typography variant="h4" component="h1" gutterBottom>Thank You</Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          Your message has been sent. We will get back to you soon.
        </Typography>
        <WrappedMUIButton variant="outlined" onClick={() => setSubmitted(false)}>
          Send another message
        </WrappedMUIButton>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Typography variant="h4" component="h1" gutterBottom>Contact Us</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Have a question or want to get in touch? Fill out the form below.
      </Typography>

      <WrappedMUIAlert severity="error" show={!!submitError} sx={{ mb: 3 }}>
        {submitError}
      </WrappedMUIAlert>

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ display: `flex`, flexDirection: `column`, gap: 3 }}>
        <WrappedMUITextField
          name="name"
          control={control}
          label="Name"
          rules={{
            required: `Name is required`,
            maxLength: { value: 255, message: `Name is too long` },
          }}
        />

        <WrappedMUITextField
          name="email"
          control={control}
          label="Email"
          type="email"
          rules={{
            required: `Email is required`,
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: `Enter a valid email address`,
            },
          }}
        />

        <WrappedMUITextField
          name="phone"
          control={control}
          label="Phone"
          type="tel"
          rules={{
            maxLength: { value: 30, message: `Phone number is too long` },
          }}
        />

        <WrappedMUISelect
          name="category"
          control={control}
          label="Category"
          rules={{ required: `Please select a category` }}
        >
          {CATEGORIES.map((cat) => (
            <MenuItem key={cat} value={cat}>{cat}</MenuItem>
          ))}
        </WrappedMUISelect>

        <WrappedMUITextField
          name="message"
          control={control}
          label="Comments"
          multiline
          rows={4}
          rules={{
            required: `Please enter your message`,
            maxLength: { value: 10000, message: `Message is too long` },
          }}
        />

        <WrappedMUIButton type="submit" variant="contained" disabled={isSubmitting}>
          {isSubmitting ? `Sending…` : `Send Message`}
        </WrappedMUIButton>
      </Box>
    </Container>
  );
}
