/**
 * ============================================================
 * DASHBOARD - ORQUESTRADOR PRINCIPAL
 * Módulos carregados: config, state, api, ui, renderer, events
 * ============================================================
 */

// ============ INITIALIZATION ============
AOS.init({ duration: 800, easing: 'ease-out-cubic', once: false, mirror: true });

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Dashboard Movimentação de Saldos v3.0 - Modular');

    UI.createParticles();
    UI.atualizarRelogio();
    setInterval(() => UI.atualizarRelogio(), 1000);

    Events.init();
    ModalInjector.init();

    carregarDados();
    startAutoRefresh();

    UI.showToast('✅ Dashboard carregado!', 'success');
    console.log('⌨️ Atalhos: Ctrl+F=Tela Cheia | Ctrl+R=Atualizar | Ctrl+B=Bipar | Ctrl+N=Novo');
});

// ============ CARREGAR DADOS ============
async function carregarDados() {
    try {
        const dados = await API.fetchResumo(Store.filtros);

        if (dados.length > 0) {
            const primeiro = dados[0];
            Store.currentNroUnico = primeiro.NROUNICO;
            Store.currentRomaneio = primeiro.ROMANEIO;

            const totalEntrada  = dados.reduce((s, d) => s + parseFloat(d.TOTAL_ENTRADA  || 0), 0);
            const totalSaida    = dados.reduce((s, d) => s + parseFloat(d.TOTAL_SAIDA    || 0), 0);
            const totalBaixados = dados.reduce((s, d) => s + parseFloat(d.TOTAL_BAIXADOS || 0), 0);

            Renderer.updateStats({
                entradaRecepcao:    totalEntrada,
                saidaRecepcao:      totalSaida,
                saldoMP:            totalEntrada - totalSaida,
                palletsProcessados: totalBaixados,
                romaneio:           primeiro.ROMANEIO,
                status:             CONFIG.STATUS_MAP[primeiro.STATUS] || primeiro.STATUS,
                saldoAtual:         totalEntrada - totalSaida
            });
        }

        const pallets = await API.fetchPallets(Store.filtros);
        Store.setMovimentacoes(pallets);

        // Detectar caminhões recém-finalizados (eram ativos, agora todos FIN)
        const novoFinalizados = _detectarNovoFinalizados(pallets);

        const resultado = Renderer.renderizarCaminhoes(pallets, novoFinalizados);
        Renderer.renderizarRefugos(pallets);

        // Atualizar conjunto de trucks ativos para o próximo ciclo
        Store.trucksAtivos = new Set(resultado.ativos.map(t => `${t.nroUnico}_${t.numCaminhao}`));

        if (novoFinalizados.length) {
            _animarNovoFinalizados(novoFinalizados);
        }

        _atualizarStatusFiltro();

    } catch (err) {
        console.error('Erro ao carregar dados:', err);
        UI.showToast('Erro ao carregar dados: ' + err.message, 'error');
    }
}

// Retorna trucks que estavam ativos e agora têm TODOS os pallets FIN
function _detectarNovoFinalizados(pallets) {
    const agrupado = {};
    pallets.forEach(m => {
        const chave = `${m.NROUNICO || '---'}_${m.NUMPCAMINHAO || '-'}`;
        if (!agrupado[chave]) agrupado[chave] = [];
        agrupado[chave].push(m);
    });

    return Object.entries(agrupado)
        .filter(([chave, ps]) => ps.every(p => p.STATUS === 'FIN') && Store.trucksAtivos.has(chave))
        .map(([chave]) => {
            const idx = chave.indexOf('_');
            return { nroUnico: chave.slice(0, idx), numCaminhao: chave.slice(idx + 1) };
        });
}

function _animarNovoFinalizados(novoFinalizados) {
    if (typeof confetti !== 'undefined') {
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 }, colors: ['#4ade80', '#a8c91d', '#fff'] });
    }
    novoFinalizados.forEach(({ numCaminhao, nroUnico }) => {
        UI.showToast(`🏁 ${numCaminhao} — todos os pallets finalizados!`, 'success');
        // Remove do DOM após animação CSS (3.2s)
        setTimeout(() => {
            const el = document.querySelector(
                `.truck-novo-finalizado[data-nrounico="${nroUnico}"][data-numcaminhao="${numCaminhao}"]`
            );
            if (el) el.style.display = 'none';
        }, 3300);
    });
}

function _atualizarStatusFiltro() {
    const el = document.getElementById('filterStatusText');
    if (!el) return;
    const fmt = iso => new Date(iso + 'T12:00:00').toLocaleDateString('pt-BR');
    if (Store.filtros.nroUnico) {
        el.textContent = `Mostrando: Nro. Único ${Store.filtros.nroUnico}`;
    } else if (Store.filtros.dataInicio || Store.filtros.dataFim) {
        const di = Store.filtros.dataInicio ? fmt(Store.filtros.dataInicio) : '?';
        const df = Store.filtros.dataFim    ? fmt(Store.filtros.dataFim)    : '?';
        el.textContent = di === df ? `Mostrando: ${di}` : `Mostrando: ${di} → ${df}`;
    } else {
        el.textContent = '';
    }
}

// ============ FILTROS ============
function aplicarFiltro() {
    const nroUnico   = (document.getElementById('filtroNroUnico')?.value    || '').trim();
    const dataInicio = (document.getElementById('filtroDataInicio')?.value  || '').trim();
    const dataFim    = (document.getElementById('filtroDataFim')?.value     || '').trim();

    if (!nroUnico && !dataInicio && !dataFim) {
        UI.showToast('Informe o Nro. Único ou o período para filtrar', 'warning');
        return;
    }

    Store.filtros = { nroUnico, dataInicio, dataFim };
    Store.mostrarFinalizados = true;
    carregarDados();
    UI.showToast('🔍 Filtro aplicado', 'info');
}

function limparFiltro() {
    ['filtroNroUnico', 'filtroDataInicio', 'filtroDataFim'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    Store.filtros = { nroUnico: '', dataInicio: '', dataFim: '' };
    Store.mostrarFinalizados = false;
    carregarDados();
    UI.showToast('📅 Exibindo dados de hoje', 'info');
}

function toggleFinalizados() {
    Store.mostrarFinalizados = !Store.mostrarFinalizados;
    Renderer.renderizarCaminhoes(Store.movimentacoes, []);
}

// ============ AUTO REFRESH ============
function startAutoRefresh() {
    Store.autoRefreshInterval = setInterval(carregarDados, CONFIG.REFRESH_INTERVAL);
}

function stopAutoRefresh() {
    if (Store.autoRefreshInterval) clearInterval(Store.autoRefreshInterval);
}

// ============ SELECIONAR CAMINHÃO ============
function selecionarCaminhao(nroUnico, numCaminhao) {
    Store.selectedTruck = { nroUnico, numCaminhao };

    const pallets = Store.movimentacoes.filter(
        m => String(m.NROUNICO) === String(nroUnico) &&
             String(m.NUMPCAMINHAO || '-') === String(numCaminhao)
    );

    const soma = (campo) => pallets.reduce((s, m) => s + parseFloat(m[campo] || 0), 0);

    Renderer.updateStats({
        entradaRecepcao:    soma('ENTRADAKG'),
        saidaRecepcao:      soma('SAIDAKG'),
        saldoMP:            soma('ENTRADAKG') - soma('SAIDAKG'),
        palletsProcessados: soma('QTDPALLETSBAIXADOS'),
        romaneio:           `${numCaminhao} · Romaneio #${nroUnico}`,
        status:             pallets[0] ? (CONFIG.STATUS_MAP[pallets[0].STATUS] || pallets[0].STATUS) : '---',
        saldoAtual:         soma('ENTRADAKG') - soma('SAIDAKG')
    });

    document.querySelectorAll('.truck-3d-wrapper').forEach(el => el.classList.remove('truck-selected'));
    const el = document.querySelector(`[data-nrounico="${nroUnico}"][data-numcaminhao="${numCaminhao}"]`);
    if (el) {
        el.classList.add('truck-selected');
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    UI.showToast(`🚛 ${numCaminhao} · ${pallets.length} pallets`, 'info');
}

// ============ GLOBAL EXPORTS ============
window.toggleSidebar      = () => UI.toggleSidebar();
window.toggleTheme        = () => UI.toggleTheme();
window.refreshData        = () => Events.refreshData();
window.buscarPallet       = () => Events.buscarPallet();
window.biparPallet        = () => Events.biparPallet();
window.selecionarCaminhao = selecionarCaminhao;
window.aplicarFiltro      = aplicarFiltro;
window.limparFiltro       = limparFiltro;
window.toggleFinalizados  = toggleFinalizados;
