/**
 * sanitizer.js ← Proteção XSS
 */
const Sanitizer = {
    clean(html) {
        if (typeof DOMPurify !== 'undefined')
            return DOMPurify.sanitize(html, { ALLOWED_TAGS: ['span','i','div','button','br','strong','b'], ALLOWED_ATTR: ['class','style','title','id'] });
        return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '').replace(/on\w+="[^"]*"/gi, '');
    },
    text(v) { if (!v) return ''; const d = document.createElement('div'); d.textContent = v; return d.innerHTML; },
    number(v, d = 0)  { const n = parseFloat(v); return isNaN(n) ? d : n; },
    integer(v, d = 0) { const n = parseInt(v, 10); return isNaN(n) ? d : n; }
};
window.Sanitizer = Sanitizer;
