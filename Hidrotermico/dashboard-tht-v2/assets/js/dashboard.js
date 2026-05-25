/**
 * ============================================================
 * THT CONTROL v2 — dashboard.js ← Orquestrador (READ-ONLY)
 * ============================================================
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('🌡️ THT Control v2.0 — Dashboard de Consulta');

    UI.createParticles();
    UI.atualizarRelogio();
    setInterval(() => UI.atualizarRelogio(), 1000);

    Events.init();

    const hoje = new Date().toISOString().split('T')[0];
    document.getElementById('filtroDataInicio').value = hoje;
    document.getElementById('filtroDataFim').value = hoje;
    Store.filtros.dataInicio = hoje;
    Store.filtros.dataFim = hoje;

    carregarDados();
    
    UI.showToast('📊 Dashboard de consulta carregado!', 'success');
});

// ============ CARREGAR DADOS ============
async function carregarDados() {
    try {
        await carregarCards();
        const trats = await API.fetchTratamentos(Store.filtros);
        Store.setTratamentos(trats);
        Renderer.renderTabelaMestre();
        if (Store.sequenciaSelecionada) await carregarItens(Store.sequenciaSelecionada);
    } catch (e) { console.error(e); UI.showToast('Erro: ' + e.message, 'error'); }
}

async function carregarCards() {
    try { const r = await API.fetchResumoCards(Store.filtros); if (r.length) Renderer.updateStats(r[0]); } catch {}
}

// ============ SELECIONAR TRATAMENTO ============
async function selecionarTratamento(nru) {
    Store.sequenciaSelecionada = nru;
    document.querySelectorAll('#tbodyMestre tr').forEach(tr => tr.classList.remove('selected'));
    const row = document.querySelector(`#tbodyMestre tr[data-nru="${nru}"]`);
    if (row) row.classList.add('selected');
    Renderer.renderDetalheHeader(Store.getTratamento(nru));
    await carregarItens(nru);
    const p = document.getElementById('painelDetalhe');
    p.style.display = 'block'; 
    p.scrollIntoView({ behavior:'smooth', block:'nearest' });
}
window.selecionarTratamento = selecionarTratamento;

async function carregarItens(nru) {
    console.log('🔄 Carregando itens para tratamento:', nru);
    try { 
        const it = await API.fetchItens(nru); 
        Store.setItens(it); 
        Renderer.renderTabelaDetalhe(it);
        console.log('✅ Itens carregados:', it.length);
    } catch (e) { 
        console.error('❌ Erro itens:', e);
        UI.showToast('Erro itens: ' + e.message, 'error'); 
    }
}
window.carregarItens = carregarItens;
window.carregarCards = carregarCards;

function fecharDetalhe() {
    document.getElementById('painelDetalhe').style.display = 'none';
    Store.sequenciaSelecionada = null; 
    Store.setItens([]);
    document.querySelectorAll('#tbodyMestre tr').forEach(tr => tr.classList.remove('selected'));
}
window.fecharDetalhe = fecharDetalhe;

// ============ PAGINAÇÃO ============
function irPagina(p) {
    p = Math.max(1, Math.min(p, Store.getTotalPages()));
    Store.paginacao.page = p;
    Renderer.renderTabelaMestre();
}
function mudarPageSize(v) {
    Store.paginacao.pageSize = parseInt(v) || CONFIG.PAGE_SIZE;
    Store.paginacao.page = 1;
    Renderer.renderTabelaMestre();
}
window.irPagina = irPagina;
window.mudarPageSize = mudarPageSize;

// ============ GLOBAL ============
window.toggleSidebar = () => UI.toggleSidebar();
window.toggleTheme   = () => UI.toggleTheme();