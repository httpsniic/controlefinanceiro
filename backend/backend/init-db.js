import pg from 'pg';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const { Pool } = pg;

// Usar a External URL para conectar do seu computador
const pool = new Pool({
  connectionString: 'postgresql://sistema_cmc_db_user:YyRHqrhcJbb2DDlmMIdhOdhr5s6zbXKv@dpg-d4vva9uuk2gs739maji0-a.ohio-postgres.render.com/sistema_cmc_db',
  ssl: { rejectUnauthorized: false }
});

async function initDatabase() {
  try {
    console.log('🔄 Conectando ao banco de dados...');
    
    // Ler arquivo SQL
    const sqlPath = join(__dirname, 'src', 'database', 'init.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('📝 Executando script SQL...');
    
    // Executar SQL
    await pool.query(sql);
    
    console.log('✅ Banco de dados inicializado com sucesso!');
    console.log('');
    console.log('📋 Credenciais padrão:');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    console.log('');
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao inicializar banco:', error.message);
    process.exit(1);
  }
}

initDatabase();