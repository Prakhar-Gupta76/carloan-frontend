import { z } from 'zod';

export const mobileNumberSchema = z
  .string()
  .regex(/^\d{10}$/, 'Enter a valid 10 digit mobile number.');

export const otpSchema = z
  .string()
  .regex(/^\d{4}$/, 'Enter a valid 4 digit OTP.');

export const nameSchema = z
  .string()
  .trim()
  .refine((value) => /[A-Za-z]/.test(value), {
    message: 'Enter at least one alphabet letter.'
  });
