import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import storeRoutes from './routes/stores.js';
import transactionRoutes from './routes/transactions.js';
import supplierRoutes from './routes/suppliers.js';
import productGroupRoutes from './routes/productGroups.js';
import dailyRevenueRoutes from './routes/dailyRevenues.js';
import goalRoutes from './routes/goals.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configurar CORS
const corsOptions = {
  origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/product-groups', productGroupRoutes);
app.use('/api/daily-revenues', dailyRevenueRoutes);
app.use('/api/goals', goalRoutes);

// Rota de health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'ONE MARKETING API está rodando!' });
});

// Rota raiz
app.get('/', (req, res) => {
  res.json({ 
    message: 'ONE MARKETING API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      stores: '/api/stores',
      transactions: '/api/transactions',
      suppliers: '/api/suppliers',
      productGroups: '/api/product-groups',
      dailyRevenues: '/api/daily-revenues',
      goals: '/api/goals'
    }
  });
});

// Tratamento de erros global
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Erro:', err);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════╗
║                                           ║
║      🚀 ONE MARKETING API Iniciada!      ║
║                                           ║
║      Servidor rodando na porta ${PORT}     ║
║      http://localhost:${PORT}              ║
║                                           ║
╚═══════════════════════════════════════════╝
  `);
});

export default app;