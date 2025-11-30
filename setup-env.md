# LocalEase Environment Setup

## Required Environment Variables

To enable all features, you need to set up the following environment variables:

### 1. Create `.env` file in the server directory

```bash
cd server
touch .env
```

### 2. Add the following variables to your `.env` file:

```env
# OpenAI Configuration (REQUIRED for AI features)
OPENAI_API_KEY=your_openai_api_key_here

# JWT Configuration (REQUIRED for authentication)
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random_at_least_32_characters

# Server Configuration
PORT=3000
NODE_ENV=development

# CORS Configuration
FRONTEND_URL=http://localhost:5173

# Database Configuration (for future PostgreSQL setup)
DATABASE_URL=postgresql://username:password@localhost:5432/localease_db
```

### 3. How to get an OpenAI API Key:

1. Go to https://platform.openai.com/
2. Sign up or log in
3. Go to API Keys section
4. Create a new API key
5. Copy the key and paste it in your `.env` file

### 4. Generate a JWT Secret:

You can generate a secure JWT secret using Node.js:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 5. Example `.env` file:

```env
OPENAI_API_KEY=sk-proj-abc123...
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4i5j6k7l8m9n0
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

## Testing the Setup

After setting up your `.env` file:

1. Restart your server:
   ```bash
   npm run dev
   ```

2. Check the health endpoint:
   ```bash
   curl http://localhost:3000/api/health
   ```

3. You should see:
   ```json
   {
     "status": "ok",
     "message": "LocalEase API is running",
     "features": {
       "ai": true,
       "auth": true,
       "database": false
     }
   }
   ```

## What's Working Now

✅ **Authentication System**
- User registration and login
- JWT token-based authentication
- Password hashing with bcrypt
- Protected routes

✅ **Real AI Features** (if OpenAI API key is set)
- Language detection (100+ languages)
- Intent analysis
- AI-powered provider profile generation
- Smart search enhancement
- Text translation

✅ **API Endpoints**
- `/api/auth/register` - User registration
- `/api/auth/login` - User login
- `/api/auth/me` - Get current user
- `/api/ai/analyze` - Analyze text (language + intent)
- `/api/ai/create-profile` - AI-powered profile creation
- `/api/ai/search` - Smart search with AI
- `/api/providers` - List providers
- `/api/providers/:id` - Get single provider
- `/api/bookings` - Create booking
- `/api/messages` - Send message
- `/api/reviews` - Create review
- `/api/translate` - Translate text

✅ **Security Features**
- Helmet for security headers
- Rate limiting
- CORS protection
- Input validation with Zod
- Password hashing

## Next Steps

1. **Set up PostgreSQL database** (replace in-memory storage)
2. **Add file upload** for provider images
3. **Implement real-time messaging** with WebSocket
4. **Add payment integration** with Stripe
5. **Integrate maps** for location services

## Troubleshooting

### AI Features Not Working
- Make sure `OPENAI_API_KEY` is set in your `.env` file
- Check that the API key is valid
- Ensure you have credits in your OpenAI account

### Authentication Not Working
- Make sure `JWT_SECRET` is set in your `.env` file
- Ensure the JWT secret is at least 32 characters long
- Check that the frontend is sending the Authorization header

### Server Not Starting
- Check that all required dependencies are installed: `npm install`
- Ensure no other process is using port 3000
- Check the console for error messages
