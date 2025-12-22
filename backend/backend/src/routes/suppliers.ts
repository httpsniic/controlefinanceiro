import { Router, Request, Response } from 'express';
import pool from '../config/database.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

// Listar fornecedores de uma loja
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
      'SELECT * FROM suppliers WHERE store_id = $1 ORDER BY name',
      [storeId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar fornecedores:', error);
    res.status(500).json({ error: 'Erro ao listar fornecedores' });
  }
});

// Criar fornecedor
router.post('/', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { storeId, name, contact, email, categories } = req.body;

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
      `INSERT INTO suppliers (store_id, name, contact, email, categories)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [storeId, name, contact || '', email || '', categories || '']
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar fornecedor:', error);
    res.status(500).json({ error: 'Erro ao criar fornecedor' });
  }
});

// Atualizar fornecedor
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const { name, contact, email, categories } = req.body;

    const accessCheck = await pool.query(
      `SELECT s.store_id FROM suppliers s
       INNER JOIN stores st ON s.store_id = st.id
       LEFT JOIN user_store_access usa ON st.id = usa.store_id
       WHERE s.id = $1 AND (st.owner_id = $2 OR usa.user_id = $2)`,
      [id, userId]
    );

    if (accessCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Sem permissão para editar este fornecedor' });
    }

    const result = await pool.query(
      `UPDATE suppliers 
       SET name = $1, contact = $2, email = $3, categories = $4
       WHERE id = $5 RETURNING *`,
      [name, contact, email, categories, id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar fornecedor:', error);
    res.status(500).json({ error: 'Erro ao atualizar fornecedor' });
  }
});

// Deletar fornecedor
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const accessCheck = await pool.query(
      `SELECT s.store_id FROM suppliers s
       INNER JOIN stores st ON s.store_id = st.id
       LEFT JOIN user_store_access usa ON st.id = usa.store_id
       WHERE s.id = $1 AND (st.owner_id = $2 OR usa.user_id = $2)`,
      [id, userId]
    );

    if (accessCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Sem permissão para deletar este fornecedor' });
    }

    await pool.query('DELETE FROM suppliers WHERE id = $1', [id]);

    res.json({ message: 'Fornecedor deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar fornecedor:', error);
    res.status(500).json({ error: 'Erro ao deletar fornecedor' });
  }
});

export default router;
