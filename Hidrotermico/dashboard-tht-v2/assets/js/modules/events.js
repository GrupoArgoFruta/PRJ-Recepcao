/**
 * events.js ← Event listeners, filtros, keyboard
 */
const Events = {
    init() {
        this._keyboardShortcuts();
        this._sidebarClickOutside();
        console.log('✅ Events init');
    },
    refreshData() {
        const btn = document.getElementById('btnRefresh');
        if (btn) btn.classList.add('spinning');
        setTimeout(() => { if (typeof carregarDados==='function') carregarDados(); if (btn) btn.classList.remove('spinning'); }, 300);
    },
    aplicarFiltro() {
        Store.filtros = {
            dataInicio: document.getElementById('filtroDataInicio')?.value || '',
            dataFim:    document.getElementById('filtroDataFim')?.value || '',
            mercado:    document.getElementById('filtroMercado')?.value || ''
        };
        Store.paginacao.page = 1;
        carregarDados();
        UI.showToast('🔍 Filtro aplicado', 'info');
    },
    limparFiltro() {
        const hoje = new Date().toISOString().split('T')[0];
        const s = (id,v) => { const e = document.getElementById(id); if (e) e.value = v; };
        s('filtroDataInicio', hoje); s('filtroDataFim', hoje); s('filtroMercado', '');
        Store.filtros = { dataInicio: hoje, dataFim: hoje, mercado: '' };
        Store.paginacao.page = 1;
        carregarDados();
        UI.showToast('📅 Dados de hoje', 'info');
    },
    _keyboardShortcuts() {
        document.addEventListener('keydown', e => {
            if (e.key === 'F5') { e.preventDefault(); this.refreshData(); }
            if (e.key === 'Escape') { 
                const s = document.getElementById('sidebar'); 
                if (s?.classList.contains('open')) s.classList.remove('open'); 
            }
        });
    },
    _sidebarClickOutside() {
        document.addEventListener('click', e => {
            const s = document.getElementById('sidebar'), b = document.querySelector('.mobile-menu-btn');
            if (s?.classList.contains('open') && !s.contains(e.target) && b && !b.contains(e.target)) s.classList.remove('open');
        });
    }
};
window.Events = Events;
window.refreshData = () => Events.refreshData();
window.aplicarFiltro = () => Events.aplicarFiltro();
window.limparFiltro = () => Events.limparFiltro();