import { z } from 'zod';

const userValidationSchema = z.object({
  body: z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string().max(20),
    phone: z.string(),
    img: z.string(),
    role: z.enum(['user', 'admin']).optional(),
    isPremium: z.boolean().optional(),
    isVerified: z.boolean().optional(),
    isBlocked: z.boolean().optional(),
    address: z.string().optional(),
    totalFollower: z.number().optional(),
    totalFollowing: z.number().optional(),
  }),
});

export default {
  userValidationSchema,
};
