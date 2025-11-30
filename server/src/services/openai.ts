import OpenAI from 'openai';

// Initialize OpenAI client lazily
let client: OpenAI | null = null;

function getOpenAI(): OpenAI | null {
  if (!client && process.env.OPENAI_API_KEY) {
    client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return client;
}

// Language detection with OpenAI
export async function detectLanguage(text: string) {
  const client = getOpenAI();
  if (!client) {
    // Fallback when OpenAI is not available
    return {
      code: 'en',
      name: 'English',
      nativeName: 'English',
      confidence: 0.5
    };
  }

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a language detection expert. Analyze the given text and return ONLY a JSON object with the following structure:
{
  "code": "language_code",
  "name": "Language Name",
  "nativeName": "Native Language Name",
  "confidence": 0.95
}

Use ISO 639-1 codes (en, es, fr, hi, zh, ar, etc.). Be accurate and confident.`
        },
        {
          role: 'user',
          content: text
        }
      ],
      temperature: 0.1,
      max_tokens: 100,
    });

    const result = response.choices[0]?.message?.content;
    if (!result) {
      throw new Error('No response from OpenAI');
    }

    return JSON.parse(result);
  } catch (error) {
    console.error('Language detection error:', error);
    // Fallback to simple detection
    return {
      code: 'en',
      name: 'English',
      nativeName: 'English',
      confidence: 0.5
    };
  }
}

// Intent analysis with OpenAI
export async function analyzeIntent(text: string, detectedLanguage: any) {
  const client = getOpenAI();
  if (!client) {
    // Fallback intent analysis
    const lowerText = text.toLowerCase();
    return {
      primaryIntent: lowerText.includes('need') || lowerText.includes('looking') ? 'search_service' : 'ask_question',
      confidence: 0.5,
      entities: {
        service: 'general',
        urgency: lowerText.includes('urgent') || lowerText.includes('emergency') ? 'high' : 'normal'
      },
      suggestedAction: 'Search for local services'
    };
  }

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an intent analysis expert for a local services platform. Analyze the user's text and return ONLY a JSON object:
{
  "primaryIntent": "search_service|create_profile|book_service|ask_question",
  "confidence": 0.95,
  "entities": {
    "service": "plumber|electrician|cleaner|carpenter|painter|general",
    "urgency": "low|normal|high|emergency",
    "location": "extracted_location_if_any"
  },
  "suggestedAction": "human readable suggestion"
}

Analyze the intent based on keywords, context, and language patterns.`
        },
        {
          role: 'user',
          content: `Language: ${detectedLanguage.name}\nText: ${text}`
        }
      ],
      temperature: 0.2,
      max_tokens: 200,
    });

    const result = response.choices[0]?.message?.content;
    if (!result) {
      throw new Error('No response from OpenAI');
    }

    return JSON.parse(result);
  } catch (error) {
    console.error('Intent analysis error:', error);
    // Fallback intent analysis
    const lowerText = text.toLowerCase();
    return {
      primaryIntent: lowerText.includes('need') || lowerText.includes('looking') ? 'search_service' : 'ask_question',
      confidence: 0.5,
      entities: {
        service: 'general',
        urgency: lowerText.includes('urgent') || lowerText.includes('emergency') ? 'high' : 'normal'
      },
      suggestedAction: 'Search for local services'
    };
  }
}

// Generate provider profile from description
export async function generateProviderProfile(description: string, detectedLanguage: any, location?: string) {
  const client = getOpenAI();
  if (!client) {
    // Fallback profile generation
    return {
      name: 'Professional Service Provider',
      category: 'Home Services',
      description: description.substring(0, 200),
      pricing: {
        min: 50,
        max: 150,
        currency: 'USD',
        type: 'per_service'
      },
      languages: [detectedLanguage.code, 'en'],
      serviceArea: location || 'Local area',
      extractedInfo: {
        experience: 'Not specified',
        specialties: ['General services'],
        availability: 'Contact for availability'
      }
    };
  }

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are an AI assistant that creates professional service provider profiles. Based on the user's description, generate a complete profile. Return ONLY a JSON object:
{
  "name": "Professional Business Name",
  "category": "Specific Service Category",
  "description": "Professional description (2-3 sentences)",
  "pricing": {
    "min": number,
    "max": number,
    "currency": "USD|EUR|GBP|INR|etc",
    "type": "per_hour|per_service|per_day"
  },
  "languages": ["detected_language_code", "en"],
  "serviceArea": "service coverage area",
  "extractedInfo": {
    "experience": "years of experience if mentioned",
    "specialties": ["list", "of", "specialties"],
    "availability": "availability info if mentioned"
  }
}

Detect appropriate currency based on location/language. Be professional and accurate.`
        },
        {
          role: 'user',
          content: `Language: ${detectedLanguage.name}
Location: ${location || 'Not specified'}
Description: ${description}`
        }
      ],
      temperature: 0.3,
      max_tokens: 500,
    });

    const result = response.choices[0]?.message?.content;
    if (!result) {
      throw new Error('No response from OpenAI');
    }

    return JSON.parse(result);
  } catch (error) {
    console.error('Profile generation error:', error);
    // Fallback profile generation
    return {
      name: 'Professional Service Provider',
      category: 'Home Services',
      description: description.substring(0, 200),
      pricing: {
        min: 50,
        max: 150,
        currency: 'USD',
        type: 'per_service'
      },
      languages: [detectedLanguage.code, 'en'],
      serviceArea: location || 'Local area',
      extractedInfo: {
        experience: 'Not specified',
        specialties: ['General services'],
        availability: 'Contact for availability'
      }
    };
  }
}

// Smart search with AI understanding
export async function enhanceSearch(query: string, detectedLanguage: any, location?: string) {
  const client = getOpenAI();
  if (!client) {
    // Fallback search enhancement
    return {
      enhancedQuery: query,
      category: 'General Services',
      keywords: query.split(' ').filter(word => word.length > 2),
      filters: {
        urgency: 'normal',
        priceRange: 'standard',
        serviceType: 'onsite'
      },
      searchIntent: 'Find local service providers'
    };
  }

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a search enhancement AI for a local services platform. Analyze the search query and return ONLY a JSON object:
{
  "enhancedQuery": "optimized search terms",
  "category": "specific service category",
  "keywords": ["relevant", "search", "keywords"],
  "filters": {
    "urgency": "low|normal|high|emergency",
    "priceRange": "budget|standard|premium",
    "serviceType": "onsite|remote|both"
  },
  "searchIntent": "what the user is really looking for"
}

Make the search more effective by understanding user intent.`
        },
        {
          role: 'user',
          content: `Language: ${detectedLanguage.name}
Location: ${location || 'Not specified'}
Query: ${query}`
        }
      ],
      temperature: 0.2,
      max_tokens: 300,
    });

    const result = response.choices[0]?.message?.content;
    if (!result) {
      throw new Error('No response from OpenAI');
    }

    return JSON.parse(result);
  } catch (error) {
    console.error('Search enhancement error:', error);
    // Fallback search enhancement
    return {
      enhancedQuery: query,
      category: 'General Services',
      keywords: query.split(' ').filter(word => word.length > 2),
      filters: {
        urgency: 'normal',
        priceRange: 'standard',
        serviceType: 'onsite'
      },
      searchIntent: 'Find local service providers'
    };
  }
}

// Translate text between languages
export async function translateText(text: string, fromLang: string, toLang: string) {
  const client = getOpenAI();
  if (!client) {
    return text; // Return original text if OpenAI is not available
  }

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a professional translator. Translate the given text from ${fromLang} to ${toLang}. Return ONLY the translated text, nothing else. Maintain the original meaning and tone.`
        },
        {
          role: 'user',
          content: text
        }
      ],
      temperature: 0.1,
      max_tokens: 500,
    });

    return response.choices[0]?.message?.content || text;
  } catch (error) {
    console.error('Translation error:', error);
    return text; // Return original text if translation fails
  }
}
