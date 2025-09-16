class DashboardFinance {
    constructor() {
        this.transactions = [];
        this.categories = {
            income: [],
            expense: []
        };
        this.user = null;
        this.charts = {};
        this.isLoading = false;
        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.setCurrentDate();
        this.initializeCharts();
        
        // Verificar autenticação
        if (window.financeAPI.isAuthenticated()) {
            try {
                await this.loadUserData();
                await this.loadCategories();
                await this.loadTransactions();
                this.updateDashboard();
            } catch (error) {
                console.error('Erro ao carregar dados:', error);
                this.showNotification('Erro ao carregar dados. Faça login novamente.', 'error');
                window.financeAPI.logout();
            }
        } else {
            // Login automático como demo
            await this.loginDemo();
        }
    }

    setupEventListeners() {
        document.getElementById('transactionForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTransaction();
        });

        document.getElementById('type').addEventListener('change', (e) => {
            this.updateCategoryOptions(e.target.value);
        });

        document.getElementById('addTransactionBtn').addEventListener('click', () => {
            this.openModal();
        });

        document.getElementById('closeModal').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('cancelTransaction').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('transactionModal').addEventListener('click', (e) => {
            if (e.target.id === 'transactionModal') {
                this.closeModal();
            }
        });

        document.querySelector('.search-bar input').addEventListener('input', (e) => {
            this.filterTransactions(e.target.value);
        });
    }

    // ===== MÉTODOS DE CARREGAMENTO DE DADOS =====
    async loadUserData() {
        try {
            const response = await window.financeAPI.getUserProfile();
            if (response.success) {
                this.user = response.data.user;
                this.updateUserInterface();
            }
        } catch (error) {
            console.error('Erro ao carregar dados do usuário:', error);
            throw error;
        }
    }

    async loadCategories() {
        try {
            const response = await window.financeAPI.getCategories();
            if (response.success) {
                this.categories = {
                    income: response.data.categories.filter(cat => cat.type === 'income'),
                    expense: response.data.categories.filter(cat => cat.type === 'expense')
                };
                this.populateCategories();
            }
        } catch (error) {
            console.error('Erro ao carregar categorias:', error);
            throw error;
        }
    }

    async loadTransactions() {
        try {
            const response = await window.financeAPI.getTransactions({ limit: 1000 });
            if (response.success) {
                this.transactions = response.data.transactions;
            }
        } catch (error) {
            console.error('Erro ao carregar transações:', error);
            throw error;
        }
    }

    async loginDemo() {
        try {
            const response = await window.financeAPI.loginDemo();
            if (response.success) {
                await this.loadUserData();
                await this.loadCategories();
                await this.loadTransactions();
                this.updateDashboard();
                this.showNotification('Login demo realizado com sucesso!', 'success');
            }
        } catch (error) {
            console.error('Erro no login demo:', error);
            this.showNotification('Erro ao fazer login demo', 'error');
        }
    }

    updateUserInterface() {
        if (this.user) {
            // Atualizar nome do usuário no header
            const userSpan = document.querySelector('.user-profile span');
            if (userSpan) {
                userSpan.textContent = this.user.name;
            }
        }
    }

    populateCategories() {
        const categorySelect = document.getElementById('category');
        categorySelect.innerHTML = '<option value="">Selecione a categoria</option>';
    }

    updateCategoryOptions(type) {
        const categorySelect = document.getElementById('category');
        categorySelect.innerHTML = '<option value="">Selecione a categoria</option>';
        
        if (type && this.categories[type]) {
            this.categories[type].forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                categorySelect.appendChild(option);
            });
        }
    }

    setCurrentDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('date').value = today;
    }

    async addTransaction() {
        const editId = document.getElementById('editId').value;
        
        if (editId) {
            await this.updateTransaction();
            return;
        }

        const description = document.getElementById('description').value.trim();
        const amount = parseFloat(document.getElementById('amount').value);
        const type = document.getElementById('type').value;
        const category = document.getElementById('category').value;
        const date = document.getElementById('date').value;

        if (!description || !amount || !type || !category || !date) {
            this.showNotification('Por favor, preencha todos os campos!', 'error');
            return;
        }

        if (amount <= 0) {
            this.showNotification('O valor deve ser maior que zero!', 'error');
            return;
        }

        this.setLoading(true);

        try {
            const transaction = {
                description,
                amount,
                type,
                category,
                date
            };

            const response = await window.financeAPI.createTransaction(transaction);
            
            if (response.success) {
                // Recarregar transações
                await this.loadTransactions();
                this.updateDashboard();
                this.resetForm();
                this.closeModal();
                this.showNotification('Transação adicionada com sucesso!', 'success');
            }
        } catch (error) {
            console.error('Erro ao adicionar transação:', error);
            this.showNotification('Erro ao adicionar transação: ' + error.message, 'error');
        } finally {
            this.setLoading(false);
        }
    }

    async updateTransaction() {
        const editId = document.getElementById('editId').value;
        const description = document.getElementById('description').value.trim();
        const amount = parseFloat(document.getElementById('amount').value);
        const type = document.getElementById('type').value;
        const category = document.getElementById('category').value;
        const date = document.getElementById('date').value;

        if (!description || !amount || !type || !category || !date) {
            this.showNotification('Por favor, preencha todos os campos!', 'error');
            return;
        }

        if (amount <= 0) {
            this.showNotification('O valor deve ser maior que zero!', 'error');
            return;
        }

        this.setLoading(true);

        try {
            const transaction = {
                description,
                amount,
                type,
                category,
                date
            };

            const response = await window.financeAPI.updateTransaction(editId, transaction);
            
            if (response.success) {
                // Recarregar transações
                await this.loadTransactions();
                this.updateDashboard();
                this.resetForm();
                this.closeModal();
                this.showNotification('Transação atualizada com sucesso!', 'success');
            }
        } catch (error) {
            console.error('Erro ao atualizar transação:', error);
            this.showNotification('Erro ao atualizar transação: ' + error.message, 'error');
        } finally {
            this.setLoading(false);
        }
    }

    editTransaction(id) {
        const transaction = this.transactions.find(t => t.id === id);
        if (transaction) {
            document.getElementById('editId').value = transaction.id;
            document.getElementById('description').value = transaction.description;
            document.getElementById('amount').value = transaction.amount;
            document.getElementById('type').value = transaction.type;
            document.getElementById('date').value = transaction.date;
            
            // Update category options based on type
            this.updateCategoryOptions(transaction.type);
            setTimeout(() => {
                document.getElementById('category').value = transaction.category;
            }, 100);
            
            // Update modal title and button
            document.querySelector('.modal-header h3').textContent = 'Editar Transação';
            document.getElementById('saveButton').textContent = 'Salvar Alterações';
            
            this.openModal();
        }
    }

    async deleteTransaction(id) {
        if (confirm('Tem certeza que deseja excluir esta transação?')) {
            this.setLoading(true);

            try {
                const response = await window.financeAPI.deleteTransaction(id);
                
                if (response.success) {
                    // Recarregar transações
                    await this.loadTransactions();
                    this.updateDashboard();
                    this.showNotification('Transação excluída com sucesso!', 'success');
                }
            } catch (error) {
                console.error('Erro ao excluir transação:', error);
                this.showNotification('Erro ao excluir transação: ' + error.message, 'error');
            } finally {
                this.setLoading(false);
            }
        }
    }

    resetForm() {
        document.getElementById('transactionForm').reset();
        document.getElementById('editId').value = '';
        document.querySelector('.modal-header h3').textContent = 'Nova Transação';
        document.getElementById('saveButton').textContent = 'Adicionar Transação';
        this.setCurrentDate();
    }

    openModal() {
        document.getElementById('transactionModal').classList.add('active');
    }

    closeModal() {
        document.getElementById('transactionModal').classList.remove('active');
    }

    updateDashboard() {
        this.updateSummaryCards();
        this.updateRecentTransactions();
        this.updateCharts();
        this.updateSpendingParameters();
    }

    updateSummaryCards() {
        const totalIncome = this.transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const totalExpense = this.transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const totalBalance = totalIncome - totalExpense;

        document.getElementById('totalBalance').textContent = this.formatCurrency(totalBalance);
        document.getElementById('totalExpense').textContent = this.formatCurrency(totalExpense);
        
        const currentMonth = new Date().getMonth();
        const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        
        const currentMonthIncome = this.getMonthlyTotal('income', currentMonth);
        const previousMonthIncome = this.getMonthlyTotal('income', previousMonth);
        const currentMonthExpense = this.getMonthlyTotal('expense', currentMonth);
        const previousMonthExpense = this.getMonthlyTotal('expense', previousMonth);
        
        const incomeChange = previousMonthIncome > 0 ? 
            ((currentMonthIncome - previousMonthIncome) / previousMonthIncome * 100) : 0;
        const expenseChange = previousMonthExpense > 0 ? 
            ((currentMonthExpense - previousMonthExpense) / previousMonthExpense * 100) : 0;
        
        document.getElementById('balanceChange').textContent = 
            `${incomeChange >= 0 ? '+' : ''}${incomeChange.toFixed(1)}%`;
        document.getElementById('expenseChange').textContent = 
            `${expenseChange >= 0 ? '+' : ''}${expenseChange.toFixed(1)}%`;
    }

    getMonthlyTotal(type, month) {
        return this.transactions
            .filter(t => t.type === type && new Date(t.date).getMonth() === month)
            .reduce((sum, t) => sum + t.amount, 0);
    }

    updateRecentTransactions() {
        const transactionsList = document.getElementById('transactionsList');
        const recentTransactions = this.transactions
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5);

        if (recentTransactions.length === 0) {
            transactionsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-receipt"></i>
                    <p>Nenhuma transação encontrada</p>
                </div>
            `;
            return;
        }

        transactionsList.innerHTML = recentTransactions.map(transaction => `
            <div class="transaction-item">
                <div class="transaction-icon ${transaction.type}">
                    <i class="fas fa-${transaction.type === 'income' ? 'arrow-up' : 'arrow-down'}"></i>
                </div>
                <div class="transaction-details">
                    <div class="transaction-description">${transaction.description}</div>
                    <div class="transaction-category">${transaction.category}</div>
                </div>
                <div class="transaction-amount ${transaction.type}">
                    ${transaction.type === 'income' ? '+' : '-'}${this.formatCurrency(transaction.amount)}
                </div>
                <div class="transaction-actions">
                    <button class="btn-edit" onclick="dashboard.editTransaction(${transaction.id})" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-delete" onclick="dashboard.deleteTransaction(${transaction.id})" title="Excluir">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    updateCharts() {
        this.updateCategoryChart();
        this.updateMonthlyChart();
        this.updateSummaryCharts();
    }

    updateCategoryChart() {
        const ctx = document.getElementById('categoryChart').getContext('2d');
        
        if (this.charts.categoryChart) {
            this.charts.categoryChart.destroy();
        }

        const expenseData = this.getCategoryData();
        const colors = ['#8b5cf6', '#ef4444', '#f59e0b', '#10b981', '#06b6d4', '#ec4899', '#84cc16', '#f97316'];

        this.charts.categoryChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: expenseData.labels,
                datasets: [{
                    data: expenseData.values,
                    backgroundColor: colors.slice(0, expenseData.labels.length),
                    borderWidth: 0,
                    cutout: '70%'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });

        this.updateCategoryLegend(expenseData.labels, colors);
    }

    updateCategoryLegend(labels, colors) {
        const legend = document.getElementById('categoryLegend');
        legend.innerHTML = labels.map((label, index) => `
            <div class="legend-item">
                <div class="legend-color" style="background-color: ${colors[index]}"></div>
                <span>${label}</span>
            </div>
        `).join('');
    }

    getCategoryData() {
        const expenseTransactions = this.transactions.filter(t => t.type === 'expense');
        const categoryTotals = {};
        
        expenseTransactions.forEach(transaction => {
            if (categoryTotals[transaction.category]) {
                categoryTotals[transaction.category] += transaction.amount;
            } else {
                categoryTotals[transaction.category] = transaction.amount;
            }
        });

        const sortedCategories = Object.entries(categoryTotals)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 6);

        return {
            labels: sortedCategories.map(([category]) => category),
            values: sortedCategories.map(([, amount]) => amount)
        };
    }

    updateMonthlyChart() {
        const ctx = document.getElementById('monthlyChart').getContext('2d');
        
        if (this.charts.monthlyChart) {
            this.charts.monthlyChart.destroy();
        }

        const monthlyData = this.getMonthlyData();
        const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

        this.charts.monthlyChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: months,
                datasets: [{
                    label: 'Gastos',
                    data: monthlyData,
                    backgroundColor: '#8b5cf6',
                    borderRadius: 8,
                    borderSkipped: false,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: '#333'
                        },
                        ticks: {
                            color: '#9ca3af'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#9ca3af'
                        }
                    }
                }
            }
        });
    }

    getMonthlyData() {
        const monthlyTotals = new Array(12).fill(0);
        
        this.transactions
            .filter(t => t.type === 'expense')
            .forEach(transaction => {
                const month = new Date(transaction.date).getMonth();
                monthlyTotals[month] += transaction.amount;
            });

        return monthlyTotals;
    }

    updateSummaryCharts() {
        this.updateBalanceChart();
        this.updateExpenseChart();
    }

    updateBalanceChart() {
        const ctx = document.getElementById('balanceChart').getContext('2d');
        
        if (this.charts.balanceChart) {
            this.charts.balanceChart.destroy();
        }

        const balanceData = this.getWeeklyBalanceData();

        this.charts.balanceChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: balanceData.labels,
                datasets: [{
                    data: balanceData.values,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        display: false
                    },
                    y: {
                        display: false
                    }
                }
            }
        });
    }

    updateExpenseChart() {
        const ctx = document.getElementById('expenseChart').getContext('2d');
        
        if (this.charts.expenseChart) {
            this.charts.expenseChart.destroy();
        }

        const expenseData = this.getWeeklyExpenseData();

        this.charts.expenseChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: expenseData.labels,
                datasets: [{
                    data: expenseData.values,
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        display: false
                    },
                    y: {
                        display: false
                    }
                }
            }
        });
    }

    getWeeklyBalanceData() {
        const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        const data = [];
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dayTransactions = this.transactions.filter(t => 
                new Date(t.date).toDateString() === date.toDateString()
            );
            
            const dayIncome = dayTransactions
                .filter(t => t.type === 'income')
                .reduce((sum, t) => sum + t.amount, 0);
            const dayExpense = dayTransactions
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + t.amount, 0);
            
            data.push(dayIncome - dayExpense);
        }

        return {
            labels: days,
            values: data
        };
    }

    getWeeklyExpenseData() {
        const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        const data = [];
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dayExpense = this.transactions
                .filter(t => t.type === 'expense' && 
                    new Date(t.date).toDateString() === date.toDateString())
                .reduce((sum, t) => sum + t.amount, 0);
            
            data.push(dayExpense);
        }

        return {
            labels: days,
            values: data
        };
    }

    updateSpendingParameters() {
        const parametersGrid = document.getElementById('parametersGrid');
        const categoryData = this.getCategoryData();
        const totalExpense = categoryData.values.reduce((sum, val) => sum + val, 0);
        
        const parameterCategories = [
            { name: 'Alimentação', icon: 'fas fa-utensils', key: 'Alimentação' },
            { name: 'Moradia', icon: 'fas fa-home', key: 'Moradia' },
            { name: 'Transporte', icon: 'fas fa-car', key: 'Transporte' },
            { name: 'Lazer', icon: 'fas fa-gamepad', key: 'Lazer' },
            { name: 'Saúde', icon: 'fas fa-heart', key: 'Saúde' }
        ];

        parametersGrid.innerHTML = parameterCategories.map(cat => {
            const amount = categoryData.values[categoryData.labels.indexOf(cat.key)] || 0;
            const percentage = totalExpense > 0 ? (amount / totalExpense * 100) : 0;
            const trend = Math.random() > 0.5 ? 'positive' : 'negative';
            const trendValue = (Math.random() * 20).toFixed(1);
            
            return `
                <div class="parameter-card">
                    <div class="parameter-icon ${cat.key.toLowerCase()}">
                        <i class="${cat.icon}"></i>
                    </div>
                    <div class="parameter-name">${cat.name}</div>
                    <div class="parameter-percentage">${percentage.toFixed(0)}%</div>
                    <div class="parameter-trend ${trend}">
                        <i class="fas fa-arrow-${trend === 'positive' ? 'up' : 'down'}"></i>
                        <span>${trendValue}%</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    filterTransactions(searchTerm) {
        const filteredTransactions = this.transactions.filter(transaction =>
            transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            transaction.category.toLowerCase().includes(searchTerm.toLowerCase())
        );

        this.displayFilteredTransactions(filteredTransactions);
    }

    displayFilteredTransactions(transactions) {
        const transactionsList = document.getElementById('transactionsList');
        
        if (transactions.length === 0) {
            transactionsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <p>Nenhuma transação encontrada</p>
                </div>
            `;
            return;
        }

        const recentTransactions = transactions
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5);

        transactionsList.innerHTML = recentTransactions.map(transaction => `
            <div class="transaction-item">
                <div class="transaction-icon ${transaction.type}">
                    <i class="fas fa-${transaction.type === 'income' ? 'arrow-up' : 'arrow-down'}"></i>
                </div>
                <div class="transaction-details">
                    <div class="transaction-description">${transaction.description}</div>
                    <div class="transaction-category">${transaction.category}</div>
                </div>
                <div class="transaction-amount ${transaction.type}">
                    ${transaction.type === 'income' ? '+' : '-'}${this.formatCurrency(transaction.amount)}
                </div>
                <div class="transaction-actions">
                    <button class="btn-edit" onclick="dashboard.editTransaction(${transaction.id})" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-delete" onclick="dashboard.deleteTransaction(${transaction.id})" title="Excluir">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    initializeCharts() {
        this.updateCharts();
    }


    formatCurrency(amount) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(amount);
    }

    setLoading(loading) {
        this.isLoading = loading;
        const saveButton = document.getElementById('saveButton');
        if (saveButton) {
            saveButton.disabled = loading;
            saveButton.textContent = loading ? 'Salvando...' : 'Adicionar Transação';
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#8b5cf6'};
            color: white;
            padding: 15px 20px;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            z-index: 3000;
            font-weight: 600;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 300px;
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize the dashboard
const dashboard = new DashboardFinance();


// Navigation functions
function navigateToAnalytics() {
    window.location.href = 'analytics.html';
}

function navigateToTransactions() {
    window.location.href = 'transactions.html';
}

function navigateToSettings() {
    console.log('Navegando para configurações...');
    window.location.href = 'settings.html';
}

// Garantir que as funções estejam disponíveis globalmente
window.navigateToAnalytics = navigateToAnalytics;
window.navigateToTransactions = navigateToTransactions;
window.navigateToSettings = navigateToSettings;

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        dashboard.closeModal();
    }
    
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        const activeElement = document.activeElement;
        if (activeElement && activeElement.form) {
            activeElement.form.dispatchEvent(new Event('submit'));
        }
    }
});

// Função para inicializar o tema
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeToggle(savedTheme);
}

// Função para alternar entre temas
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeToggle(newTheme);
    
    // Animação suave de transição
    document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
    setTimeout(() => {
        document.body.style.transition = '';
    }, 300);
}

// Função para atualizar o visual do toggle
function updateThemeToggle(theme) {
    const darkDot = document.querySelector('.theme-dot.dark');
    const lightDot = document.querySelector('.theme-dot.light');
    
    if (darkDot && lightDot) {
        if (theme === 'dark') {
            darkDot.classList.add('active');
            lightDot.classList.remove('active');
        } else {
            lightDot.classList.add('active');
            darkDot.classList.remove('active');
        }
    }
}

// Inicializar tema quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    initializeTheme();
    initializeDeviceDetection();
});

// ========================================
// SISTEMA DE DETECÇÃO DE DISPOSITIVO
// ========================================

class DeviceDetector {
    constructor() {
        this.deviceType = this.detectDevice();
        this.isMobile = this.deviceType === 'mobile';
        this.isTablet = this.deviceType === 'tablet';
        this.isDesktop = this.deviceType === 'desktop';
        this.touchDevice = this.isTouchDevice();
        this.orientation = this.getOrientation();
        
        this.setupDeviceOptimizations();
        this.setupOrientationListener();
        this.setupResizeListener();
    }

    detectDevice() {
        const userAgent = navigator.userAgent.toLowerCase();
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        
        // Detecção por User Agent
        const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
        const isTabletUA = /ipad|android(?!.*mobile)/i.test(userAgent);
        
        // Detecção por tamanho de tela
        if (screenWidth <= 768) {
            return 'mobile';
        } else if (screenWidth <= 1024 || isTabletUA) {
            return 'tablet';
        } else {
            return 'desktop';
        }
    }

    isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }

    getOrientation() {
        return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
    }

    setupDeviceOptimizations() {
        // Adicionar classes CSS baseadas no dispositivo
        document.documentElement.classList.add(`device-${this.deviceType}`);
        document.documentElement.classList.add(`touch-${this.touchDevice ? 'enabled' : 'disabled'}`);
        document.documentElement.classList.add(`orientation-${this.orientation}`);
        
        // Otimizações específicas por dispositivo
        if (this.isMobile) {
            this.setupMobileOptimizations();
        } else if (this.isTablet) {
            this.setupTabletOptimizations();
        } else {
            this.setupDesktopOptimizations();
        }
    }

    setupMobileOptimizations() {
        // Otimizações para mobile
        this.enableMobileSidebar();
        this.optimizeMobileTouch();
        this.setupMobileGestures();
        this.optimizeMobilePerformance();
    }

    setupTabletOptimizations() {
        // Otimizações para tablet
        this.enableTabletLayout();
        this.optimizeTabletTouch();
    }

    setupDesktopOptimizations() {
        // Otimizações para desktop
        this.enableDesktopFeatures();
        this.optimizeDesktopHover();
        this.setupKeyboardShortcuts();
    }

    enableMobileSidebar() {
        // Sidebar como overlay em mobile
        const sidebar = document.querySelector('.sidebar');
        const mainContent = document.querySelector('.main-content');
        
        if (sidebar && mainContent) {
            sidebar.classList.add('mobile-overlay');
            mainContent.classList.add('mobile-content');
            
            // Adicionar botão de toggle para mobile
            this.createMobileMenuButton();
        }
    }

    createMobileMenuButton() {
        const header = document.querySelector('.dashboard-header');
        if (header && !document.querySelector('.mobile-menu-btn')) {
            const menuBtn = document.createElement('button');
            menuBtn.className = 'mobile-menu-btn';
            menuBtn.innerHTML = '<i class="fas fa-bars"></i>';
            menuBtn.onclick = this.toggleMobileSidebar;
            
            const headerLeft = header.querySelector('.header-left');
            if (headerLeft) {
                headerLeft.insertBefore(menuBtn, headerLeft.firstChild);
            }
        }
    }

    toggleMobileSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.sidebar-overlay');
        
        if (sidebar) {
            sidebar.classList.toggle('active');
            
            if (!overlay) {
                this.createSidebarOverlay();
            } else {
                overlay.classList.toggle('active');
            }
        }
    }

    createSidebarOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        overlay.onclick = this.toggleMobileSidebar;
        document.body.appendChild(overlay);
        overlay.classList.add('active');
    }

    optimizeMobileTouch() {
        // Otimizar elementos para touch
        const touchElements = document.querySelectorAll('button, .card, .nav-item a');
        touchElements.forEach(element => {
            element.style.minHeight = '44px'; // Tamanho mínimo para touch
            element.style.minWidth = '44px';
        });
    }

    setupMobileGestures() {
        // Configurar gestos para mobile
        let startY = 0;
        let startX = 0;
        
        document.addEventListener('touchstart', (e) => {
            startY = e.touches[0].clientY;
            startX = e.touches[0].clientX;
        });
        
        document.addEventListener('touchend', (e) => {
            const endY = e.changedTouches[0].clientY;
            const endX = e.changedTouches[0].clientX;
            const diffY = startY - endY;
            const diffX = startX - endX;
            
            // Swipe para baixo para fechar sidebar
            if (Math.abs(diffY) > Math.abs(diffX) && diffY < -50) {
                this.closeMobileSidebar();
            }
        });
    }

    closeMobileSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.sidebar-overlay');
        
        if (sidebar) {
            sidebar.classList.remove('active');
            if (overlay) {
                overlay.classList.remove('active');
            }
        }
    }

    optimizeMobilePerformance() {
        // Otimizações de performance para mobile
        const charts = document.querySelectorAll('.chart-container');
        charts.forEach(chart => {
            chart.style.willChange = 'transform';
        });
        
        // Lazy loading para imagens
        const images = document.querySelectorAll('img[data-src]');
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });
            
            images.forEach(img => imageObserver.observe(img));
        }
    }

    enableTabletLayout() {
        // Layout híbrido para tablet
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            sidebar.classList.add('tablet-layout');
        }
    }

    optimizeTabletTouch() {
        // Otimizações específicas para tablet
        const touchElements = document.querySelectorAll('.filter-group, .summary-card');
        touchElements.forEach(element => {
            element.style.minHeight = '48px';
        });
    }

    enableDesktopFeatures() {
        // Funcionalidades específicas para desktop
        this.enableHoverEffects();
        this.setupKeyboardNavigation();
        this.enableAdvancedInteractions();
    }

    enableHoverEffects() {
        // Efeitos hover apenas em desktop
        const hoverElements = document.querySelectorAll('.summary-card, .nav-item, .btn');
        hoverElements.forEach(element => {
            element.classList.add('desktop-hover');
        });
    }

    setupKeyboardNavigation() {
        // Navegação por teclado
        document.addEventListener('keydown', (e) => {
            if (e.altKey) {
                switch(e.key) {
                    case '1':
                        e.preventDefault();
                        navigateToDashboard();
                        break;
                    case '2':
                        e.preventDefault();
                        navigateToAnalytics();
                        break;
                    case '3':
                        e.preventDefault();
                        navigateToTransactions();
                        break;
                    case '4':
                        e.preventDefault();
                        navigateToSettings();
                        break;
                    case 'm':
                        e.preventDefault();
                        this.toggleMobileSidebar();
                        break;
                }
            }
        });
    }

    enableAdvancedInteractions() {
        // Interações avançadas para desktop
        const cards = document.querySelectorAll('.summary-card');
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-4px) scale(1.02)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
            });
        });
    }

    setupOrientationListener() {
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.orientation = this.getOrientation();
                document.documentElement.classList.remove('orientation-portrait', 'orientation-landscape');
                document.documentElement.classList.add(`orientation-${this.orientation}`);
                
                // Reajustar layout após mudança de orientação
                this.handleOrientationChange();
            }, 100);
        });
    }

    handleOrientationChange() {
        if (this.isMobile) {
            // Fechar sidebar em mudança de orientação no mobile
            this.closeMobileSidebar();
        }
    }

    setupResizeListener() {
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                const newDeviceType = this.detectDevice();
                if (newDeviceType !== this.deviceType) {
                    this.deviceType = newDeviceType;
                    this.isMobile = this.deviceType === 'mobile';
                    this.isTablet = this.deviceType === 'tablet';
                    this.isDesktop = this.deviceType === 'desktop';
                    
                    // Remover classes antigas
                    document.documentElement.classList.remove('device-mobile', 'device-tablet', 'device-desktop');
                    document.documentElement.classList.add(`device-${this.deviceType}`);
                    
                    // Reconfigurar otimizações
                    this.setupDeviceOptimizations();
                }
            }, 250);
        });
    }
}

// Função para inicializar detecção de dispositivo
function initializeDeviceDetection() {
    window.deviceDetector = new DeviceDetector();
    
    // Adicionar informações de dispositivo ao console (apenas em desenvolvimento)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('🔍 Device Detection:', {
            type: window.deviceDetector.deviceType,
            touch: window.deviceDetector.touchDevice,
            orientation: window.deviceDetector.orientation,
            screen: `${window.innerWidth}x${window.innerHeight}`
        });
    }
}

// Funções de navegação para atalhos de teclado
function navigateToDashboard() {
    if (window.location.pathname !== '/index.html' && window.location.pathname !== '/') {
        window.location.href = 'index.html';
    }
}

function navigateToAnalytics() {
    if (window.location.pathname !== '/analytics.html') {
        window.location.href = 'analytics.html';
    }
}

function navigateToTransactions() {
    if (window.location.pathname !== '/transactions.html') {
        window.location.href = 'transactions.html';
    }
}

function navigateToSettings() {
    if (window.location.pathname !== '/settings.html') {
        window.location.href = 'settings.html';
    }
}