import { Router, Request, Response } from 'express';
import pool from '../config/database.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

// Helper para converter valores numéricos
const parseNumeric = (value: any): number => {
  return value !== null && value !== undefined ? parseFloat(value) : 0;
};

// Listar lançamentos de porcionados de uma loja
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
      `SELECT pe.*, s.name as supplier_name
       FROM portioned_entries pe
       LEFT JOIN suppliers s ON pe.supplier_id = s.id
       WHERE pe.store_id = $1
       ORDER BY pe.entry_date DESC, pe.created_at DESC`,
      [storeId]
    );

    const entries = result.rows.map(row => ({
      id: row.id,
      storeId: row.store_id,
      portionedProductId: row.portioned_product_id,
      proteinName: row.protein_name,
      supplierId: row.supplier_id,
      supplierName: row.supplier_name,
      price: parseNumeric(row.price),
      entryDate: row.entry_date,
      createdAt: row.created_at
    }));

    res.json(entries);
  } catch (error) {
    console.error('Erro ao listar lançamentos:', error);
    res.status(500).json({ error: 'Erro ao listar lançamentos' });
  }
});

// Criar lançamento de porcionado
router.post('/', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const {
      storeId,
      portionedProductId,
      proteinName,
      supplierId,
      price,
      entryDate
    } = req.body;

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
      `INSERT INTO portioned_entries 
       (store_id, portioned_product_id, protein_name, supplier_id, price, entry_date)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [storeId, portionedProductId, proteinName, supplierId || null, price, entryDate]
    );

    const entry = result.rows[0];
    const formattedEntry = {
      id: entry.id,
      storeId: entry.store_id,
      portionedProductId: entry.portioned_product_id,
      proteinName: entry.protein_name,
      supplierId: entry.supplier_id,
      price: parseNumeric(entry.price),
      entryDate: entry.entry_date,
      createdAt: entry.created_at
    };

    res.status(201).json(formattedEntry);
  } catch (error) {
    console.error('Erro ao criar lançamento:', error);
    res.status(500).json({ error: 'Erro ao criar lançamento' });
  }
});

// Deletar lançamento de porcionado
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const accessCheck = await pool.query(
      `SELECT pe.store_id FROM portioned_entries pe
       INNER JOIN stores s ON pe.store_id = s.id
       LEFT JOIN user_store_access usa ON s.id = usa.store_id
       WHERE pe.id = $1 AND (s.owner_id = $2 OR usa.user_id = $2)`,
      [id, userId]
    );

    if (accessCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Sem permissão para deletar este lançamento' });
    }

    await pool.query('DELETE FROM portioned_entries WHERE id = $1', [id]);

    res.json({ message: 'Lançamento deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar lançamento:', error);
    res.status(500).json({ error: 'Erro ao deletar lançamento' });
  }
});

export default router;