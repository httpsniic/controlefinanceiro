import { Router, Request, Response } from 'express';
import pool from '../config/database.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Todas as rotas precisam de autenticação
router.use(authMiddleware);

// Listar todas as lojas do usuário
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    const result = await pool.query(
      `SELECT s.* FROM stores s
       LEFT JOIN user_store_access usa ON s.id = usa.store_id
       WHERE s.owner_id = $1 OR usa.user_id = $1
       ORDER BY s.created_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar lojas:', error);
    res.status(500).json({ error: 'Erro ao listar lojas' });
  }
});

// Criar nova loja
router.post('/', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Nome da loja é obrigatório' });
    }

    const result = await pool.query(
      'INSERT INTO stores (owner_id, name) VALUES ($1, $2) RETURNING *',
      [userId, name]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar loja:', error);
    res.status(500).json({ error: 'Erro ao criar loja' });
  }
});

// Buscar loja específica
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const result = await pool.query(
      `SELECT s.* FROM stores s
       LEFT JOIN user_store_access usa ON s.id = usa.store_id
       WHERE s.id = $1 AND (s.owner_id = $2 OR usa.user_id = $2)`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Loja não encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar loja:', error);
    res.status(500).json({ error: 'Erro ao buscar loja' });
  }
});

// Atualizar loja
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const { name } = req.body;

    // Verificar se usuário é dono
    const checkOwner = await pool.query(
      'SELECT id FROM stores WHERE id = $1 AND owner_id = $2',
      [id, userId]
    );

    if (checkOwner.rows.length === 0) {
      return res.status(403).json({ error: 'Sem permissão para editar esta loja' });
    }

    const result = await pool.query(
      'UPDATE stores SET name = $1 WHERE id = $2 RETURNING *',
      [name, id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar loja:', error);
    res.status(500).json({ error: 'Erro ao atualizar loja' });
  }
});

// Deletar loja
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    // Verificar se usuário é dono
    const checkOwner = await pool.query(
      'SELECT id FROM stores WHERE id = $1 AND owner_id = $2',
      [id, userId]
    );

    if (checkOwner.rows.length === 0) {
      return res.status(403).json({ error: 'Sem permissão para deletar esta loja' });
    }

    await pool.query('DELETE FROM stores WHERE id = $1', [id]);

    res.json({ message: 'Loja deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar loja:', error);
    res.status(500).json({ error: 'Erro ao deletar loja' });
  }
});

export default router;
