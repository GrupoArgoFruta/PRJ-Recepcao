<p align="center">
  <img src="https://argofruta.com/wp-content/uploads/2021/05/Logo-text-green.png" width="200" alt="Argo Fruta Logo">
</p>

<h1 align="center">DASH-MOV-RECEPCAO</h1>

<p align="center">
  <b>Dashboard Operacional — Movimentação de Saldos na Recepção de Frutos</b><br>
  Módulo: Recepção / Tombador<br>
  Sankhya ERP — Grupo Argo
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Plataforma-Sankhya_ERP-274135?style=flat-square" alt="Sankhya">
  <img src="https://img.shields.io/badge/Frontend-Vanilla_JS_Modular-f7df1e?style=flat-square" alt="JS">
  <img src="https://img.shields.io/badge/Backend-JSP_Java-orange?style=flat-square" alt="JSP">
  <img src="https://img.shields.io/badge/Banco-Oracle-red?style=flat-square" alt="Oracle">
  <img src="https://img.shields.io/badge/Status-Em_Produção-brightgreen?style=flat-square" alt="Status">
</p>

---

## 📋 Sobre

Dashboard operacional em tempo real para monitoramento da **movimentação de pallets e KG na recepção de frutos**, integrado ao ERP Sankhya via tabelas customizadas (`AD_ROMANEIOENTRMOVSALDO` / `AD_ROMANEIOENTR`).

O operador acompanha a entrada dos caminhões, gerencia pallets individualmente, bipa o código de barras no tombador com leitor USB e imprime etiquetas **CONTROLE DE RECEPÇÃO** (108×80 mm) para a Zebra ZD 220 — tudo na mesma tela, sem troca de módulo.

### Problema resolvido

Anteriormente o controle de recepção era manual e fragmentado:
- Anotações em papel para contagem de pallets por caminhão
- Sem visibilidade em tempo real de saldo de KG por romaneio
- Bipagem no tombador feita fora do sistema, sem baixa automática
- Etiquetas impressas manualmente sem código de barras rastreável

Com este dashboard, **uma única tela** centraliza: entrada, baixa automática por scanner, status por pallet, stat cards agregados e impressão de etiquetas em lote.

---

## 📁 Estrutura do Projeto

```
Dash-movimentacao-recepcao-refugo/
├── primeiro_nivel.jsp                     ← Entry point — carregado pelo Sankhya
├── assets/
│   ├── css/
│   │   └── style.css                      ← Tema Dark Glassmorphism (CSS Variables)
│   └── js/
│       ├── config.js                      ← Constantes, mapeamentos e magic numbers
│       ├── dashboard.js                   ← Orquestrador principal (init + refresh)
│       └── modules/
│           ├── state.js                   ← Estado global da aplicação (Store)
│           ├── sanitizer.js              ← Sanitização com DOMPurify
│           ├── ui.js                      ← Toast, partículas, relógio, tema, sidebar
│           ├── api.js                     ← Chamadas ao Sankhya (CRUD + retry)
│           ├── renderer.js               ← Renderização visual (caminhões SVG, pallets)
│           ├── modal.js                  ← Modais CRUD, bipagem e etiqueta
│           └── events.js                 ← Listeners, debounce e ações do usuário
└── README.md
```

---

## 🏗️ Arquitetura — Módulos JS

### Ordem obrigatória de carregamento

```
config.js → state.js → sanitizer.js → ui.js → api.js → renderer.js → modal.js → events.js → dashboard.js
```

| Módulo | Namespace Global | Responsabilidade |
|--------|-----------------|-----------------|
| `config.js` | `CONFIG` | Constantes, STATUS_MAP, BLOCK_COLORS, TOAST_ICONS, magic numbers |
| `state.js` | `Store` | Estado em memória: movimentações, romaneio atual, caminhão selecionado |
| `sanitizer.js` | `Sanitizer` | DOMPurify: `clean()`, `text()`, `number()`, `integer()` |
| `ui.js` | `UI` | Toast, partículas animadas, relógio, toggle tema, sidebar, confetti |
| `api.js` | `API` | `fetchResumo`, `fetchPallets`, `create`, `update`, `bipar`, `remove`, retry exponencial |
| `renderer.js` | `Renderer` | Caminhão SVG 3D, blocos de pallet, stat cards, cards de refugo |
| `modal.js` | `ModalInjector` | Modal CRUD (novo/editar), modal bipagem (scanner), modal impressão etiqueta |
| `events.js` | `Events` | Debounce busca, bipagem, atalhos de teclado, refresh |
| `dashboard.js` | — | Init (AOS, partículas, relógio), `carregarDados`, `selecionarCaminhao` |

### Stack de bibliotecas externas (CDN)

| Biblioteca | Versão | Uso |
|-----------|--------|-----|
| Bootstrap | 5.3.0 | Grid, modais, utilitários CSS |
| Font Awesome | 6.5.2 | Ícones |
| Inter (Google Fonts) | — | Tipografia |
| jQuery | 3.5.1 | DOM helpers legados |
| SweetAlert2 | 11 | Confirmações (delete) |
| AOS | 2.3.1 | Animações de entrada (scroll) |
| DOMPurify | 3.0.6 | Sanitização XSS |
| JsBarcode | 3.11.6 | Geração de código de barras Code 128 |
| canvas-confetti | 1.6.0 | Celebração ao finalizar romaneio |
| SankhyaJX | main | Bridge JS → Sankhya (`executeQuery`) |

---

## ⚙️ Configuração (`config.js`)

| Chave | Valor padrão | Descrição |
|-------|-------------|-----------|
| `ENTITY_NAME` | `AD_ROMANEIOENTRMOVSALDO` | Entidade principal do CRUD |
| `DATA_SET_ID` | `00P` | ID do DataSet Sankhya |
| `REFRESH_INTERVAL` | `30000` ms | Auto-refresh dos dados |
| `API_RETRY_COUNT` | `3` | Tentativas em caso de falha |
| `API_RETRY_DELAY` | `1000` ms | Delay base para backoff exponencial |
| `DEBOUNCE_DELAY` | `300` ms | Delay da busca por pallet |
| `PESO_PADRAO_PALLET` | `1000` KG | Peso pré-preenchido ao criar pallet |
| `MAX_SLOTS` | `14` | Slots máximos por caminhão no SVG |
| `TOAST_DURATION` | `3000` ms | Duração dos toasts |

### Mapeamentos de status

| Código DB | Label exibido | Cor |
|-----------|--------------|-----|
| `APR` | À PROCESSAR | `#60a5fa` (azul) |
| `EPR` | EM PROC. | `#ff8c1a` (laranja) |
| `FIN` | FINALIZADO | `#4ade80` (verde) |

---

## 🗃️ Tabelas Envolvidas

| Tabela | Operação | Descrição |
|--------|----------|-----------|
| `AD_ROMANEIOENTRMOVSALDO` | **READ / WRITE** | Movimentações por pallet (tabela principal) |
| `AD_ROMANEIOENTR` | **READ** | Cabeçalho do romaneio (JOIN para exibir ROMANEIO) |
| `TGFPRO` | **READ** | Produto (variedade — via JOIN para etiqueta) |
| `TGFGRU` | **READ** | Grupo do produto (`AD_DESCRESUMO` = variedade) |
| `TSIEMP` | **READ** | Empresa/produtor (RAZAOSOCIAL, CNPJ, NUMEND, TELEFONE) |
| `TSIEND` | **READ** | Logradouro do produtor |
| `TSICID` | **READ** | Cidade do produtor |
| `TSIUFS` | **READ** | UF do produtor |
| `TSIBAI` | **READ** | Bairro do produtor |

### Campos principais de `AD_ROMANEIOENTRMOVSALDO`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `NROUNICO` | NUMBER | FK para romaneio — chave composta |
| `SEQUENCIA` | NUMBER | Sequência do pallet — chave composta |
| `NROPALLET` | VARCHAR | Código do pallet (ex: `16425-001`) |
| `PESOPALLET` | NUMBER | Peso em KG do pallet |
| `TIPOPALLET` | VARCHAR | `MP` / `REF` / `PA` |
| `ETAPA` | VARCHAR | `REC` / `EMB` / `EXP` |
| `STATUS` | VARCHAR | `APR` / `EPR` / `FIN` |
| `ENTRADAKG` | NUMBER | KG de entrada do pallet |
| `SAIDAKG` | NUMBER | KG de saída — atualizado pela bipagem |
| `QTDPALLETSBAIXADOS` | NUMBER | Contador de baixas — atualizado pela bipagem |
| `DHMOVIMENTACAO` | DATE | Data/hora da última movimentação |
| `NUMPCAMINHAO` | NUMBER | Número do caminhão dentro do romaneio |
| `OBS` | VARCHAR | Observação livre |

---

## 🔄 Fluxo de Execução

```mermaid
flowchart TD
    A[Caminhão chega com romaneio] --> B[Operador abre o Dashboard]
    B --> C[Nova Movimentação: informa NROUNICO + caminhão]
    C --> D[Sistema gera NROPALLET automático]
    D --> E[JsBarcode gera Code 128 para etiqueta]
    E --> F[Impressão na Zebra ZD 220 — 108×80 mm]
    F --> G[Etiqueta fixada no pallet físico]
    G --> H[Pallet vai para o Tombador]
    H --> I[Operador abre Modo Bipagem — scanner USB]
    I --> J[Scanner lê código de barras do pallet]
    J --> K{NROPALLET encontrado?}
    K -- Não --> L[Erro: pallet não encontrado]
    K -- Sim --> M{STATUS já é FIN ou EPR?}
    M -- Sim --> N[Bloqueio: pallet já baixado]
    M -- Não --> O[API.bipar: STATUS=FIN, SAIDAKG+=PESOPALLET, QTDPALLETSBAIXADOS+=1]
    O --> P[Bloco do pallet some do caminhão SVG ✅]
    P --> I
    I --> Q[Todos os pallets bipados]
    Q --> R[Stat cards atualizados: Saldo MP recalculado]
    R --> S[Auto-refresh a cada 30s mantém dados sincronizados]

    style A fill:#0b5c39,color:#fff,stroke:#274135
    style Q fill:#a8c91d,color:#000,stroke:#274135
    style L fill:#dc3545,color:#fff,stroke:#c62828
    style N fill:#dc3545,color:#fff,stroke:#c62828
    style O fill:#0b8a44,color:#fff,stroke:#274135
    style P fill:#4ade80,color:#000,stroke:#274135
```

---

## 📊 Exemplo de Uso

### Cenário: Romaneio 16425 — 2 caminhões, 14 pallets cada

**Caminhão 1 — ao iniciar:**

| Seq | NROPALLET | Peso | Status |
|-----|-----------|------|--------|
| 1 | 16425-001 | 1000 KG | À Processar |
| 2 | 16425-002 | 1000 KG | À Processar |
| … | … | … | … |
| 14 | 16425-014 | 1000 KG | À Processar |

**Stat cards — após bipagem de 6 pallets:**

| Card | Valor |
|------|-------|
| Entrada Recepção | 14.000 KG |
| Saída Recepção | 6.000 KG |
| Saldo Matéria Prima | 8.000 KG |
| Pallets Processados | 6 PLTS |

**No caminhão SVG:** 6 slots exibem ícone ✅ verde (FIN), 8 slots mostram bloco azul (APR).

**Etiqueta impressa (108×80 mm):**
- Header: Logo Argo + CONTROLE DE RECEPÇÃO
- Dados do produtor (RAZAOSOCIAL, CNPJ, endereço, cidade/UF)
- Variedade, data de colheita
- Nº do pallet + peso
- Código de barras Code 128 (`16425-001`)

---

## 🚀 Deploy

### Pré-requisitos

- Sankhya ERP com acesso ao módulo JSP customizado
- Tabelas `AD_ROMANEIOENTRMOVSALDO` e `AD_ROMANEIOENTR` criadas no Oracle
- Campo `AD_CALIBRE` e demais campos customizados no Dicionário de Dados
- Impressora Zebra ZD 220 com bobina 108×80 mm configurada no Chrome

### Passos

1. **Upload dos arquivos no Sankhya**
   - Copiar a pasta `assets/` e o arquivo `primeiro_nivel.jsp` para o diretório customizado do Sankhya
   - Garantir que `${BASE_FOLDER}` aponta para o diretório correto

2. **Configurar a tela no Sankhya**
   - Criar aba customizada apontando para `primeiro_nivel.jsp`
   - Configurar permissões de acesso por perfil de usuário

3. **Configurar impressora Zebra**
   - No diálogo de impressão do Chrome: Tamanho = **108×80 mm**, Margens = **Mínima**, Escala = **100%**
   - Definir Zebra ZD 220 como impressora padrão no Windows

4. **Testar**
   - Abrir o dashboard e verificar os stat cards (deve mostrar `0 KG` se não houver movimentações do dia)
   - Criar uma nova movimentação e verificar geração do NROPALLET
   - Testar bipagem com scanner USB (envio de texto + Enter)
   - Imprimir etiqueta de teste e conferir layout na Zebra

---

## 📝 Observações

1. **Scanner USB como teclado:** O leitor Elgin Flash (e similares) funciona como dispositivo HID — envia o conteúdo do código de barras como texto + Enter. O modal de bipagem escuta o `keydown Enter` no input com `autofocus`.

2. **Etiqueta Zebra 108×80 mm:** O CSS usa `@page { size: 108mm 80mm; margin: 1mm }` com `page-break-after: always` por etiqueta. Fontes em 6.5 pt / 7.5 pt. Código de barras height=42px para caber sem quebrar.

3. **Retry com backoff exponencial:** Todas as chamadas à API Sankhya passam por `_fetchWithRetry` — 3 tentativas com delay de 1s, 2s, 4s antes de lançar erro.

4. **Sanitização XSS:** Todo dado externo (usuário ou API) é sanitizado via `Sanitizer.text()` / `Sanitizer.number()` antes de entrar no DOM ou ser gravado.

5. **NROPALLET auto-gerado:** Formato `{NROUNICO}-{SEQ_ZERO_PADDED}` — ex: `16425-003`. Sequência calculada com `COUNT(*) + 1` na tabela, por romaneio.

6. **Bipagem em lote:** A impressão de todas as etiquetas de um caminhão (`imprimirTodasEtiquetas`) pré-renderiza os SVGs no DOM oculto antes de abrir o popup, evitando bloqueio cross-origin do `document.write`.

7. **Auto-refresh:** O dashboard atualiza os dados a cada 30 segundos automaticamente. O botão de refresh manual anima o ícone de rotação enquanto carrega.

---

## 📜 Changelog

| Versão | Data | Tipo | Descrição |
|--------|------|------|-----------|
| 1.0.0 | 2026-04-01 | `feat` | Dashboard base: stat cards, sidebar, topbar, tema dark glassmorphism |
| 1.1.0 | 2026-04-10 | `feat` | Visualização de pallets por caminhão (grid 2D) |
| 2.0.0 | 2026-05-05 | `feat` | Caminhão SVG 3D com CSS Transforms e seleção por caminhão |
| 2.1.0 | 2026-05-10 | `feat` | Bipagem automática via scanner USB — baixa STATUS=FIN + SAIDAKG |
| 2.1.1 | 2026-05-10 | `fix` | STATUS corrigido de EPR para FIN na bipagem |
| 2.2.0 | 2026-05-11 | `feat` | Etiqueta CONTROLE DE RECEPÇÃO — Code 128 para Zebra ZD 220 108×80 mm |
| 2.2.1 | 2026-05-11 | `fix` | Impressão em lote: SVGs pré-renderizados no DOM (sem bloqueio cross-origin) |
| 2.3.0 | 2026-05-11 | `feat` | NROPALLET auto-gerado por romaneio no formato `{NROUNICO}-{001}` |
| 2.3.1 | 2026-05-11 | `refactor` | Segurança: DOMPurify, debounce 300ms, retry exponencial, magic numbers centralizados |
| 2.4.0 | 2026-05-12 | `refactor` | Remoção de campos obsoletos da tabela (SALDORECEPKG, QTDPALLETSMP, SALDOPALLETS, EMBALAGEMIKG, EMBALAGEMMEKG, REFUGOKG) |

---

## 👤 Autor

| | |
|---|---|
| **Desenvolvedor** | Natanael Lopes — Grupo Argo (Argo Fruta) |
| **Módulo** | Recepção / Tombador — Sankhya ERP |
| **Contato** | natanael.lopes@argofruta.com |

---

<p align="center">
  <img src="https://argofruta.com/wp-content/uploads/2021/05/Logo-text-green.png" width="80" alt="Argo Fruta">
  <br>
  <sub>Grupo Argo — Desenvolvimento ERP Sankhya</sub>
</p>
