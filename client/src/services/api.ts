const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Helper function to get auth headers
function getAuthHeaders() {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
}

export interface Provider {
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
}

export interface SearchResponse {
  providers: Provider[];
  searchAnalysis: {
    query: string;
    queryTranslated: string;
    intent: string;
    category: string;
    detectedLanguage: {
      code: string;
      name: string;
    };
  };
}

export interface CreateProfileResponse {
  provider: Provider;
  aiAnalysis: {
    detectedLanguage: {
      code: string;
      name: string;
    };
  };
}

export interface AnalyzeResponse {
  language: {
    detectedLanguage: {
      code: string;
      name: string;
      nativeName: string;
      confidence: number;
    };
  };
  intent: {
    primaryIntent: string;
    confidence: number;
    entities: {
      service: string;
      urgency?: string;
    };
    suggestedAction: string;
  };
}

// API functions
export const api = {
  // Search providers
  async searchProviders(query: string, userLanguage?: string, location?: string): Promise<SearchResponse> {
    const response = await fetch(`${API_BASE_URL}/api/ai/search`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ query, userLanguage, location }),
    });
    if (!response.ok) throw new Error('Failed to search providers');
    return response.json();
  },

  // Get all providers
  async getProviders(query?: string, category?: string, location?: string): Promise<{ providers: Provider[] }> {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (category) params.append('category', category);
    if (location) params.append('location', location);

    const response = await fetch(`${API_BASE_URL}/api/providers?${params.toString()}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch providers');
    return response.json();
  },

  // Get single provider
  async getProvider(id: string): Promise<{ provider: Provider }> {
    const response = await fetch(`${API_BASE_URL}/api/providers/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch provider');
    return response.json();
  },

  // Create provider profile with AI
  async createProfile(description: string, userId?: string, location?: string): Promise<CreateProfileResponse> {
    const response = await fetch(`${API_BASE_URL}/api/ai/create-profile`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ description, userId, location }),
    });
    if (!response.ok) throw new Error('Failed to create profile');
    return response.json();
  },

  // Analyze text (language detection + intent)
  async analyzeText(text: string): Promise<AnalyzeResponse> {
    const response = await fetch(`${API_BASE_URL}/api/ai/analyze`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ text }),
    });
    if (!response.ok) throw new Error('Failed to analyze text');
    return response.json();
  },

  // Create booking
  async createBooking(providerId: string, customerId: string, serviceDate?: string, notes?: string) {
    const response = await fetch(`${API_BASE_URL}/api/bookings`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ providerId, customerId, serviceDate, notes }),
    });
    if (!response.ok) throw new Error('Failed to create booking');
    return response.json();
  },

  // Send message
  async sendMessage(fromId: string, toId: string, message: string) {
    const response = await fetch(`${API_BASE_URL}/api/messages`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ fromId, toId, message }),
    });
    if (!response.ok) throw new Error('Failed to send message');
    return response.json();
  },

  // Create review
  async createReview(providerId: string, customerId: string, rating: number, comment?: string) {
    const response = await fetch(`${API_BASE_URL}/api/reviews`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ providerId, customerId, rating, comment }),
    });
    if (!response.ok) throw new Error('Failed to create review');
    return response.json();
  },

  // Profile management
  async getProfile() {
    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to get profile');
    return response.json();
  },

  async updateProfile(profileData: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    location?: string;
    language?: string;
  }) {
    const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update profile');
    }
    return response.json();
  },

  async changePassword(currentPassword: string, newPassword: string) {
    const response = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to change password');
    }
    return response.json();
  },
};
