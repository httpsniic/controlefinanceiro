import { Router, Request, Response } from 'express';
import pool from '../config/database.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Todas as rotas precisam de autenticação
router.use(authMiddleware);

// Listar todos os usuários (apenas master)
router.get('/', async (req: Request, res: Response) => {
  try {
    const currentUser = req.user!;

    // Verificar se é master
    if (currentUser.role !== 'master') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const result = await pool.query(
      'SELECT id, username, name, role, created_at FROM users ORDER BY created_at DESC'
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({ error: 'Erro ao listar usuários' });
  }
});

// Buscar usuário específico
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const currentUser = req.user!;
    const { id } = req.params;

    // Apenas master ou o próprio usuário pode ver
    if (currentUser.role !== 'master' && currentUser.userId !== id) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const result = await pool.query(
      'SELECT id, username, name, role, created_at FROM users WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ error: 'Erro ao buscar usuário' });
  }
});

// Atualizar usuário (apenas master)
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const currentUser = req.user!;
    const { id } = req.params;
    const { name, role } = req.body;

    // Verificar se é master
    if (currentUser.role !== 'master') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const result = await pool.query(
      'UPDATE users SET name = COALESCE($1, name), role = COALESCE($2, role) WHERE id = $3 RETURNING id, username, name, role',
      [name, role, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ error: 'Erro ao atualizar usuário' });
  }
});

// Deletar usuário (apenas master)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const currentUser = req.user!;
    const { id } = req.params;

    // Verificar se é master
    if (currentUser.role !== 'master') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    // Não pode deletar a si mesmo
    if (currentUser.userId === id) {
      return res.status(400).json({ error: 'Não é possível deletar seu próprio usuário' });
    }

    await pool.query('DELETE FROM users WHERE id = $1', [id]);

    res.json({ message: 'Usuário deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    res.status(500).json({ error: 'Erro ao deletar usuário' });
  }
});

export default router;