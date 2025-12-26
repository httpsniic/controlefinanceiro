import { Router, Request, Response } from 'express';
import pool from '../config/database.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

// Listar acessos de todos os usuários (apenas master)
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const userRole = req.user!.role;

    if (userRole !== 'master') {
      return res.status(403).json({ error: 'Apenas master pode ver acessos' });
    }

    const result = await pool.query(
      'SELECT user_id, store_id FROM user_store_access'
    );

    // Agrupar por usuário
    const accessMap: Record<string, string[]> = {};
    result.rows.forEach(row => {
      if (!accessMap[row.user_id]) {
        accessMap[row.user_id] = [];
      }
      accessMap[row.user_id].push(row.store_id);
    });

    res.json(accessMap);
  } catch (error) {
    console.error('Erro ao listar acessos:', error);
    res.status(500).json({ error: 'Erro ao listar acessos' });
  }
});

// Atualizar acesso de um usuário a uma loja
router.post('/toggle', async (req: Request, res: Response) => {
  try {
    const currentUserId = req.user!.userId;
    const currentUserRole = req.user!.role;
    const { userId, storeId } = req.body;

    if (currentUserRole !== 'master') {
      return res.status(403).json({ error: 'Apenas master pode alterar acessos' });
    }

    // Verificar se o acesso já existe
    const existingAccess = await pool.query(
      'SELECT id FROM user_store_access WHERE user_id = $1 AND store_id = $2',
      [userId, storeId]
    );

    if (existingAccess.rows.length > 0) {
      // Remover acesso
      await pool.query(
        'DELETE FROM user_store_access WHERE user_id = $1 AND store_id = $2',
        [userId, storeId]
      );
      return res.json({ action: 'removed', userId, storeId });
    } else {
      // Adicionar acesso
      await pool.query(
        'INSERT INTO user_store_access (user_id, store_id) VALUES ($1, $2)',
        [userId, storeId]
      );
      return res.json({ action: 'added', userId, storeId });
    }
  } catch (error) {
    console.error('Erro ao alterar acesso:', error);
    res.status(500).json({ error: 'Erro ao alterar acesso' });
  }
});

export default router;