(function () {
  'use strict';

  const STORAGE_KEY = 'ledger.transactions.v1';

  const els = {
    form: document.getElementById('txForm'),
    desc: document.getElementById('txDesc'),
    amount: document.getElementById('txAmount'),
    type: document.getElementById('txType'),
    category: document.getElementById('txCategory'),
    date: document.getElementById('txDate'),
    statBalance: document.getElementById('statBalance'),
    statIncome: document.getElementById('statIncome'),
    statExpense: document.getElementById('statExpense'),
    breakdown: document.getElementById('breakdown'),
    search: document.getElementById('searchInput'),
    categoryFilter: document.getElementById('categoryFilter'),
    list: document.getElementById('txList'),
    empty: document.getElementById('emptyState'),
    template: document.getElementById('txTemplate'),
  };

  let transactions = loadTransactions();

  function loadTransactions() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : seedData();
    } catch (e) {
      return seedData();
    }
  }

  function seedData() {
    const today = new Date().toISOString().slice(0, 10);
    return [
      { id: crypto.randomUUID(), desc: 'Freelance payment', amount: 8000, type: 'income', category: 'Freelance', date: today },
      { id: crypto.randomUUID(), desc: 'Groceries', amount: 650, type: 'expense', category: 'Food', date: today },
      { id: crypto.randomUUID(), desc: 'Auto fare', amount: 120, type: 'expense', category: 'Transport', date: today },
    ];
  }

  function saveTransactions() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  }

  function formatCurrency(n) {
    return '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 });
  }

  function formatDate(dateStr) {
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  }

  function computeStats() {
    let income = 0, expense = 0;
    transactions.forEach(t => {
      if (t.type === 'income') income += Number(t.amount);
      else expense += Number(t.amount);
    });
    return { income, expense, balance: income - expense };
  }

  function renderStats() {
    const { income, expense, balance } = computeStats();
    els.statIncome.textContent = formatCurrency(income);
    els.statExpense.textContent = formatCurrency(expense);
    els.statBalance.textContent = formatCurrency(balance);
  }

  function renderBreakdown() {
    const byCategory = {};
    let totalExpense = 0;
    transactions.filter(t => t.type === 'expense').forEach(t => {
      byCategory[t.category] = (byCategory[t.category] || 0) + Number(t.amount);
      totalExpense += Number(t.amount);
    });

    els.breakdown.innerHTML = '';

    const entries = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);
    if (entries.length === 0) {
      const p = document.createElement('p');
      p.className = 'breakdown-empty';
      p.textContent = 'No expenses logged yet.';
      els.breakdown.appendChild(p);
      return;
    }

    entries.forEach(([cat, amt]) => {
      const pct = totalExpense ? Math.round((amt / totalExpense) * 100) : 0;
      const row = document.createElement('div');
      row.className = 'breakdown-row';
      row.innerHTML = `
        <span>${cat}</span>
        <span class="breakdown-bar"><span style="width:${pct}%"></span></span>
        <span>${pct}%</span>
      `;
      els.breakdown.appendChild(row);
    });
  }

  function getFilteredTransactions() {
    const q = els.search.value.trim().toLowerCase();
    const cat = els.categoryFilter.value;
    return transactions
      .slice()
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .filter(t => {
        const matchesSearch = !q || t.desc.toLowerCase().includes(q) || t.category.toLowerCase().includes(q);
        const matchesCategory = cat === 'all' || t.category === cat;
        return matchesSearch && matchesCategory;
      });
  }

  function renderList() {
    const filtered = getFilteredTransactions();
    els.list.innerHTML = '';

    if (filtered.length === 0) {
      els.empty.hidden = false;
    } else {
      els.empty.hidden = true;
      filtered.forEach(t => {
        const node = els.template.content.cloneNode(true);
        const li = node.querySelector('.tx-item');
        li.classList.add(t.type);
        li.dataset.id = t.id;
        node.querySelector('.tx-desc').textContent = t.desc;
        node.querySelector('.tx-category').textContent = t.category;
        node.querySelector('.tx-date').textContent = formatDate(t.date);
        const amountEl = node.querySelector('.tx-amount');
        amountEl.textContent = (t.type === 'income' ? '+ ' : '− ') + formatCurrency(t.amount);
        node.querySelector('.tx-delete').addEventListener('click', () => deleteTransaction(t.id));
        els.list.appendChild(node);
      });
    }
  }

  function renderAll() {
    renderStats();
    renderBreakdown();
    renderList();
  }

  function deleteTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    saveTransactions();
    renderAll();
  }

  function handleSubmit(e) {
    e.preventDefault();
    const desc = els.desc.value.trim();
    const amount = parseFloat(els.amount.value);
    if (!desc || !amount || amount <= 0) return;

    transactions.push({
      id: crypto.randomUUID(),
      desc,
      amount,
      type: els.type.value,
      category: els.category.value,
      date: els.date.value || new Date().toISOString().slice(0, 10),
    });

    saveTransactions();
    renderAll();
    els.form.reset();
    els.date.value = new Date().toISOString().slice(0, 10);
    els.desc.focus();
  }

  els.form.addEventListener('submit', handleSubmit);
  els.search.addEventListener('input', renderList);
  els.categoryFilter.addEventListener('change', renderList);

  els.date.value = new Date().toISOString().slice(0, 10);
  renderAll();
})();
