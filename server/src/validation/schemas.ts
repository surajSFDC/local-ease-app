import { z } from 'zod';

// User validation schemas
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  phone: z.string().optional(),
  language: z.string().default('en'),
  location: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  phone: z.string().optional(),
  language: z.string().optional(),
  location: z.string().optional(),
  avatar: z.string().url().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

// Provider validation schemas
export const createProviderSchema = z.object({
  description: z.string().min(10, 'Description must be at least 10 characters'),
  location: z.string().optional(),
  userId: z.string().uuid().optional(),
});

export const updateProviderSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  category: z.string().min(1).max(50).optional(),
  description: z.string().min(10).optional(),
  location: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  pricing: z.object({
    min: z.number().min(0),
    max: z.number().min(0),
    currency: z.string().length(3),
    type: z.enum(['per_hour', 'per_service', 'per_day', 'per_project']),
  }).optional(),
  languages: z.array(z.string()).optional(),
  serviceArea: z.string().optional(),
  availability: z.record(z.array(z.object({
    start: z.string(),
    end: z.string(),
    available: z.boolean(),
  }))).optional(),
});

// Booking validation schemas
export const createBookingSchema = z.object({
  providerId: z.string().uuid('Invalid provider ID'),
  serviceDate: z.string().datetime().optional(),
  notes: z.string().max(500).optional(),
  customerLocation: z.string().optional(),
  estimatedDuration: z.number().min(15).max(480).optional(), // 15 minutes to 8 hours
});

export const updateBookingSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'in_progress', 'completed', 'cancelled']).optional(),
  serviceDate: z.string().datetime().optional(),
  notes: z.string().max(500).optional(),
  actualDuration: z.number().min(0).optional(),
});

// Message validation schemas
export const sendMessageSchema = z.object({
  toId: z.string().uuid('Invalid recipient ID'),
  message: z.string().min(1, 'Message cannot be empty').max(1000),
  messageType: z.enum(['text', 'image', 'location', 'system']).default('text'),
  bookingId: z.string().uuid().optional(),
});

// Review validation schemas
export const createReviewSchema = z.object({
  bookingId: z.string().uuid('Invalid booking ID'),
  providerId: z.string().uuid('Invalid provider ID'),
  rating: z.number().min(1).max(5, 'Rating must be between 1 and 5'),
  comment: z.string().max(500).optional(),
});

// Search validation schemas
export const searchProvidersSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
  userLanguage: z.string().optional(),
  location: z.string().optional(),
  category: z.string().optional(),
  minRating: z.number().min(0).max(5).optional(),
  maxPrice: z.number().min(0).optional(),
  radius: z.number().min(1).max(100).optional(), // km
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

// AI analysis validation schemas
export const analyzeTextSchema = z.object({
  text: z.string().min(1, 'Text is required'),
});

export const translateTextSchema = z.object({
  text: z.string().min(1, 'Text is required'),
  fromLang: z.string().min(2).max(5),
  toLang: z.string().min(2).max(5),
});

// Pagination schema
export const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Query parameter schemas
export const providerQuerySchema = z.object({
  category: z.string().optional(),
  location: z.string().optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  isVerified: z.coerce.boolean().optional(),
  isActive: z.coerce.boolean().optional(),
  ...paginationSchema.shape,
});

export const bookingQuerySchema = z.object({
  status: z.enum(['pending', 'confirmed', 'in_progress', 'completed', 'cancelled']).optional(),
  providerId: z.string().uuid().optional(),
  customerId: z.string().uuid().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  ...paginationSchema.shape,
});

// Validation middleware helper
export function validateRequest(schema: z.ZodSchema) {
  return (req: any, res: any, next: any) => {
    try {
      const result = schema.parse(req.body);
      req.validatedData = result;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
      }
      next(error);
    }
  };
}

// Query validation middleware helper
export function validateQuery(schema: z.ZodSchema) {
  return (req: any, res: any, next: any) => {
    try {
      const result = schema.parse(req.query);
      req.validatedQuery = result;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Query validation failed',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
      }
      next(error);
    }
  };
}
