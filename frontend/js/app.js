// frontend/js/app.js — improved version

// DOM helpers
const form = document.getElementById('reportForm');
const photoInput = document.getElementById('photoInput');
const preview = document.getElementById('preview');
const submitBtn = document.getElementById('submitBtn');
const msgEl = document.getElementById('message'); // optional message element in new index.html

// API base (works if page is served by backend)
const API_BASE = window.location.origin;
const API_COMPLAINTS = `${API_BASE}/api/complaints`;

// helper: show small status message
function showMessage(text, isError = false) {
  if (!msgEl) {
    // fallback to alert for older pages
    if (isError) console.error(text);
    else console.log(text);
    return;
  }
  msgEl.textContent = text;
  msgEl.style.color = isError ? '#b00' : 'green';
}

// render user bar if present and set createdBy input from localStorage
function applySignedInUser() {
  const raw = localStorage.getItem('dr_user');
  if (!raw) return;
  try {
    const u = JSON.parse(raw);
    // fill createdBy input if empty
    const createdByInput = document.getElementById('createdByInput') || form.elements['createdBy'];
    if (createdByInput && (!createdByInput.value || createdByInput.value === '')) {
      createdByInput.value = u.id || u.name || u.email || '';
    }
  } catch (e) {
    console.warn('Invalid dr_user in localStorage', e);
  }
}

// image preview (revoke old objectURL)
let currentObjectURL = null;
photoInput.addEventListener('change', () => {
  preview.innerHTML = '';
  if (currentObjectURL) {
    URL.revokeObjectURL(currentObjectURL);
    currentObjectURL = null;
  }
  const f = photoInput.files && photoInput.files[0];
  if (!f) return;
  const img = document.createElement('img');
  img.style.maxWidth = '200px';
  currentObjectURL = URL.createObjectURL(f);
  img.src = currentObjectURL;
  preview.appendChild(img);
});

// use geolocation
document.getElementById('useLocation').addEventListener('click', (ev) => {
  ev.preventDefault();
  if (!navigator.geolocation) {
    return alert('Geolocation not supported by this browser');
  }
  showMessage('Getting location…');
  navigator.geolocation.getCurrentPosition(pos => {
    // form.latitude and form.longitude refer to inputs by name if present
    if (form.latitude) form.latitude.value = pos.coords.latitude;
    if (form.longitude) form.longitude.value = pos.coords.longitude;
    showMessage('Location captured: ' + pos.coords.latitude.toFixed(4) + ', ' + pos.coords.longitude.toFixed(4), false);
  }, err => {
    showMessage('Unable to get location: ' + (err.message || err), true);
  }, { enableHighAccuracy: true, timeout: 10000 });
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  // ensure createdBy gets set from localStorage if empty (optional)
  const raw = localStorage.getItem('dr_user');
  if (raw) {
    try {
      const u = JSON.parse(raw);
      const createdByInput = document.getElementById('createdByInput') || form.elements['createdBy'];
      if (createdByInput && (!createdByInput.value || createdByInput.value === '')) {
        createdByInput.value = u.id || u.name || u.email || '';
      }
    } catch {}
  }

  const data = new FormData(form);

  if (submitBtn) submitBtn.disabled = true;
  showMessage('Submitting — please wait...');

  try {
    const res = await fetch(API_COMPLAINTS, {
      method: 'POST',
      body: data,
      credentials: 'include'   // << IMPORTANT for session auth
    });

    // grab text first for easier debugging, then parse if JSON
    const rawText = await res.text();
    let json;
    try { json = JSON.parse(rawText || '{}'); } catch { json = { message: rawText }; }

    if (res.status === 401) {
      showMessage('You are not signed in. Please sign in first.', true);
      alert('Please login first.');
      window.location.href = '/login.html';
      return;
    }
    if (!res.ok) {
      const errMsg = json && (json.message || json.error) ? (json.message || json.error) : `Server returned ${res.status}`;
      throw new Error(errMsg);
    }

    showMessage('Complaint submitted successfully');
    form.reset();
    preview.innerHTML = '';

    // go to "My Reports" so they see their complaint
    setTimeout(() => {
      window.location.href = '/mycomplaints.html';
    }, 700);

  } catch (err) {
    console.error('Submit failed', err);
    showMessage('Submit failed: ' + (err.message || err), true);
    alert('Submit failed: ' + (err.message || err));
  } finally {
    if (submitBtn) submitBtn.disabled = false;
  }
});
// nav render + mobile toggle
(function(){
  const nav = document.getElementById('userActions');
  const toggle = document.getElementById('navToggle');

  function renderForSignedIn(u){
    nav.innerHTML = '';
    const my = document.createElement('a'); my.href = '/mycomplaints.html'; my.textContent = 'My Complaints';
    my.className = 'btn primary-nav';
    nav.appendChild(my);

    const rep = document.createElement('a'); rep.href = '/index.html'; rep.textContent = 'Report';
    rep.className = 'btn secondary-nav';
    nav.appendChild(rep);

    const out = document.createElement('button'); out.textContent = 'Sign out'; out.className = 'btn signout';
    out.addEventListener('click', async () => {
      try { await fetch('/logout', { method: 'POST', credentials: 'include' }); } catch(e){}
      localStorage.removeItem('dr_user');
      document.body.classList.remove('nav-open');
      window.location.href = '/login.html';
    });
    nav.appendChild(out);
  }

  function renderForSignedOut(){
    nav.innerHTML = '';
    const sIn = document.createElement('a'); sIn.href='/login.html'; sIn.textContent='Sign in'; sIn.className='btn primary-nav';
    const sUp = document.createElement('a'); sUp.href='/signup.html'; sUp.textContent='Sign up'; sUp.className='btn secondary-nav';
    nav.appendChild(sIn); nav.appendChild(sUp);
  }

  // initial render
  let raw = null;
  try { raw = localStorage.getItem('dr_user'); } catch(e){ raw = null; }
  if (raw) {
    try {
      const u = JSON.parse(raw);
      if (u && (u.id || u.email)) renderForSignedIn(u); else renderForSignedOut();
    } catch(e){ renderForSignedOut(); }
  } else {
    renderForSignedOut();
  }

  // burger toggle
  if (toggle) {
    toggle.addEventListener('click', () => {
      const open = document.body.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    // close menu if clicking outside
    document.addEventListener('click', (ev) => {
      if (!document.body.classList.contains('nav-open')) return;
      if (!nav.contains(ev.target) && !toggle.contains(ev.target)) {
        document.body.classList.remove('nav-open');
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 760 && document.body.classList.contains('nav-open')) {
        document.body.classList.remove('nav-open');
      }
    });
  }
})();
// burger toggle
(function(){
  const toggle = document.getElementById('navToggle');
  const nav = document.getElementById('userActions');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    const open = document.body.classList.toggle('nav-open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  // close when clicking outside
  document.addEventListener('click', (ev) => {
    if (!document.body.classList.contains('nav-open')) return;
    if (!nav.contains(ev.target) && !toggle.contains(ev.target)) {
      document.body.classList.remove('nav-open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });

  // close on resize to desktop (optional)
  window.addEventListener('resize', () => {
    if (window.innerWidth > 760 && document.body.classList.contains('nav-open')) {
      document.body.classList.remove('nav-open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
})();
