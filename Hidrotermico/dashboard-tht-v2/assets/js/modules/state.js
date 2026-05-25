/**
 * ============================================================
 * THT CONTROL — state.js ← Estado global + paginação
 * ============================================================
 */
const Store = {
    tratamentos: [], itens: [],
    sequenciaSelecionada: null,
    editandoMestre: null, editandoItem: null,
    filtros: { dataInicio: '', dataFim: '', mercado: '', status: '' },
    isDark: true, autoRefreshInterval: null,

    // Paginação
    paginacao: { page: 1, pageSize: CONFIG.PAGE_SIZE, totalRows: 0 },

    setTratamentos(data) { this.tratamentos = data || []; this.paginacao.totalRows = this.tratamentos.length; },
    getTratamentos()     { return this.tratamentos; },
    getTratamento(nru)   { return this.tratamentos.find(t => String(t.NRUNICO) === String(nru)); },

    getPage() {
        const s = (this.paginacao.page - 1) * this.paginacao.pageSize;
        return this.tratamentos.slice(s, s + this.paginacao.pageSize);
    },
    getTotalPages() { return Math.max(1, Math.ceil(this.paginacao.totalRows / this.paginacao.pageSize)); },

    setItens(data) { this.itens = data || []; },
    getItens()     { return this.itens; },

    reset() {
        this.tratamentos = []; this.itens = [];
        this.sequenciaSelecionada = null;
        this.editandoMestre = null; this.editandoItem = null;
        this.paginacao.page = 1;
    }
};
window.Store = Store;
