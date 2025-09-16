class SettingsManager {
    constructor() {
        this.settings = JSON.parse(localStorage.getItem('appSettings')) || this.getDefaultSettings();
        this.customCategories = JSON.parse(localStorage.getItem('customCategories')) || {
            income: [],
            expense: []
        };
        this.transactions = JSON.parse(localStorage.getItem('expenseTracker')) || [];
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadSettings();
        this.loadCategories();
        this.updateSystemInfo();
    }

    getDefaultSettings() {
        return {
            profile: {
                name: 'Usuário',
                email: '',
                currency: 'BRL',
                dateFormat: 'dd/mm/yyyy'
            },
            display: {
                theme: 'dark',
                itemsPerPage: 25,
                notifications: true,
                autoSave: true
            },
            limits: {
                monthly: 0,
                daily: 0,
                alertThreshold: 80
            }
        };
    }

    setupEventListeners() {
        // Profile form
        document.getElementById('userName').addEventListener('change', () => this.saveProfile());
        document.getElementById('userEmail').addEventListener('change', () => this.saveProfile());
        document.getElementById('userCurrency').addEventListener('change', () => this.saveProfile());
        document.getElementById('dateFormat').addEventListener('change', () => this.saveProfile());

        // Display preferences
        document.querySelectorAll('.theme-option').forEach(btn => {
            btn.addEventListener('click', (e) => this.changeTheme(e.target.dataset.theme));
        });

        document.getElementById('itemsPerPage').addEventListener('change', () => this.saveDisplaySettings());
        document.getElementById('notificationsEnabled').addEventListener('change', () => this.saveDisplaySettings());
        document.getElementById('autoSaveEnabled').addEventListener('change', () => this.saveDisplaySettings());

        // Category tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchCategoryTab(e.target.dataset.tab));
        });

        // Category modal
        document.getElementById('openCategoryModal').addEventListener('click', () => this.openCategoryModal());
        document.getElementById('closeCategoryModal').addEventListener('click', () => this.closeCategoryModal());
        document.getElementById('cancelCategory').addEventListener('click', () => this.closeCategoryModal());
        document.getElementById('categoryForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveCategory();
        });

        // Data management
        document.getElementById('exportAllData').addEventListener('click', () => this.exportAllData());
        document.getElementById('importData').addEventListener('click', () => this.triggerImport());
        document.getElementById('importFile').addEventListener('change', (e) => this.importData(e.target.files[0]));
        document.getElementById('clearAllData').addEventListener('click', () => this.clearAllData());

        // Limits
        document.getElementById('monthlyLimit').addEventListener('change', () => this.saveLimits());
        document.getElementById('dailyLimit').addEventListener('change', () => this.saveLimits());
        document.getElementById('alertThreshold').addEventListener('change', () => this.saveLimits());
    }

    loadSettings() {
        // Load profile settings
        document.getElementById('userName').value = this.settings.profile.name;
        document.getElementById('userEmail').value = this.settings.profile.email;
        document.getElementById('userCurrency').value = this.settings.profile.currency;
        document.getElementById('dateFormat').value = this.settings.profile.dateFormat;

        // Load display settings
        document.querySelector(`[data-theme="${this.settings.display.theme}"]`).classList.add('active');
        document.getElementById('itemsPerPage').value = this.settings.display.itemsPerPage;
        document.getElementById('notificationsEnabled').checked = this.settings.display.notifications;
        document.getElementById('autoSaveEnabled').checked = this.settings.display.autoSave;

        // Load limits
        document.getElementById('monthlyLimit').value = this.settings.limits.monthly;
        document.getElementById('dailyLimit').value = this.settings.limits.daily;
        document.getElementById('alertThreshold').value = this.settings.limits.alertThreshold;
    }

    loadCategories() {
        this.renderCategories('income');
        this.renderCategories('expense');
    }

    renderCategories(type) {
        const container = document.getElementById(`${type}-categories`);
        const categories = this.customCategories[type];
        
        if (categories.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="text-align: center; padding: 40px; color: #9ca3af;">
                    <i class="fas fa-tag" style="font-size: 2rem; margin-bottom: 10px; display: block;"></i>
                    <p>Nenhuma categoria personalizada</p>
                </div>
            `;
            return;
        }

        container.innerHTML = categories.map(category => `
            <div class="category-item">
                <div class="category-info">
                    <div class="category-color" style="background-color: ${category.color}"></div>
                    <span class="category-name">${category.name}</span>
                </div>
                <div class="category-actions">
                    <button class="btn-edit-category" onclick="settingsManager.editCategory('${type}', '${category.name}')" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-delete-category" onclick="settingsManager.deleteCategory('${type}', '${category.name}')" title="Excluir">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    switchCategoryTab(tab) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
        document.getElementById(`${tab}-categories`).classList.add('active');
    }

    openCategoryModal() {
        document.getElementById('categoryModal').classList.add('active');
        document.getElementById('categoryForm').reset();
        document.getElementById('categoryModalTitle').textContent = 'Nova Categoria';
    }

    closeCategoryModal() {
        document.getElementById('categoryModal').classList.remove('active');
    }

    saveCategory() {
        const name = document.getElementById('categoryName').value.trim();
        const type = document.getElementById('categoryType').value;
        const color = document.getElementById('categoryColor').value;

        if (!name || !type) {
            this.showNotification('Por favor, preencha todos os campos!', 'error');
            return;
        }

        // Check if category already exists
        if (this.customCategories[type].some(cat => cat.name.toLowerCase() === name.toLowerCase())) {
            this.showNotification('Esta categoria já existe!', 'error');
            return;
        }

        const category = { name, color };
        this.customCategories[type].push(category);
        this.saveCustomCategories();
        this.renderCategories(type);
        this.closeCategoryModal();
        this.showNotification('Categoria adicionada com sucesso!', 'success');
    }

    editCategory(type, oldName) {
        const category = this.customCategories[type].find(cat => cat.name === oldName);
        if (category) {
            document.getElementById('categoryName').value = category.name;
            document.getElementById('categoryType').value = type;
            document.getElementById('categoryColor').value = category.color;
            document.getElementById('categoryModalTitle').textContent = 'Editar Categoria';
            document.getElementById('categoryModal').classList.add('active');
            
            // Store old name for update
            this.editingCategory = { type, oldName };
        }
    }

    deleteCategory(type, name) {
        if (confirm(`Tem certeza que deseja excluir a categoria "${name}"?`)) {
            this.customCategories[type] = this.customCategories[type].filter(cat => cat.name !== name);
            this.saveCustomCategories();
            this.renderCategories(type);
            this.showNotification('Categoria excluída com sucesso!', 'success');
        }
    }

    saveProfile() {
        this.settings.profile = {
            name: document.getElementById('userName').value,
            email: document.getElementById('userEmail').value,
            currency: document.getElementById('userCurrency').value,
            dateFormat: document.getElementById('dateFormat').value
        };
        this.saveSettings();
        this.showNotification('Perfil atualizado com sucesso!', 'success');
    }

    changeTheme(theme) {
        document.querySelectorAll('.theme-option').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-theme="${theme}"]`).classList.add('active');
        
        this.settings.display.theme = theme;
        this.saveSettings();
        this.showNotification('Tema alterado com sucesso!', 'success');
    }

    saveDisplaySettings() {
        this.settings.display = {
            theme: this.settings.display.theme,
            itemsPerPage: parseInt(document.getElementById('itemsPerPage').value),
            notifications: document.getElementById('notificationsEnabled').checked,
            autoSave: document.getElementById('autoSaveEnabled').checked
        };
        this.saveSettings();
    }

    saveLimits() {
        this.settings.limits = {
            monthly: parseFloat(document.getElementById('monthlyLimit').value) || 0,
            daily: parseFloat(document.getElementById('dailyLimit').value) || 0,
            alertThreshold: parseInt(document.getElementById('alertThreshold').value) || 80
        };
        this.saveSettings();
        this.showNotification('Limites atualizados com sucesso!', 'success');
    }

    exportAllData() {
        const data = {
            transactions: this.transactions,
            settings: this.settings,
            customCategories: this.customCategories,
            exportDate: new Date().toISOString(),
            version: '1.0.0'
        };

        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `backup-financeiro-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
        
        this.showNotification('Backup exportado com sucesso!', 'success');
    }

    triggerImport() {
        document.getElementById('importFile').click();
    }

    importData(file) {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                if (data.transactions) {
                    localStorage.setItem('expenseTracker', JSON.stringify(data.transactions));
                }
                if (data.settings) {
                    localStorage.setItem('appSettings', JSON.stringify(data.settings));
                }
                if (data.customCategories) {
                    localStorage.setItem('customCategories', JSON.stringify(data.customCategories));
                }

                this.showNotification('Dados importados com sucesso!', 'success');
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            } catch (error) {
                this.showNotification('Erro ao importar arquivo: ' + error.message, 'error');
            }
        };
        reader.readAsText(file);
    }

    clearAllData() {
        if (confirm('Tem certeza que deseja limpar TODOS os dados? Esta ação é irreversível!')) {
            if (confirm('Digite "CONFIRMAR" para prosseguir:')) {
                const confirmation = prompt('Digite "CONFIRMAR" para limpar todos os dados:');
                if (confirmation === 'CONFIRMAR') {
                    localStorage.removeItem('expenseTracker');
                    localStorage.removeItem('appSettings');
                    localStorage.removeItem('customCategories');
                    
                    this.showNotification('Todos os dados foram removidos!', 'success');
                    setTimeout(() => {
                        window.location.reload();
                    }, 1500);
                } else {
                    this.showNotification('Operação cancelada', 'info');
                }
            }
        }
    }

    updateSystemInfo() {
        document.getElementById('totalTransactions').textContent = this.transactions.length;
        document.getElementById('lastUpdate').textContent = new Date().toLocaleDateString('pt-BR');
        
        // Calculate data size
        const dataSize = JSON.stringify(localStorage).length;
        const sizeInKB = (dataSize / 1024).toFixed(2);
        document.getElementById('dataSize').textContent = `${sizeInKB} KB`;
    }

    saveSettings() {
        localStorage.setItem('appSettings', JSON.stringify(this.settings));
    }

    saveCustomCategories() {
        localStorage.setItem('customCategories', JSON.stringify(this.customCategories));
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

function navigateToTransactions() {
    window.location.href = 'transactions.html';
}

// Global functions for HTML onclick events
function changeAvatar() {
    // Placeholder for avatar change functionality
    settingsManager.showNotification('Funcionalidade de alterar avatar em desenvolvimento', 'info');
}

function openCategoryModal() {
    settingsManager.openCategoryModal();
}

function saveProfile() {
    settingsManager.saveProfile();
}

function saveLimits() {
    settingsManager.saveLimits();
}

function exportAllData() {
    settingsManager.exportAllData();
}

function importData() {
    settingsManager.triggerImport();
}

function clearAllData() {
    settingsManager.clearAllData();
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

// Initialize settings manager when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.settingsManager = new SettingsManager();
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
