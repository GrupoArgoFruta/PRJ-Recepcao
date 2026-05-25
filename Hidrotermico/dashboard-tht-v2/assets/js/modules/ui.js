/**
 * ui.js ← UI helpers
 */
const UI = {
    showToast(msg, type = 'info') {
        const c = document.getElementById('toastContainer'); if (!c) return;
        const t = document.createElement('div'); t.classList.add('toast');
        t.innerHTML = `<i class="fa-solid ${CONFIG.TOAST_ICONS[type]||CONFIG.TOAST_ICONS.info}" style="color:${CONFIG.TOAST_COLORS[type]||CONFIG.TOAST_COLORS.info};font-size:18px;"></i> ${Sanitizer.text(msg)}`;
        c.appendChild(t);
        setTimeout(() => { if (t.parentNode) t.remove(); }, CONFIG.TOAST_DURATION);
    },
    atualizarRelogio() {
        const el = document.getElementById('clock');
        if (el) el.innerText = new Date().toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' });
    },
    createParticles() {
        const c = document.getElementById('particles'); if (!c) return;
        for (let i = 0; i < 12; i++) {
            const p = document.createElement('div'); p.classList.add('particle');
            p.style.left = Math.random()*100+'%'; p.style.top = Math.random()*100+'%';
            p.style.width = (Math.random()*5+2)+'px'; p.style.height = p.style.width;
            p.style.animationDelay = Math.random()*6+'s'; p.style.animationDuration = (Math.random()*6+4)+'s';
            c.appendChild(p);
        }
    },
    toggleSidebar() { const s = document.getElementById('sidebar'); if (s) s.classList.toggle('open'); },
    toggleTheme() {
        Store.isDark = !Store.isDark;
        if (Store.isDark) { document.body.removeAttribute('data-theme'); localStorage.setItem('tht-theme','dark'); }
        else              { document.body.setAttribute('data-theme','light'); localStorage.setItem('tht-theme','light'); }
        const i = document.querySelector('.theme-toggle i');
        if (i) i.className = Store.isDark ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
        this.showToast(Store.isDark ? '🌙 Modo escuro' : '☀️ Modo claro', 'info');
    },
    restoreTheme() {
        if (localStorage.getItem('tht-theme') === 'light') {
            Store.isDark = false; document.body.setAttribute('data-theme','light');
            const i = document.querySelector('.theme-toggle i'); if (i) i.className = 'fa-solid fa-sun';
        }
    },
    animateCounter(id, target) {
        const el = document.getElementById(id); if (!el) return;
        const cur = parseInt(el.textContent) || 0; if (cur === target) { el.textContent = target; return; }
        const start = performance.now(), dur = 400;
        const step = (now) => { const p = Math.min((now-start)/dur,1); el.textContent = Math.round(cur+(target-cur)*(1-Math.pow(1-p,3))); if (p<1) requestAnimationFrame(step); };
        requestAnimationFrame(step);
    },
    celebrate() {
        if (typeof confetti === 'function') confetti({ particleCount:80, spread:60, origin:{y:0.7}, colors:['#a8c91d','#0b5c39','#ff8c1a','#4ade80'] });
    }
};
window.UI = UI;
