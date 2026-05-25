/**
 * ============================================================
 * api.js ← THT Control - APENAS CONSULTAS (READ-ONLY)
 * Datas com segundos: DD/MM/YYYY HH24:MI:SS
 * ============================================================
 */

const API = {
    
    async query(sql) {
        console.log('📝 SQL:', sql.substring(0, 200));
        return new Promise((resolve, reject) => {
            if (typeof executeQuery === 'function') {
                executeQuery(sql, [],
                    (retorno) => {
                        try { resolve(JSON.parse(retorno || '[]')); }
                        catch(e) { resolve([]); }
                    },
                    (erro) => reject(erro)
                );
            } else {
                reject(new Error('executeQuery não disponível'));
            }
        });
    },

    // ============ CARDS RESUMO ============
    
    async fetchResumoCards(filtros = {}) {
        const w = this._whereMestre(filtros);
        return this.query(`
            SELECT 
                COUNT(*) AS TOTAL_HOJE,
                NVL(SUM((SELECT NVL(SUM(NVL(I.CONTENTORES,0)),0) FROM AD_HIDROITEM I WHERE I.NRUNICO = H.NRUNICO)),0) AS TOTAL_CONT
            FROM AD_HIDROTERMICO H 
            WHERE ${w}
        `);
    },

    // ============ GRID MESTRE (com data/hora/segundos) ============
    
    async fetchTratamentos(filtros = {}) {
        const w = this._whereMestre(filtros);
        return this.query(`
            SELECT 
                H.NRUNICO, 
                TO_CHAR(H.DTINCLUSAO, 'DD/MM/YYYY HH24:MI:SS') AS DTINCLUSAO,
                H.FISCALMAPA,
                H.FISCALUSDA,
                H.CODUSUINC,
                (SELECT COUNT(*) FROM AD_HIDROITEM I WHERE I.NRUNICO = H.NRUNICO) AS QTD_ITENS,
                (SELECT NVL(SUM(NVL(I.CONTENTORES,0)),0) FROM AD_HIDROITEM I WHERE I.NRUNICO = H.NRUNICO) AS TOTAL_CONT,
                NVL(USU.NOMEUSU, '—') AS CRIADO_POR
            FROM AD_HIDROTERMICO H 
            LEFT JOIN TSIUSU USU ON USU.CODUSU = H.CODUSUINC
            WHERE ${w} 
            ORDER BY H.NRUNICO DESC
        `);
    },

    // ============ ITENS (com data/hora/segundos) ============
    
    async fetchItens(nru) {
        return this.query(`
            SELECT 
                I.SEQUENCIA, I.NRUNICO,
                I.HORATRAIN AS HORATRAIN,
                I.HORATRAFIN AS HORATRAFIN,
                NVL(I.CONTENTORES, 0) AS CONTENTORES, 
                I.TANQUE, 
                I.IMCOMPLETO, 
                I.CODGRUPOPROD,
                NVL(GRU.AD_DESCRESUMO, '—') AS VARIEDADE,
                NVL(I.POLPA, 0) AS POLPA, 
                I.GAIOLA, 
                I.MERCADO, 
                NVL(I.GAIOLAS, 0) AS GAIOLAS, 
                I.TEMPO
            FROM AD_HIDROITEM I
            LEFT JOIN TGFGRU GRU ON GRU.CODGRUPOPROD = I.CODGRUPOPROD
            WHERE I.NRUNICO = ${Sanitizer.integer(nru)}
            ORDER BY I.SEQUENCIA ASC
        `);
    },

    // ============ HELPERS ============
    
    _whereMestre(f, a = 'H') {
        let w = '1=1';
        if (f.dataInicio) {
            w += ` AND TRUNC(${a}.DTINCLUSAO) >= TO_DATE('${f.dataInicio}', 'YYYY-MM-DD')`;
        }
        if (f.dataFim) {
            w += ` AND TRUNC(${a}.DTINCLUSAO) <= TO_DATE('${f.dataFim}', 'YYYY-MM-DD')`;
        }
        if (f.mercado) {
            w += ` AND EXISTS (SELECT 1 FROM AD_HIDROITEM I WHERE I.NRUNICO = ${a}.NRUNICO AND I.MERCADO = '${Sanitizer.text(f.mercado)}')`;
        }
        return w;
    }
};

window.API = API;