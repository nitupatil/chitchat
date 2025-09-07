/* app.js - shared utilities for ChitChat frontend */
const API_URL = 'https://script.google.com/macros/s/AKfycbys9SnHnFMBM03hDBdivBVMk0a7hwyNVlCBpOHxcShFvgwbnTcUUI32ZYQKYlyPW2ympQ/exec';
const DEFAULT_RADIUS_KM = 50;

async function api(action, payload = {}) {
  const body = { action, payload };
  const resp = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return resp.json();
}

/* Auth helpers: store minimal session in localStorage */
function saveSession(obj) {
  localStorage.setItem('chitchat_session', JSON.stringify(obj));
}
function loadSession() {
  const s = localStorage.getItem('chitchat_session');
  return s ? JSON.parse(s) : null;
}
function clearSession() { localStorage.removeItem('chitchat_session'); }

/* Location - try browser geolocation, fallback: use Nominatim reverse geocode for address */
function getCurrentPositionPromise() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error('Geolocation not supported'));
    navigator.geolocation.getCurrentPosition(pos => resolve(pos.coords), err => reject(err));
  });
}

async function resolveLocationName(lat, lon) {
  try {
    // OpenStreetMap Nominatim reverse geocoding (no key; usage should be respectful)
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`;
    const r = await fetch(url, { headers: { 'Accept-Language': 'en' }});
    if (!r.ok) return null;
    const j = await r.json();
    return (j.address && (j.address.city || j.address.town || j.address.village || j.address.state)) || j.display_name || null;
  } catch (e) { return null; }
}

/* Image helper - read file to base64 string */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const data = reader.result.split(',')[1]; // remove data:...base64,
      resolve(data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/* UI: show simple toast */
function toast(msg) {
  const el = document.createElement('div');
  el.textContent = msg;
  el.style.position = 'fixed';
  el.style.left = '50%';
  el.style.bottom = '24px';
  el.style.transform = 'translateX(-50%)';
  el.style.background = 'rgba(0,0,0,0.75)';
  el.style.color = 'white';
  el.style.padding = '10px 14px';
  el.style.borderRadius = '8px';
  el.style.zIndex = 9999;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}
