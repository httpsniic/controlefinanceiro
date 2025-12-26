import { Router, Request, Response } from 'express';
import pool from '../config/database.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

// Helper para converter valores numéricos
const parseNumeric = (value: any): number => {
  return value !== null && value !== undefined ? parseFloat(value) : 0;
};

// Listar receitas diárias de uma loja
router.get('/store/:storeId', async (req: Request, res: Response) => {
  try {
    const { storeId } = req.params;
    const userId = req.user!.userId;

    const accessCheck = await pool.query(
      `SELECT 1 FROM stores s
       LEFT JOIN user_store_access usa ON s.id = usa.store_id
       WHERE s.id = $1 AND (s.owner_id = $2 OR usa.user_id = $2)`,
      [storeId, userId]
    );

    if (accessCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Sem acesso a esta loja' });
    }

    const result = await pool.query(
      'SELECT * FROM daily_revenues WHERE store_id = $1 ORDER BY date DESC',
      [storeId]
    );

    // Converter snake_case para camelCase E converter números
    const revenues = result.rows.map(row => ({
      id: row.id,
      storeId: row.store_id,
      date: row.date,
      salon: parseNumeric(row.salon),
      delivery: parseNumeric(row.delivery),
      serviceCharge: parseNumeric(row.service_charge),
      total: parseNumeric(row.total),
      createdAt: row.created_at
    }));

    res.json(revenues);
  } catch (error) {
    console.error('Erro ao listar receitas:', error);
    res.status(500).json({ error: 'Erro ao listar receitas' });
  }
});

// Criar ou atualizar receita diária
router.post('/', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { storeId, date, salon, delivery, serviceCharge } = req.body;

    const accessCheck = await pool.query(
      `SELECT 1 FROM stores s
       LEFT JOIN user_store_access usa ON s.id = usa.store_id
       WHERE s.id = $1 AND (s.owner_id = $2 OR usa.user_id = $2)`,
      [storeId, userId]
    );

    if (accessCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Sem acesso a esta loja' });
    }

    const total = (salon || 0) + (delivery || 0) + (serviceCharge || 0);

    const result = await pool.query(
      `INSERT INTO daily_revenues (store_id, date, salon, delivery, service_charge, total)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (store_id, date) 
       DO UPDATE SET 
         salon = EXCLUDED.salon,
         delivery = EXCLUDED.delivery,
         service_charge = EXCLUDED.service_charge,
         total = EXCLUDED.total
       RETURNING *`,
      [storeId, date, salon || 0, delivery || 0, serviceCharge || 0, total]
    );

    // Converter snake_case para camelCase E converter números
    const revenue = result.rows[0];
    const formattedRevenue = {
      id: revenue.id,
      storeId: revenue.store_id,
      date: revenue.date,
      salon: parseNumeric(revenue.salon),
      delivery: parseNumeric(revenue.delivery),
      serviceCharge: parseNumeric(revenue.service_charge),
      total: parseNumeric(revenue.total),
      createdAt: revenue.created_at
    };

    res.status(201).json(formattedRevenue);
  } catch (error) {
    console.error('Erro ao salvar receita:', error);
    res.status(500).json({ error: 'Erro ao salvar receita' });
  }
});

// Deletar receita diária
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const accessCheck = await pool.query(
      `SELECT dr.store_id FROM daily_revenues dr
       INNER JOIN stores s ON dr.store_id = s.id
       LEFT JOIN user_store_access usa ON s.id = usa.store_id
       WHERE dr.id = $1 AND (s.owner_id = $2 OR usa.user_id = $2)`,
      [id, userId]
    );

    if (accessCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Sem permissão para deletar esta receita' });
    }

    await pool.query('DELETE FROM daily_revenues WHERE id = $1', [id]);

    res.json({ message: 'Receita deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar receita:', error);
    res.status(500).json({ error: 'Erro ao deletar receita' });
  }
});

export default router;