<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" isELIgnored="false"%>
<!DOCTYPE html>
<%@ page import="java.util.*" %>
<%@ taglib uri="http://java.sun.com/jstl/core_rt" prefix="c" %>
<%@ page import="br.com.sankhya.modelcore.auth.AuthenticationInfo" %>

<%
    response.setContentType("text/html; charset=UTF-8");
    String idUsuario = ((AuthenticationInfo) session.getAttribute("usuarioLogado")).getUserID().toString();
%>

<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <title>THT Control - Relatorio Analitico</title>

    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
    
    <style>
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }
    
    body {
        font-family: 'Inter', sans-serif;
        background: linear-gradient(135deg, #0a0e27 0%, #1a1a2e 50%, #16213e 100%);
        min-height: 100vh;
        color: #e0e0e0;
        padding: 20px;
    }
    
    .container {
        max-width: 1400px;
        margin: 0 auto;
    }
    
    .report-header {
        background: linear-gradient(135deg, #0b5c39, #0a1a2e);
        padding: 20px 24px;
        border-radius: 16px;
        margin-bottom: 24px;
    }
    
    .report-title {
        font-size: 24px;
        font-weight: 700;
        color: #a8c91d;
    }
    
    .report-subtitle {
        color: #aaa;
        font-size: 13px;
        margin-top: 4px;
    }
    
    .filter-bar {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px 20px;
        background: rgba(255,255,255,0.05);
        backdrop-filter: blur(16px);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 16px;
        margin-bottom: 24px;
        flex-wrap: wrap;
    }
    
    .filter-group {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
    }
    
    .filter-sep {
        font-size: 13px;
        color: rgba(255,255,255,0.5);
    }
    
    input[type="date"], select {
        background: rgba(255,255,255,0.08);
        border: 1px solid rgba(255,255,255,0.15);
        color: #e0e0e0;
        border-radius: 10px;
        padding: 8px 14px;
        font-size: 13px;
        font-family: 'Inter', sans-serif;
        outline: none;
    }
    
    input[type="date"]:focus, select:focus {
        border-color: #a8c91d;
    }
    
    .btn {
        padding: 8px 20px;
        border: none;
        border-radius: 10px;
        font-weight: 600;
        font-size: 13px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        transition: all 0.2s ease;
        font-family: 'Inter', sans-serif;
    }
    
    .btn-primary {
        background: linear-gradient(135deg, #0b5c39, #0d7a4a);
        color: white;
    }
    
    .btn-secondary {
        background: rgba(255,255,255,0.08);
        color: #ccc;
        border: 1px solid rgba(255,255,255,0.1);
    }
    
    .btn-print {
        background: linear-gradient(135deg, #a8c91d, #0b5c39);
        color: white;
    }
    
    .btn:hover {
        transform: translateY(-2px);
        filter: brightness(1.05);
    }
    
    .loading {
        text-align: center;
        padding: 60px;
        color: #a8c91d;
    }
    
    .empty-state {
        text-align: center;
        padding: 60px;
        color: #888;
    }
    
    .empty-state i {
        font-size: 48px;
        margin-bottom: 16px;
        display: block;
    }
    
    /* ===== RESUMO CARDS ===== */
    .resumo-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 16px;
        margin-bottom: 24px;
    }

    .resumo-card {
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 12px;
        padding: 16px 20px;
        text-align: center;
    }

    .resumo-label {
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 1px;
        color: #888;
        margin-bottom: 6px;
    }

    .resumo-value {
        font-size: 28px;
        font-weight: 800;
        color: #a8c91d;
    }

    /* ===== TABELA ===== */
    .report-table-wrapper {
        overflow-x: auto;
        margin-bottom: 20px;
    }

    .report-table {
        width: 100%;
        font-size: 12px;
        border-collapse: collapse;
        background: rgba(255,255,255,0.03);
        border-radius: 8px;
        min-width: 1000px;
    }

    .report-table th {
        background: rgba(168,201,29,0.15);
        padding: 10px 8px;
        text-align: center;
        font-weight: 700;
        color: #a8c91d;
        border-bottom: 2px solid rgba(168,201,29,0.3);
        white-space: nowrap;
    }

    .report-table td {
        padding: 8px 6px;
        border-bottom: 1px solid rgba(255,255,255,0.05);
        vertical-align: middle;
        white-space: nowrap;
    }

    .report-table td:first-child,
    .report-table th:first-child {
        text-align: center;
        font-weight: 600;
        width: 50px;
    }

    .report-table td:nth-child(2),
    .report-table th:nth-child(2) { width: 70px; text-align: center; }
    .report-table td:nth-child(3),
    .report-table th:nth-child(3) { width: 80px; }
    .report-table td:nth-child(4),
    .report-table th:nth-child(4) { width: 60px; text-align: center; }
    .report-table td:nth-child(5),
    .report-table th:nth-child(5) { width: 140px; }
    .report-table td:nth-child(6),
    .report-table th:nth-child(6) { width: 140px; }
    .report-table td:nth-child(7),
    .report-table th:nth-child(7) { width: 90px; text-align: center; }
    .report-table td:nth-child(8),
    .report-table th:nth-child(8) { width: 80px; text-align: center; }
    .report-table td:nth-child(9),
    .report-table th:nth-child(9) { width: 70px; text-align: center; }
    .report-table td:nth-child(10),
    .report-table th:nth-child(10) { width: 100px; }
    .report-table td:nth-child(11),
    .report-table th:nth-child(11) { width: 70px; text-align: right; }
    .report-table td:nth-child(12),
    .report-table th:nth-child(12) { width: 100px; }

    .report-table tr:hover td {
        background: rgba(168,201,29,0.05);
    }

    .tratamento-header {
        background: rgba(11,92,57,0.2);
        padding: 10px 12px;
        margin-top: 20px;
        margin-bottom: 10px;
        border-radius: 8px;
        border-left: 4px solid #a8c91d;
    }

    .tratamento-header strong {
        color: #a8c91d;
    }

    .tempos-texto {
        margin-left: 12px;
        font-size: 11px;
        color: #ffffff;
    }

    .footer {
        margin-top: 24px;
        text-align: center;
        font-size: 11px;
        color: #666;
        padding: 16px;
        border-top: 1px solid rgba(255,255,255,0.05);
    }
    
    @media print {
        @page { 
            size: landscape; 
            margin: 8mm; 
        }
        
        .no-print { display: none !important; }
        
        body { 
            background: white !important; 
            color: black !important; 
            padding: 0 !important;
            margin: 0 !important;
            font-size: 8pt;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
        
        .container { 
            max-width: 100% !important; 
            margin: 0 !important; 
            padding: 0 !important; 
        }

        .report-header { 
            background: none !important; 
            border-bottom: 2px solid #0b5c39; 
            padding: 4px 8px !important;
            margin-bottom: 8px !important;
            border-radius: 0 !important;
        }
        
        .report-title { 
            color: #0b5c39 !important; 
            font-size: 14pt !important; 
        }
        
        .report-subtitle { 
            color: #333 !important; 
            font-size: 9pt !important; 
        }

        .print-resumo {
            display: table !important;
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 8px;
            font-size: 9pt;
        }
        
        .print-resumo td {
            border: 1px solid #999;
            padding: 4px 8px;
            text-align: center;
        }
        
        .print-resumo .label { 
            font-weight: bold; 
            background: #e8e8e8; 
        }
        
        .print-resumo .value { 
            font-weight: bold; 
            font-size: 11pt; 
            color: #0b5c39; 
        }

        .report-table,
        .report-table thead,
        .report-table tbody {
            display: table !important;
            width: 100% !important;
            table-layout: auto !important;
            overflow: visible !important;
        }
        
        .report-table-wrapper {
            overflow: visible !important;
        }
        
        .report-table {
            font-size: 7.5pt !important;
            border-collapse: collapse !important;
            border: 1px solid #999 !important;
            background: white !important;
            border-radius: 0 !important;
            page-break-inside: auto;
        }
        
        .report-table th {
            background: #d4d4d4 !important;
            color: black !important;
            border: 1px solid #999 !important;
            padding: 3px 4px !important;
            font-weight: bold !important;
            font-size: 7.5pt !important;
            white-space: nowrap !important;
        }
        
        .report-table td {
            border: 1px solid #bbb !important;
            padding: 2px 4px !important;
            color: black !important;
            background: white !important;
            white-space: nowrap !important;
            font-size: 7.5pt !important;
        }
        
        .report-table tr {
            page-break-inside: avoid;
        }

        .footer {
            border-top: 1px solid #999;
            margin-top: 8px;
            padding-top: 4px;
            font-size: 8pt;
            color: #333;
        }

        #printResumo { display: block !important; }
        .print-resumo { display: table !important; }
        
        .tratamento-header {
            background: #e8f0e0 !important;
            border-left: 4px solid #0b5c39 !important;
            color: black !important;
            margin-top: 16px;
            margin-bottom: 6px;
            padding: 6px 8px;
        }
        
        .tratamento-header strong {
            color: #0b5c39 !important;
        }

        .tempos-texto {
            color: #000000 !important;
        }

        /* Assinaturas na impressão */
        .assinatura-area {
            display: flex !important;
            justify-content: space-between;
            margin-top: 40px;
            padding: 0 40px;
            page-break-inside: avoid;
        }

        .assinatura-box {
            text-align: center;
            width: 40%;
        }

        .assinatura-linha {
            border-bottom: 1px solid #333;
            margin-bottom: 6px;
            height: 30px;
        }

        .assinatura-cargo {
            font-size: 9pt;
            font-weight: bold;
            color: #333;
            text-transform: uppercase;
        }
    }
    
    /* ===== ASSINATURAS (oculto na tela, visível na impressão) ===== */
    .assinatura-area {
        display: none;
    }

    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .print-resumo { display: none; }
</style>
</head>

<body>
<div class="container">
    <!-- CABECALHO -->
    <div class="report-header">
        <div class="report-title">
            <i class="fa-solid fa-chart-bar"></i> Relatorio Analitico - Tratamento Hidrotermico
        </div>
        <div class="report-subtitle">
            ARGOFRUTA COMERCIAL EXPORT LTDA 
        </div>
    </div>

    <!-- FILTROS -->
    <div class="filter-bar no-print">
        <div class="filter-group">
            <i class="fa-solid fa-calendar" style="color:rgba(255,255,255,0.35);"></i>
            <span class="filter-sep">De</span>
            <input type="date" id="filtroDataInicio" />
            <span class="filter-sep">Ate</span>
            <input type="date" id="filtroDataFim" />
            
            <span class="filter-sep">|</span>
            
            <i class="fa-solid fa-hashtag"></i>
            <input type="number" id="filtroNRUNICO" placeholder="Nº Tratamento" style="width:120px;" />
            
            <select id="filtroMercado">
                <option value="">Todos os Mercados</option>
                <option value="ARG">Argentina</option>
                <option value="ZAF">Africa do Sul</option>
                <option value="CHL">Chile</option>
                <option value="KOR">Coreia</option>
                <option value="URY">Uruguai</option>
                <option value="USA">Estados Unidos</option>
                <option value="MER">Mercosul</option>
            </select>

            <button class="btn btn-primary" id="btnBuscar">
                <i class="fa-solid fa-magnifying-glass"></i> Buscar
            </button>
            <button class="btn btn-secondary" id="btnLimpar">
                <i class="fa-solid fa-rotate-left"></i> Limpar
            </button>
            <button class="btn btn-print" id="btnImprimir">
                <i class="fa-solid fa-print"></i> Imprimir
            </button>
        </div>
    </div>

    <!-- RESUMO (tela) -->
    <div class="resumo-grid no-print" id="resumoGrid" style="display:none;"></div>
    <div id="printResumo" style="display:none;"></div>

    <!-- CONTEUDO DO RELATORIO -->
    <div id="conteudoRelatorio">
        <div class="empty-state">
            <i class="fa-solid fa-chart-simple"></i>
            Selecione os filtros e clique em Buscar
        </div>
    </div>
    
    <!-- AREA DE ASSINATURAS (só aparece na impressão) -->
    <div class="assinatura-area">
        <div class="assinatura-box">
            <div class="assinatura-linha"></div>
            <div class="assinatura-cargo">Monitor</div>
        </div>
        <div class="assinatura-box">
            <div class="assinatura-linha"></div>
            <div class="assinatura-cargo">Verificador</div>
        </div>
    </div>

    <div class="footer no-print">
        THT Control - Sistema de Tratamento Hidrotermico
    </div>
</div>

<script>
    const BASE_URL = window.location.origin;
    const USUARIO_LOGADO = '<%= idUsuario %>';

    async function executarQuery(sql) {
        sql = sql.replace(/(\r\n|\n|\r)/gm, ' ').replace(/\s+/g, ' ').trim();
        var url = BASE_URL + '/mge/service.sbr?serviceName=DbExplorerSP.executeQuery&outputType=json';
        var body = JSON.stringify({ serviceName: 'DbExplorerSP.executeQuery', requestBody: { sql: sql } });
        var resp = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json; charset=UTF-8' }, body: body, credentials: 'include' });
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        var json = await resp.json();
        if (json.status === '0' || json.status === 0) {
            var msg = json.statusMessage || 'Erro desconhecido';
            try { msg = decodeURIComponent(escape(atob(msg))); } catch(e) {}
            throw new Error(msg);
        }
        return parseJsonResponse(json);
    }

    function parseJsonResponse(json) {
        var body = json;
        if (body.data) body = body.data;
        if (body.responseBody) body = body.responseBody;
        var metadata = body.fieldsMetadata || [];
        var rows = body.rows || [];
        if (!rows.length) return [];
        var result = [];
        rows.forEach(function(row) {
            var obj = {};
            metadata.forEach(function(field, idx) {
                obj[field.name] = row[idx] !== undefined && row[idx] !== null ? String(row[idx]) : null;
            });
            result.push(obj);
        });
        return result;
    }

    document.addEventListener('DOMContentLoaded', function() {
        var hoje = new Date();
        var trintaDiasAtras = new Date();
        trintaDiasAtras.setDate(hoje.getDate() - 30);
        document.getElementById('filtroDataInicio').value = trintaDiasAtras.toISOString().split('T')[0];
        document.getElementById('filtroDataFim').value = hoje.toISOString().split('T')[0];
        document.getElementById('btnBuscar').onclick = function() { carregarRelatorio(); };
        document.getElementById('btnLimpar').onclick = function() { limparFiltro(); };
        document.getElementById('btnImprimir').onclick = function() { window.print(); };
        carregarRelatorio();
    });
    
    function limparFiltro() {
        var hoje = new Date();
        var trintaDiasAtras = new Date();
        trintaDiasAtras.setDate(hoje.getDate() - 30);
        document.getElementById('filtroDataInicio').value = trintaDiasAtras.toISOString().split('T')[0];
        document.getElementById('filtroDataFim').value = hoje.toISOString().split('T')[0];
        document.getElementById('filtroMercado').value = '';
        document.getElementById('filtroNRUNICO').value = '';
        carregarRelatorio();
    }
    
    async function carregarRelatorio() {
        var dataInicio = document.getElementById('filtroDataInicio').value || '';
        var dataFim = document.getElementById('filtroDataFim').value || '';
        var mercado = document.getElementById('filtroMercado').value || '';
        var nrunico = document.getElementById('filtroNRUNICO').value || '';
        
        document.getElementById('conteudoRelatorio').innerHTML = '<div class="loading"><i class="fa-solid fa-spinner fa-spin" style="font-size:32px;"></i><p>Carregando dados...</p></div>';
        document.getElementById('resumoGrid').style.display = 'none';
        
        var where = '1=1';
        if (dataInicio) where += " AND TRUNC(H.DTINCLUSAO) >= TO_DATE('" + dataInicio + "', 'YYYY-MM-DD')";
        if (dataFim) where += " AND TRUNC(H.DTINCLUSAO) <= TO_DATE('" + dataFim + "', 'YYYY-MM-DD')";
        if (mercado) where += " AND I.MERCADO = '" + mercado + "'";
        if (nrunico) where += " AND H.NRUNICO = " + parseInt(nrunico);
        
        var sql = "SELECT H.NRUNICO, TO_CHAR(H.DTINCLUSAO, 'DD/MM/YYYY HH24:MI:SS') AS DTINCLUSAO, H.FISCALMAPA, H.FISCALUSDA, NVL(USU.NOMEUSU, '-') AS CRIADO_POR, I.SEQUENCIA, I.HORATRAIN, I.HORATRAFIN, NVL(I.CONTENTORES, 0) AS CONTENTORES, I.TANQUE, NVL(GRU.AD_DESCRESUMO, '-') AS VARIEDADE, NVL(I.POLPA, 0) AS POLPA, I.GAIOLA, I.MERCADO, NVL(I.GAIOLAS, 0) AS GAIOLAS, I.TEMPO FROM AD_HIDROTERMICO H INNER JOIN AD_HIDROITEM I ON I.NRUNICO = H.NRUNICO LEFT JOIN TSIUSU USU ON USU.CODUSU = H.CODUSUINC LEFT JOIN TGFGRU GRU ON GRU.CODGRUPOPROD = I.CODGRUPOPROD WHERE " + where + " ORDER BY H.DTINCLUSAO DESC, H.NRUNICO, I.SEQUENCIA";
        
        try {
            var result = await executarQuery(sql);
            renderizarRelatorio(result);
        } catch (e) {
            document.getElementById('conteudoRelatorio').innerHTML = '<div class="empty-state"><i class="fa-solid fa-circle-exclamation" style="color:#f87171;"></i><p>Erro: ' + e.message + '</p></div>';
        }
    }
    
    function renderizarRelatorio(data) {
        if (!data || data.length === 0) {
            document.getElementById('conteudoRelatorio').innerHTML = '<div class="empty-state"><i class="fa-solid fa-inbox"></i><p>Nenhum registro encontrado.</p></div>';
            document.getElementById('resumoGrid').style.display = 'none';
            return;
        }
        
        var grupos = {}, ordemTrat = [], totalContentores = 0, totalGaiolas = 0, totalPeso = 0;
        
        // Peso médio por contentor de acordo com o mercado
        var pesoMedioPorMercado = {
            'CHL': 22,   // Chile
            'ARG': 22,   // Argentina
            'URY': 22,   // Uruguai
            'USA': 25,   // Estados Unidos
            'ZAF': 0,    // Africa do Sul
            'KOR': 0,    // Coreia
            'MER': 0     // Mercosul
        };
        
        data.forEach(function(item) {
            var nru = item.NRUNICO;
            if (!grupos[nru]) {
                grupos[nru] = { trat: item, itens: [] };
                ordemTrat.push(nru);
            }
            grupos[nru].itens.push(item);
            var qtdCont = parseInt(item.CONTENTORES) || 0;
            totalContentores += qtdCont;
            totalGaiolas += parseInt(item.GAIOLAS) || 0;
            // Peso = contentores * peso medio do mercado
            var pesoMedio = pesoMedioPorMercado[item.MERCADO] || 0;
            totalPeso += qtdCont * pesoMedio;
        });
        
        var totalTrat = ordemTrat.length, totalItens = data.length;
        
        var resumoEl = document.getElementById('resumoGrid');
        resumoEl.style.display = 'grid';
        resumoEl.innerHTML = '<div class="resumo-card"><div class="resumo-label">Tratamentos</div><div class="resumo-value">' + totalItens + '</div></div><div class="resumo-card"><div class="resumo-label">Registros</div><div class="resumo-value">' + totalTrat + '</div></div><div class="resumo-card"><div class="resumo-label">Contentores</div><div class="resumo-value">' + totalContentores.toLocaleString('pt-BR') + '</div></div><div class="resumo-card"><div class="resumo-label">Gaiolas</div><div class="resumo-value">' + totalGaiolas + '</div></div><div class="resumo-card"><div class="resumo-label">Peso Total</div><div class="resumo-value">' + totalPeso.toLocaleString('pt-BR') + '</div></div>';
        
        var printResumoEl = document.getElementById('printResumo');
        printResumoEl.innerHTML = '<table class="print-resumo"><tr><td class="label">TRAT=</td><td class="value">' + totalItens + '</td><td class="label">GAIOLA=</td><td class="value">' + totalGaiolas + '</td><td class="label">CONTENTORES=</td><td class="value">' + totalContentores.toLocaleString('pt-BR') + '</td><td class="label">PESO=</td><td class="value">' + totalPeso.toLocaleString('pt-BR') + '</td></tr></table>';
        
        var html = '';
        ordemTrat.forEach(function(nru) {
            var grupo = grupos[nru], t = grupo.trat;
            
            var contagemTempos = {};
            grupo.itens.forEach(function(item) {
                var tempo = item.TEMPO;
                if (tempo && tempo !== '-' && tempo !== '—') contagemTempos[tempo] = (contagemTempos[tempo] || 0) + 1;
            });
            
            var contadorTexto = '';
            if (Object.keys(contagemTempos).length > 0) {
                var partes = [];
                for (var tempo in contagemTempos) partes.push(tempo + 'min: ' + contagemTempos[tempo]);
                contadorTexto = ' - Tempos: ' + partes.join(' | ');
            }
            
            html += '<div class="tratamento-header">';
            html += '<strong style="color: #a8c91d;">TRATAMENTO #' + t.NRUNICO + '</strong>';
            html += ' - Fiscal MAPA: ' + (t.FISCALMAPA || '-');
            html += ' / Fiscal USDA: ' + (t.FISCALUSDA || '-');
            html += ' - ' + (t.DTINCLUSAO || '-');
            html += ' - Criado por: ' + (t.CRIADO_POR || '-');
            html += '<span class="tempos-texto">' + contadorTexto + '</span>';
            html += '</div>';
            
            html += '<div class="report-table-wrapper">';
            html += '<table class="report-table">';
            html += '<thead><tr><th>Trat</th><th>Tanque</th><th>Gaiola</th><th class="text-center">Tempo</th><th>Inicio</th><th>Final</th><th class="text-center">Contentores</th><th class="text-center">Gaiolas</th><th>Variedade</th><th class="text-right">Polpa</th><th>Mercado</th></tr></thead><tbody>';
            
            grupo.itens.forEach(function(item) {
                html += '<tr>';
                html += '<td>' + item.SEQUENCIA + '</td>';
                html += '<td class="text-center">' + (item.TANQUE || '-') + '</td>';
                html += '<td>' + (item.GAIOLA || '-') + '</td>';
                html += '<td class="text-center">' + (item.TEMPO || '-') + '</td>';
                html += '<td>' + (item.HORATRAIN || '-') + '</td>';
                html += '<td>' + (item.HORATRAFIN || '-') + '</td>';
                html += '<td class="text-center">' + (parseInt(item.CONTENTORES) || 0) + '</td>';
                html += '<td class="text-center">' + (parseInt(item.GAIOLAS) || 0) + '</td>';
                html += '<td>' + (item.VARIEDADE || '-') + '</td>';
                html += '<td class="text-right">' + parseFloat(item.POLPA || 0).toFixed(1) + '</td>';
                html += '<td>' + (item.MERCADO || '-') + '</td>';
                html += '</tr>';
            });
            
            html += '</tbody></table></div>';
        });
        
        html += '<div class="footer" style="margin-top:16px;text-align:center;">';
        html += 'Total de tratamentos: ' + totalItens + ' | Total de itens: ' + totalItens;
        html += ' | Contentores: ' + totalContentores.toLocaleString('pt-BR');
        html += ' | Peso: ' + totalPeso.toLocaleString('pt-BR') + ' kg';
        html += '</div>';
        
        document.getElementById('conteudoRelatorio').innerHTML = html;
    }
</script>
</body>
</html>
