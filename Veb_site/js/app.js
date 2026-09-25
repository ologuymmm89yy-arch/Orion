let codeEditor = null;
let currentLanguage = "rust";

const projectFiles = {
    rust: { path: "core/main.rs", lang: "rust", content: `// Core Runtime Component\nfn main() {\n    println!("System online.");\n}` },
    cpp: { path: "core/native_loader.cpp", lang: "cpp", content: `// C++ Engine\n#include <iostream>\n\nint main() {\n    std::cout << "Engine Active" << std::endl;\n    return 0;\n}` },
    lua: { path: "scripts/main.lua", lang: "lua", content: `-- BLACK SENSE Lua Runtime\nlocal name = "BLACK SENSE"\nprint("Hello from " .. name .. " Lua Engine!")\n\nfor i = 1, 3 do\n    print("Iteration: " .. i)\nend` },
    c: { path: "core/kernel.c", lang: "c", content: `// System Kernel\n#include <stdio.h>\n\nvoid init() {\n    printf("Kernel initialized.\\n");\n}` },
    js: { path: "js/dns_bridge.js", lang: "javascript", content: `// Secure DNS Bridge\nconst endpoint = "https://cloudflare-dns.com/dns-query";` },
    app: { path: "js/app.js", lang: "javascript", content: `// Main Orchestrator\nconsole.log("UI Initialized");` }
};

// Инициализация Monaco Editor
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
    currentLanguage = lang;
    codeEditor.setValue(projectFiles[fileKey].content);
    monaco.editor.setModelLanguage(codeEditor.getModel(), lang);
    document.getElementById('current-file-label').innerText = filePath;
    document.getElementById('language-select').value = lang;
}

function changeLanguage(lang) {
    if (!codeEditor) return;
    currentLanguage = lang;
    monaco.editor.setModelLanguage(codeEditor.getModel(), lang);
}

// Запуск кода из редактора
async function runCurrentCode() {
    const code = codeEditor.getValue();
    toggleDevTools(true); // Показываем консоль

    if (currentLanguage === 'javascript') {
        try {
            const result = eval(code);
            console.log('[JS Exec Result]:', result);
        } catch (err) {
            console.error('[JS Error]:', err.message);
        }
    } else if (currentLanguage === 'lua') {
        if (!window.wasmoon) {
            return console.error('[Lua]: Движок Wasmoon еще загружается...');
        }
        try {
            const { LuaFactory } = window.wasmoon;
            const factory = new LuaFactory();
            const lua = await factory.createEngine();

            lua.global.set('print', (...args) => {
                console.log('[Lua Output]:', args.map(a => String(a)).join('  '));
            });

            await lua.doString(code);
            lua.global.close();
        } catch (err) {
            console.error('[Lua Error]:', err.message);
        }
    } else {
        console.warn(`[Runner]: Запуск для языка ${currentLanguage.toUpperCase()} доступен в сборке WASM.`);
    }
}

// Навигация
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
}

function initKeyboardNav() {
    const items = document.querySelectorAll('.menu-item');
    items.forEach((item) => {
        item.addEventListener('click', () => switchTab(item.getAttribute('data-tab')));
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'F12') {
            e.preventDefault();
            toggleDevTools();
        }
    });
}

// DevTools
function toggleDevTools(forceOpen = false) {
    const panel = document.getElementById('devtools-panel');
    if (forceOpen) {
        panel.classList.remove('devtools-hidden');
    } else {
        panel.classList.toggle('devtools-hidden');
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

// Перехват Консоли
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

function handleDevToolsExec(e) {
    if (e.key === 'Enter') {
        const code = e.target.value.trim();
        if (!code) return;
        console.log(code);
        try { console.log(eval(code)); } catch (err) { console.error(err.message); }
        e.target.value = '';
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    initMonaco();
    initKeyboardNav();
    
    if (typeof dnsShield !== 'undefined') {
        const statusDiv = document.getElementById('dns-status');
        const ip = await dnsShield.resolve('github.com');
        if (ip) {
            statusDiv.innerText = `DNS Shield: ${ip}`;
            statusDiv.style.color = '#4ade80';
        }
    }
});
