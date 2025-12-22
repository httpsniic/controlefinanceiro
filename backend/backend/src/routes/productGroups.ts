import { Router, Request, Response } from 'express';
import pool from '../config/database.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

// Listar grupos de produtos de uma loja
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
      'SELECT * FROM product_groups WHERE store_id = $1 ORDER BY name',
      [storeId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar grupos:', error);
    res.status(500).json({ error: 'Erro ao listar grupos' });
  }
});

// Criar grupo de produtos
router.post('/', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { storeId, name, color, cmcTarget, icon } = req.body;

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
      `INSERT INTO product_groups (store_id, name, color, cmc_target, icon)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [storeId, name, color || '#3b82f6', cmcTarget || 0, icon || 'Package']
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar grupo:', error);
    res.status(500).json({ error: 'Erro ao criar grupo' });
  }
});

// Atualizar grupo de produtos
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const { name, color, cmcTarget, icon } = req.body;

    const accessCheck = await pool.query(
      `SELECT pg.store_id FROM product_groups pg
       INNER JOIN stores s ON pg.store_id = s.id
       LEFT JOIN user_store_access usa ON s.id = usa.store_id
       WHERE pg.id = $1 AND (s.owner_id = $2 OR usa.user_id = $2)`,
      [id, userId]
    );

    if (accessCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Sem permissão para editar este grupo' });
    }

    const result = await pool.query(
      `UPDATE product_groups 
       SET name = $1, color = $2, cmc_target = $3, icon = $4
       WHERE id = $5 RETURNING *`,
      [name, color, cmcTarget, icon, id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar grupo:', error);
    res.status(500).json({ error: 'Erro ao atualizar grupo' });
  }
});

// Deletar grupo de produtos
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const accessCheck = await pool.query(
      `SELECT pg.store_id FROM product_groups pg
       INNER JOIN stores s ON pg.store_id = s.id
       LEFT JOIN user_store_access usa ON s.id = usa.store_id
       WHERE pg.id = $1 AND (s.owner_id = $2 OR usa.user_id = $2)`,
      [id, userId]
    );

    if (accessCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Sem permissão para deletar este grupo' });
    }

    await pool.query('DELETE FROM product_groups WHERE id = $1', [id]);

    res.json({ message: 'Grupo deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar grupo:', error);
    res.status(500).json({ error: 'Erro ao deletar grupo' });
  }
});

export default router;
