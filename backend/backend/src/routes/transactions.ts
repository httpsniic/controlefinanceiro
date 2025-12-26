import { Router, Request, Response } from 'express';
import pool from '../config/database.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

// Helper para converter valores numéricos
const parseNumeric = (value: any): number => {
  return value !== null && value !== undefined ? parseFloat(value) : 0;
};

// Listar transações de uma loja
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
      `SELECT t.*, 
              pg.name as group_name,
              s.name as supplier_name
       FROM transactions t
       LEFT JOIN product_groups pg ON t.group_id = pg.id
       LEFT JOIN suppliers s ON t.supplier_id = s.id
       WHERE t.store_id = $1
       ORDER BY t.date DESC, t.created_at DESC`,
      [storeId]
    );

    // Converter snake_case para camelCase E converter números
    const transactions = result.rows.map(row => ({
      id: row.id,
      storeId: row.store_id,
      type: row.type,
      description: row.description,
      amount: parseNumeric(row.amount),
      date: row.date,
      dueDate: row.due_date,
      groupId: row.group_id,
      supplierId: row.supplier_id,
      invoiceNumber: row.invoice_number,
      createdAt: row.created_at,
      groupName: row.group_name,
      supplierName: row.supplier_name
    }));

    res.json(transactions);
  } catch (error) {
    console.error('Erro ao listar transações:', error);
    res.status(500).json({ error: 'Erro ao listar transações' });
  }
});

// Criar transação
router.post('/', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const {
      storeId,
      type,
      description,
      amount,
      date,
      dueDate,
      groupId,
      supplierId,
      invoiceNumber
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
      `INSERT INTO transactions 
       (store_id, type, description, amount, date, due_date, group_id, supplier_id, invoice_number)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [storeId, type, description, amount, date, dueDate || null, groupId || null, supplierId || null, invoiceNumber || null]
    );

    // Converter snake_case para camelCase E converter números
    const transaction = result.rows[0];
    const formattedTransaction = {
      id: transaction.id,
      storeId: transaction.store_id,
      type: transaction.type,
      description: transaction.description,
      amount: parseNumeric(transaction.amount),
      date: transaction.date,
      dueDate: transaction.due_date,
      groupId: transaction.group_id,
      supplierId: transaction.supplier_id,
      invoiceNumber: transaction.invoice_number,
      createdAt: transaction.created_at
    };

    res.status(201).json(formattedTransaction);
  } catch (error) {
    console.error('Erro ao criar transação:', error);
    res.status(500).json({ error: 'Erro ao criar transação' });
  }
});

// Atualizar transação
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const {
      type,
      description,
      amount,
      date,
      dueDate,
      groupId,
      supplierId,
      invoiceNumber
    } = req.body;

    const accessCheck = await pool.query(
      `SELECT t.store_id FROM transactions t
       INNER JOIN stores s ON t.store_id = s.id
       LEFT JOIN user_store_access usa ON s.id = usa.store_id
       WHERE t.id = $1 AND (s.owner_id = $2 OR usa.user_id = $2)`,
      [id, userId]
    );

    if (accessCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Sem permissão para editar esta transação' });
    }

    const result = await pool.query(
      `UPDATE transactions 
       SET type = $1, description = $2, amount = $3, date = $4, 
           due_date = $5, group_id = $6, supplier_id = $7, invoice_number = $8
       WHERE id = $9
       RETURNING *`,
      [type, description, amount, date, dueDate || null, groupId || null, supplierId || null, invoiceNumber || null, id]
    );

    // Converter snake_case para camelCase E converter números
    const transaction = result.rows[0];
    const formattedTransaction = {
      id: transaction.id,
      storeId: transaction.store_id,
      type: transaction.type,
      description: transaction.description,
      amount: parseNumeric(transaction.amount),
      date: transaction.date,
      dueDate: transaction.due_date,
      groupId: transaction.group_id,
      supplierId: transaction.supplier_id,
      invoiceNumber: transaction.invoice_number,
      createdAt: transaction.created_at
    };

    res.json(formattedTransaction);
  } catch (error) {
    console.error('Erro ao atualizar transação:', error);
    res.status(500).json({ error: 'Erro ao atualizar transação' });
  }
});

// Deletar transação
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const accessCheck = await pool.query(
      `SELECT t.store_id FROM transactions t
       INNER JOIN stores s ON t.store_id = s.id
       LEFT JOIN user_store_access usa ON s.id = usa.store_id
       WHERE t.id = $1 AND (s.owner_id = $2 OR usa.user_id = $2)`,
      [id, userId]
    );

    if (accessCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Sem permissão para deletar esta transação' });
    }

    await pool.query('DELETE FROM transactions WHERE id = $1', [id]);

    res.json({ message: 'Transação deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar transação:', error);
    res.status(500).json({ error: 'Erro ao deletar transação' });
  }
});

export default router;