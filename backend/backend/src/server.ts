import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth';
import storeRoutes from './routes/stores';
import transactionRoutes from './routes/transactions';
import supplierRoutes from './routes/suppliers';
import productGroupRoutes from './routes/productGroups';
import dailyRevenueRoutes from './routes/dailyRevenues';
import goalRoutes from './routes/goals';
import userRoutes from './routes/users';
import userStoreAccessRoutes from './routes/userStoreAccess';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// =========================
// CORS (travado corretamente)
// =========================
const corsOptions: cors.CorsOptions = {
  origin: process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',')
    : true, // fallback seguro (não usa '*')
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// =========================
// Rotas
// =========================
app.use('/api/auth', authRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/product-groups', productGroupRoutes);
app.use('/api/daily-revenues', dailyRevenueRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/users', userRoutes);
app.use('/api/user-store-access', userStoreAccessRoutes);

// =========================
// Health / Root
// =========================
app.get('/', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    message: 'ONE MARKETING API rodando',
    endpoints: {
      auth: '/api/auth',
      stores: '/api/stores',
      transactions: '/api/transactions',
      suppliers: '/api/suppliers',
      productGroups: '/api/product-groups',
      dailyRevenues: '/api/daily-revenues',
      goals: '/api/goals',
      users: '/api/users',
      userStoreAccess: '/api/user-store-access'
    }
  });
});

// =========================
// Middleware global de erro
// =========================
app.use(
  (err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('Erro:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
);

// =========================
// Start do servidor
// =========================
app.listen(PORT, () => {
  console.log(`
========================================
🚀 FINANCEIRO API INICIADA
Servidor rodando na porta ${PORT}
========================================
  `);
});

export default app;