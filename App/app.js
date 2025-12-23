// ===== Financial Assistant App =====

// Data Store
let appData = {
    income: [],
    expenses: []
};

// Current selected month/year for filtering
let selectedMonth = new Date().getMonth(); // 0-11
let selectedYear = new Date().getFullYear();

// DOM Elements
const navLinks = document.querySelectorAll('.nav-link');
const views = document.querySelectorAll('.view');
const incomeForm = document.getElementById('incomeForm');
const expenseForm = document.getElementById('expenseForm');

// Charts
let incomeExpenseChart = null;
let categoryChart = null;

// ===== Initialize App =====
function init() {
    loadData();
    setupNavigation();
    setupForms();
    setupMonthSelector();
    setDefaultDates();
    updateCurrentDate();
    updateMonthDisplay();
    renderAll();
}

// ===== Data Persistence =====
function loadData() {
    const savedData = localStorage.getItem('finAssistData');
    if (savedData) {
        appData = JSON.parse(savedData);
    }
}

function saveData() {
    localStorage.setItem('finAssistData', JSON.stringify(appData));
}

// ===== Month Selector =====
function setupMonthSelector() {
    const prevBtn = document.getElementById('prevMonth');
    const nextBtn = document.getElementById('nextMonth');

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            selectedMonth--;
            if (selectedMonth < 0) {
                selectedMonth = 11;
                selectedYear--;
            }
            updateMonthDisplay();
            renderAll();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            selectedMonth++;
            if (selectedMonth > 11) {
                selectedMonth = 0;
                selectedYear++;
            }
            updateMonthDisplay();
            renderAll();
        });
    }
}

function updateMonthDisplay() {
    const monthDisplay = document.getElementById('currentMonthDisplay');
    if (monthDisplay) {
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        monthDisplay.textContent = `${monthNames[selectedMonth]} ${selectedYear}`;
    }
}

// ===== Filter Data by Selected Month =====
function getFilteredIncome() {
    return appData.income.filter(item => {
        const date = new Date(item.date);
        return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear;
    });
}

function getFilteredExpenses() {
    return appData.expenses.filter(item => {
        const date = new Date(item.date);
        return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear;
    });
}

// ===== Navigation =====
function setupNavigation() {
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const viewId = link.dataset.view;
            switchView(viewId);
        });
    });
}

function switchView(viewId) {
    // Update nav links
    navLinks.forEach(link => {
        link.classList.toggle('active', link.dataset.view === viewId);
    });

    // Update views
    views.forEach(view => {
        view.classList.toggle('active', view.id === viewId);
    });

    // Render charts if dashboard
    if (viewId === 'dashboard') {
        setTimeout(() => {
            renderCharts();
        }, 100);
    }
}

// ===== Forms Setup =====
function setupForms() {
    incomeForm.addEventListener('submit', handleIncomeSubmit);
    expenseForm.addEventListener('submit', handleExpenseSubmit);
}

function setDefaultDates() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('incomeDate').value = today;
    document.getElementById('expenseDate').value = today;
}

function updateCurrentDate() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const today = new Date().toLocaleDateString('en-US', options);
    document.getElementById('currentDate').textContent = today;
}

// ===== Income Handlers =====
function handleIncomeSubmit(e) {
    e.preventDefault();

    const income = {
        id: Date.now(),
        source: document.getElementById('incomeSource').value,
        amount: parseFloat(document.getElementById('incomeAmount').value),
        date: document.getElementById('incomeDate').value,
        type: 'income'
    };

    appData.income.push(income);
    saveData();

    // Auto-switch to the month of the added item
    const addedDate = new Date(income.date);
    selectedMonth = addedDate.getMonth();
    selectedYear = addedDate.getFullYear();
    updateMonthDisplay();

    renderAll();

    // Reset form
    incomeForm.reset();
    setDefaultDates();

    // Show feedback
    showNotification('Income added successfully!', 'success');
}

function deleteIncome(id) {
    appData.income = appData.income.filter(item => item.id !== id);
    saveData();
    renderAll();
    showNotification('Income deleted', 'info');
}

// ===== Expense Handlers =====
function handleExpenseSubmit(e) {
    e.preventDefault();

    const expense = {
        id: Date.now(),
        name: document.getElementById('expenseName').value,
        category: document.getElementById('expenseCategory').value,
        amount: parseFloat(document.getElementById('expenseAmount').value),
        date: document.getElementById('expenseDate').value,
        type: 'expense'
    };

    appData.expenses.push(expense);
    saveData();

    // Auto-switch to the month of the added item
    const addedDate = new Date(expense.date);
    selectedMonth = addedDate.getMonth();
    selectedYear = addedDate.getFullYear();
    updateMonthDisplay();

    renderAll();

    // Reset form
    expenseForm.reset();
    setDefaultDates();

    // Show feedback
    showNotification('Expense added successfully!', 'warning');
}

function deleteExpense(id) {
    appData.expenses = appData.expenses.filter(item => item.id !== id);
    saveData();
    renderAll();
    showNotification('Expense deleted', 'info');
}

// ===== Calculations (filtered by month) =====
function getTotalIncome() {
    return getFilteredIncome().reduce((sum, item) => sum + item.amount, 0);
}

function getTotalExpenses() {
    return getFilteredExpenses().reduce((sum, item) => sum + item.amount, 0);
}

function getRemainingBalance() {
    return getTotalIncome() - getTotalExpenses();
}

function getTotalTransactions() {
    return getFilteredIncome().length + getFilteredExpenses().length;
}

function getExpensesByCategory() {
    const categories = {};
    getFilteredExpenses().forEach(expense => {
        if (categories[expense.category]) {
            categories[expense.category] += expense.amount;
        } else {
            categories[expense.category] = expense.amount;
        }
    });
    return categories;
}

// ===== Render Functions =====
function renderAll() {
    renderStats();
    renderIncomeList();
    renderExpenseList();
    renderRecentTransactions();
    renderCharts();
}

function renderStats() {
    document.getElementById('totalIncome').textContent = formatCurrency(getTotalIncome());
    document.getElementById('totalExpenses').textContent = formatCurrency(getTotalExpenses());
    document.getElementById('remainingBalance').textContent = formatCurrency(getRemainingBalance());
    document.getElementById('totalTransactions').textContent = getTotalTransactions();
    document.getElementById('incomeTotal').textContent = `Total: ${formatCurrency(getTotalIncome())}`;
    document.getElementById('expenseTotal').textContent = `Total: ${formatCurrency(getTotalExpenses())}`;
}

function renderIncomeList() {
    const container = document.getElementById('incomeList');
    const filteredIncome = getFilteredIncome();

    if (filteredIncome.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">💵</span>
                <p>No income recorded for this month. Add your first income above!</p>
            </div>
        `;
        return;
    }

    const sortedIncome = [...filteredIncome].sort((a, b) => new Date(b.date) - new Date(a.date));

    container.innerHTML = sortedIncome.map(item => `
        <div class="transaction-item">
            <div class="transaction-info">
                <div class="transaction-icon income">💵</div>
                <div class="transaction-details">
                    <span class="transaction-name">${escapeHtml(item.source)}</span>
                    <span class="transaction-category">Income</span>
                </div>
            </div>
            <div class="transaction-meta">
                <span class="transaction-amount income">+${formatCurrency(item.amount)}</span>
                <span class="transaction-date">${formatDate(item.date)}</span>
            </div>
            <div class="transaction-actions">
                <button class="btn-delete" onclick="deleteIncome(${item.id})" title="Delete">🗑️</button>
            </div>
        </div>
    `).join('');
}

function renderExpenseList() {
    const container = document.getElementById('expenseList');
    const filteredExpenses = getFilteredExpenses();

    if (filteredExpenses.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">🛒</span>
                <p>No expenses recorded for this month. Add your first expense above!</p>
            </div>
        `;
        return;
    }

    const sortedExpenses = [...filteredExpenses].sort((a, b) => new Date(b.date) - new Date(a.date));

    container.innerHTML = sortedExpenses.map(item => `
        <div class="transaction-item">
            <div class="transaction-info">
                <div class="transaction-icon expense">${getCategoryIcon(item.category)}</div>
                <div class="transaction-details">
                    <span class="transaction-name">${escapeHtml(item.name)}</span>
                    <span class="transaction-category">${escapeHtml(item.category)}</span>
                </div>
            </div>
            <div class="transaction-meta">
                <span class="transaction-amount expense">-${formatCurrency(item.amount)}</span>
                <span class="transaction-date">${formatDate(item.date)}</span>
            </div>
            <div class="transaction-actions">
                <button class="btn-delete" onclick="deleteExpense(${item.id})" title="Delete">🗑️</button>
            </div>
        </div>
    `).join('');
}

function renderRecentTransactions() {
    const container = document.getElementById('recentTransactions');

    // Combine and sort filtered transactions for selected month
    const allTransactions = [
        ...getFilteredIncome().map(item => ({ ...item, type: 'income' })),
        ...getFilteredExpenses().map(item => ({ ...item, type: 'expense' }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);

    if (allTransactions.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">📭</span>
                <p>No transactions for this month. Add some income or expenses to get started!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = allTransactions.map(item => {
        const isIncome = item.type === 'income';
        const name = isIncome ? item.source : item.name;
        const category = isIncome ? 'Income' : item.category;
        const icon = isIncome ? '💵' : getCategoryIcon(item.category);

        return `
            <div class="transaction-item">
                <div class="transaction-info">
                    <div class="transaction-icon ${item.type}">${icon}</div>
                    <div class="transaction-details">
                        <span class="transaction-name">${escapeHtml(name)}</span>
                        <span class="transaction-category">${escapeHtml(category)}</span>
                    </div>
                </div>
                <div class="transaction-meta">
                    <span class="transaction-amount ${item.type}">${isIncome ? '+' : '-'}${formatCurrency(item.amount)}</span>
                    <span class="transaction-date">${formatDate(item.date)}</span>
                </div>
            </div>
        `;
    }).join('');
}

// ===== Charts =====
function renderCharts() {
    renderIncomeExpenseChart();
    renderCategoryChart();
}

function renderIncomeExpenseChart() {
    const ctx = document.getElementById('incomeExpenseChart');
    if (!ctx) return;

    // Destroy existing chart
    if (incomeExpenseChart) {
        incomeExpenseChart.destroy();
    }

    const totalIncome = getTotalIncome();
    const totalExpenses = getTotalExpenses();
    const remaining = getRemainingBalance();

    incomeExpenseChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Income', 'Expenses', 'Remaining'],
            datasets: [{
                data: [totalIncome, totalExpenses, Math.max(0, remaining)],
                backgroundColor: [
                    'rgba(0, 212, 170, 0.8)',
                    'rgba(255, 77, 106, 0.8)',
                    'rgba(168, 85, 247, 0.8)'
                ],
                borderColor: [
                    'rgba(0, 212, 170, 1)',
                    'rgba(255, 77, 106, 1)',
                    'rgba(168, 85, 247, 1)'
                ],
                borderWidth: 2,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#a0a0b0',
                        padding: 20,
                        font: {
                            family: 'Inter',
                            size: 12
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(18, 18, 26, 0.9)',
                    titleColor: '#fff',
                    bodyColor: '#a0a0b0',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: true,
                    callbacks: {
                        label: function (context) {
                            return ` ${context.label}: ${formatCurrency(context.raw)}`;
                        }
                    }
                }
            },
            cutout: '65%'
        }
    });
}

function renderCategoryChart() {
    const ctx = document.getElementById('categoryChart');
    if (!ctx) return;

    // Destroy existing chart
    if (categoryChart) {
        categoryChart.destroy();
    }

    const categories = getExpensesByCategory();
    const labels = Object.keys(categories);
    const data = Object.values(categories);

    const colors = [
        'rgba(255, 159, 67, 0.8)',
        'rgba(77, 159, 255, 0.8)',
        'rgba(168, 85, 247, 0.8)',
        'rgba(0, 212, 170, 0.8)',
        'rgba(255, 77, 106, 0.8)',
        'rgba(255, 217, 61, 0.8)',
        'rgba(46, 213, 115, 0.8)',
        'rgba(116, 185, 255, 0.8)',
        'rgba(162, 155, 254, 0.8)'
    ];

    categoryChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels.map(l => l.split(' ')[0]), // Shorten labels
            datasets: [{
                label: 'Amount',
                data: data,
                backgroundColor: colors.slice(0, labels.length),
                borderColor: colors.slice(0, labels.length).map(c => c.replace('0.8', '1')),
                borderWidth: 1,
                borderRadius: 8,
                barThickness: 40
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(18, 18, 26, 0.9)',
                    titleColor: '#fff',
                    bodyColor: '#a0a0b0',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    padding: 12,
                    callbacks: {
                        title: function (context) {
                            return labels[context[0].dataIndex];
                        },
                        label: function (context) {
                            return ` ${formatCurrency(context.raw)}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#6b6b7b',
                        font: {
                            family: 'Inter',
                            size: 11
                        }
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    },
                    ticks: {
                        color: '#6b6b7b',
                        font: {
                            family: 'Inter',
                            size: 11
                        },
                        callback: function (value) {
                            return '$' + value;
                        }
                    }
                }
            }
        }
    });
}

// ===== Utility Functions =====
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    }).format(date);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function getCategoryIcon(category) {
    const icons = {
        'Food & Groceries': '🍕',
        'Housing': '🏠',
        'Transportation': '🚗',
        'Utilities': '💡',
        'Healthcare': '🏥',
        'Entertainment': '🎬',
        'Shopping': '🛍️',
        'Education': '📚',
        'Other': '📦'
    };
    return icons[category] || '📦';
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span class="notification-icon">${type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️'}</span>
        <span class="notification-message">${message}</span>
    `;

    // Add styles if not already added
    if (!document.querySelector('#notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 1rem 1.5rem;
                background: rgba(18, 18, 26, 0.95);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 12px;
                display: flex;
                align-items: center;
                gap: 0.75rem;
                z-index: 1000;
                animation: slideInRight 0.3s ease, fadeOut 0.3s ease 2.7s forwards;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            }
            .notification-success { border-left: 3px solid #00d4aa; }
            .notification-warning { border-left: 3px solid #ff9f43; }
            .notification-info { border-left: 3px solid #4d9fff; }
            .notification-icon { font-size: 1.25rem; }
            .notification-message { color: #fff; font-size: 0.9rem; }
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
        `;
        document.head.appendChild(styles);
    }

    document.body.appendChild(notification);

    // Remove after animation
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// ===== Initialize on Load =====
document.addEventListener('DOMContentLoaded', init);
