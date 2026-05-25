const CONFIG = {
    REFRESH_INTERVAL: 30000,
    API_RETRY_COUNT: 3,
    API_RETRY_DELAY: 1000,
    PAGE_SIZE: 15,
    PAGE_SIZES: [10, 15, 25, 50],
    TOAST_DURATION: 3500,

    MERCADOS: {
        'ARG': 'Argentina', 'ZAF': 'África do Sul', 'CHL': 'Chile',
        'KOR': 'Coreia', 'URY': 'Uruguai', 'USA': 'Estados Unidos', 'MER': 'Mercosul'
    },
    MERCADO_DEFAULT: 'MER',

    TOAST_ICONS: { success:'fa-circle-check', error:'fa-circle-xmark', info:'fa-circle-info', warning:'fa-triangle-exclamation' },
    TOAST_COLORS: { success:'#4ade80', error:'#f87171', info:'#60a5fa', warning:'#ff8c1a' }
};
window.CONFIG = CONFIG;