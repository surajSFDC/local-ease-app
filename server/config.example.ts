// LocalEase Server Configuration Template
// Copy this file to config.ts and fill in your actual values

export const config = {
  // OpenAI Configuration
  openai: {
    apiKey: process.env.OPENAI_API_KEY || 'your_openai_api_key_here',
  },

  // Database Configuration
  database: {
    url: process.env.DATABASE_URL || 'postgresql://username:password@localhost:5432/localease_db',
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    database: process.env.POSTGRES_DB || 'localease_db',
    user: process.env.POSTGRES_USER || 'your_username',
    password: process.env.POSTGRES_PASSWORD || 'your_password',
  },

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your_super_secret_jwt_key_here_make_it_long_and_random',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  // Server Configuration
  server: {
    port: parseInt(process.env.PORT || '3000'),
    nodeEnv: process.env.NODE_ENV || 'development',
  },

  // CORS Configuration
  cors: {
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  },

  // Email Configuration (Optional - for later)
  email: {
    service: process.env.EMAIL_SERVICE || 'sendgrid',
    apiKey: process.env.EMAIL_API_KEY || '',
    from: process.env.EMAIL_FROM || 'noreply@localease.com',
  },
};

// Validate required environment variables
export function validateConfig() {
  const required = [
    'OPENAI_API_KEY',
    'JWT_SECRET',
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(key => console.error(`  - ${key}`));
    console.error('\n💡 Please create a .env file with these variables or set them in your environment.');
    process.exit(1);
  }
}
