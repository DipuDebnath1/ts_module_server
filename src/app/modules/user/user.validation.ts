import { z } from 'zod';

// User Registration Validation
const userValidationSchema = z.object({
  body: z.object({
    name: z
      .string({
        required_error: 'Name is required',
      })
      .min(2, 'Name must be at least 2 characters'),

    email: z
      .string({
        required_error: 'Email is required',
      })
      .email('Invalid email format'),

    password: z
      .string({
        required_error: 'Password is required',
      })
      .min(6, 'Password must be at least 6 characters'),

    phone: z.string().optional(),
    address: z.string().optional(),
    img: z.string().optional(),
  }),
});

// Login Validation
const loginValidationSchema = z.object({
  body: z.object({
    email: z
      .string({
        required_error: 'Email is required',
      })
      .email('Invalid email format'),

    password: z
      .string({
        required_error: 'Password is required',
      })
      .min(1, 'Password is required'),

    img: z.string().optional(), // Allow image update during login
  }),
});

// Update Profile Validation
const updateProfileValidationSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    img: z.string().optional(),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .optional(),
  }),
});

// Follow/Unfollow Validation
const followValidationSchema = z.object({
  body: z.object({
    followedId: z
      .string({
        required_error: 'User ID to follow is required',
      })
      .min(1, 'Valid user ID is required'),
  }),
});

// Change Role Validation
const changeRoleValidationSchema = z.object({
  body: z.object({
    userId: z
      .string({
        required_error: 'User ID is required',
      })
      .min(1, 'Valid user ID is required'),

    role: z.enum(['user', 'admin'], {
      required_error: 'Role is required',
      invalid_type_error: 'Role must be either user or admin',
    }),
  }),
});

// User Action Validation (Block/Unblock/Delete/Restore)
const userActionValidationSchema = z.object({
  body: z.object({
    userId: z
      .string({
        required_error: 'User ID is required',
      })
      .min(1, 'Valid user ID is required'),
  }),
});

// Password Change Validation
const changePasswordValidationSchema = z
  .object({
    body: z.object({
      currentPassword: z.string({
        required_error: 'Current password is required',
      }),

      newPassword: z
        .string({
          required_error: 'New password is required',
        })
        .min(6, 'New password must be at least 6 characters'),

      confirmPassword: z.string({
        required_error: 'Confirm password is required',
      }),
    }),
  })
  .refine((data) => data.body.newPassword === data.body.confirmPassword, {
    message: "Passwords don't match",
    path: ['body', 'confirmPassword'],
  });

// Email Verification
const emailVerificationSchema = z.object({
  body: z.object({
    email: z
      .string({
        required_error: 'Email is required',
      })
      .email('Invalid email format'),

    verificationCode: z
      .string({
        required_error: 'Verification code is required',
      })
      .length(6, 'Verification code must be 6 digits'),
  }),
});

// Reset Password Request
const resetPasswordRequestSchema = z.object({
  body: z.object({
    email: z
      .string({
        required_error: 'Email is required',
      })
      .email('Invalid email format'),
  }),
});

// Reset Password
const resetPasswordSchema = z
  .object({
    body: z.object({
      email: z
        .string({
          required_error: 'Email is required',
        })
        .email('Invalid email format'),

      resetToken: z.string({
        required_error: 'Reset token is required',
      }),

      newPassword: z
        .string({
          required_error: 'New password is required',
        })
        .min(6, 'Password must be at least 6 characters'),

      confirmPassword: z.string({
        required_error: 'Confirm password is required',
      }),
    }),
  })
  .refine((data) => data.body.newPassword === data.body.confirmPassword, {
    message: "Passwords don't match",
    path: ['body', 'confirmPassword'],
  });

const userValidation = {
  userValidationSchema,
  loginValidationSchema,
  updateProfileValidationSchema,
  followValidationSchema,
  changeRoleValidationSchema,
  userActionValidationSchema,
  changePasswordValidationSchema,
  emailVerificationSchema,
  resetPasswordRequestSchema,
  resetPasswordSchema,
};

export default userValidation;
