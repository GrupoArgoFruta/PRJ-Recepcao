<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" isELIgnored="false"%>
<!DOCTYPE html>
<%@ page import="java.util.*" %>
<%@ taglib uri="http://java.sun.com/jstl/core_rt" prefix="c" %>
<%@ taglib prefix="snk" uri="/WEB-INF/tld/sankhyaUtil.tld" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ page import="br.com.sankhya.modelcore.auth.AuthenticationInfo" %>

<%
    response.setContentType("text/html; charset=UTF-8");
    javax.servlet.jsp.jstl.core.Config.set(request, javax.servlet.jsp.jstl.core.Config.FMT_LOCALE, new java.util.Locale("pt", "BR"));
    String idUsuario = ((AuthenticationInfo) session.getAttribute("usuarioLogado")).getUserID().toString();
%>

<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <title>THT Control — Tratamento Hidrotérmico</title>

    <snk:load/>

    <!-- Font Awesome 6 -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" />
    <!-- Google Fonts - Inter -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
    <!-- Bootstrap 5 CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Bootstrap Icons -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css" rel="stylesheet">

    <!-- CSS base + extensão THT -->
    <link href="${BASE_FOLDER}/assets/css/base.css" rel="stylesheet" />
    <link href="${BASE_FOLDER}/assets/css/tht.css" rel="stylesheet" />
</head>

<body>
    <!-- Glow Orbs -->
    <div class="glow-orb orb1"></div>
    <div class="glow-orb orb2"></div>
    <!-- Particles -->
    <div class="particles" id="particles"></div>
    <!-- Toast -->
    <div class="toast-container" id="toastContainer"></div>

    <div class="app-container">

        <!-- ========== SIDEBAR ========== -->
        <aside class="sidebar" id="sidebar">
            <div class="logo-container">
                <img src="https://argofruta.com/wp-content/uploads/2021/05/Logo-text-green.png"
                     alt="Argo Fruta"
                     style="height:40px;object-fit:contain;max-width:140px;"
                     onerror="this.style.display='none';document.getElementById('logoFallback').style.display='flex';">
                <div id="logoFallback" style="display:none;align-items:center;gap:10px;">
                    <div class="logo-icon"><i class="fa-solid fa-leaf"></i></div>
                    <span class="logo-text">ARGOFRUTA</span>
                </div>
            </div>

            <div class="menu-category">Hidrotérmico</div>
            <ul class="menu">
                <li>
                    <a href="#" class="active">
                        <i class="fa-solid fa-temperature-high"></i>
                        Dashboard
                        <span class="menu-badge">AO VIVO</span>
                    </a>
                </li>
                <li>
                    <a href="#" onclick="document.getElementById('gridSection').scrollIntoView({behavior:'smooth'});return false;">
                        <i class="fa-solid fa-flask"></i>
                        Tratamentos
                    </a>
                </li>
                          <li>
    <a href="#" onclick="window.open('${BASE_FOLDER}/relatorio.jsp', '_blank');return false;">
        <i class="fa-solid fa-chart-bar"></i>
        Relatórios
        <span class="menu-badge">NOVO</span>
    </a>
</li>
            </ul>
        </aside>

        <!-- ========== MAIN ========== -->
        <main class="main-content" id="mainContent">

            <!-- TOP BAR -->
            <div class="topbar">
                <div class="title-section">
                    <h1>THT CONTROL</h1>
                    <div class="subtitle">
                        <span class="live-dot"></span>
                        Tratamento Hidrotérmico • Seleção de Frutos
                    </div>
                </div>
                <div class="topbar-actions">
                    <button class="btn-refresh" onclick="refreshData()" id="btnRefresh" title="Atualizar (F5)">
                        <i class="fa-solid fa-rotate"></i>
                    </button>
                    <button class="theme-toggle" onclick="toggleTheme()" title="Alternar tema">
                        <i class="fa-solid fa-moon"></i>
                    </button>
                    <button class="mobile-menu-btn" onclick="toggleSidebar()">
                        <i class="fa-solid fa-bars"></i>
                    </button>
                    <div class="clock-widget" id="clock">00:00</div>
                </div>
            </div>

            <!-- ========== STATS CARDS ========== -->
            <section class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon entry"><i class="fa-solid fa-flask"></i></div>
                    <div class="stat-label">Tratamentos Hoje</div>
                    <div class="stat-value" id="cardTratamentosHoje">0</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon pallets"><i class="fa-solid fa-boxes-stacked"></i></div>
                    <div class="stat-label">Contentores Hoje</div>
                    <div class="stat-value" id="cardContentoresHoje">0</div>
                </div>
            </section>

            <!-- ========== FILTROS ========== -->
            <section class="filter-bar">
                <div class="filter-group">
                    <i class="fa-solid fa-filter" style="color:rgba(255,255,255,0.35);"></i>
                    <span class="filter-sep">De</span>
                    <input type="date" id="filtroDataInicio" onkeydown="if(event.key==='Enter') aplicarFiltro()" />
                    <span class="filter-sep">Até</span>
                    <input type="date" id="filtroDataFim" onkeydown="if(event.key==='Enter') aplicarFiltro()" />

                    <select id="filtroMercado"
                        style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);color:#fff;border-radius:8px;padding:6px 10px;font-size:13px;height:36px;">
                        <option value="">Mercado: Todos</option>
                        <option value="ARG">Argentina</option>
                        <option value="ZAF">África do Sul</option>
                        <option value="CHL">Chile</option>
                        <option value="KOR">Coreia</option>
                        <option value="URY">Uruguai</option>
                        <option value="USA">Estados Unidos</option>
                        <option value="MER">Mercosul</option>
                    </select>

                    <button class="btn btn-primary btn-filter" onclick="aplicarFiltro()">
                        <i class="fa-solid fa-magnifying-glass"></i> Filtrar
                    </button>
                    <button class="btn btn-filter-clear" onclick="limparFiltro()">
                        <i class="fa-solid fa-rotate-left"></i> Hoje
                    </button>
                </div>
            </section>

            <!-- ========== GRID MESTRE ========== -->
            <section class="panel" id="gridSection" style="margin-bottom:20px;">
                <div class="panel-header">
                    <div class="panel-title" style="font-size:18px;">
                        <i class="fa-solid fa-table-list"></i> Tratamentos Hidrotérmicos
                    </div>
                    <span style="color:#666;font-size:12px;">
                        <span id="gridCount">0</span> registros
                    </span>
                </div>
                <div style="overflow-x:auto;">
                    <table class="crud-table">
                        <thead>
                            <tr>
                                <th class="col-seq">#</th>
                                <th>Dt. Inclusão</th>
                                <th>Fiscal Mapa</th>
                                <th>Fiscal USDA</th>
                                <th style="text-align:center;">Contentores</th>
                                <th style="text-align:center;">Itens</th>
                            </tr>
                        </thead>
                        <tbody id="tbodyMestre">
                            <tr><td colspan="6">
                                <div class="empty-state">
                                    <i class="fa-solid fa-spinner fa-spin-pulse"></i>
                                    <p>Carregando...</p>
                                </div>
                            </td></tr>
                        </tbody>
                    </table>
                </div>
                <!-- PAGINAÇÃO -->
                <div class="pagination-bar" id="paginacaoBar"></div>
            </section>

            <!-- ========== PAINEL DETALHE (ITENS) ========== -->
            <section class="panel detalhe-panel" id="painelDetalhe"
                     style="display:none;border:1px solid rgba(168,201,29,0.3);">
                <div class="panel-header" style="background:rgba(11,92,57,0.08);">
                    <div class="panel-title" style="font-size:16px;">
                        <i class="fa-solid fa-list-check" style="color:#a8c91d;"></i>
                        Itens do Tratamento
                        <span id="detalheTitulo" style="font-weight:400;font-size:13px;color:#aaa;"></span>
                    </div>
                    <button onclick="fecharDetalhe()" class="btn btn-sm btn-outline-secondary"
                        style="height:34px;font-size:12px;border-radius:8px;">
                        <i class="fa-solid fa-xmark"></i> Fechar
                    </button>
                </div>
                <div class="detalhe-tags" id="detalheResumo"></div>
                <div style="overflow-x:auto;">
                    <table class="crud-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Variedade</th>
                                <th>Mercado</th>
                                <th style="text-align:center;">Tanque</th>
                                <th style="text-align:center;">Contentores</th>
                                <th style="text-align:center;">Gaiolas</th>
                                <th>Início</th>
                                <th>Fim</th>
                                <th>Tempo (min)</th>
                            </tr>
                        </thead>
                        <tbody id="tbodyDetalhe"></tbody>
                    </table>
                </div>
            </section>

        </main>
    </div>

    <!-- Usuário Logado -->
    <script>
        const USUARIO_LOGADO = '<%= idUsuario %>';
    </script>

    <!-- Libs -->
    <script src="https://cdn.jsdelivr.net/gh/wansleynery/SankhyaJX@main/jx.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/jquery@3.5.1/dist/jquery.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.0.6/purify.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"></script>

    <!-- Módulos MVC -->
    <script src="${BASE_FOLDER}/assets/js/config.js"></script>
    <script src="${BASE_FOLDER}/assets/js/modules/state.js"></script>
    <script src="${BASE_FOLDER}/assets/js/modules/sanitizer.js"></script>
    <script src="${BASE_FOLDER}/assets/js/modules/ui.js"></script>
    <script src="${BASE_FOLDER}/assets/js/modules/api.js"></script>
    <script src="${BASE_FOLDER}/assets/js/modules/renderer.js"></script>
    <script src="${BASE_FOLDER}/assets/js/modules/events.js"></script>
    <script src="${BASE_FOLDER}/assets/js/dashboard.js"></script>
</body>
</html>