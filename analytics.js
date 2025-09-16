class AnalyticsFinance {
    constructor() {
        this.transactions = JSON.parse(localStorage.getItem('expenseTracker')) || [];
        this.filteredTransactions = [...this.transactions];
        this.charts = {};
        this.currentPeriod = 30;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.populateFilters();
        this.updateAnalytics();
        this.initializeCharts();
    }

    setupEventListeners() {
        // Filter controls
        document.getElementById('applyFilters').addEventListener('click', () => {
            this.applyFilters();
        });

        // Chart type controls
        document.querySelectorAll('.chart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchChartType(e.target.dataset.type);
            });
        });

        // Export functionality
        document.getElementById('exportData').addEventListener('click', () => {
            this.exportData();
        });

        // Period filter change
        document.getElementById('periodFilter').addEventListener('change', (e) => {
            this.currentPeriod = e.target.value;
            this.applyFilters();
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

    applyFilters() {
        const period = document.getElementById('periodFilter').value;
        const category = document.getElementById('categoryFilter').value;
        const type = document.getElementById('typeFilter').value;

        let filtered = [...this.transactions];

        // Filter by period
        if (period !== 'custom') {
            const days = parseInt(period);
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - days);
            filtered = filtered.filter(t => new Date(t.date) >= cutoffDate);
        }

        // Filter by category
        if (category) {
            filtered = filtered.filter(t => t.category === category);
        }

        // Filter by type
        if (type) {
            filtered = filtered.filter(t => t.type === type);
        }

        this.filteredTransactions = filtered;
        this.updateAnalytics();
    }

    updateAnalytics() {
        this.updateKPICards();
        this.updateCharts();
        this.updateTopCategories();
        this.updateSpendingPatterns();
        this.updateDataTable();
    }

    updateKPICards() {
        const revenue = this.filteredTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const expenses = this.filteredTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const netBalance = revenue - expenses;
        const dailyAverage = this.filteredTransactions.length > 0 ? 
            (revenue + expenses) / this.getDaysInPeriod() : 0;

        // Update KPI values
        document.getElementById('totalRevenue').textContent = this.formatCurrency(revenue);
        document.getElementById('totalExpenses').textContent = this.formatCurrency(expenses);
        document.getElementById('netBalance').textContent = this.formatCurrency(netBalance);
        document.getElementById('dailyAverage').textContent = this.formatCurrency(dailyAverage);

        // Calculate changes (simplified - comparing with previous period)
        const previousPeriodData = this.getPreviousPeriodData();
        const revenueChange = this.calculatePercentageChange(revenue, previousPeriodData.revenue);
        const expenseChange = this.calculatePercentageChange(expenses, previousPeriodData.expenses);
        const balanceChange = this.calculatePercentageChange(netBalance, previousPeriodData.balance);

        document.getElementById('revenueChange').textContent = `${revenueChange >= 0 ? '+' : ''}${revenueChange.toFixed(1)}%`;
        document.getElementById('expenseChange').textContent = `${expenseChange >= 0 ? '+' : ''}${expenseChange.toFixed(1)}%`;
        document.getElementById('balanceChange').textContent = `${balanceChange >= 0 ? '+' : ''}${balanceChange.toFixed(1)}%`;
    }

    getPreviousPeriodData() {
        const days = parseInt(this.currentPeriod);
        const endDate = new Date();
        endDate.setDate(endDate.getDate() - days);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - (days * 2));

        const previousTransactions = this.transactions.filter(t => {
            const transactionDate = new Date(t.date);
            return transactionDate >= startDate && transactionDate < endDate;
        });

        const revenue = previousTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const expenses = previousTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        return {
            revenue,
            expenses,
            balance: revenue - expenses
        };
    }

    calculatePercentageChange(current, previous) {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
    }

    getDaysInPeriod() {
        const days = parseInt(this.currentPeriod);
        return Math.min(days, this.filteredTransactions.length);
    }

    updateCharts() {
        this.updateTrendChart();
        this.updateCategoryAnalysisChart();
        this.updateMonthlyComparisonChart();
    }

    updateTrendChart() {
        const ctx = document.getElementById('trendChart').getContext('2d');
        
        if (this.charts.trendChart) {
            this.charts.trendChart.destroy();
        }

        const trendData = this.getTrendData();
        const isLineChart = document.querySelector('.chart-btn.active').dataset.type === 'line';

        this.charts.trendChart = new Chart(ctx, {
            type: isLineChart ? 'line' : 'bar',
            data: {
                labels: trendData.labels,
                datasets: [
                    {
                        label: 'Receitas',
                        data: trendData.income,
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        fill: false,
                        tension: 0.4
                    },
                    {
                        label: 'Despesas',
                        data: trendData.expenses,
                        borderColor: '#ef4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        fill: false,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: '#9ca3af'
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: '#333'
                        },
                        ticks: {
                            color: '#9ca3af'
                        }
                    },
                    y: {
                        grid: {
                            color: '#333'
                        },
                        ticks: {
                            color: '#9ca3af'
                        }
                    }
                }
            }
        });
    }

    getTrendData() {
        const days = parseInt(this.currentPeriod);
        const labels = [];
        const income = [];
        const expenses = [];

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            labels.push(date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }));
            
            const dayIncome = this.filteredTransactions
                .filter(t => t.type === 'income' && t.date === dateStr)
                .reduce((sum, t) => sum + t.amount, 0);
            
            const dayExpense = this.filteredTransactions
                .filter(t => t.type === 'expense' && t.date === dateStr)
                .reduce((sum, t) => sum + t.amount, 0);
            
            income.push(dayIncome);
            expenses.push(dayExpense);
        }

        return { labels, income, expenses };
    }

    updateCategoryAnalysisChart() {
        const ctx = document.getElementById('categoryAnalysisChart').getContext('2d');
        
        if (this.charts.categoryAnalysisChart) {
            this.charts.categoryAnalysisChart.destroy();
        }

        const categoryData = this.getCategoryAnalysisData();
        const colors = ['#8b5cf6', '#ef4444', '#f59e0b', '#10b981', '#06b6d4', '#ec4899', '#84cc16', '#f97316'];

        this.charts.categoryAnalysisChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: categoryData.labels,
                datasets: [{
                    data: categoryData.values,
                    backgroundColor: colors.slice(0, categoryData.labels.length),
                    borderWidth: 0,
                    cutout: '60%'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#9ca3af',
                            padding: 20
                        }
                    }
                }
            }
        });
    }

    getCategoryAnalysisData() {
        const expenseTransactions = this.filteredTransactions.filter(t => t.type === 'expense');
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

    updateMonthlyComparisonChart() {
        const ctx = document.getElementById('monthlyComparisonChart').getContext('2d');
        
        if (this.charts.monthlyComparisonChart) {
            this.charts.monthlyComparisonChart.destroy();
        }

        const comparisonData = this.getMonthlyComparisonData();

        this.charts.monthlyComparisonChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: comparisonData.labels,
                datasets: [
                    {
                        label: 'Mês Atual',
                        data: comparisonData.current,
                        backgroundColor: '#8b5cf6',
                        borderRadius: 8
                    },
                    {
                        label: 'Mês Anterior',
                        data: comparisonData.previous,
                        backgroundColor: '#6b7280',
                        borderRadius: 8
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: '#9ca3af'
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: '#333'
                        },
                        ticks: {
                            color: '#9ca3af'
                        }
                    },
                    y: {
                        grid: {
                            color: '#333'
                        },
                        ticks: {
                            color: '#9ca3af'
                        }
                    }
                }
            }
        });
    }

    getMonthlyComparisonData() {
        const currentMonth = new Date().getMonth();
        const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const currentYear = new Date().getFullYear();
        const previousYear = previousMonth === 11 ? currentYear - 1 : currentYear;

        const currentMonthData = this.filteredTransactions.filter(t => {
            const date = new Date(t.date);
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        });

        const previousMonthData = this.transactions.filter(t => {
            const date = new Date(t.date);
            return date.getMonth() === previousMonth && date.getFullYear() === previousYear;
        });

        const categories = [...new Set([...currentMonthData, ...previousMonthData].map(t => t.category))];
        
        const current = categories.map(category => 
            currentMonthData
                .filter(t => t.category === category && t.type === 'expense')
                .reduce((sum, t) => sum + t.amount, 0)
        );

        const previous = categories.map(category => 
            previousMonthData
                .filter(t => t.category === category && t.type === 'expense')
                .reduce((sum, t) => sum + t.amount, 0)
        );

        return {
            labels: categories,
            current,
            previous
        };
    }

    updateTopCategories() {
        const categoryData = this.getCategoryAnalysisData();
        const totalExpenses = categoryData.values.reduce((sum, val) => sum + val, 0);
        
        const topCategories = document.getElementById('topCategories');
        topCategories.innerHTML = categoryData.labels.map((category, index) => {
            const amount = categoryData.values[index];
            const percentage = totalExpenses > 0 ? (amount / totalExpenses * 100) : 0;
            const iconClass = this.getCategoryIcon(category);
            
            return `
                <div class="category-item">
                    <div class="category-info">
                        <div class="category-icon" style="background-color: ${this.getCategoryColor(category)}">
                            <i class="${iconClass}"></i>
                        </div>
                        <div>
                            <div class="category-name">${category}</div>
                            <div class="category-amount">${this.formatCurrency(amount)}</div>
                        </div>
                    </div>
                    <div class="category-percentage">${percentage.toFixed(1)}%</div>
                </div>
            `;
        }).join('');
    }

    getCategoryIcon(category) {
        const icons = {
            'Alimentação': 'fas fa-utensils',
            'Moradia': 'fas fa-home',
            'Transporte': 'fas fa-car',
            'Saúde': 'fas fa-heart',
            'Educação': 'fas fa-graduation-cap',
            'Lazer': 'fas fa-gamepad',
            'Roupas': 'fas fa-tshirt',
            'Contas': 'fas fa-file-invoice',
            'Outros': 'fas fa-ellipsis-h'
        };
        return icons[category] || 'fas fa-tag';
    }

    getCategoryColor(category) {
        const colors = {
            'Alimentação': '#10b981',
            'Moradia': '#f59e0b',
            'Transporte': '#ef4444',
            'Saúde': '#8b5cf6',
            'Educação': '#06b6d4',
            'Lazer': '#ec4899',
            'Roupas': '#84cc16',
            'Contas': '#f97316',
            'Outros': '#6b7280'
        };
        return colors[category] || '#8b5cf6';
    }

    updateSpendingPatterns() {
        // Analyze spending patterns
        const dayOfWeek = this.getMostSpendingDay();
        const peakTime = this.getPeakSpendingTime();
        const topCategory = this.getTopSpendingCategory();

        document.getElementById('topDay').textContent = dayOfWeek;
        document.getElementById('peakTime').textContent = peakTime;
        document.getElementById('topCategory').textContent = topCategory;
    }

    getMostSpendingDay() {
        const dayTotals = {};
        this.filteredTransactions
            .filter(t => t.type === 'expense')
            .forEach(t => {
                const day = new Date(t.date).toLocaleDateString('pt-BR', { weekday: 'long' });
                dayTotals[day] = (dayTotals[day] || 0) + t.amount;
            });

        const sortedDays = Object.entries(dayTotals).sort(([,a], [,b]) => b - a);
        return sortedDays.length > 0 ? sortedDays[0][0] : 'N/A';
    }

    getPeakSpendingTime() {
        // Simplified - return a mock time range
        return '14:00 - 16:00';
    }

    getTopSpendingCategory() {
        const categoryData = this.getCategoryAnalysisData();
        return categoryData.labels.length > 0 ? categoryData.labels[0] : 'N/A';
    }

    updateDataTable() {
        const tableBody = document.querySelector('#analyticsTable tbody');
        const sortedTransactions = this.filteredTransactions
            .sort((a, b) => new Date(b.date) - new Date(a.date));

        tableBody.innerHTML = sortedTransactions.map(transaction => `
            <tr>
                <td>${new Date(transaction.date).toLocaleDateString('pt-BR')}</td>
                <td>${transaction.description}</td>
                <td>${transaction.category}</td>
                <td class="type-${transaction.type}">
                    ${transaction.type === 'income' ? 'Receita' : 'Despesa'}
                </td>
                <td class="type-${transaction.type}">
                    ${transaction.type === 'income' ? '+' : '-'}${this.formatCurrency(transaction.amount)}
                </td>
            </tr>
        `).join('');
    }

    switchChartType(type) {
        document.querySelectorAll('.chart-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-type="${type}"]`).classList.add('active');
        this.updateTrendChart();
    }

    exportData() {
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
        link.download = `analise-financeira-${new Date().toISOString().split('T')[0]}.csv`;
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

    initializeCharts() {
        this.updateCharts();
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(amount);
    }
}

// Navigation functions
function navigateToDashboard() {
    window.location.href = 'index.html';
}

function navigateToTransactions() {
    window.location.href = 'transactions.html';
}

function navigateToSettings() {
    window.location.href = 'settings.html';
}

// ========================================
// SISTEMA DE DETECÇÃO DE DISPOSITIVO (Simplificado)
// ========================================

function initializeDeviceDetection() {
    // Detecção básica de dispositivo
    const screenWidth = window.innerWidth;
    let deviceType = 'desktop';
    
    if (screenWidth <= 768) {
        deviceType = 'mobile';
    } else if (screenWidth <= 1024) {
        deviceType = 'tablet';
    }
    
    // Adicionar classes CSS
    document.documentElement.classList.add(`device-${deviceType}`);
    
    // Detecção de touch
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    document.documentElement.classList.add(`touch-${isTouch ? 'enabled' : 'disabled'}`);
    
    // Detecção de orientação
    const orientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
    document.documentElement.classList.add(`orientation-${orientation}`);
    
    // Configurar otimizações específicas
    if (deviceType === 'mobile') {
        setupMobileOptimizations();
    } else if (deviceType === 'tablet') {
        setupTabletOptimizations();
    } else {
        setupDesktopOptimizations();
    }
    
    // Listener para mudanças de tamanho
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            const newScreenWidth = window.innerWidth;
            let newDeviceType = 'desktop';
            
            if (newScreenWidth <= 768) {
                newDeviceType = 'mobile';
            } else if (newScreenWidth <= 1024) {
                newDeviceType = 'tablet';
            }
            
            if (newDeviceType !== deviceType) {
                document.documentElement.classList.remove('device-mobile', 'device-tablet', 'device-desktop');
                document.documentElement.classList.add(`device-${newDeviceType}`);
                deviceType = newDeviceType;
            }
        }, 250);
    });
}

function setupMobileOptimizations() {
    // Otimizações para mobile
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        sidebar.classList.add('mobile-overlay');
    }
    
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.classList.add('mobile-content');
    }
    
    // Criar botão de menu mobile
    createMobileMenuButton();
}

function setupTabletOptimizations() {
    // Otimizações para tablet
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        sidebar.classList.add('tablet-layout');
    }
}

function setupDesktopOptimizations() {
    // Otimizações para desktop
    const hoverElements = document.querySelectorAll('.summary-card, .nav-item, .btn');
    hoverElements.forEach(element => {
        element.classList.add('desktop-hover');
    });
}

function createMobileMenuButton() {
    const header = document.querySelector('.dashboard-header');
    if (header && !document.querySelector('.mobile-menu-btn')) {
        const menuBtn = document.createElement('button');
        menuBtn.className = 'mobile-menu-btn';
        menuBtn.innerHTML = '<i class="fas fa-bars"></i>';
        menuBtn.onclick = toggleMobileSidebar;
        
        const headerLeft = header.querySelector('.header-left');
        if (headerLeft) {
            headerLeft.insertBefore(menuBtn, headerLeft.firstChild);
        }
    }
}

function toggleMobileSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    
    if (sidebar) {
        sidebar.classList.toggle('active');
        
        if (!overlay) {
            createSidebarOverlay();
        } else {
            overlay.classList.toggle('active');
        }
    }
}

function createSidebarOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    overlay.onclick = toggleMobileSidebar;
    document.body.appendChild(overlay);
    overlay.classList.add('active');
}

// Initialize analytics when page loads
document.addEventListener('DOMContentLoaded', () => {
    new AnalyticsFinance();
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
