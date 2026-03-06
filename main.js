// ═══════════════════════════════════════
//  main.js — Discord OAuth Only
// ═══════════════════════════════════════

window.addEventListener('DOMContentLoaded', () => {
  handleDiscordCallback();
});

// ─────────────────────────────
//  DISCORD — Implicit Flow
// ─────────────────────────────
function loginWithDiscord() {
  const params = new URLSearchParams({
    client_id: CONFIG.discord.clientId,
    redirect_uri: CONFIG.discord.redirectUri,
    response_type: 'token',
    scope: CONFIG.discord.scope
  });
  window.location.href = `https://discord.com/api/oauth2/authorize?${params}`;
}

async function handleDiscordCallback() {
  const hash = window.location.hash;
  if (!hash.includes('access_token')) return;
  
  const params = new URLSearchParams(hash.slice(1));
  const token = params.get('access_token');
  
  // ล้าง hash ออกจาก URL
  history.replaceState(null, '', window.location.pathname);
  
  if (!token) return;
  
  toast('⏳ กำลังตรวจสอบ...', 'ok');
  
  try {
    const res = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const user = await res.json();
    
    if (!user.id) throw new Error('ดึงข้อมูล Discord ไม่สำเร็จ');
    
    if (CONFIG.whitelist.includes(user.id)) {
      toast(`✅ ยินดีต้อนรับ ${user.username}!`, 'ok');
      setTimeout(() => {
        window.location.href = CONFIG.redirectTo;
      }, 1200);
    } else {
      toast(`⛔ ${user.username} ไม่อยู่ใน Whitelist`, 'err');
    }
    
  } catch (e) {
    toast('❌ ' + (e.message || 'เกิดข้อผิดพลาด'), 'err');
  }
}

// ─────────────────────────────
//  Toast
// ─────────────────────────────
let toastTimer;

function toast(msg, type) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = (type || 'ok') + ' show';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 3500);
}