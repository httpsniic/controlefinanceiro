// services/api.ts
const API_URL = 'https://sistema-cmc-server.onrender.com';

// Helper para adicionar token nas requisições
const getHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

// Helper para tratar erros
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
    throw new Error(error.error || 'Erro na requisição');
  }
  return response.json();
};

// ============================================
// AUTENTICAÇÃO
// ============================================

export const auth = {
  login: async (username: string, password: string) => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await handleResponse(response);
    localStorage.setItem('auth_token', data.token);
    return data.user;
  },

  register: async (username: string, password: string, name: string) => {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, name, role: 'user' })
    });
    const data = await handleResponse(response);
    localStorage.setItem('auth_token', data.token);
    return data.user;
  },

  logout: () => {
    localStorage.removeItem('auth_token');
  }
};

// ============================================
// LOJAS
// ============================================

export const stores = {
  list: async () => {
    const response = await fetch(`${API_URL}/api/stores`, {
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  create: async (name: string) => {
    const response = await fetch(`${API_URL}/api/stores`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ name })
    });
    return handleResponse(response);
  },

  update: async (id: string, name: string) => {
    const response = await fetch(`${API_URL}/api/stores/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ name })
    });
    return handleResponse(response);
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_URL}/api/stores/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(response);
  }
};

// ============================================
// TRANSAÇÕES
// ============================================

export const transactions = {
  list: async (storeId: string) => {
    const response = await fetch(`${API_URL}/api/transactions/store/${storeId}`, {
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  create: async (data: any) => {
    const response = await fetch(`${API_URL}/api/transactions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  update: async (id: string, data: any) => {
    const response = await fetch(`${API_URL}/api/transactions/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_URL}/api/transactions/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(response);
  }
};

// ============================================
// FORNECEDORES
// ============================================

export const suppliers = {
  list: async (storeId: string) => {
    const response = await fetch(`${API_URL}/api/suppliers/store/${storeId}`, {
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  create: async (data: any) => {
    const response = await fetch(`${API_URL}/api/suppliers`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  update: async (id: string, data: any) => {
    const response = await fetch(`${API_URL}/api/suppliers/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_URL}/api/suppliers/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(response);
  }
};

// ============================================
// GRUPOS DE PRODUTOS
// ============================================

export const productGroups = {
  list: async (storeId: string) => {
    const response = await fetch(`${API_URL}/api/product-groups/store/${storeId}`, {
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  create: async (data: any) => {
    const response = await fetch(`${API_URL}/api/product-groups`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  update: async (id: string, data: any) => {
    const response = await fetch(`${API_URL}/api/product-groups/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_URL}/api/product-groups/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(response);
  }
};

// ============================================
// RECEITAS DIÁRIAS
// ============================================

export const dailyRevenues = {
  list: async (storeId: string) => {
    const response = await fetch(`${API_URL}/api/daily-revenues/store/${storeId}`, {
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  createOrUpdate: async (data: any) => {
    const response = await fetch(`${API_URL}/api/daily-revenues`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_URL}/api/daily-revenues/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(response);
  }
};

// ============================================
// METAS
// ============================================

export const goals = {
  list: async (storeId: string) => {
    const response = await fetch(`${API_URL}/api/goals/store/${storeId}`, {
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  createOrUpdate: async (data: any) => {
    const response = await fetch(`${API_URL}/api/goals`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_URL}/api/goals/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(response);
  }
};

// ============================================
// PERMISSÕES DE ACESSO
// ============================================

export const userStoreAccess = {
  list: async () => {
    const response = await fetch(`${API_URL}/api/user-store-access`, {
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  toggle: async (userId: string, storeId: string) => {
    const response = await fetch(`${API_URL}/api/user-store-access/toggle`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ userId, storeId })
    });
    return handleResponse(response);
  }
};

// ============================================
// PRODUTOS PORCIONADOS
// ============================================

export const portionedProducts = {
  list: async (storeId: string) => {
    const response = await fetch(`${API_URL}/api/portioned-products/store/${storeId}`, {
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  create: async (data: any) => {
    const response = await fetch(`${API_URL}/api/portioned-products`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_URL}/api/portioned-products/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(response);
  }
};

export const portionedEntries = {
  list: async (storeId: string) => {
    const response = await fetch(`${API_URL}/api/portioned-entries/store/${storeId}`, {
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  create: async (data: any) => {
    const response = await fetch(`${API_URL}/api/portioned-entries`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_URL}/api/portioned-entries/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(response);
  }
};