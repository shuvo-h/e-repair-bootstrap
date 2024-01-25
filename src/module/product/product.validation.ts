import { z } from 'zod';

const productFeatureValidationSchema = z.object({
  cameraResolution: z
    .string({ invalid_type_error: 'must be string' })
    .optional(),
  storageCapacity: z
    .string({ invalid_type_error: 'must be string' })
    .optional(),
  screenSize: z.string({ invalid_type_error: 'must be string' }).optional(),
});
const productDimensionValidationSchema = z.object({
  height: z.number({ invalid_type_error: 'must be number' }).min(0).optional(),
  width: z.number({ invalid_type_error: 'must be number' }).min(0).optional(),
  depth: z.number({ invalid_type_error: 'must be number' }).min(0).optional(),
});
const createProductValidationSchema = z.object({
  body: z.object({
    name: z.string({ invalid_type_error: 'must be string' }),
    slug: z.string({ invalid_type_error: 'must be string' }).optional(),
    price: z.number({ invalid_type_error: 'must be number' }).min(0),
    quantity: z.number({ invalid_type_error: 'must be number' }).min(0),
    isAvailable: z
      .boolean({ invalid_type_error: 'must be true or false' })
      .optional(),
    releaseDate: z.string().datetime({ message: 'must be a Date' }).optional(),
    brand: z.string({ invalid_type_error: 'must be string' }).optional(),
    model: z.string({ invalid_type_error: 'must be string' }).optional(),
    category: z.string({ invalid_type_error: 'must be string' }).optional(),
    operatingSystem: z
      .string({ invalid_type_error: 'must be string' })
      .optional(),
    connectivity: z.string({ invalid_type_error: 'must be string' }).optional(),
    powerSource: z.string({ invalid_type_error: 'must be string' }).optional(),
    features: productFeatureValidationSchema.optional(),
    dimension: productDimensionValidationSchema.optional(),
  }),
});
const updateProductValidationSchema = z.object({
  body: z.object({
    name: z.string({ invalid_type_error: 'must be string' }).optional(),
    slug: z.string({ invalid_type_error: 'must be string' }).optional(),
    price: z.number({ invalid_type_error: 'must be number' }).min(0).optional(),
    quantity: z
      .number({ invalid_type_error: 'must be number' })
      .min(0)
      .optional(),
    isAvailable: z
      .boolean({ invalid_type_error: 'must be true or false' })
      .optional(),
    releaseDate: z.string().datetime({ message: 'must be a Date' }).optional(),
    brand: z.string({ invalid_type_error: 'must be string' }).optional(),
    model: z.string({ invalid_type_error: 'must be string' }).optional(),
    category: z.string({ invalid_type_error: 'must be string' }).optional(),
    operatingSystem: z
      .string({ invalid_type_error: 'must be string' })
      .optional(),
    connectivity: z.string({ invalid_type_error: 'must be string' }).optional(),
    powerSource: z.string({ invalid_type_error: 'must be string' }).optional(),
    features: productFeatureValidationSchema.optional(),
    dimension: productDimensionValidationSchema.optional(),
  }),
});

export const productValidations = {
  createProductValidationSchema,
  updateProductValidationSchema,
};
