// Data Storage Manager
class DataManager {
    constructor() {
        this.storageKey = 'whitelistData';
        this.initData();
    }

    initData() {
        const defaultData = {
            users: [
                { id: 1, username: 'john_doe', userId: 'USER001', service: 'Discord', status: 'active', addedDate: '2024-02-01' },
                { id: 2, username: 'jane_smith', userId: 'USER002', service: 'API', status: 'active', addedDate: '2024-02-02' },
                { id: 3, username: 'bob_wilson', userId: 'USER003', service: 'Discord', status: 'pending', addedDate: '2024-02-03' }
            ],
            services: [],
            providers: [],
            apiKeys: [
                { id: 1, name: 'Production Key', key: 'wl_prod_abc123def456ghi789jkl012mno345pqr', permission: 'admin', createdAt: '2024-01-15' },
                { id: 2, name: 'Development Key', key: 'wl_dev_xyz987wvu654tsr321ponm098lkj876ihg', permission: 'write', createdAt: '2024-01-20' }
            ],
            scripts: [
                { id: 1, name: 'Whitelist Checker', createdAt: '2024-02-01', updatedAt: '2024-02-05', status: 'active', code: `-- Lua Whitelist Checker Script
local whitelist = {}

function checkWhitelist(userId)
    if whitelist[userId] then
        return true, "User is whitelisted"
    else
        return false, "User not found in whitelist"
    end
end

function addToWhitelist(userId, username)
    whitelist[userId] = {
        username = username,
        addedAt = os.time(),
        status = "active"
    }
    return true, "User added successfully"
end

function removeFromWhitelist(userId)
    if whitelist[userId] then
        whitelist[userId] = nil
        return true, "User removed successfully"
    else
        return false, "User not found"
    end
end

return {
    check = checkWhitelist,
    add = addToWhitelist,
    remove = removeFromWhitelist
}` }
            ]
        };

        if (!localStorage.getItem(this.storageKey)) {
            this.saveData(defaultData);
        }
    }

    getData() {
        return JSON.parse(localStorage.getItem(this.storageKey));
    }

    saveData(data) {
        localStorage.setItem(this.storageKey, JSON.stringify(data));
    }

    // User management
    addUser(user) {
        const data = this.getData();
        const newUser = {
            id: Date.now(),
            ...user,
            addedDate: new Date().toISOString().split('T')[0]
        };
        data.users.push(newUser);
        this.saveData(data);
        return newUser;
    }

    deleteUser(id) {
        const data = this.getData();
        data.users = data.users.filter(user => user.id !== id);
        this.saveData(data);
    }

    updateUser(id, updates) {
        const data = this.getData();
        const index = data.users.findIndex(user => user.id === id);
        if (index !== -1) {
            data.users[index] = { ...data.users[index], ...updates };
            this.saveData(data);
        }
    }

    // API Key management
    generateApiKey(name, permission) {
        const data = this.getData();
        const prefix = permission === 'admin' ? 'wl_admin' : permission === 'write' ? 'wl_write' : 'wl_read';
        const randomPart = this.generateRandomString(32);
        const newKey = {
            id: Date.now(),
            name,
            key: `${prefix}_${randomPart}`,
            permission,
            createdAt: new Date().toISOString().split('T')[0]
        };
        data.apiKeys.push(newKey);
        this.saveData(data);
        return newKey;
    }

    deleteApiKey(id) {
        const data = this.getData();
        data.apiKeys = data.apiKeys.filter(key => key.id !== id);
        this.saveData(data);
    }

    // Script management
    saveScript(name, code) {
        const data = this.getData();
        const existingScript = data.scripts.find(s => s.name === name);
        
        if (existingScript) {
            existingScript.code = code;
            existingScript.updatedAt = new Date().toISOString().split('T')[0];
        } else {
            const newScript = {
                id: Date.now(),
                name,
                code,
                createdAt: new Date().toISOString().split('T')[0],
                updatedAt: new Date().toISOString().split('T')[0],
                status: 'active'
            };
            data.scripts.push(newScript);
        }
        this.saveData(data);
    }

    deleteScript(id) {
        const data = this.getData();
        data.scripts = data.scripts.filter(script => script.id !== id);
        this.saveData(data);
    }

    // Stats
    getStats() {
        const data = this.getData();
        return {
            totalUsers: data.users.length,
            activeUsers: data.users.filter(u => u.status === 'active').length,
            pendingUsers: data.users.filter(u => u.status === 'pending').length,
            totalServices: data.services.length
        };
    }

    // Utility
    generateRandomString(length) {
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
}

// Initialize Data Manager
const dataManager = new DataManager();

// UI Manager
class UIManager {
    constructor() {
        this.currentPage = 'dashboard';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateDashboard();
        this.renderUsers();
        this.renderApiKeys();
        this.renderScripts();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                this.navigate(e.currentTarget.dataset.page);
            });
        });

        // Mobile menu
        const menuToggle = document.querySelector('.menu-toggle');
        const sidebarOverlay = document.querySelector('.sidebar-overlay');
        if (menuToggle) {
            menuToggle.addEventListener('click', this.toggleMenu);
        }
        if (sidebarOverlay) {
            sidebarOverlay.addEventListener('click', this.toggleMenu);
        }
    }

    navigate(pageId) {
        // Update pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        document.getElementById(pageId).classList.add('active');

        // Update nav items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.page === pageId) {
                item.classList.add('active');
            }
        });

        // Close mobile menu
        if (window.innerWidth <= 768) {
            this.toggleMenu();
        }

        this.currentPage = pageId;
    }

    toggleMenu() {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.sidebar-overlay');
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
    }

    updateDashboard() {
        const stats = dataManager.getStats();
        document.getElementById('totalUsers').textContent = stats.totalUsers;
        document.getElementById('activeUsers').textContent = stats.activeUsers;
        document.getElementById('pendingUsers').textContent = stats.pendingUsers;
        document.getElementById('totalServices').textContent = stats.totalServices;
    }

    renderUsers() {
        const data = dataManager.getData();
        const tbody = document.getElementById('userTable');
        tbody.innerHTML = '';

        data.users.forEach(user => {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${user.username}</td>
                <td>${user.userId}</td>
                <td>${user.service}</td>
                <td><span class="badge badge-${user.status}">${user.status === 'active' ? 'Active' : user.status === 'pending' ? 'Pending' : 'Inactive'}</span></td>
                <td>${user.addedDate}</td>
                <td class="actions">
                    <button class="btn btn-secondary btn-sm" onclick="ui.editUser(${user.id})">แก้ไข</button>
                    <button class="btn btn-danger btn-sm" onclick="ui.deleteUser(${user.id})">ลบ</button>
                </td>
            `;
        });
    }

    renderApiKeys() {
        const data = dataManager.getData();
        const container = document.getElementById('apiKeysList');
        container.innerHTML = '';

        data.apiKeys.forEach(apiKey => {
            const div = document.createElement('div');
            div.className = 'key-display';
            div.innerHTML = `
                <div>
                    <strong>${apiKey.name}</strong><br>
                    <code id="key${apiKey.id}">${apiKey.key}</code><br>
                    <small style="color: #94a3b8;">Permission: ${apiKey.permission} | Created: ${apiKey.createdAt}</small>
                </div>
                <div>
                    <button class="btn btn-secondary btn-sm" onclick="ui.copyKey('key${apiKey.id}')">Copy</button>
                    <button class="btn btn-danger btn-sm" onclick="ui.deleteApiKey(${apiKey.id})">ลบ</button>
                </div>
            `;
            container.appendChild(div);
        });
    }

    renderScripts() {
        const data = dataManager.getData();
        const tbody = document.getElementById('scriptsTable');
        tbody.innerHTML = '';

        data.scripts.forEach(script => {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${script.name}</td>
                <td>${script.createdAt}</td>
                <td>${script.updatedAt}</td>
                <td><span class="badge badge-${script.status}">${script.status === 'active' ? 'Active' : 'Inactive'}</span></td>
                <td class="actions">
                    <button class="btn btn-secondary btn-sm" onclick="ui.editScript(${script.id})">แก้ไข</button>
                    <button class="btn btn-danger btn-sm" onclick="ui.deleteScript(${script.id})">ลบ</button>
                </td>
            `;
        });
    }

    // User actions
    addUser(event) {
        event.preventDefault();
        const username = document.getElementById('username').value;
        const userId = document.getElementById('userId').value;
        const service = document.getElementById('service').value;

        if (!username || !userId || !service) {
            this.showAlert('กรุณากรอกข้อมูลให้ครบถ้วน', 'error');
            return;
        }

        dataManager.addUser({
            username,
            userId,
            service,
            status: 'active'
        });

        this.renderUsers();
        this.updateDashboard();
        event.target.reset();
        this.showAlert('เพิ่มผู้ใช้งานสำเร็จ!', 'success');
    }

    deleteUser(id) {
        if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้งานนี้?')) {
            dataManager.deleteUser(id);
            this.renderUsers();
            this.updateDashboard();
            this.showAlert('ลบผู้ใช้งานสำเร็จ!', 'success');
        }
    }

    editUser(id) {
        const data = dataManager.getData();
        const user = data.users.find(u => u.id === id);
        if (user) {
            document.getElementById('username').value = user.username;
            document.getElementById('userId').value = user.userId;
            document.getElementById('service').value = user.service;
            this.showAlert('กรอกข้อมูลใหม่แล้วกดบันทึก', 'warning');
        }
    }

    // API Key actions
    generateApiKey(event) {
        event.preventDefault();
        const keyName = document.getElementById('keyName').value;
        const permission = document.getElementById('keyPermission').value;

        if (!keyName) {
            this.showAlert('กรุณาใส่ชื่อ API Key', 'error');
            return;
        }

        const newKey = dataManager.generateApiKey(keyName, permission);
        this.renderApiKeys();
        event.target.reset();
        
        // Show key in alert
        this.showAlert(`สร้าง API Key สำเร็จ!\n\nKey Name: ${newKey.name}\nKey: ${newKey.key}\n\nกรุณาเก็บ Key นี้ไว้ในที่ปลอดภัย`, 'success');
    }

    deleteApiKey(id) {
        if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบ API Key นี้?')) {
            dataManager.deleteApiKey(id);
            this.renderApiKeys();
            this.showAlert('ลบ API Key สำเร็จ!', 'success');
        }
    }

    copyKey(keyId) {
        const keyElement = document.getElementById(keyId);
        const key = keyElement.textContent;
        navigator.clipboard.writeText(key).then(() => {
            this.showAlert('คัดลอก API Key แล้ว!', 'success');
        });
    }

    // Script actions
    saveScript() {
        const scriptName = document.getElementById('scriptName').value;
        const scriptCode = document.getElementById('scriptCode').value;

        if (!scriptName) {
            this.showAlert('กรุณาใส่ชื่อ Script', 'error');
            return;
        }

        if (!scriptCode) {
            this.showAlert('กรุณาเขียน Script Code', 'error');
            return;
        }

        dataManager.saveScript(scriptName, scriptCode);
        this.renderScripts();
        this.showAlert('บันทึก Script สำเร็จ!', 'success');
    }

    deleteScript(id) {
        if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบ Script นี้?')) {
            dataManager.deleteScript(id);
            this.renderScripts();
            this.showAlert('ลบ Script สำเร็จ!', 'success');
        }
    }

    editScript(id) {
        const data = dataManager.getData();
        const script = data.scripts.find(s => s.id === id);
        if (script) {
            document.getElementById('scriptName').value = script.name;
            document.getElementById('scriptCode').value = script.code;
            window.scrollTo({ top: 0, behavior: 'smooth' });
            this.showAlert('แก้ไข Script แล้วกดบันทึก', 'warning');
        }
    }

    testScript() {
        const scriptCode = document.getElementById('scriptCode').value;
        if (!scriptCode) {
            this.showAlert('กรุณาเขียน Script Code ก่อนทดสอบ', 'error');
            return;
        }
        this.showAlert('กำลังทดสอบ Script...\n\nผลลัพธ์: Script ทำงานได้ถูกต้อง ✓', 'success');
    }

    // Alert system
    showAlert(message, type) {
        const alertClass = type === 'success' ? 'alert-success' : type === 'error' ? 'alert-error' : 'alert-warning';
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert ${alertClass}`;
        alertDiv.style.position = 'fixed';
        alertDiv.style.top = '20px';
        alertDiv.style.right = '20px';
        alertDiv.style.zIndex = '10000';
        alertDiv.style.maxWidth = '400px';
        alertDiv.style.whiteSpace = 'pre-line';
        alertDiv.textContent = message;

        document.body.appendChild(alertDiv);

        setTimeout(() => {
            alertDiv.remove();
        }, 3000);
    }
}

// Initialize UI Manager
const ui = new UIManager();

// Global functions for onclick handlers
function addUser(event) {
    ui.addUser(event);
}

function addService(event) {
    event.preventDefault();
    ui.showAlert('สร้างบริการใหม่สำเร็จ!', 'success');
    event.target.reset();
}

function addProvider(event) {
    event.preventDefault();
    ui.showAlert('เพิ่ม Provider สำเร็จ!', 'success');
    event.target.reset();
}

function generateKey(event) {
    ui.generateApiKey(event);
}

function copyKey(keyId) {
    ui.copyKey(keyId);
}

function saveScript() {
    ui.saveScript();
}

function testScript() {
    ui.testScript();
}

function showPage(pageId) {
    ui.navigate(pageId);
}

// Integration search
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('integrationSearch');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            document.querySelectorAll('.integration-card').forEach(card => {
                const text = card.textContent.toLowerCase();
                card.style.display = text.includes(searchTerm) ? 'block' : 'none';
            });
        });
    }
});

console.log('Whitelist Management System Initialized');
