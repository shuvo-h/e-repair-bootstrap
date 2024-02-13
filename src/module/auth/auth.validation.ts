import { z } from 'zod';
import { USER_ROLE } from '../user/user.constant';

const userRegistrationValidationSchema = z.object({
  body: z.object({
    email: z
      .string({
        required_error: 'Email is required',
        invalid_type_error: 'Email must be string',
      })
      .email({ message: 'Invalid email address' }),
    password: z
      .string({
        required_error: 'Password is required',
        invalid_type_error: 'Password must be string',
      })
      .min(4, { message: 'Password must be atleast 4 characters' })
      .max(20, { message: 'Password must not exceed 20 characters' })
      .refine(
        (value) => {
          return /^(?=.*[A-Z])(?=.*[a-z])/.test(value);
        },
        { message: 'Password must be atleast 1 uppercase and 1 lowercase' },
      ),
    role: z.enum([...Object.values(USER_ROLE)] as [string, ...string[]], {
      invalid_type_error: `Role must be one of ${Object.values(USER_ROLE).join(', ')}`,
      required_error: 'Role is required',
    }),
  }),
});
const userLoginValidationSchema = z.object({
  body: z.object({
    email: z
      .string({
        required_error: 'Email is required',
        invalid_type_error: 'Email must be string',
      })
      .email({ message: 'Invalid email address' }),
    password: z.string({
      required_error: 'Password is required',
      invalid_type_error: 'Password must be string',
    }),
  }),
});

export const authValidations = {
  userRegistrationValidationSchema,
  userLoginValidationSchema,
};
