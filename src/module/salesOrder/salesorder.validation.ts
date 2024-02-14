import { z } from 'zod';

const salesOrderCreateValidationSchema = z.object({
  body: z.object({
    productList: z.array(
      z.object({
        product: z.string({
          invalid_type_error: 'Product ID must be a string',
          required_error: 'Product ID is required',
        }),
        quantity: z
          .number({
            invalid_type_error: 'Quantity must be number',
            required_error: 'Quantity is required',
          })
          .min(1, { message: 'Minimum 1 item is required' }),
      }),
    ),
    buyerName: z.string({
      invalid_type_error: 'Buyer name must be string',
      required_error: 'Buyer name is required',
    }),
    contactNumber: z.string({
      invalid_type_error: 'Contact number must be string',
      required_error: 'Contact number is required',
    }),
    soldDate: z.string().datetime({ message: 'Must be a valid date' }),
  }),
});

export const salesOrderValidation = {
  salesOrderCreateValidationSchema,
};
