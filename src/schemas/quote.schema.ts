import { z } from 'zod';

export const contactSchema = z.object({
  name: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom est trop long'),
  prenom: z.string()
    .min(2, 'Le prénom doit contenir au moins 2 caractères')
    .max(100, 'Le prénom est trop long')
    .optional(),
  email: z.string()
    .email('Email invalide')
    .max(255, 'Email trop long')
    .refine(email => {
      const disposableDomains = ['temp-mail.org', 'guerrillamail.com', 'mailinator.com', '10minutemail.com'];
      const domain = email.split('@')[1]?.toLowerCase();
      return !disposableDomains.includes(domain);
    }, 'Domaine email non autorisé'),
  phone: z.string()
    .regex(/^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/, 'Numéro de téléphone invalide')
    .max(20, 'Numéro trop long'),
  city: z.string().max(100).optional(),
  postal_code: z.string().max(10).optional(),
});

export const projectDimensionSchema = z.object({
  width: z.number().min(0).max(100000).nullable(),
  height: z.number().min(0).max(100000).nullable(),
  depth: z.number().min(0).max(100000).nullable(),
  quantity: z.number().int().min(1).max(10000),
});

export const quoteRequestSchema = z.object({
  contact: contactSchema,
  selectedProjects: z.array(z.object({
    project: z.object({ id: z.string().uuid() }),
    woodType: z.string().max(100).optional(),
    finish: z.string().max(100).optional(),
    additionalNotes: z.string().max(2000).optional(),
    dimensions: z.array(projectDimensionSchema),
  })),
  pose_sur_site: z.boolean(),
});

export const projectDescriptionSchema = z.object({
  email: z.string()
    .email('Email invalide')
    .max(255, 'Email trop long'),
  project_description: z.string()
    .min(10, 'La description doit contenir au moins 10 caractères')
    .max(2000, 'La description est limitée à 2000 caractères'),
});

export const generalProjectSchema = z.object({
  name: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom est trop long'),
  email: z.string()
    .email('Email invalide')
    .max(255, 'Email trop long'),
  phone: z.string()
    .regex(/^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/, 'Numéro de téléphone invalide')
    .max(20, 'Numéro trop long'),
  message: z.string()
    .min(10, 'Le message doit contenir au moins 10 caractères')
    .max(2000, 'Le message est limité à 2000 caractères'),
});
