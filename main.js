// ข้อมูลตัวอย่าง (ในชีวิตจริงควร fetch จาก API / SheetDB)
let keys = [
  { key: "LUASYNC-ABCD1234-EFGH56", created: "2026-01-15", expires: "2026-03-09", status: "Active" },
  { key: "LUASYNC-XYZ78901-234567", created: "2026-02-01", expires: "2026-03-01", status: "Expired" },
  { key: "LUASYNC-KLMN9012-345678", created: "2026-02-05", expires: "2026-04-05", status: "Active" }
];

const tableBody = document.getElementById("key-table-body");
const totalBuyersEl = document.getElementById("total-buyers");
const expiresInfoEl = document.getElementById("expires-info");
const generateBtn = document.getElementById("generate-btn");

// อัพเดท stats
function updateStats() {
  const active = keys.filter(k => k.status === "Active").length;
  totalBuyersEl.textContent = keys.length;
  expiresInfoEl.textContent = active > 0 ? "in a month" : "No active keys";
}

// Render ตาราง
function renderKeys() {
  tableBody.innerHTML = "";
  keys.forEach((item, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.key}</td>
      <td>${item.created}</td>
      <td>${item.expires}</td>
      <td class="\( {item.status.toLowerCase()}"> \){item.status}</td>
      <td>
        <button class="btn danger small" onclick="deleteKey(${index})">Delete</button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

// สร้าง Key ใหม่
generateBtn.addEventListener("click", () => {
  const randomPart1 = Math.random().toString(36).substring(2, 10).toUpperCase();
  const randomPart2 = Math.random().toString(36).substring(2, 8).toUpperCase();
  const newKey = `LUASYNC-\( {randomPart1}- \){randomPart2}`;
  
  const today = new Date().toISOString().split('T')[0];
  const expireDate = new Date();
  expireDate.setMonth(expireDate.getMonth() + 1);
  const expireStr = expireDate.toISOString().split('T')[0];
  
  keys.push({
    key: newKey,
    created: today,
    expires: expireStr,
    status: "Active"
  });
  
  renderKeys();
  updateStats();
  alert(`สร้าง Key ใหม่: ${newKey}\nหมดอายุ: ${expireStr}`);
});

// ลบ Key
window.deleteKey = function(index) {
  if (confirm("แน่ใจว่าจะลบ Key นี้?")) {
    keys.splice(index, 1);
    renderKeys();
    updateStats();
  }
};

// โหลดครั้งแรก
renderKeys();
updateStats();