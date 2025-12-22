import { Router, Request, Response } from 'express';
import pool from '../config/database.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

// Listar metas de uma loja
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
      'SELECT * FROM goals WHERE store_id = $1 ORDER BY month DESC',
      [storeId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar metas:', error);
    res.status(500).json({ error: 'Erro ao listar metas' });
  }
});

// Criar ou atualizar meta
router.post('/', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { storeId, month, revenueTarget, cmcTarget, avgTicket } = req.body;

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
      `INSERT INTO goals (store_id, month, revenue_target, cmc_target, avg_ticket)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (store_id, month) 
       DO UPDATE SET 
         revenue_target = EXCLUDED.revenue_target,
         cmc_target = EXCLUDED.cmc_target,
         avg_ticket = EXCLUDED.avg_ticket
       RETURNING *`,
      [storeId, month, revenueTarget || 0, cmcTarget || 0, avgTicket || 0]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao salvar meta:', error);
    res.status(500).json({ error: 'Erro ao salvar meta' });
  }
});

// Deletar meta
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const accessCheck = await pool.query(
      `SELECT g.store_id FROM goals g
       INNER JOIN stores s ON g.store_id = s.id
       LEFT JOIN user_store_access usa ON s.id = usa.store_id
       WHERE g.id = $1 AND (s.owner_id = $2 OR usa.user_id = $2)`,
      [id, userId]
    );

    if (accessCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Sem permissão para deletar esta meta' });
    }

    await pool.query('DELETE FROM goals WHERE id = $1', [id]);

    res.json({ message: 'Meta deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar meta:', error);
    res.status(500).json({ error: 'Erro ao deletar meta' });
  }
});

export default router;
