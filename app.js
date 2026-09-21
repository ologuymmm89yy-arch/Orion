let codeEditor = null;

const projectFiles = {
    rust: { path: "core/main.rs", lang: "rust", content: `// Core Runtime Component\nfn main() {\n    println!("System online. Route: security.cloudflare-dns.com");\n}` },
    cpp: { path: "core/native_loader.cpp", lang: "cpp", content: `// C++ Engine\n#include <iostream>\n\nint main() {\n    std::cout << "Engine Active" << std::endl;\n    return 0;\n}` },
    c: { path: "core/kernel.c", lang: "c", content: `// System Kernel\n#include <stdio.h>\n\nvoid init() {\n    printf("Kernel initialized.\\n");\n}` },
    js: { path: "js/dns_bridge.js", lang: "javascript", content: `// Secure DNS Bridge\nconst endpoint = "https://security.cloudflare-dns.com/dns-query";` },
    app: { path: "js/app.js", lang: "javascript", content: `// Main Orchestrator\nconsole.log("UI Initialized");` }
};

// Инициализация Monaco
function initMonaco() {
    if (typeof require === 'undefined') return;
    require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs' }});
    require(['vs/editor/editor.main'], function() {
        codeEditor = monaco.editor.create(document.getElementById('editor-container'), {
            value: projectFiles.rust.content,
            language: 'rust',
            theme: 'vs-dark',
            automaticLayout: true,
            fontSize: 14
        });
    });
}

function openProjectFile(fileKey, filePath, lang) {
    if (!codeEditor) return;
    codeEditor.setValue(projectFiles[fileKey].content);
    monaco.editor.setModelLanguage(codeEditor.getModel(), lang);
    document.getElementById('current-file-label').innerText = filePath;
    document.getElementById('language-select').value = lang;
    console.log(`[IDE] Открыт файл: ${filePath}`);
}

function changeLanguage(lang) {
    if (!codeEditor) return;
    monaco.editor.setModelLanguage(codeEditor.getModel(), lang);
}

// Навигация по вкладкам интерфейса
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
}

// Управление клавиатурой (Стрелочки + F12)
function initKeyboardNav() {
    const items = document.querySelectorAll('.menu-item');
    let currentIndex = 0;

    items.forEach((item, index) => {
        item.addEventListener('click', () => {
            currentIndex = index;
            switchTab(item.getAttribute('data-tab'));
        });
    });

    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.closest('.monaco-editor')) {
            if (e.key === 'F12') { e.preventDefault(); toggleDevTools(); }
            return;
        }
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            currentIndex = (currentIndex + 1) % items.length;
            switchTab(items[currentIndex].getAttribute('data-tab'));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            currentIndex = (currentIndex - 1 + items.length) % items.length;
            switchTab(items[currentIndex].getAttribute('data-tab'));
        } else if (e.key === 'F12') {
            e.preventDefault();
            toggleDevTools();
        }
    });
}

// DEVTOOLS ЛОГИКА
function toggleDevTools() {
    const panel = document.getElementById('devtools-panel');
    panel.classList.toggle('devtools-hidden');
    if (!panel.classList.contains('devtools-hidden')) {
        document.getElementById('devtools-input').focus();
    }
}

function switchDtTab(tabName) {
    document.querySelectorAll('.dt-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.dt-pane').forEach(p => p.classList.remove('active'));
    if (tabName === 'console') {
        document.querySelector('.dt-tab:nth-child(1)').classList.add('active');
        document.getElementById('dt-pane-console').classList.add('active');
    } else {
        document.querySelector('.dt-tab:nth-child(2)').classList.add('active');
        document.getElementById('dt-pane-network').classList.add('active');
    }
}

// Перехват Console
(function hookConsole() {
    const oldLog = console.log, oldErr = console.error, oldWarn = console.warn;
    function appendLog(msg, type) {
        const logs = document.getElementById('devtools-logs');
        if (!logs) return;
        const line = document.createElement('div');
        line.className = `dev-log dev-${type}`;
        line.textContent = `> ${msg}`;
        logs.appendChild(line);
        logs.scrollTop = logs.scrollHeight;
    }
    console.log = function(...args) { oldLog.apply(console, args); appendLog(args.join(' '), 'info'); };
    console.error = function(...args) { oldErr.apply(console, args); appendLog(args.join(' '), 'error'); };
    console.warn = function(...args) { oldWarn.apply(console, args); appendLog(args.join(' '), 'warn'); };
})();

// Перехват Network (Fetch)
(function hookNetwork() {
    const origFetch = window.fetch;
    window.fetch = async function(...args) {
        const url = args[0], startTime = performance.now();
        const logs = document.getElementById('network-logs');
        try {
            const res = await origFetch.apply(this, args);
            const ms = (performance.now() - startTime).toFixed(1);
            if (logs) logs.innerHTML += `<div class="net-row"><span style="color:#38bdf8">GET</span><span>${url}</span><span style="color:#22c55e">${res.status} (${ms}ms)</span></div>`;
            return res;
        } catch (err) {
            if (logs) logs.innerHTML += `<div class="net-row"><span style="color:#ef4444">ERR</span><span>${url}</span><span style="color:#ef4444">Failed</span></div>`;
            throw err;
        }
    };
})();

function handleDevToolsExec(e) {
    if (e.key === 'Enter') {
        const code = e.target.value.trim();
        if (!code) return;
        console.log(code);
        try { console.log(eval(code)); } catch (err) { console.error(err.message); }
        e.target.value = '';
    }
}

// Запуск при загрузке
document.addEventListener('DOMContentLoaded', async () => {
    initMonaco();
    initKeyboardNav();
    
    // Проверка DNS
    if (typeof dnsShield !== 'undefined') {
        const statusDiv = document.getElementById('dns-status');
        const ip = await dnsShield.resolve('github.com');
        if (ip) {
            statusDiv.innerText = `DNS Shield: ${ip}`;
            statusDiv.style.color = '#4ade80';
        }
    }
});
