/**
 * ============================================================
 * MOVIMENTAÇÃO DE SALDOS - DASHBOARD JS (INTEGRAÇÃO REAL)
 * Tabela: AD_ROMANEIOENTRMOVSALDO
 * API:  ←    Estado global da aplicação
 * ============================================================
 */

/**
 * ============================================================
 * ESTADO GLOBAL DA APLICAÇÃO
 * ============================================================
 */

const Store = {
    // Dados
    currentRomaneio: null,
    currentNroUnico: null,
    movimentacoes: [],
    editandoSequencia: null,

    // Filtros de pesquisa
    filtros: { nroUnico: '', dataInicio: '', dataFim: '' },

    // Controle de caminhões finalizados
    trucksAtivos: new Set(),   // keys "nroUnico_numCaminhao" com pallets não-FIN
    mostrarFinalizados: false,

    // UI State
    isDark: true,
    autoRefreshInterval: null,
    selectedTruck: null,

    // Métodos
    setMovimentacoes(data) {
        this.movimentacoes = data || [];
    },
    
    getMovimentacoes() {
        return this.movimentacoes;
    },
    
    getRefugos() {
        return this.movimentacoes.filter(m => m.TIPOPALLET === 'REF');
    },
    
    getByRomaneio(nroUnico) {
        return this.movimentacoes.filter(m => m.NROUNICO == nroUnico);
    },
    
    reset() {
        this.currentRomaneio = null;
        this.currentNroUnico = null;
        this.movimentacoes = [];
        this.editandoSequencia = null;
    }
};

window.Store = Store;