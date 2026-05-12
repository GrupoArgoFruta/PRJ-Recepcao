/**
 * ============================================================
 * MOVIMENTAÇÃO DE SALDOS - DASHBOARD JS (INTEGRAÇÃO REAL)
 * Tabela: AD_ROMANEIOENTRMOVSALDO
 * API:  ← Todas as chamadas à API Sankhya (CRUD)
 * ============================================================
 */

/**
 * ============================================================
 * MÓDULO DE API - Todas as chamadas ao Sankhya
 * ============================================================
 */

const API = {
    
    /**
     * Busca resumo agregado por romaneio
     */

 /**
     * Retry automático com backoff exponencial
     */
    async _fetchWithRetry(url, options, retries = CONFIG.API_RETRY_COUNT) {
        for (let i = 0; i < retries; i++) {
            try {
                const response = await fetch(url, options);
                
                if (!response.ok && i < retries - 1) {
                    throw new Error(`HTTP ${response.status}`);
                }
                
                return response;
            } catch (err) {
                if (i === retries - 1) throw err;

                const delay = CONFIG.API_RETRY_DELAY * Math.pow(2, i);
                console.warn(`🔄 Retry ${i + 1}/${retries} em ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    },

    async fetchResumo(filtros = {}) {
        let whereClause;
        if (filtros.nroUnico) {
            whereClause = `WHERE MOV.NROUNICO = ${parseInt(filtros.nroUnico) || 0}`;
        } else if (filtros.dataInicio || filtros.dataFim) {
            const di = (filtros.dataInicio || filtros.dataFim).replace(/[^0-9\-]/g, '');
            const df = (filtros.dataFim   || filtros.dataInicio).replace(/[^0-9\-]/g, '');
            whereClause = `WHERE TRUNC(ENT.DTENTRADA) BETWEEN TO_DATE('${di}', 'YYYY-MM-DD') AND TO_DATE('${df}', 'YYYY-MM-DD')`;
        } else {
            whereClause = `WHERE (MOV.DHMOVIMENTACAO >= TRUNC(SYSDATE) OR MOV.DHMOVIMENTACAO IS NULL)`;
        }

        const query = `
            SELECT
                MOV.NROUNICO,
                ENT.ROMANEIO,
                MOV.ETAPA,
                MOV.STATUS,
                SUM(NVL(MOV.ENTRADAKG, 0)) AS TOTAL_ENTRADA,
                SUM(NVL(MOV.SAIDAKG, 0)) AS TOTAL_SAIDA,
                SUM(NVL(MOV.ENTRADAKG, 0)) - SUM(NVL(MOV.SAIDAKG, 0)) AS SALDO,
                SUM(NVL(MOV.QTDPALLETSBAIXADOS, 0)) AS TOTAL_BAIXADOS
            FROM AD_ROMANEIOENTRMOVSALDO MOV
            INNER JOIN AD_ROMANEIOENTR ENT ON MOV.NROUNICO = ENT.NROUNICO
            ${whereClause}
            GROUP BY MOV.NROUNICO, ENT.ROMANEIO, MOV.ETAPA, MOV.STATUS
            ORDER BY MOV.NROUNICO DESC
        `;
        
        return new Promise((resolve, reject) => {
            executeQuery(query, [], 
                (retorno) => resolve(JSON.parse(retorno || '[]')),
                (erro) => reject(erro)
            );
        });
    },
    
    /**
     * Busca todos os pallets detalhados
     */
    async fetchPallets(filtros = {}) {
        let whereClause;
        if (filtros.nroUnico) {
            whereClause = `WHERE MOV.NROUNICO = ${parseInt(filtros.nroUnico) || 0}`;
        } else if (filtros.dataInicio || filtros.dataFim) {
            const di = (filtros.dataInicio || filtros.dataFim).replace(/[^0-9\-]/g, '');
            const df = (filtros.dataFim   || filtros.dataInicio).replace(/[^0-9\-]/g, '');
            whereClause = `WHERE MOV.NROUNICO IN (
                SELECT NROUNICO FROM AD_ROMANEIOENTR
                WHERE TRUNC(DTENTRADA) BETWEEN TO_DATE('${di}', 'YYYY-MM-DD') AND TO_DATE('${df}', 'YYYY-MM-DD')
            )`;
        } else {
            whereClause = `WHERE (MOV.DHMOVIMENTACAO >= TRUNC(SYSDATE) OR MOV.DHMOVIMENTACAO IS NULL)`;
        }

        const query = `
            SELECT
                MOV.NROUNICO, MOV.SEQUENCIA, MOV.NROPALLET, MOV.PESOPALLET,
                MOV.TIPOPALLET, MOV.STATUS, MOV.ETAPA,
                MOV.ENTRADAKG, MOV.SAIDAKG, MOV.QTDPALLETSBAIXADOS, MOV.OBS,
                NVL(TO_CHAR(MOV.NUMPCAMINHAO), '-') AS NUMPCAMINHAO,
                TO_CHAR(MOV.DHMOVIMENTACAO, 'DD/MM HH24:MI') AS DH_MOV
            FROM AD_ROMANEIOENTRMOVSALDO MOV
            ${whereClause}
            ORDER BY MOV.NROUNICO DESC, MOV.NUMPCAMINHAO ASC, MOV.SEQUENCIA ASC
        `;
        
        return new Promise((resolve, reject) => {
            executeQuery(query, [],
                (retorno) => resolve(JSON.parse(retorno || '[]')),
                (erro) => reject(erro)
            );
        });
    },
    
    /**
     * Cria um novo registro
     */
    async create(data) {
        const fields = [
            "NROUNICO","ETAPA","STATUS","ENTRADAKG","SAIDAKG",
            "QTDPALLETSBAIXADOS","NROPALLET","PESOPALLET","TIPOPALLET","OBS","NUMPCAMINHAO"
        ];

        const values = {};
        fields.forEach((field, i) => {
            values[i] = Sanitizer.text(data[field] || "");
        });

        const body = {
            serviceName: "DatasetSP.save",
            requestBody: {
                entityName: CONFIG.ENTITY_NAME,
                standAlone: false,
                fields: fields,
                records: [{ values: values }]
            }
        };

        const response = await this._fetchWithRetry(
            `${window.location.origin}/mge/service.sbr?serviceName=DatasetSP.save&outputType=json`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            }
        );

        const json = await response.json();
        if (json.status !== "1") throw new Error(json.msg || "Erro ao criar registro");
        return json;
    },

    /**
     * Atualiza um registro existente
     */
    async update(nroUnico, sequencia, data) {
        const url = `${window.location.origin}/mge/service.sbr?serviceName=CRUDServiceProvider.saveRecord&outputType=json`;
        
        const localFields = {};
        Object.keys(data).forEach(key => {
            if (key !== 'NROUNICO' && key !== 'SEQUENCIA') {
                localFields[key] = { "$": data[key] || "" };
            }
        });
        
        const body = {
            requestBody: {
                dataSet: {
                    rootEntity: CONFIG.ENTITY_NAME,
                    includePresentationFields: "N",
                    dataRow: {
                        key: {
                            NROUNICO: { "$": nroUnico },
                            SEQUENCIA: { "$": sequencia }
                        },
                        localFields: localFields
                    },
                    entity: {
                        fieldset: {
                            list: Object.keys(localFields).join(",")
                        }
                    }
                }
            }
        };
        
        const response = await this._fetchWithRetry(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const result = await response.json();
        if (!result || result.status !== "1") throw new Error(result?.msg || "Erro ao atualizar");
        return result;
    },
    
    /**
     * Bipagem de pallet: baixa automática no saldo
     */
    async bipar(nroUnico, sequencia, pallet) {
        const peso         = parseFloat(pallet.PESOPALLET         || 0);
        const saidaAtual   = parseFloat(pallet.SAIDAKG            || 0);
        const baixadosAtual = parseInt(pallet.QTDPALLETSBAIXADOS  || 0);

        return this.update(nroUnico, sequencia, {
            STATUS:               'FIN',
            SAIDAKG:              String(saidaAtual + peso),
            QTDPALLETSBAIXADOS:   String(baixadosAtual + 1),
            DHMOVIMENTACAO:       this._formatDateBR()
        });
    },

    /**
     * Busca o próximo número de pallet global (sufixo máximo + 1)
     * Formato esperado de NROPALLET: "{NROUNICO}-{N}" ex: "16425-30"
     */
    /**
     * Busca cabeçalho do romaneio para imprimir na etiqueta
     * ATENÇÃO: campos marcados com (?) precisam confirmação do nome da coluna
     */
    async fetchCabecalhoRomaneio(nroUnico) {
        const query = `
            SELECT
                ENT.NROUNICO,
                ENT.ROMANEIO,
                TO_CHAR(ENT.DTCOLHEITA, 'DD/MM/YYYY')  AS DTCOLHEITA,
                TO_CHAR(ENT.DTENTRADA,  'DD/MM/YYYY')  AS DTENTRADA,
                OPTION_LABEL('AD_ROMANEIOENTR','TRATAMENTO', ENT.TRATAMENTO) AS MERCADO,
                ENT.UP,
                ENT.CODPARC,
                PAR.NOMEPARC,
                ENT.CODAREAP || ' - ' || NVL(AREAPCVW.VALVLOTE, '') AS AREA_VALVULA,
                GRU.AD_DESCRESUMO AS VARIEDADE,
                ENT.AD_QTD_CX_CONTENTORES AS QTD_CONTENTORES,
                CASE WHEN ENT.ORIGEMPESO = 1 THEN 'PESO ROÇA' ELSE 'CAIXA EMBALADA' END AS ORIGEMPESO,
                (SELECT SUM(NVL(MOV.ENTRADAKG, 0))
                 FROM AD_ROMANEIOENTRMOVSALDO MOV
                 WHERE MOV.NROUNICO = ENT.NROUNICO) AS TOTAL_PESO_LIQ
            FROM AD_ROMANEIOENTR ENT
            INNER JOIN TGFPAR      PAR      ON ENT.CODPARC       = PAR.CODPARC
            INNER JOIN TGFPRO      PRO      ON ENT.CODPROD        = PRO.CODPROD
            INNER JOIN TGFGRU      GRU      ON PRO.CODGRUPOPROD   = GRU.CODGRUPOPROD
            LEFT  JOIN AD_AREAPARCVW AREAPCVW ON ENT.CODAREAP    = AREAPCVW.CODAREA
            WHERE ENT.NROUNICO = ${parseInt(nroUnico) || 0}
        `;
        return new Promise((resolve) => {
            executeQuery(query, [],
                (retorno) => {
                    try { resolve(JSON.parse(retorno || '[]')[0] || {}); }
                    catch(e) { resolve({}); }
                },
                () => resolve({})
            );
        });
    },

    async fetchProximoNroPallet(nroUnico) {
        const query = `
            SELECT COUNT(*) + 1 AS PROXIMO
            FROM AD_ROMANEIOENTRMOVSALDO
            WHERE NROUNICO = ${parseInt(nroUnico) || 0}
        `;
        return new Promise((resolve) => {
            executeQuery(query, [],
                (retorno) => {
                    try {
                        const data = JSON.parse(retorno || '[]');
                        resolve(parseInt(data[0]?.PROXIMO || 1));
                    } catch(e) { resolve(1); }
                },
                () => resolve(1)
            );
        });
    },

    _formatDateBR() {
        const d = new Date();
        const p = n => String(n).padStart(2, '0');
        return `${p(d.getDate())}/${p(d.getMonth()+1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
    },

    /**
     * Remove um registro
     */
    async remove(nroUnico, sequencia) {
        const url = `${window.location.origin}/mge/service.sbr?serviceName=DatasetSP.removeRecord&outputType=json`;
        
        const body = {
            serviceName: "DatasetSP.removeRecord",
            requestBody: {
                dataSetID: CONFIG.DATA_SET_ID,
                entityName: CONFIG.ENTITY_NAME,
                standAlone: false,
                pks: [
                    {
                        NROUNICO: nroUnico,
                        SEQUENCIA: sequencia
                    }
                ]
            }
        };
        
        const response = await this._fetchWithRetry(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const json = await response.json();
        if (json.status !== "1") throw new Error(json.statusMessage || json.msg || "Erro ao excluir");
        return json;
    }
};

window.API = API;