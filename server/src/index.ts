import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import { z } from 'zod';

// Import our services and middleware
import { detectLanguage, analyzeIntent, generateProviderProfile, enhanceSearch, translateText } from './services/openai.js';
import { authenticateToken, optionalAuth, hashPassword, verifyPassword, generateToken, createUser, findUserByEmail } from './middleware/auth-simple.js';
import { registerSchema, loginSchema, updateProfileSchema, changePasswordSchema, createProviderSchema, searchProvidersSchema, analyzeTextSchema } from './validation/schemas.js';

// Simple validation helper
function validateBody(schema: z.ZodSchema, body: any) {
  const result = schema.safeParse(body);
  if (!result.success) {
    throw new Error(`Validation failed: ${result.error.errors.map(e => e.message).join(', ')}`);
  }
  return result.data;
}

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// In-memory storage (will be replaced with database)
interface User {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  role: string;
  createdAt: string;
}

interface Provider {
  id: string;
  userId: string;
  name: string;
  category: string;
  description: string;
  location: string;
  rating: number;
  reviewCount: number;
  pricing: {
    min: number;
    max: number;
    currency: string;
    type: string;
  };
  languages: string[];
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
}

interface Booking {
  id: string;
  customerId: string;
  providerId: string;
  serviceDate?: string;
  status: string;
  notes?: string;
  totalAmount?: number;
  currency: string;
  createdAt: string;
}

interface Message {
  id: string;
  fromId: string;
  toId: string;
  message: string;
  bookingId?: string;
  isRead: boolean;
  createdAt: string;
}

interface Review {
  id: string;
  bookingId: string;
  customerId: string;
  providerId: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

// In-memory storage
const users: User[] = [];
const providers: Provider[] = [
  {
    id: '1',
    userId: 'system',
    name: 'Professional Plumbing Services',
    category: 'Plumbing',
    description: 'Expert plumber with 15 years of experience. Emergency repairs, installations, and maintenance. Available 24/7.',
    location: 'London, UK',
    rating: 4.8,
    reviewCount: 127,
    pricing: { min: 50, max: 150, currency: 'GBP', type: 'per_service' },
    languages: ['en'],
    isVerified: true,
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    userId: 'system',
    name: 'QuickFix Plumbing',
    category: 'Plumbing',
    description: '24/7 emergency plumbing services. Fast, reliable, and affordable. Licensed and insured.',
    location: 'London, UK',
    rating: 4.6,
    reviewCount: 89,
    pricing: { min: 40, max: 120, currency: 'GBP', type: 'per_service' },
    languages: ['en'],
    isVerified: true,
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    userId: 'system',
    name: 'Delhi Home Cleaning',
    category: 'Cleaning',
    description: 'Professional home cleaning services in Delhi. Deep cleaning, regular maintenance, and sanitization.',
    location: 'Delhi, India',
    rating: 4.7,
    reviewCount: 156,
    pricing: { min: 500, max: 2000, currency: 'INR', type: 'per_service' },
    languages: ['hi', 'en'],
    isVerified: true,
    isActive: true,
    createdAt: new Date().toISOString()
  }
];
const bookings: Booking[] = [];
const messages: Message[] = [];
const reviews: Review[] = [];

// Utility functions
function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function findUserByEmail(email: string): User | undefined {
  return users.find(user => user.email === email);
}

function findUserById(id: string): User | undefined {
  return users.find(user => user.id === id);
}

function findProviderById(id: string): Provider | undefined {
  return providers.find(provider => provider.id === id);
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'LocalEase API is running',
    features: {
      ai: !!process.env.OPENAI_API_KEY,
      auth: true,
      database: false // Will be true when we add PostgreSQL
    },
    debug: {
      hasOpenAIKey: !!process.env.OPENAI_API_KEY,
      keyLength: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0
    }
  });
});

// Authentication endpoints
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = validateBody(registerSchema, req.body);

    // Create user using the auth service
    const user = await createUser({ email, password, firstName, lastName });

    // Generate JWT token
    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    res.status(201).json({
      message: 'User registered successfully',
      user,
      token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = validateBody(loginSchema, req.body);

    // Find user
    const user = findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = findUserById(req.user!.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone || '',
        location: user.location || '',
        language: user.language || 'en',
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Update user profile
app.put('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const { firstName, lastName, phone, location, language } = validateBody(updateProfileSchema, req.body);

    const user = findUserById(req.user!.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user data
    Object.assign(user, {
      firstName: firstName || user.firstName,
      lastName: lastName || user.lastName,
      phone: phone || user.phone,
      location: location || user.location,
      language: language || user.language,
    });

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone || '',
        location: user.location || '',
        language: user.language || 'en',
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    res.status(400).json({ error: error.message || 'Failed to update profile' });
  }
});

// Change password
app.put('/api/auth/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = validateBody(changePasswordSchema, req.body);

    const user = findUserById(req.user!.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isValidPassword = await verifyPassword(currentPassword, user.passwordHash);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    user.passwordHash = await hashPassword(newPassword);

    res.json({
      message: 'Password changed successfully',
    });
  } catch (error: any) {
    console.error('Change password error:', error);
    res.status(400).json({ error: error.message || 'Failed to change password' });
  }
});

// AI endpoints with real OpenAI integration
app.post('/api/ai/analyze', async (req, res) => {
  try {
    const { text } = validateBody(analyzeTextSchema, req.body);

    if (!process.env.OPENAI_API_KEY) {
      // Fallback to simple analysis
      const detectedLanguage = { code: 'en', name: 'English', nativeName: 'English', confidence: 0.5 };
      const intent = {
        primaryIntent: 'search_service',
        confidence: 0.5,
        entities: { service: 'general', urgency: 'normal' },
        suggestedAction: 'Search for local services'
      };

      return res.json({ language: { detectedLanguage }, intent });
    }

    // Real AI analysis
    const detectedLanguage = await detectLanguage(text);
    const intent = await analyzeIntent(text, detectedLanguage);

    res.json({
      language: { detectedLanguage },
      intent
    });
  } catch (error) {
    console.error('AI analysis error:', error);
    res.status(500).json({ error: 'Analysis failed' });
  }
});

app.post('/api/ai/create-profile', authenticateToken, async (req, res) => {
  try {
    const { description, location } = validateBody(createProviderSchema, req.body);
    const userId = req.user!.id;

    if (!process.env.OPENAI_API_KEY) {
      // Fallback profile generation
      const provider: Provider = {
        id: generateId(),
        userId,
        name: 'Professional Service Provider',
        category: 'Home Services',
        description: description.substring(0, 200),
        location: location || 'Local area',
        rating: 0,
        reviewCount: 0,
        pricing: { min: 50, max: 150, currency: 'USD', type: 'per_service' },
        languages: ['en'],
        isVerified: false,
        isActive: true,
        createdAt: new Date().toISOString(),
      };

      providers.push(provider);
      return res.json({ provider, aiAnalysis: { detectedLanguage: { code: 'en', name: 'English' } } });
    }

    // Real AI profile generation
    const detectedLanguage = await detectLanguage(description);
    const profileData = await generateProviderProfile(description, detectedLanguage, location);

    const provider: Provider = {
      id: generateId(),
      userId,
      name: profileData.name,
      category: profileData.category,
      description: profileData.description,
      location: location || profileData.serviceArea,
      rating: 0,
      reviewCount: 0,
      pricing: profileData.pricing,
      languages: profileData.languages,
      isVerified: false,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    providers.push(provider);

    res.json({
      provider,
      aiAnalysis: { detectedLanguage }
    });
  } catch (error) {
    console.error('Profile creation error:', error);
    res.status(500).json({ error: 'Profile creation failed' });
  }
});

app.post('/api/ai/search', optionalAuth, async (req, res) => {
  try {
    const { query, userLanguage, location } = validateBody(searchProvidersSchema, req.body);

    let searchResults = [...providers];
    let searchAnalysis = {
      query,
      queryTranslated: query,
      intent: 'search_service',
      category: 'General Services',
      detectedLanguage: { code: 'en', name: 'English' }
    };

    if (process.env.OPENAI_API_KEY) {
      // Real AI search enhancement
      const detectedLanguage = await detectLanguage(query);
      const enhancedSearch = await enhanceSearch(query, detectedLanguage, location);

      searchAnalysis = {
        query,
        queryTranslated: query,
        intent: enhancedSearch.searchIntent,
        category: enhancedSearch.category,
        detectedLanguage
      };

      // Filter by category if detected
      if (enhancedSearch.category && enhancedSearch.category !== 'General Services') {
        searchResults = searchResults.filter(provider =>
          provider.category.toLowerCase().includes(enhancedSearch.category.toLowerCase()) ||
          provider.description.toLowerCase().includes(enhancedSearch.category.toLowerCase())
        );
      }

      // Filter by keywords
      if (enhancedSearch.keywords && enhancedSearch.keywords.length > 0) {
        searchResults = searchResults.filter(provider => {
          const searchText = `${provider.name} ${provider.description} ${provider.category}`.toLowerCase();
        return enhancedSearch.keywords.some((keyword: string) =>
          searchText.includes(keyword.toLowerCase())
        );
        });
      }
    } else {
      // Simple keyword search fallback
      const queryLower = query.toLowerCase();
      searchResults = searchResults.filter(provider => {
        const searchText = `${provider.name} ${provider.description} ${provider.category}`.toLowerCase();
        return searchText.includes(queryLower);
      });
    }

    // Filter by location if provided
    if (location) {
      searchResults = searchResults.filter(provider =>
        provider.location.toLowerCase().includes(location.toLowerCase())
      );
    }

    // Sort by rating
    searchResults.sort((a, b) => b.rating - a.rating);

    res.json({
      providers: searchResults,
      searchAnalysis
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// Provider endpoints
app.get('/api/providers', optionalAuth, (req, res) => {
  try {
    const { category, location, q } = req.query;
    let results = [...providers];

    if (category) {
      results = results.filter(p => p.category.toLowerCase().includes((category as string).toLowerCase()));
    }

    if (location) {
      results = results.filter(p => p.location.toLowerCase().includes((location as string).toLowerCase()));
    }

    if (q) {
      const query = (q as string).toLowerCase();
      results = results.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
      );
    }

    results.sort((a, b) => b.rating - a.rating);

    res.json({ providers: results });
  } catch (error) {
    console.error('Get providers error:', error);
    res.status(500).json({ error: 'Failed to fetch providers' });
  }
});

app.get('/api/providers/:id', optionalAuth, (req, res) => {
  try {
    const provider = findProviderById(req.params.id);
    if (!provider) {
      return res.status(404).json({ error: 'Provider not found' });
    }

    res.json({ provider });
  } catch (error) {
    console.error('Get provider error:', error);
    res.status(500).json({ error: 'Failed to fetch provider' });
  }
});

// Booking endpoints
app.post('/api/bookings', authenticateToken, (req, res) => {
  try {
    const { providerId, serviceDate, notes } = req.body;
    const customerId = req.user!.id;

    const provider = findProviderById(providerId);
    if (!provider) {
      return res.status(404).json({ error: 'Provider not found' });
    }

    const booking: Booking = {
      id: generateId(),
      customerId,
      providerId,
      serviceDate,
      status: 'pending',
      notes,
      currency: provider.pricing.currency,
      createdAt: new Date().toISOString(),
    };

    bookings.push(booking);

    res.status(201).json({ booking });
  } catch (error) {
    console.error('Booking creation error:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// Message endpoints
app.post('/api/messages', authenticateToken, (req, res) => {
  try {
    const { toId, message, bookingId } = req.body;
    const fromId = req.user!.id;

    const newMessage: Message = {
      id: generateId(),
      fromId,
      toId,
      message,
      bookingId,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    messages.push(newMessage);

    res.status(201).json({ message: newMessage });
  } catch (error) {
    console.error('Message creation error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Review endpoints
app.post('/api/reviews', authenticateToken, (req, res) => {
  try {
    const { providerId, bookingId, rating, comment } = req.body;
    const customerId = req.user!.id;

    const review: Review = {
      id: generateId(),
      bookingId,
      customerId,
      providerId,
      rating,
      comment,
      createdAt: new Date().toISOString(),
    };

    reviews.push(review);

    // Update provider rating
    const provider = findProviderById(providerId);
    if (provider) {
      const providerReviews = reviews.filter(r => r.providerId === providerId);
      const avgRating = providerReviews.reduce((sum, r) => sum + r.rating, 0) / providerReviews.length;
      provider.rating = Math.round(avgRating * 10) / 10;
      provider.reviewCount = providerReviews.length;
    }

    res.status(201).json({ review });
  } catch (error) {
    console.error('Review creation error:', error);
    res.status(500).json({ error: 'Failed to create review' });
  }
});

// Translation endpoint
app.post('/api/translate', authenticateToken, async (req, res) => {
  try {
    const { text, fromLang, toLang } = req.body;

    if (!process.env.OPENAI_API_KEY) {
      return res.json({ translatedText: text }); // Fallback: return original text
    }

    const translatedText = await translateText(text, fromLang, toLang);
    res.json({ translatedText });
  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({ error: 'Translation failed' });
  }
});

// Error handling middleware
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 LocalEase API server running on http://localhost:${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🤖 AI features: ${process.env.OPENAI_API_KEY ? '✅ Enabled' : '❌ Disabled (set OPENAI_API_KEY)'}`);
  console.log(`🔐 Authentication: ✅ Enabled`);
  console.log(`📊 Total providers: ${providers.length}`);
});

export default app;
