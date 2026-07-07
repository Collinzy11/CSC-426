/* =========================================================
   IRO — shared frontend behaviour
   Mobile nav, dark/light mode, toasts, modal helper
   ========================================================= */

(function(){
  // ---- Mobile nav toggle ----
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  if(hamburger && navLinks){
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      navLinks.classList.toggle('open');
    });
    // close menu after a link is tapped (mobile)
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        hamburger.classList.remove('open');
        navLinks.classList.remove('open');
      });
    });
  }

  // ---- Dark / light mode ----
  const THEME_KEY = 'iro-theme';
  const themeToggle = document.getElementById('themeToggle');
  const root = document.documentElement;

  function applyTheme(theme){
    root.setAttribute('data-theme', theme);
    if(themeToggle){
      const icon = themeToggle.querySelector('i');
      if(icon){
        icon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
      }
    }
  }
  const savedTheme = localStorage.getItem(THEME_KEY) ||
    (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  applyTheme(savedTheme);

  if(themeToggle){
    themeToggle.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      localStorage.setItem(THEME_KEY, next);
      applyTheme(next);
    });
  }

  // ---- Footer year ----
  document.querySelectorAll('[data-year]').forEach(el => {
    el.textContent = new Date().getFullYear();
  });

  // ---- Active nav link highlighting ----
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a[data-page]').forEach(a => {
    if(a.getAttribute('data-page') === path){
      a.classList.add('active');
    }
  });
})();

/* =========================================================
   Toast notifications — window.IRO.toast(message, type)
   ========================================================= */
window.IRO = window.IRO || {};

IRO.toast = function(message, type = 'success', duration = 4000){
  let stack = document.getElementById('toast-stack');
  if(!stack){
    stack = document.createElement('div');
    stack.id = 'toast-stack';
    document.body.appendChild(stack);
  }
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icon = type === 'success' ? 'fa-circle-check' : type === 'error' ? 'fa-circle-exclamation' : 'fa-circle-info';
  toast.innerHTML = `<i class="fa-solid ${icon}"></i><span>${message}</span>`;
  stack.appendChild(toast);
  setTimeout(() => {
    toast.style.transition = 'opacity .25s ease, transform .25s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(30px)';
    setTimeout(() => toast.remove(), 250);
  }, duration);
};

/* =========================================================
   Modal helper — window.IRO.openModal(id) / closeModal(id)
   ========================================================= */
IRO.openModal = function(id){
  const overlay = document.getElementById(id);
  if(overlay) overlay.classList.add('open');
};
IRO.closeModal = function(id){
  const overlay = document.getElementById(id);
  if(overlay) overlay.classList.remove('open');
};

// Close modal on overlay click or [data-close-modal]
document.addEventListener('click', (e) => {
  if(e.target.classList && e.target.classList.contains('modal-overlay')){
    e.target.classList.remove('open');
  }
  const closeBtn = e.target.closest('[data-close-modal]');
  if(closeBtn){
    const overlay = closeBtn.closest('.modal-overlay');
    if(overlay) overlay.classList.remove('open');
  }
});
document.addEventListener('keydown', (e) => {
  if(e.key === 'Escape'){
    document.querySelectorAll('.modal-overlay.open').forEach(o => o.classList.remove('open'));
  }
});

/* =========================================================
   Shared helpers
   ========================================================= */

// Generate a ticket-style report ID: IRO-YYYY-###
IRO.generateReportId = function(){
  const year = new Date().getFullYear();
  const existing = JSON.parse(localStorage.getItem('iro-reports') || '[]');
  const seq = String(existing.length + 1).padStart(3, '0');
  return `IRO-${year}-${seq}`;
};

// Persist a report to localStorage (frontend-only "database")
IRO.saveReport = function(report){
  const existing = JSON.parse(localStorage.getItem('iro-reports') || '[]');
  existing.push(report);
  localStorage.setItem('iro-reports', JSON.stringify(existing));
};

IRO.getReports = function(){
  return JSON.parse(localStorage.getItem('iro-reports') || '[]');
};

IRO.formatDate = function(d){
  return new Date(d).toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' });
};
