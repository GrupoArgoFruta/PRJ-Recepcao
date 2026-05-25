/**
 * ============================================================
 * renderer.js ← Renderização visual com paginação
 * ============================================================
 */
const Renderer = {

    // ============ CARDS RESUMO ============
    updateStats(data) {
        UI.animateCounter('cardTratamentosHoje', Sanitizer.integer(data.TOTAL_HOJE));
        UI.animateCounter('cardContentoresHoje', Sanitizer.integer(data.TOTAL_CONT));
    },

    // ============ GRID MESTRE ============
    renderTabelaMestre() {
        const tbody = document.getElementById('tbodyMestre');
        const countEl = document.getElementById('gridCount');
        if (!tbody) return;

        const allRows = Store.getTratamentos();
        if (countEl) countEl.textContent = allRows.length;

        const rows = Store.getPage();

        if (!rows.length) {
            tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><i class="fa-solid fa-inbox"></i><p>Nenhum tratamento encontrado</p><small>Ajuste os filtros</small></div></td></tr>`;
            this.renderPaginacao();
            return;
        }

        tbody.innerHTML = rows.map(r => {
            const nru = r.NRUNICO;
            const sel = Store.sequenciaSelecionada == nru;
            return `
                <tr onclick="selecionarTratamento('${nru}')" class="${sel?'selected':''}" data-nru="${nru}">
                    <td class="col-seq">${nru}</td>
                    <td>${r.DTINCLUSAO || '—'}</td>
                    <td>${r.FISCALMAPA || '—'}</td>
                    <td>${r.FISCALUSDA || '—'}</td>
                    <td style="text-align:center"><strong>${r.TOTAL_CONT || 0}</strong></td>
                    <td style="text-align:center">${r.QTD_ITENS || 0}</td>
                </tr>`;
        }).join('');

        this.renderPaginacao();
    },

    // ============ PAGINAÇÃO ============
    renderPaginacao() {
        const c = document.getElementById('paginacaoBar');
        if (!c) return;

        const total = Store.paginacao.totalRows;
        const pages = Store.getTotalPages();
        const cur = Store.paginacao.page;
        const ps = Store.paginacao.pageSize;
        const start = (cur - 1) * ps + 1;
        const end = Math.min(cur * ps, total);

        let btns = '';
        btns += `<button class="pg-btn" onclick="irPagina(1)" ${cur<=1?'disabled':''}><i class="fa-solid fa-angles-left"></i></button>`;
        btns += `<button class="pg-btn" onclick="irPagina(${cur-1})" ${cur<=1?'disabled':''}><i class="fa-solid fa-angle-left"></i></button>`;

        const range = this._pageRange(cur, pages);
        range.forEach(p => {
            if (p === '...') btns += `<span style="color:#555;padding:0 4px;">…</span>`;
            else btns += `<button class="pg-btn ${p===cur?'active':''}" onclick="irPagina(${p})">${p}</button>`;
        });

        btns += `<button class="pg-btn" onclick="irPagina(${cur+1})" ${cur>=pages?'disabled':''}><i class="fa-solid fa-angle-right"></i></button>`;
        btns += `<button class="pg-btn" onclick="irPagina(${pages})" ${cur>=pages?'disabled':''}><i class="fa-solid fa-angles-right"></i></button>`;

        const opts = CONFIG.PAGE_SIZES.map(s => `<option value="${s}" ${s===ps?'selected':''}>${s}</option>`).join('');

        c.innerHTML = `
            <div class="pagination-info">${total?`<strong>${start}</strong>–<strong>${end}</strong> de <strong>${total}</strong>`:'Nenhum registro'}</div>
            <div class="pagination-controls">${btns}</div>
            <div class="pg-per-page">Por página: <select onchange="mudarPageSize(this.value)">${opts}</select></div>
        `;
    },

    _pageRange(cur, total) {
        if (total <= 7) return Array.from({length:total}, (_,i) => i+1);
        const r = [1];
        if (cur > 3) r.push('...');
        for (let i = Math.max(2, cur-1); i <= Math.min(total-1, cur+1); i++) r.push(i);
        if (cur < total - 2) r.push('...');
        r.push(total);
        return r;
    },

    // ============ DETALHE HEADER ============
    renderDetalheHeader(trat) {
        if (!trat) return;
        const t = document.getElementById('detalheTitulo');
        const r = document.getElementById('detalheResumo');
        if (t) t.textContent = `#${trat.NRUNICO} — ${trat.FISCALMAPA || '—'} / ${trat.FISCALUSDA || '—'}`;
        if (r) r.innerHTML = `
            <span><strong>Fiscal Mapa:</strong> ${trat.FISCALMAPA || '—'}</span>
            <span><strong>Fiscal USDA:</strong> ${trat.FISCALUSDA || '—'}</span>
            <span><strong>Data Inclusão:</strong> ${trat.DTINCLUSAO || '—'}</span>
            <span><strong>Criado por:</strong> ${trat.CRIADO_POR || '—'}</span>
            <span><strong>Total Contentores:</strong> ${trat.TOTAL_CONT || 0}</span>
            <span><strong>Total Itens:</strong> ${trat.QTD_ITENS || 0}</span>`;
    },

    // ============ GRID ITENS (sem botões de ação e sem cálculo de tempo) ============
    renderTabelaDetalhe(rows) {
        const tbody = document.getElementById('tbodyDetalhe');
        if (!tbody) return;
        
        if (!rows || !rows.length) {
            tbody.innerHTML = `<td><td colspan="8"><div class="empty-state" style="padding:1.2rem;"><i class="fa-solid fa-box-open"></i><p>Nenhum item encontrado</p></div></td></tr>`;
            return;
        }
        
        tbody.innerHTML = rows.map(r => `
            <tr>
                <td><strong>${r.SEQUENCIA}</strong></td>
                <td>${r.VARIEDADE || '—'}</td>
                <td>${CONFIG.MERCADOS[r.MERCADO] || r.MERCADO || '—'}</td>
                <td style="text-align:center">${r.TANQUE || '—'}</td>
                <td style="text-align:center"><strong>${r.CONTENTORES || 0}</strong></td>
                <td style="text-align:center">${r.GAIOLAS || 0}</td>
                <td>${r.HORATRAIN || '—'}</td>
                <td>${r.HORATRAFIN || '—'}</td>
                <td>${r.TEMPO || '—'}</td>
            </tr>
        `).join('');
    }
};

window.Renderer = Renderer;