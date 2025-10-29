import { z } from 'zod';

// User Registration Validation
const userSignUpValidation = z.object({
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
    image: z.string().optional(),
  }),
});

// Login Validation
const userSignInValidation = z.object({
  body: z.object({
    device: z.enum(['web', 'mobile']).optional(),
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
  }),
});

// otp validation
const VerifyOtpValidation = z.object({
  body: z.object({
    email: z
      .string({
        required_error: 'Email is required',
      })
      .email('Invalid email format'),

    oneTimeCode: z
      .string({
        required_error: 'oneTimeCode is required',
      })
      .length(6, 'oneTimeCode must be 6 digits'),
  }),
});

// Forgot Password Validation
const ForgotPasswordValidation = z.object({
  body: z.object({
    email: z
      .string({
        required_error: 'Email is required',
      })
      .email('Invalid email format'),
  }),
});

// Reset Password Validation
const ResetPasswordValidation = z.object({
  body: z.object({
    email: z
      .string({
        required_error: 'Email is required',
      })
      .email('Invalid email format'),

    password: z
      .string({
        required_error: 'New password is required',
      })
      .min(6, 'New password must be at least 6 characters'),
  }),
});

// Password Change Validation
const updatePasswordValidation = z.object({
  body: z.object({
    oldPassword: z.string({
      required_error: 'Old password is required',
    }),

    newPassword: z
      .string({
        required_error: 'New password is required',
      })
      .min(6, 'New password must be at least 6 characters'),
  }),
});
//   .refine((data) => data.body.newPassword === data.body.confirmPassword, {
//     message: "Passwords don't match",
//     path: ['body', 'confirmPassword'],
//   });

// Email Verification
const emailVerificationSchema = z.object({
  body: z.object({
    email: z
      .string({
        required_error: 'Email is required',
      })
      .email('Invalid email format'),

    oneTimeCode: z
      .string({
        required_error: 'oneTimeCode code is required',
      })
      .length(6, 'oneTimeCode code must be 6 digits'),
  }),
});

// logout Verification
const logoutVerification = z.object({
  body: z.object({
    refresh_token: z.string({
      required_error: 'Refresh token is required',
    }),
  }),
});
// refresh_token Verification
const refreshTokenVerification = z.object({
  body: z.object({
    refresh_token: z.string({
      required_error: 'Refresh token is required',
    }),
  }),
});

// login with oauth validation
const loginWithOAuthValidation = z.object({
  body: z
    .object({
      name: z.string({
        required_error: 'OAuth name is required',
      }),
      email: z
        .string({
          required_error: 'OAuth email is required',
        })
        .email('Invalid email format'),
      image: z.string().optional(),
      token: z.string().optional(),
      provider: z.enum(['google', 'facebook', 'twitter', 'apple', 'github'], {
        required_error: 'OAuth provider is required',
      }),
    })
    .strict(),
});

const AuthValidation = {
  userSignUpValidation,
  userSignInValidation,
  VerifyOtpValidation,
  ForgotPasswordValidation,
  ResetPasswordValidation,
  updatePasswordValidation,
  emailVerificationSchema,
  refreshTokenVerification,
  logoutVerification,
  loginWithOAuthValidation,
};

export default AuthValidation;
