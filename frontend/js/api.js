// Classe para gerenciar comunicação com a API
class FinanceAPI {
    constructor() {
        this.baseURL = process.env.NODE_ENV === 'production' ? '/api' : '/api';
        this.token = localStorage.getItem('finance_token');
    }

    // Configurar token de autenticação
    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('finance_token', token);
        } else {
            localStorage.removeItem('finance_token');
        }
    }

    // Fazer requisição HTTP
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        // Adicionar token de autenticação se existir
        if (this.token) {
            config.headers.Authorization = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erro na requisição');
            }

            return data;
        } catch (error) {
            console.error('Erro na API:', error);
            throw error;
        }
    }

    // ===== AUTENTICAÇÃO =====
    async login(email, password) {
        const response = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        
        if (response.success && response.data.token) {
            this.setToken(response.data.token);
        }
        
        return response;
    }

    async register(name, email, password) {
        const response = await this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ name, email, password })
        });
        
        if (response.success && response.data.token) {
            this.setToken(response.data.token);
        }
        
        return response;
    }

    async loginDemo() {
        const response = await this.request('/auth/demo', {
            method: 'POST'
        });
        
        if (response.success && response.data.token) {
            this.setToken(response.data.token);
        }
        
        return response;
    }

    async verifyToken() {
        return await this.request('/auth/verify');
    }

    // ===== TRANSAÇÕES =====
    async getTransactions(filters = {}) {
        const params = new URLSearchParams();
        
        Object.keys(filters).forEach(key => {
            if (filters[key] !== undefined && filters[key] !== '') {
                params.append(key, filters[key]);
            }
        });

        const queryString = params.toString();
        const endpoint = queryString ? `/transactions?${queryString}` : '/transactions';
        
        return await this.request(endpoint);
    }

    async getTransaction(id) {
        return await this.request(`/transactions/${id}`);
    }

    async createTransaction(transaction) {
        return await this.request('/transactions', {
            method: 'POST',
            body: JSON.stringify(transaction)
        });
    }

    async updateTransaction(id, transaction) {
        return await this.request(`/transactions/${id}`, {
            method: 'PUT',
            body: JSON.stringify(transaction)
        });
    }

    async deleteTransaction(id) {
        return await this.request(`/transactions/${id}`, {
            method: 'DELETE'
        });
    }

    async deleteMultipleTransactions(ids) {
        return await this.request('/transactions/bulk/delete', {
            method: 'DELETE',
            body: JSON.stringify({ ids })
        });
    }

    async getTransactionStats(filters = {}) {
        const params = new URLSearchParams();
        
        Object.keys(filters).forEach(key => {
            if (filters[key] !== undefined && filters[key] !== '') {
                params.append(key, filters[key]);
            }
        });

        const queryString = params.toString();
        const endpoint = queryString ? `/transactions/stats?${queryString}` : '/transactions/stats';
        
        return await this.request(endpoint);
    }

    async getRecentTransactions(limit = 5) {
        return await this.request(`/transactions/recent?limit=${limit}`);
    }

    // ===== CATEGORIAS =====
    async getCategories(type = null) {
        const endpoint = type ? `/categories?type=${type}` : '/categories';
        return await this.request(endpoint);
    }

    async getCategory(id) {
        return await this.request(`/categories/${id}`);
    }

    async createCategory(category) {
        return await this.request('/categories', {
            method: 'POST',
            body: JSON.stringify(category)
        });
    }

    async updateCategory(id, category) {
        return await this.request(`/categories/${id}`, {
            method: 'PUT',
            body: JSON.stringify(category)
        });
    }

    async deleteCategory(id) {
        return await this.request(`/categories/${id}`, {
            method: 'DELETE'
        });
    }

    async getCategoryStats(filters = {}) {
        const params = new URLSearchParams();
        
        Object.keys(filters).forEach(key => {
            if (filters[key] !== undefined && filters[key] !== '') {
                params.append(key, filters[key]);
            }
        });

        const queryString = params.toString();
        const endpoint = queryString ? `/categories/stats?${queryString}` : '/categories/stats';
        
        return await this.request(endpoint);
    }

    // ===== USUÁRIO =====
    async getUserProfile() {
        return await this.request('/users/profile');
    }

    async updateUserProfile(profile) {
        return await this.request('/users/profile', {
            method: 'PUT',
            body: JSON.stringify(profile)
        });
    }

    async changePassword(currentPassword, newPassword) {
        return await this.request('/users/password', {
            method: 'PUT',
            body: JSON.stringify({ currentPassword, newPassword })
        });
    }

    async getUserSettings() {
        return await this.request('/users/settings');
    }

    async updateUserSettings(settings) {
        return await this.request('/users/settings', {
            method: 'PUT',
            body: JSON.stringify(settings)
        });
    }

    async getUserStats() {
        return await this.request('/users/stats');
    }

    async exportUserData() {
        return await this.request('/users/export');
    }

    // ===== UTILITÁRIOS =====
    isAuthenticated() {
        return !!this.token;
    }

    logout() {
        this.setToken(null);
        // Redirecionar para login ou recarregar página
        window.location.reload();
    }

    // Verificar se a resposta indica erro de autenticação
    isAuthError(error) {
        return error.message && (
            error.message.includes('Token') || 
            error.message.includes('não autorizado') ||
            error.message.includes('credenciais')
        );
    }
}

// Instância global da API
window.financeAPI = new FinanceAPI();
