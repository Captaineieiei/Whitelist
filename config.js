// ═══════════════════════════════════════
//  config.js — แก้ค่าในไฟล์นี้ไฟล์เดียว
// ═══════════════════════════════════════

const CONFIG = {

  // ── Discord OAuth ──────────────────────
  // discord.com/developers → Applications → OAuth2
  discord: {
    clientId: "1476489335221256314",   // ← ใส่ Client ID
    redirectUri: window.location.origin + window.location.pathname,
    scope: "identify email"
  },

  // ── Whitelist ──────────────────────────
  // เพิ่ม Discord User ID ของคนที่อนุมัติ
  whitelist: [
    // "123456789012345678",
    // "987654321098765432",
  ],

  // ── หลัง Login + ผ่าน Whitelist ────────
  redirectTo: "dashboard.html"

};
