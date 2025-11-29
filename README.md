# LocalAI - AI-Powered Global Local Services Platform

## Overview

LocalAI is a global AI-powered platform that connects service providers and customers for local services worldwide. The application leverages artificial intelligence to automatically detect languages, understand user intent, and generate professional profiles from natural language descriptions in 100+ languages. The platform is designed to democratize access to local services by removing language barriers and simplifying the onboarding process for service providers globally.

## Recent Changes (Nov 2024)

- **Globalized Platform**: Removed India-specific references, now supports worldwide locations and currencies
- **Language-First AI Processing**: All user inputs are first analyzed for language detection, then intent understanding, then action execution
- **100+ Language Support**: Expanded from Indian languages to support all major world languages including English, Spanish, Chinese, Hindi, Arabic, French, Japanese, Korean, Portuguese, German, and many more
- **Simplified Onboarding**: Reduced provider signup to single step - just describe your service in any language, AI handles everything automatically
- **Smart Currency Detection**: AI detects appropriate currency based on user's language and location context
- **Enhanced Search**: Search now shows language detection results and AI understanding of the query
- **Fixed Search Results Page**: Corrected URL parameter extraction using window.location.search for reliable query parsing
- **Fixed API Query Key Handling**: Search results now properly construct URL with query parameters instead of passing objects

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

- **Framework**: React with TypeScript using Vite as the build tool
- **UI Framework**: Shadcn/UI components built on Radix UI primitives with Tailwind CSS for styling
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Icons**: Lucide React for modern iconography
- **Component Structure**: Modular component architecture with reusable UI components and feature-specific components

### Backend Architecture

- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with structured route handling
- **Data Storage**: In-memory storage implementation with interface-based design for future database integration
- **Development Setup**: Vite middleware integration for development with hot module replacement

### Database Design

- **ORM**: Drizzle ORM configured for PostgreSQL
- **Schema**: Comprehensive schema including users, service providers, bookings, messages, and reviews
- **Migration Strategy**: Drizzle Kit for database migrations and schema management
- **Data Models**: Type-safe schemas with Zod validation

### AI Integration (Core Feature)

- **Primary AI Service**: OpenAI GPT-4o for all AI features
- **Language Detection**: First-step detection of user's input language (100+ languages supported)
- **Intent Recognition**: Understanding what the user wants to do (search, create profile, book service, etc.)
- **Profile Generation**: Automatic extraction of service categories, pricing (with currency detection), and professional descriptions
- **Translation Service**: AI-powered multilingual support for seamless cross-language communication
- **Smart Search**: AI-powered search understanding with intent recognition, language detection, and location-based matching

### AI Processing Flow

1. **Language Detection** → Detect the language of user input
2. **Intent Understanding** → Determine what action the user wants
3. **Action Execution** → Perform the appropriate action (search, profile creation, booking, etc.)
4. **Response Translation** → Translate responses back to user's language if needed

### Geolocation and Maps

- **Location Services**: Browser geolocation API integration
- **Map Integration**: Prepared for Google Maps API or Leaflet integration
- **Location-Based Features**: Service provider discovery within specified radius and real-time location updates

### Authentication and Security

- **Authentication**: Basic email/password authentication with session management
- **Data Validation**: Zod schemas for request validation and type safety
- **Error Handling**: Centralized error handling with proper HTTP status codes

### Styling and Design System

- **CSS Framework**: Tailwind CSS with custom design tokens
- **Component Library**: Shadcn/UI providing consistent design patterns
- **Responsive Design**: Mobile-first approach for global accessibility
- **Theming**: CSS custom properties for consistent color scheme and spacing

### Communication Features

- **Messaging System**: In-app messaging between customers and service providers
- **Booking System**: Structured booking workflow with status tracking
- **Review System**: Customer feedback and rating system for service providers

## Key API Endpoints

### AI Endpoints

- `POST /api/ai/analyze` - Language detection + intent understanding for any text input
- `POST /api/ai/create-profile` - Create provider profile from natural language description
- `POST /api/ai/search` - AI-powered search with language detection

### Translation Endpoints

- `POST /api/translate/detect` - Detect language of text
- `POST /api/translate` - Translate text between languages
- `GET /api/languages` - Get list of supported languages

### Provider Endpoints

- `GET /api/providers` - List/search providers
- `GET /api/providers/:id` - Get single provider
- `POST /api/providers` - Create new provider

### Booking/Messaging Endpoints

- `POST /api/bookings` - Create booking
- `POST /api/messages` - Send message
- `POST /api/reviews` - Submit review

## External Dependencies

### Core Dependencies

- **OpenAI API**: GPT-4o model for AI profile generation, language detection, and natural language processing
- **Neon Database**: Serverless PostgreSQL database for production data storage

### Development Tools

- **Replit Integration**: Development environment integration with cartographer and runtime error overlay
- **Vite**: Build tool and development server with React plugin support
- **ESBuild**: Production bundling for server-side code

### UI and Component Libraries

- **Radix UI**: Headless UI components for accessibility and interaction patterns
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Lucide React**: Icon library for consistent iconography
- **Embla Carousel**: Carousel component for enhanced user experience

### Utility Libraries

- **TanStack Query**: Server state management and caching
- **React Hook Form**: Form handling with validation
- **Date-fns**: Date manipulation and formatting
- **Wouter**: Lightweight routing solution
- **Zod**: Runtime type validation and schema definition

### Planned Integrations

- **Payment Gateway**: Stripe for global transaction processing
- **Maps Service**: Google Maps API or Leaflet for location visualization
- **SMS/OTP Service**: User verification and communication
- **Push Notifications**: Real-time updates for bookings and messages
