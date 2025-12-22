# FinancePro Backend API

Backend completo para o sistema FinancePro Multi-Store com Node.js, Express, PostgreSQL e autenticação JWT.

## 🚀 Instalação Local

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
PORT=5000
DATABASE_URL=postgresql://usuario:senha@localhost:5432/financepro
JWT_SECRET=seu_segredo_super_secreto_aqui
CORS_ORIGINS=http://localhost:3000,https://seu-site.netlify.app
NODE_ENV=development
```

### 3. Criar banco de dados PostgreSQL

Se você ainda não tem o PostgreSQL instalado, instale: https://www.postgresql.org/download/

Crie o banco de dados:

```bash
createdb financepro
```

Ou use o cliente psql:

```sql
CREATE DATABASE financepro;
```

### 4. Executar script de inicialização do banco

```bash
psql -d financepro -f src/database/init.sql
```

Ou copie o conteúdo do arquivo `src/database/init.sql` e execute no seu cliente PostgreSQL.

### 5. Rodar o servidor em desenvolvimento

```bash
npm run dev
```

O servidor estará rodando em: http://localhost:5000

### 6. Testar a API

Acesse: http://localhost:5000/health

Você deve ver:
```json
{
  "status": "OK",
  "message": "FinancePro API está rodando!"
}
```

## 📦 Deploy no Render

### 1. Criar conta no Render

Acesse: https://render.com e crie uma conta gratuita.

### 2. Criar banco de dados PostgreSQL

1. No dashboard do Render, clique em "New +" → "PostgreSQL"
2. Configure:
   - Name: `financepro-db`
   - Database: `financepro`
   - User: (deixe automático)
   - Region: escolha o mais próximo
   - Plan: Free
3. Clique em "Create Database"
4. Copie a URL de conexão "Internal Database URL"

### 3. Executar SQL de inicialização

1. No painel do banco criado, clique em "Connect"
2. Escolha "External Connection"
3. Use as credenciais para conectar via psql ou outro cliente
4. Execute o conteúdo do arquivo `src/database/init.sql`

### 4. Fazer deploy do backend

1. Faça push do código para GitHub
2. No Render, clique em "New +" → "Web Service"
3. Conecte seu repositório GitHub
4. Configure:
   - Name: `financepro-api`
   - Environment: `Node`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Plan: Free
5. Adicione as variáveis de ambiente:
   ```
   PORT=5000
   DATABASE_URL=(cole a Internal Database URL copiada antes)
   JWT_SECRET=cmc_master_super_secreto_2025
   CORS_ORIGINS=https://seu-site.netlify.app,http://localhost:3000
   NODE_ENV=production
   ```
6. Clique em "Create Web Service"

### 5. Testar deploy

Após o deploy completar, acesse:
```
https://seu-app.onrender.com/health
```

## 📚 Documentação da API

### Autenticação

#### POST /api/auth/login
Login de usuário

```json
{
  "username": "admin",
  "password": "admin123"
}
```

Resposta:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "username": "admin",
    "name": "Administrador",
    "role": "master"
  }
}
```

#### POST /api/auth/register
Criar novo usuário

```json
{
  "username": "usuario",
  "password": "senha123",
  "name": "Nome do Usuário",
  "role": "user"
}
```

### Lojas (requer autenticação)

#### GET /api/stores
Listar todas as lojas do usuário

Headers:
```
Authorization: Bearer {token}
```

#### POST /api/stores
Criar nova loja

```json
{
  "name": "Loja Centro"
}
```

#### GET /api/stores/:id
Buscar loja específica

#### PUT /api/stores/:id
Atualizar loja

#### DELETE /api/stores/:id
Deletar loja

### Transações

#### GET /api/transactions/store/:storeId
Listar transações de uma loja

#### POST /api/transactions
Criar transação

```json
{
  "storeId": "uuid",
  "type": "EXPENSE",
  "description": "Compra de ingredientes",
  "amount": 500.00,
  "date": "2025-12-22",
  "dueDate": "2025-12-30",
  "groupId": "uuid",
  "supplierId": "uuid",
  "invoiceNumber": "NF-12345"
}
```

### Fornecedores

#### GET /api/suppliers/store/:storeId
Listar fornecedores

#### POST /api/suppliers
Criar fornecedor

```json
{
  "storeId": "uuid",
  "name": "Fornecedor ABC",
  "contact": "(11) 98765-4321",
  "email": "contato@fornecedor.com",
  "categories": "Alimentos, Bebidas"
}
```

### Grupos de Produtos

#### GET /api/product-groups/store/:storeId
Listar grupos

#### POST /api/product-groups
Criar grupo

```json
{
  "storeId": "uuid",
  "name": "CMC (Custo de Mercadoria)",
  "color": "#10b981",
  "cmcTarget": 30.0,
  "icon": "Package"
}
```

### Receitas Diárias

#### GET /api/daily-revenues/store/:storeId
Listar receitas

#### POST /api/daily-revenues
Criar/atualizar receita

```json
{
  "storeId": "uuid",
  "date": "2025-12-22",
  "salon": 1500.00,
  "delivery": 800.00,
  "serviceCharge": 50.00
}
```

### Metas

#### GET /api/goals/store/:storeId
Listar metas

#### POST /api/goals
Criar/atualizar meta

```json
{
  "storeId": "uuid",
  "month": "2025-12",
  "revenueTarget": 50000.00,
  "cmcTarget": 30.0,
  "avgTicket": 45.00
}
```

## 🔐 Credenciais Padrão

Usuário master criado automaticamente:
- Username: `admin`
- Password: `admin123`

**⚠️ IMPORTANTE: Altere esta senha em produção!**

## 🛠️ Scripts Disponíveis

- `npm run dev` - Roda em modo desenvolvimento com hot reload
- `npm run build` - Compila TypeScript para JavaScript
- `npm start` - Inicia servidor em produção

## 📝 Notas

- Todas as rotas (exceto `/api/auth/*`) requerem autenticação via JWT
- O token JWT deve ser enviado no header: `Authorization: Bearer {token}`
- O token expira em 7 dias
- As senhas são criptografadas com bcrypt
- O banco usa UUIDs como IDs primários
