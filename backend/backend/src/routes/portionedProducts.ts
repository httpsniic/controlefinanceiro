import { Router, Request, Response } from 'express';
import pool from '../config/database.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

// Helper para converter valores numéricos
const parseNumeric = (value: any): number => {
  return value !== null && value !== undefined ? parseFloat(value) : 0;
};

// Listar produtos porcionados de uma loja
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
      `SELECT pp.*, s.name as supplier_name
       FROM portioned_products pp
       LEFT JOIN suppliers s ON pp.supplier_id = s.id
       WHERE pp.store_id = $1
       ORDER BY pp.created_at DESC`,
      [storeId]
    );

    const products = result.rows.map(row => ({
      id: row.id,
      storeId: row.store_id,
      rawProtein: row.raw_protein,
      portionedProduct: row.portioned_product,
      standardWeight: parseNumeric(row.standard_weight),
      targetYield: parseNumeric(row.target_yield),
      tolerance: parseNumeric(row.tolerance),
      supplierId: row.supplier_id,
      supplierName: row.supplier_name,
      operatorName: row.operator_name,
      createdAt: row.created_at
    }));

    res.json(products);
  } catch (error) {
    console.error('Erro ao listar produtos porcionados:', error);
    res.status(500).json({ error: 'Erro ao listar produtos porcionados' });
  }
});

// Criar produto porcionado
router.post('/', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const {
      storeId,
      rawProtein,
      portionedProduct,
      standardWeight,
      targetYield,
      tolerance,
      supplierId,
      operatorName
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
      `INSERT INTO portioned_products 
       (store_id, raw_protein, portioned_product, standard_weight, target_yield, tolerance, supplier_id, operator_name)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [storeId, rawProtein, portionedProduct, standardWeight, targetYield, tolerance, supplierId || null, operatorName]
    );

    const product = result.rows[0];
    const formattedProduct = {
      id: product.id,
      storeId: product.store_id,
      rawProtein: product.raw_protein,
      portionedProduct: product.portioned_product,
      standardWeight: parseNumeric(product.standard_weight),
      targetYield: parseNumeric(product.target_yield),
      tolerance: parseNumeric(product.tolerance),
      supplierId: product.supplier_id,
      operatorName: product.operator_name,
      createdAt: product.created_at
    };

    res.status(201).json(formattedProduct);
  } catch (error) {
    console.error('Erro ao criar produto porcionado:', error);
    res.status(500).json({ error: 'Erro ao criar produto porcionado' });
  }
});

// Deletar produto porcionado
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const accessCheck = await pool.query(
      `SELECT pp.store_id FROM portioned_products pp
       INNER JOIN stores s ON pp.store_id = s.id
       LEFT JOIN user_store_access usa ON s.id = usa.store_id
       WHERE pp.id = $1 AND (s.owner_id = $2 OR usa.user_id = $2)`,
      [id, userId]
    );

    if (accessCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Sem permissão para deletar este produto' });
    }

    await pool.query('DELETE FROM portioned_products WHERE id = $1', [id]);

    res.json({ message: 'Produto porcionado deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar produto porcionado:', error);
    res.status(500).json({ error: 'Erro ao deletar produto porcionado' });
  }
});

export default router;