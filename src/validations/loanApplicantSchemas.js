import { z } from 'zod';

export const loanApplicantSchema = z.object({
  pan: z
    .string()
    .trim()
    .min(1, 'This field is required.')
    .regex(/^[A-Z]{5}\d{4}[A-Z]$/, {
      message: 'PAN must be like ABCDE1234F.'
    }),
  age: z
    .number()
    .min(22, 'Age must be between 22 and 60.')
    .max(60, 'Age must be between 22 and 60.'),
  permanent_address: z
    .string()
    .trim()
    .min(1, 'This field is required.'),
  salary: z.number().min(1, 'This field is required.'),
  current_company_duration: z
    .number()
    .min(4, 'Duration must be greater than 3 months.'),
  loan_amount: z.number().min(1, 'This field is required.'),
  loan_tenure: z.number().min(1, 'This field is required.')
});

export function validateLoanApplicant(values) {
  const result = loanApplicantSchema.safeParse(values);

  if (result.success) {
    return {
      data: result.data,
      errors: {}
    };
  }

  const errors = result.error.issues.reduce((accumulator, issue) => {
    const field = issue.path[0];
    if (field && !accumulator[field]) {
      accumulator[field] = issue.message;
    }
    return accumulator;
  }, {});

  return {
    data: null,
    errors
  };
}
