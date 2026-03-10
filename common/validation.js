import { z } from 'zod';

// ─────────────────────────────────────────────
// Shared Zod schemas (used by both API + React)
// ─────────────────────────────────────────────

export const emailSchema = z.string().email().max(255).toLowerCase().trim();

export const passwordSchema = z.string().min(8).max(128);

export const uuidSchema = z.string().uuid();

export const slugSchema = z
  .string()
  .min(2)
  .max(100)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, `Must be lowercase alphanumeric with hyphens`);

export const paginationSchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const userUpdateSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  profileImage: z.string().url().optional().nullable(),
});

export const addressSchema = z.object({
  type: z.enum([`home`, `work`, `billing`, `shipping`, `other`]),
  street: z.string().min(1).max(255),
  city: z.string().min(1).max(100),
  state: z.string().max(100).optional(),
  postalCode: z.string().min(1).max(20),
  country: z.string().min(2).max(100),
  isDefault: z.boolean().default(false),
});

export const organizationSchema = z.object({
  name: z.string().min(1).max(255),
  slug: slugSchema,
  description: z.string().max(2000).optional(),
  website: z.string().url().optional().nullable(),
  logo: z.string().url().optional().nullable(),
});

export const inquirySchema = z.object({
  name: z.string().min(1).max(255),
  email: emailSchema,
  phone: z.string().max(30).optional().nullable(),
  subject: z.string().min(1).max(255),
  message: z.string().min(1).max(10000),
});

export const invitationSchema = z.object({
  email: emailSchema,
  role: z.enum([`admin`, `member`, `viewer`]),
});
