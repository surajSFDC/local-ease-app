import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory data storage
interface Provider {
  id: string;
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
  createdAt: string;
  userId?: string;
}

const providers: Provider[] = [
  {
    id: '1',
    name: 'Professional Plumbing Services',
    category: 'Home Services',
    description: 'Expert plumber with 15 years of experience. Emergency repairs, installations, and maintenance. Available 24/7.',
    location: 'London, UK',
    rating: 4.8,
    reviewCount: 127,
    pricing: { min: 50, max: 150, currency: 'GBP', type: 'per_service' },
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'QuickFix Plumbing',
    category: 'Home Services',
    description: '24/7 emergency plumbing services. Fast, reliable, and affordable. Licensed and insured.',
    location: 'London, UK',
    rating: 4.6,
    reviewCount: 89,
    pricing: { min: 40, max: 120, currency: 'GBP', type: 'per_service' },
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Elite Electrical Solutions',
    category: 'Electrical Services',
    description: 'Professional electrician specializing in residential and commercial electrical work. Certified and experienced.',
    location: 'New York, USA',
    rating: 4.9,
    reviewCount: 203,
    pricing: { min: 75, max: 200, currency: 'USD', type: 'per_service' },
    createdAt: new Date().toISOString()
  },
  {
    id: '4',
    name: 'Clean & Shine Services',
    category: 'Cleaning Services',
    description: 'Professional cleaning services for homes and offices. Eco-friendly products, fully insured.',
    location: 'Toronto, Canada',
    rating: 4.7,
    reviewCount: 156,
    pricing: { min: 60, max: 180, currency: 'CAD', type: 'per_service' },
    createdAt: new Date().toISOString()
  }
];

// Helper function to detect language (simplified - in production, use OpenAI)
function detectLanguage(text: string): { code: string; name: string; nativeName: string; confidence: number } {
  // Simple keyword-based detection (in production, use OpenAI)
  const lowerText = text.toLowerCase();
  
  if (/[\u0900-\u097F]/.test(text)) {
    return { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', confidence: 0.95 };
  }
  if (/[\u4E00-\u9FFF]/.test(text)) {
    return { code: 'zh', name: 'Chinese', nativeName: '中文', confidence: 0.95 };
  }
  if (/[\u0600-\u06FF]/.test(text)) {
    return { code: 'ar', name: 'Arabic', nativeName: 'العربية', confidence: 0.95 };
  }
  if (/[ñáéíóúü]/.test(lowerText) && /(soy|estoy|tengo|servicio|profesional)/.test(lowerText)) {
    return { code: 'es', name: 'Spanish', nativeName: 'Español', confidence: 0.90 };
  }
  
  return { code: 'en', name: 'English', nativeName: 'English', confidence: 0.85 };
}

// Helper function to extract service details from description
function extractServiceDetails(description: string, detectedLang: string) {
  const lowerDesc = description.toLowerCase();
  
  // Extract category
  let category = 'Home Services';
  if (lowerDesc.includes('plumb') || lowerDesc.includes('नल') || lowerDesc.includes('fontanero')) {
    category = 'Plumbing';
  } else if (lowerDesc.includes('electric') || lowerDesc.includes('बिजली') || lowerDesc.includes('electricista')) {
    category = 'Electrical Services';
  } else if (lowerDesc.includes('clean') || lowerDesc.includes('सफाई') || lowerDesc.includes('limpieza')) {
    category = 'Cleaning Services';
  } else if (lowerDesc.includes('carpent') || lowerDesc.includes('बढ़ई') || lowerDesc.includes('carpintero')) {
    category = 'Carpentry';
  } else if (lowerDesc.includes('paint') || lowerDesc.includes('पेंट') || lowerDesc.includes('pintor')) {
    category = 'Painting Services';
  }
  
  // Extract pricing (look for numbers with currency indicators)
  let minPrice = 50;
  let maxPrice = 150;
  let currency = 'USD';
  
  const priceMatch = description.match(/(\d+)\s*(?:-|to|–)\s*(\d+)|(\d+)\s*(?:per|hour|hr|day)/i);
  if (priceMatch) {
    minPrice = parseInt(priceMatch[1] || priceMatch[3] || '50');
    maxPrice = parseInt(priceMatch[2] || priceMatch[3] || '150');
  }
  
  // Detect currency based on location keywords or language
  if (lowerDesc.includes('london') || lowerDesc.includes('uk') || lowerDesc.includes('britain')) {
    currency = 'GBP';
  } else if (lowerDesc.includes('toronto') || lowerDesc.includes('canada')) {
    currency = 'CAD';
  } else if (lowerDesc.includes('euro') || lowerDesc.includes('€') || lowerDesc.includes('madrid') || lowerDesc.includes('paris')) {
    currency = 'EUR';
  } else if (detectedLang === 'hi' || lowerDesc.includes('delhi') || lowerDesc.includes('mumbai')) {
    currency = 'INR';
  } else if (detectedLang === 'zh' || lowerDesc.includes('beijing') || lowerDesc.includes('shanghai')) {
    currency = 'CNY';
  }
  
  // Extract name (first sentence or first few words)
  const sentences = description.split(/[.!?]/);
  let name = sentences[0]?.trim() || 'Professional Service Provider';
  if (name.length > 50) {
    name = name.substring(0, 47) + '...';
  }
  
  return { category, minPrice, maxPrice, currency, name };
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'LocalEase API is running' });
});

// AI endpoints
app.post('/api/ai/analyze', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    const detectedLanguage = detectLanguage(text);
    
    // Simple intent detection
    const lowerText = text.toLowerCase();
    let primaryIntent = 'search_service';
    let service = 'general';
    
    if (lowerText.includes('need') || lowerText.includes('looking for') || lowerText.includes('find') || lowerText.includes('search')) {
      primaryIntent = 'search_service';
    } else if (lowerText.includes('i am') || lowerText.includes('i\'m') || lowerText.includes('soy') || lowerText.includes('मैं')) {
      primaryIntent = 'create_profile';
    }
    
    if (lowerText.includes('plumb')) service = 'plumber';
    else if (lowerText.includes('electric')) service = 'electrician';
    else if (lowerText.includes('clean')) service = 'cleaner';
    
    res.json({
      language: {
        detectedLanguage
      },
      intent: {
        primaryIntent,
        confidence: 0.95,
        entities: {
          service,
          urgency: lowerText.includes('urgent') || lowerText.includes('emergency') ? 'high' : 'normal'
        },
        suggestedAction: primaryIntent === 'search_service' 
          ? `Search for ${service} services` 
          : 'Create service provider profile'
      }
    });
  } catch (error) {
    console.error('Error analyzing text:', error);
    res.status(500).json({ error: 'Failed to analyze text' });
  }
});

app.post('/api/ai/create-profile', async (req, res) => {
  try {
    const { description, userId, location } = req.body;
    
    if (!description) {
      return res.status(400).json({ error: 'Description is required' });
    }
    
    const detectedLanguage = detectLanguage(description);
    const serviceDetails = extractServiceDetails(description, detectedLanguage.code);
    
    // Extract location from description if not provided
    let providerLocation = location || 'Unknown Location';
    const locationKeywords = ['london', 'new york', 'toronto', 'delhi', 'mumbai', 'madrid', 'paris', 'beijing'];
    for (const keyword of locationKeywords) {
      if (description.toLowerCase().includes(keyword)) {
        providerLocation = keyword.charAt(0).toUpperCase() + keyword.slice(1);
        break;
      }
    }
    
    const newProvider: Provider = {
      id: `provider-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: serviceDetails.name,
      category: serviceDetails.category,
      description: description,
      location: providerLocation,
      rating: 0,
      reviewCount: 0,
      pricing: {
        min: serviceDetails.minPrice,
        max: serviceDetails.maxPrice,
        currency: serviceDetails.currency,
        type: 'per_service'
      },
      createdAt: new Date().toISOString(),
      userId
    };
    
    providers.push(newProvider);
    
    res.json({
      provider: newProvider,
      aiAnalysis: {
        detectedLanguage: {
          code: detectedLanguage.code,
          name: detectedLanguage.name
        }
      }
    });
  } catch (error) {
    console.error('Error creating profile:', error);
    res.status(500).json({ error: 'Failed to create profile' });
  }
});

app.post('/api/ai/search', async (req, res) => {
  try {
    const { query, userLanguage, location } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }
    
    const detectedLanguage = detectLanguage(query);
    const lowerQuery = query.toLowerCase();
    
    // Simple search matching
    const matchedProviders = providers.filter(provider => {
      const searchText = `${provider.name} ${provider.description} ${provider.category} ${provider.location}`.toLowerCase();
      return searchText.includes(lowerQuery) || 
             lowerQuery.includes(provider.category.toLowerCase()) ||
             (lowerQuery.includes('plumb') && provider.category.toLowerCase().includes('plumb')) ||
             (lowerQuery.includes('electric') && provider.category.toLowerCase().includes('electric')) ||
             (lowerQuery.includes('clean') && provider.category.toLowerCase().includes('clean'));
    });
    
    res.json({
      providers: matchedProviders,
      searchAnalysis: {
        query,
        queryTranslated: query,
        intent: 'search_service',
        category: matchedProviders[0]?.category || 'Home Services',
        detectedLanguage: {
          code: detectedLanguage.code,
          name: detectedLanguage.name
        }
      }
    });
  } catch (error) {
    console.error('Error searching:', error);
    res.status(500).json({ error: 'Failed to search' });
  }
});

// Provider endpoints
app.get('/api/providers', (req, res) => {
  try {
    const { q, category, location } = req.query;
    
    let filteredProviders = [...providers];
    
    if (q) {
      const query = (q as string).toLowerCase();
      filteredProviders = filteredProviders.filter(provider => {
        const searchText = `${provider.name} ${provider.description} ${provider.category}`.toLowerCase();
        return searchText.includes(query);
      });
    }
    
    if (category) {
      filteredProviders = filteredProviders.filter(provider => 
        provider.category.toLowerCase().includes((category as string).toLowerCase())
      );
    }
    
    if (location) {
      filteredProviders = filteredProviders.filter(provider => 
        provider.location.toLowerCase().includes((location as string).toLowerCase())
      );
    }
    
    res.json({ providers: filteredProviders });
  } catch (error) {
    console.error('Error fetching providers:', error);
    res.status(500).json({ error: 'Failed to fetch providers' });
  }
});

app.get('/api/providers/:id', (req, res) => {
  try {
    const { id } = req.params;
    const provider = providers.find(p => p.id === id);
    
    if (!provider) {
      return res.status(404).json({ error: 'Provider not found' });
    }
    
    res.json({ provider });
  } catch (error) {
    console.error('Error fetching provider:', error);
    res.status(500).json({ error: 'Failed to fetch provider' });
  }
});

app.post('/api/providers', (req, res) => {
  try {
    const { name, category, description, location, pricing, userId } = req.body;
    
    if (!name || !category || !description) {
      return res.status(400).json({ error: 'Name, category, and description are required' });
    }
    
    const newProvider: Provider = {
      id: `provider-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      category,
      description,
      location: location || 'Unknown Location',
      rating: 0,
      reviewCount: 0,
      pricing: pricing || { min: 50, max: 150, currency: 'USD', type: 'per_service' },
      createdAt: new Date().toISOString(),
      userId
    };
    
    providers.push(newProvider);
    
    res.status(201).json({ provider: newProvider });
  } catch (error) {
    console.error('Error creating provider:', error);
    res.status(500).json({ error: 'Failed to create provider' });
  }
});

// Booking endpoints
app.post('/api/bookings', (req, res) => {
  try {
    const { providerId, customerId, serviceDate, notes } = req.body;
    
    if (!providerId || !customerId) {
      return res.status(400).json({ error: 'Provider ID and customer ID are required' });
    }
    
    const booking = {
      id: `booking-${Date.now()}`,
      providerId,
      customerId,
      serviceDate: serviceDate || new Date().toISOString(),
      notes: notes || '',
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    res.status(201).json({ booking });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// Message endpoints
app.post('/api/messages', (req, res) => {
  try {
    const { fromId, toId, message } = req.body;
    
    if (!fromId || !toId || !message) {
      return res.status(400).json({ error: 'From ID, to ID, and message are required' });
    }
    
    const newMessage = {
      id: `message-${Date.now()}`,
      fromId,
      toId,
      message,
      createdAt: new Date().toISOString()
    };
    
    res.status(201).json({ message: newMessage });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Review endpoints
app.post('/api/reviews', (req, res) => {
  try {
    const { providerId, customerId, rating, comment } = req.body;
    
    if (!providerId || !customerId || !rating) {
      return res.status(400).json({ error: 'Provider ID, customer ID, and rating are required' });
    }
    
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }
    
    // Update provider rating (simplified - in production, calculate average)
    const provider = providers.find(p => p.id === providerId);
    if (provider) {
      provider.reviewCount += 1;
      provider.rating = ((provider.rating * (provider.reviewCount - 1)) + rating) / provider.reviewCount;
    }
    
    const review = {
      id: `review-${Date.now()}`,
      providerId,
      customerId,
      rating,
      comment: comment || '',
      createdAt: new Date().toISOString()
    };
    
    res.status(201).json({ review, provider });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ error: 'Failed to create review' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 LocalEase API server running on http://localhost:${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📊 Total providers: ${providers.length}`);
});
