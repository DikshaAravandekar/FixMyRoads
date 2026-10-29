// frontend/shared/nav.js
(function(){
  const navHtml = `
    <nav style="background:#fff;border-bottom:1px solid #eee;padding:10px 16px;display:flex;align-items:center;gap:10px">
      <a href="/index.html" style="font-weight:700;margin-right:6px">Damaged Roads</a>
      <a href="/public.html">Public</a>
      <a href="/mycomplaints.html" id="navMy">My Reports</a>
      <div style="margin-left:auto" id="navRight"></div>
    </nav>
  `;
  // inject at top of body
  document.addEventListener('DOMContentLoaded', () => {
    document.body.insertAdjacentHTML('afterbegin', navHtml);
    renderAuth();
  });

  function renderAuth(){
    const right = document.getElementById('navRight');
    right.innerHTML = '';
    const raw = localStorage.getItem('dr_user');
    const isAdmin = localStorage.getItem('dr_admin') === 'true';
    if (isAdmin) {
      right.innerHTML = `<a href="/admin.html" style="margin-right:12px">Admin</a><button id="adminLogout">Sign out</button>`;
      document.getElementById('adminLogout').addEventListener('click', () => {
        localStorage.removeItem('dr_admin');
        renderAuth();
        window.location.href = '/';
      });
      return;
    }
    if (!raw) {
      right.innerHTML = `<a href="/login.html" style="margin-right:12px">Sign in</a><a href="/signup.html">Sign up</a>`;
      return;
    }
    const u = JSON.parse(raw);
    right.innerHTML = `Signed in as <strong>${u.name || u.email || 'User'}</strong>
      <button id="logoutBtn" style="margin-left:10px">Sign out</button>`;
    document.getElementById('logoutBtn').addEventListener('click', () => {
      localStorage.removeItem('dr_user');
      renderAuth();
      window.location.href = '/';
    });
  }
})();
// === mobile nav toggle (required) ===
(function(){
  const toggle = document.getElementById('navToggle');
  const nav = document.getElementById('userActions');
  if (!toggle || !nav) {
    // one-time console hint for debugging
    console.warn('navToggle or userActions not found. header IDs must match HTML.');
    return;
  }

  // click the burger to open/close
  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const opened = document.body.classList.toggle('nav-open');
    toggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
  });

  // close when clicking outside menu
  document.addEventListener('click', (ev) => {
    if (!document.body.classList.contains('nav-open')) return;
    if (!nav.contains(ev.target) && !toggle.contains(ev.target)) {
      document.body.classList.remove('nav-open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });

  // close on ESC
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape' && document.body.classList.contains('nav-open')) {
      document.body.classList.remove('nav-open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });

  // close if user resizes to desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth > 760 && document.body.classList.contains('nav-open')) {
      document.body.classList.remove('nav-open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
})();
