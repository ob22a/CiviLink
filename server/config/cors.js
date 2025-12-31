import dotenv from 'dotenv';
dotenv.config();

const allowedOrigins = [
  process.env.FRONTEND_URL,   // Your production or dev URL from .env
  'http://localhost:3000',    // Common React port
  'http://localhost:5173',    // Common Vite port
];

export const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};