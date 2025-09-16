class TransactionsManager {
    constructor() {
        this.transactions = JSON.parse(localStorage.getItem('expenseTracker')) || [];
        this.filteredTransactions = [...this.transactions];
        this.currentPage = 1;
        this.pageSize = 25;
        this.sortBy = 'date-desc';
        this.selectedTransactions = new Set();
        this.categories = {
            income: ['Salário', 'Freelance', 'Investimentos', 'Vendas', 'Outros'],
            expense: ['Alimentação', 'Moradia', 'Transporte', 'Saúde', 'Educação', 'Lazer', 'Roupas', 'Contas', 'Outros']
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.populateFilters();
        this.setDefaultDates();
        this.updateDisplay();
    }

    setupEventListeners() {
        // Filter controls
        document.getElementById('applyFilters').addEventListener('click', () => {
            this.applyFilters();
        });

        document.getElementById('clearFilters').addEventListener('click', () => {
            this.clearFilters();
        });

        // Search
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.searchTransactions(e.target.value);
        });

        // Transaction form
        document.getElementById('transactionForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveTransaction();
        });

        // Type change - update categories
        document.getElementById('type').addEventListener('change', (e) => {
            this.updateCategoryOptions(e.target.value);
        });

        // Modal controls
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

        // Bulk actions
        document.getElementById('bulkDelete').addEventListener('click', () => {
            this.bulkDelete();
        });

        document.getElementById('bulkEdit').addEventListener('click', () => {
            this.openBulkEditModal();
        });

        // Bulk edit modal
        document.getElementById('closeBulkModal').addEventListener('click', () => {
            this.closeBulkModal();
        });

        document.getElementById('cancelBulkEdit').addEventListener('click', () => {
            this.closeBulkModal();
        });

        document.getElementById('saveBulkEdit').addEventListener('click', () => {
            this.saveBulkEdit();
        });

        // Pagination
        document.getElementById('prevPage').addEventListener('click', () => {
            this.previousPage();
        });

        document.getElementById('nextPage').addEventListener('click', () => {
            this.nextPage();
        });

        document.getElementById('pageSize').addEventListener('change', (e) => {
            this.pageSize = parseInt(e.target.value);
            this.currentPage = 1;
            this.updateDisplay();
        });

        // Sorting
        document.getElementById('sortBy').addEventListener('change', (e) => {
            this.sortBy = e.target.value;
            this.updateDisplay();
        });

        // View options
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchView(e.target.dataset.view);
            });
        });

        // Export
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportTransactions();
        });

        // Select all checkbox
        document.getElementById('selectAll').addEventListener('change', (e) => {
            this.toggleSelectAll(e.target.checked);
        });
    }

    populateFilters() {
        const categoryFilter = document.getElementById('categoryFilter');
        const categories = [...new Set(this.transactions.map(t => t.category))].sort();
        
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });
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

    setDefaultDates() {
        const today = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);
        
        document.getElementById('dateTo').value = today.toISOString().split('T')[0];
        document.getElementById('dateFrom').value = thirtyDaysAgo.toISOString().split('T')[0];
    }

    applyFilters() {
        const dateFrom = document.getElementById('dateFrom').value;
        const dateTo = document.getElementById('dateTo').value;
        const category = document.getElementById('categoryFilter').value;
        const type = document.getElementById('typeFilter').value;
        const amount = document.getElementById('amountFilter').value;

        let filtered = [...this.transactions];

        // Filter by date range
        if (dateFrom) {
            filtered = filtered.filter(t => t.date >= dateFrom);
        }
        if (dateTo) {
            filtered = filtered.filter(t => t.date <= dateTo);
        }

        // Filter by category
        if (category) {
            filtered = filtered.filter(t => t.category === category);
        }

        // Filter by type
        if (type) {
            filtered = filtered.filter(t => t.type === type);
        }

        // Filter by amount range
        if (amount) {
            const [min, max] = amount.split('-').map(v => v === '+' ? Infinity : parseFloat(v));
            filtered = filtered.filter(t => {
                const amount = parseFloat(t.amount);
                return amount >= min && (max === undefined || amount <= max);
            });
        }

        this.filteredTransactions = filtered;
        this.currentPage = 1;
        this.updateDisplay();
    }

    clearFilters() {
        document.getElementById('dateFrom').value = '';
        document.getElementById('dateTo').value = '';
        document.getElementById('categoryFilter').value = '';
        document.getElementById('typeFilter').value = '';
        document.getElementById('amountFilter').value = '';
        document.getElementById('searchInput').value = '';
        
        this.filteredTransactions = [...this.transactions];
        this.currentPage = 1;
        this.updateDisplay();
    }

    searchTransactions(searchTerm) {
        if (!searchTerm.trim()) {
            this.applyFilters();
            return;
        }

        const filtered = this.filteredTransactions.filter(transaction =>
            transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            transaction.category.toLowerCase().includes(searchTerm.toLowerCase())
        );

        this.filteredTransactions = filtered;
        this.currentPage = 1;
        this.updateDisplay();
    }

    updateDisplay() {
        this.updateSummaryCards();
        this.updateTable();
        this.updatePagination();
    }

    updateSummaryCards() {
        const income = this.filteredTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const expense = this.filteredTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const netBalance = income - expense;
        const incomeCount = this.filteredTransactions.filter(t => t.type === 'income').length;
        const expenseCount = this.filteredTransactions.filter(t => t.type === 'expense').length;
        const totalCount = this.filteredTransactions.length;

        document.getElementById('totalIncome').textContent = this.formatCurrency(income);
        document.getElementById('totalExpense').textContent = this.formatCurrency(expense);
        document.getElementById('netBalance').textContent = this.formatCurrency(netBalance);
        document.getElementById('incomeCount').textContent = `${incomeCount} transações`;
        document.getElementById('expenseCount').textContent = `${expenseCount} transações`;
        document.getElementById('totalCount').textContent = `${totalCount} transações`;
    }

    updateTable() {
        const sortedTransactions = this.sortTransactions([...this.filteredTransactions]);
        const paginatedTransactions = this.paginateTransactions(sortedTransactions);
        
        this.renderTable(paginatedTransactions);
        this.updateBulkActions();
    }

    sortTransactions(transactions) {
        return transactions.sort((a, b) => {
            switch (this.sortBy) {
                case 'date-desc':
                    return new Date(b.date) - new Date(a.date);
                case 'date-asc':
                    return new Date(a.date) - new Date(b.date);
                case 'amount-desc':
                    return b.amount - a.amount;
                case 'amount-asc':
                    return a.amount - b.amount;
                case 'description-asc':
                    return a.description.localeCompare(b.description);
                case 'description-desc':
                    return b.description.localeCompare(a.description);
                default:
                    return new Date(b.date) - new Date(a.date);
            }
        });
    }

    paginateTransactions(transactions) {
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        return transactions.slice(startIndex, endIndex);
    }

    renderTable(transactions) {
        const tbody = document.getElementById('transactionsTableBody');
        
        if (transactions.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center" style="padding: 40px; color: #9ca3af;">
                        <i class="fas fa-inbox" style="font-size: 2rem; margin-bottom: 10px; display: block;"></i>
                        Nenhuma transação encontrada
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = transactions.map(transaction => `
            <tr>
                <td class="checkbox-col">
                    <input type="checkbox" class="transaction-checkbox" 
                           data-id="${transaction.id}" 
                           ${this.selectedTransactions.has(transaction.id) ? 'checked' : ''}>
                </td>
                <td class="date-col">
                    <span class="transaction-date">${this.formatDate(transaction.date)}</span>
                </td>
                <td class="description-col">
                    <span class="transaction-description">${transaction.description}</span>
                </td>
                <td class="category-col">
                    <span class="transaction-category">${transaction.category}</span>
                </td>
                <td class="type-col">
                    <span class="transaction-type ${transaction.type}">
                        ${transaction.type === 'income' ? 'Receita' : 'Despesa'}
                    </span>
                </td>
                <td class="amount-col">
                    <span class="transaction-amount ${transaction.type}">
                        ${transaction.type === 'income' ? '+' : '-'}${this.formatCurrency(transaction.amount)}
                    </span>
                </td>
                <td class="actions-col">
                    <div class="transaction-actions">
                        <button class="btn-action btn-edit" onclick="transactionsManager.editTransaction(${transaction.id})" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-action btn-duplicate" onclick="transactionsManager.duplicateTransaction(${transaction.id})" title="Duplicar">
                            <i class="fas fa-copy"></i>
                        </button>
                        <button class="btn-action btn-delete" onclick="transactionsManager.deleteTransaction(${transaction.id})" title="Excluir">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        // Add event listeners to checkboxes
        tbody.querySelectorAll('.transaction-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                this.toggleTransactionSelection(parseInt(e.target.dataset.id), e.target.checked);
            });
        });
    }

    updatePagination() {
        const totalPages = Math.ceil(this.filteredTransactions.length / this.pageSize);
        const startItem = (this.currentPage - 1) * this.pageSize + 1;
        const endItem = Math.min(this.currentPage * this.pageSize, this.filteredTransactions.length);
        
        // Update pagination info
        document.getElementById('paginationInfo').textContent = 
            `Mostrando ${startItem} a ${endItem} de ${this.filteredTransactions.length} transações`;

        // Update pagination controls
        document.getElementById('prevPage').disabled = this.currentPage === 1;
        document.getElementById('nextPage').disabled = this.currentPage === totalPages;

        // Update pagination numbers
        this.renderPaginationNumbers(totalPages);
    }

    renderPaginationNumbers(totalPages) {
        const container = document.getElementById('paginationNumbers');
        const maxVisible = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
        let endPage = Math.min(totalPages, startPage + maxVisible - 1);

        if (endPage - startPage + 1 < maxVisible) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }

        let html = '';
        
        if (startPage > 1) {
            html += `<span class="pagination-number" data-page="1">1</span>`;
            if (startPage > 2) {
                html += `<span class="pagination-number">...</span>`;
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            html += `<span class="pagination-number ${i === this.currentPage ? 'active' : ''}" data-page="${i}">${i}</span>`;
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                html += `<span class="pagination-number">...</span>`;
            }
            html += `<span class="pagination-number" data-page="${totalPages}">${totalPages}</span>`;
        }

        container.innerHTML = html;

        // Add event listeners
        container.querySelectorAll('.pagination-number').forEach(btn => {
            if (btn.dataset.page) {
                btn.addEventListener('click', (e) => {
                    this.goToPage(parseInt(e.target.dataset.page));
                });
            }
        });
    }

    goToPage(page) {
        this.currentPage = page;
        this.updateDisplay();
    }

    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.updateDisplay();
        }
    }

    nextPage() {
        const totalPages = Math.ceil(this.filteredTransactions.length / this.pageSize);
        if (this.currentPage < totalPages) {
            this.currentPage++;
            this.updateDisplay();
        }
    }

    toggleSelectAll(checked) {
        const checkboxes = document.querySelectorAll('.transaction-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = checked;
            const id = parseInt(checkbox.dataset.id);
            if (checked) {
                this.selectedTransactions.add(id);
            } else {
                this.selectedTransactions.delete(id);
            }
        });
        this.updateBulkActions();
    }

    toggleTransactionSelection(id, checked) {
        if (checked) {
            this.selectedTransactions.add(id);
        } else {
            this.selectedTransactions.delete(id);
        }
        this.updateBulkActions();
    }

    updateBulkActions() {
        const bulkActions = document.getElementById('bulkActions');
        const selectAllCheckbox = document.getElementById('selectAll');
        
        if (this.selectedTransactions.size > 0) {
            bulkActions.style.display = 'flex';
        } else {
            bulkActions.style.display = 'none';
        }

        // Update select all checkbox state
        const totalCheckboxes = document.querySelectorAll('.transaction-checkbox').length;
        const checkedCheckboxes = document.querySelectorAll('.transaction-checkbox:checked').length;
        
        if (checkedCheckboxes === 0) {
            selectAllCheckbox.indeterminate = false;
            selectAllCheckbox.checked = false;
        } else if (checkedCheckboxes === totalCheckboxes) {
            selectAllCheckbox.indeterminate = false;
            selectAllCheckbox.checked = true;
        } else {
            selectAllCheckbox.indeterminate = true;
        }
    }

    // Transaction CRUD operations
    saveTransaction() {
        const editId = document.getElementById('editId').value;
        
        if (editId) {
            this.updateTransaction();
        } else {
            this.addTransaction();
        }
    }

    addTransaction() {
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

        const transaction = {
            id: Date.now(),
            description,
            amount,
            type,
            category,
            date,
            createdAt: new Date().toISOString()
        };

        this.transactions.push(transaction);
        this.saveToStorage();
        this.applyFilters();
        this.resetForm();
        this.closeModal();
        this.showNotification('Transação adicionada com sucesso!', 'success');
    }

    updateTransaction() {
        const editId = parseInt(document.getElementById('editId').value);
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

        const transactionIndex = this.transactions.findIndex(t => t.id === editId);
        if (transactionIndex !== -1) {
            this.transactions[transactionIndex] = {
                ...this.transactions[transactionIndex],
                description,
                amount,
                type,
                category,
                date
            };

            this.saveToStorage();
            this.applyFilters();
            this.resetForm();
            this.closeModal();
            this.showNotification('Transação atualizada com sucesso!', 'success');
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
            
            this.updateCategoryOptions(transaction.type);
            setTimeout(() => {
                document.getElementById('category').value = transaction.category;
            }, 100);
            
            document.querySelector('.modal-header h3').textContent = 'Editar Transação';
            document.getElementById('saveButton').textContent = 'Salvar Alterações';
            
            this.openModal();
        }
    }

    duplicateTransaction(id) {
        const transaction = this.transactions.find(t => t.id === id);
        if (transaction) {
            const newTransaction = {
                ...transaction,
                id: Date.now(),
                description: `${transaction.description} (Cópia)`,
                createdAt: new Date().toISOString()
            };

            this.transactions.push(newTransaction);
            this.saveToStorage();
            this.applyFilters();
            this.showNotification('Transação duplicada com sucesso!', 'success');
        }
    }

    deleteTransaction(id) {
        if (confirm('Tem certeza que deseja excluir esta transação?')) {
            this.transactions = this.transactions.filter(t => t.id !== id);
            this.saveToStorage();
            this.applyFilters();
            this.showNotification('Transação excluída com sucesso!', 'success');
        }
    }

    bulkDelete() {
        if (this.selectedTransactions.size === 0) {
            this.showNotification('Nenhuma transação selecionada!', 'error');
            return;
        }

        if (confirm(`Tem certeza que deseja excluir ${this.selectedTransactions.size} transações?`)) {
            this.transactions = this.transactions.filter(t => !this.selectedTransactions.has(t.id));
            this.saveToStorage();
            this.selectedTransactions.clear();
            this.applyFilters();
            this.showNotification(`${this.selectedTransactions.size} transações excluídas com sucesso!`, 'success');
        }
    }

    openBulkEditModal() {
        if (this.selectedTransactions.size === 0) {
            this.showNotification('Nenhuma transação selecionada!', 'error');
            return;
        }

        const bulkCategorySelect = document.getElementById('bulkCategory');
        bulkCategorySelect.innerHTML = '<option value="">Selecione a categoria</option>';
        
        const allCategories = [...new Set(this.transactions.map(t => t.category))].sort();
        allCategories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            bulkCategorySelect.appendChild(option);
        });

        document.getElementById('selectedCount').textContent = this.selectedTransactions.size;
        document.getElementById('bulkEditModal').classList.add('active');
    }

    closeBulkModal() {
        document.getElementById('bulkEditModal').classList.remove('active');
    }

    saveBulkEdit() {
        const newCategory = document.getElementById('bulkCategory').value;
        
        if (!newCategory) {
            this.showNotification('Por favor, selecione uma categoria!', 'error');
            return;
        }

        this.transactions.forEach(transaction => {
            if (this.selectedTransactions.has(transaction.id)) {
                transaction.category = newCategory;
            }
        });

        this.saveToStorage();
        this.selectedTransactions.clear();
        this.applyFilters();
        this.closeBulkModal();
        this.showNotification('Categorias atualizadas com sucesso!', 'success');
    }

    // Modal controls
    openModal() {
        document.getElementById('transactionModal').classList.add('active');
    }

    closeModal() {
        document.getElementById('transactionModal').classList.remove('active');
    }

    resetForm() {
        document.getElementById('transactionForm').reset();
        document.getElementById('editId').value = '';
        document.querySelector('.modal-header h3').textContent = 'Nova Transação';
        document.getElementById('saveButton').textContent = 'Adicionar Transação';
        this.setCurrentDate();
    }

    setCurrentDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('date').value = today;
    }

    switchView(view) {
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-view="${view}"]`).classList.add('active');
        
        // Implement view switching logic here if needed
    }

    exportTransactions() {
        const data = this.filteredTransactions.map(t => ({
            Data: new Date(t.date).toLocaleDateString('pt-BR'),
            Descrição: t.description,
            Categoria: t.category,
            Tipo: t.type === 'income' ? 'Receita' : 'Despesa',
            Valor: t.amount
        }));

        const csv = this.convertToCSV(data);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `transacoes-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    }

    convertToCSV(data) {
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(header => `"${row[header]}"`).join(','))
        ].join('\n');
        return csvContent;
    }

    saveToStorage() {
        localStorage.setItem('expenseTracker', JSON.stringify(this.transactions));
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(amount);
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('pt-BR');
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

// Navigation functions
function navigateToDashboard() {
    window.location.href = 'index.html';
}

function navigateToAnalytics() {
    window.location.href = 'analytics.html';
}

function navigateToSettings() {
    window.location.href = 'settings.html';
}

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
        const touchElements = document.querySelectorAll('button, .card, .nav-item a, .filter-group');
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

// Initialize transactions manager when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.transactionsManager = new TransactionsManager();
    initializeTheme();
    initializeDeviceDetection();
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
