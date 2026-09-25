// --- Перехват консоли для DevTools ---
(function() {
    const oldLog = console.log;
    const oldError = console.error;
    const logsContainer = document.getElementById('devtools-logs');

    function appendLog(type, args) {
        if (!logsContainer) return;
        const div = document.createElement('div');
        div.style.color = type === 'error' ? '#ef4444' : '#cbd5e1';
        div.innerText = `[${type.toUpperCase()}]: ` + Array.from(args).map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg) : arg
        ).join(' ');
        logsContainer.appendChild(div);
        logsContainer.scrollTop = logsContainer.scrollHeight;
    }

    console.log = function(...args) {
        oldLog.apply(console, args);
        appendLog('log', args);
    };

    console.error = function(...args) {
        oldError.apply(console, args);
        appendLog('error', args);
    };
})();

// --- Перехват Network запросов ---
const originalFetch = window.fetch;
window.fetch = async function(...args) {
    const url = args[0];
    const method = (args[1] && args[1].method) || 'GET';
    const networkLogs = document.getElementById('network-logs');
    const rowId = 'net-' + Date.now();
    
    if (networkLogs) {
        networkLogs.innerHTML += `<div class="net-row" id="${rowId}"><span>${method}</span> <span style="color: #38bdf8; overflow:hidden; text-overflow:ellipsis;">${url}</span> <span>Pending...</span></div>`;
    }

    try {
        const response = await originalFetch.apply(this, args);
        if (networkLogs) {
            const row = document.getElementById(rowId);
            if (row) row.innerHTML = `<span>${method}</span> <span style="color: #38bdf8;">${url}</span> <span style="color: #16a34a;">${response.status} OK</span>`;
        }
        return response;
    } catch (error) {
        if (networkLogs) {
            const row = document.getElementById(rowId);
            if (row) row.innerHTML = `<span>${method}</span> <span style="color: #38bdf8;">${url}</span> <span style="color: #ef4444;">Failed</span>`;
        }
        throw error;
    }
};

// --- Глобальные функции интерфейса ---
window.toggleSettingsModal = function() {
    const modal = document.getElementById('settings-modal');
    if (modal) {
        modal.classList.toggle('modal-hidden');
        if (!modal.classList.contains('modal-hidden')) {
            document.getElementById('key-gemini').value = localStorage.getItem('key_gemini') || '';
            document.getElementById('key-anthropic').value = localStorage.getItem('key_anthropic') || '';
            document.getElementById('key-groq').value = localStorage.getItem('key_groq') || '';
        }
    }
};

window.toggleDevTools = function() {
    const dt = document.getElementById('devtools-panel');
    if (dt) dt.classList.toggle('devtools-hidden');
};

window.switchDtTab = function(tabName) {
    document.querySelectorAll('.dt-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.dt-pane').forEach(p => p.classList.remove('active'));
    if (tabName === 'console') {
        document.querySelector('.dt-tab:nth-child(1)').classList.add('active');
        document.getElementById('dt-pane-console').classList.add('active');
    } else {
        document.querySelector('.dt-tab:nth-child(2)').classList.add('active');
        document.getElementById('dt-pane-network').classList.add('active');
    }
};

window.saveApiKeys = function() {
    localStorage.setItem('key_gemini', document.getElementById('key-gemini').value.trim());
    localStorage.setItem('key_anthropic', document.getElementById('key-anthropic').value.trim());
    localStorage.setItem('key_groq', document.getElementById('key-groq').value.trim());
    alert('✅ API ключи сохранены!');
    toggleSettingsModal();
};

window.handleDevToolsExec = function(event) {
    if (event.key === 'Enter') {
        const input = document.getElementById('devtools-input');
        const logs = document.getElementById('devtools-logs');
        const val = input.value;
        logs.innerHTML += `<div>> ${val}</div>`;
        try {
            const res = eval(val);
            logs.innerHTML += `<div style="color: #38bdf8;">< ${res}</div>`;
        } catch (e) {
            logs.innerHTML += `<div style="color: #ef4444;">< ${e.message}</div>`;
        }
        input.value = '';
        logs.scrollTop = logs.scrollHeight;
    }
};

// --- v86 Emulator Logic ---
window.handleIsoSourceChange = function(val) {
    const fileInput = document.getElementById('iso-input');
    if (val === 'custom') {
        fileInput.style.display = 'inline-block';
        fileInput.click();
    } else {
        fileInput.style.display = 'none';
    }
};

window.loadSelectedIso = function() {
    const source = document.getElementById('iso-source-select').value;
    const env = document.getElementById('desktop-env-select').value;
    if (source === 'netinstall') {
        alert(`Выбран режим: BlackArch Netinstall (815MB) с окружением: ${env}. Выберите скачанный .iso файл для быстрого запуска в памяти v86.`);
        document.getElementById('iso-source-select').value = 'custom';
        document.getElementById('iso-input').style.display = 'inline-block';
        document.getElementById('iso-input').click();
    }
};

// --- Инициализация файловой системы с защитой от пустого хранилища ---
const DEFAULT_FILES = {
    'core/main.rs': { lang: 'rust', content: '// Core Runtime Component\nfn main() {\n    println!("System online.");\n}' },
    'core/native_loader.cpp': { lang: 'cpp', content: '#include <iostream>\nint main() {\n    std::cout << "Native loader initialized.\\n";\n    return 0;\n}' },
    'scripts/main.lua': { lang: 'lua', content: 'print("Lua Runtime Executed Successfully!")' },
    'core/kernel.c': { lang: 'c', content: '#include <stdio.h>\nvoid kernel_main() {\n    // Kernel initialization\n}' },
    'js/dns_bridge.js': { lang: 'javascript', content: 'console.log("DNS Bridge Ready.");' }
};

function getSavedFiles() {
    try {
        const saved = JSON.parse(localStorage.getItem('black_sense_files'));
        if (saved && Object.keys(saved).length > 0) {
            return saved;
        }
    } catch (e) {}
    return { ...DEFAULT_FILES };
}

let files = getSavedFiles();
let openTabs = Object.keys(files).length > 0 ? [Object.keys(files)[0]] : ['core/main.rs'];
let activeFile = openTabs[0];
let currentLanguage = files[activeFile] ? files[activeFile].lang : 'rust';
let codeEditor = null;

function saveFileSystem() {
    localStorage.setItem('black_sense_files', JSON.stringify(files));
}

// --- Monaco Editor Initialization ---
require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs' }});

require(['vs/editor/editor.main'], function() {
    const initialContent = files[activeFile] ? files[activeFile].content : '';
    const initialLang = files[activeFile] ? files[activeFile].lang : 'plaintext';

    codeEditor = monaco.editor.create(document.getElementById('editor-container'), {
        value: initialContent,
        language: initialLang,
        theme: 'vs-dark',
        automaticLayout: true,
        fontSize: 14,
        minimap: { enabled: true }
    });

    codeEditor.onDidChangeModelContent(() => {
        if (files[activeFile]) {
            files[activeFile].content = codeEditor.getValue();
            saveFileSystem();
        }
    });

    codeEditor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, function() {
        saveFileSystem();
        console.log(`[FS]: Файл ${activeFile} сохранен.`);
    });

    codeEditor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, function() {
        runCurrentCode();
    });

    renderFileTree();
    renderTabs();
});

// --- Tab Management ---
function renderTabs() {
    const tabsBar = document.getElementById('tabs-bar');
    if (!tabsBar) return;
    tabsBar.innerHTML = '';

    openTabs.forEach(filepath => {
        const tabEl = document.createElement('div');
        tabEl.className = `tab-item ${filepath === activeFile ? 'active' : ''}`;
        
        const nameSpan = document.createElement('span');
        nameSpan.innerText = filepath.split('/').pop();
        nameSpan.onclick = () => switchFile(filepath);

        const closeSpan = document.createElement('span');
        closeSpan.className = 'tab-close';
        closeSpan.innerText = '✕';
        closeSpan.onclick = (e) => {
            e.stopPropagation();
            closeTab(filepath);
        };

        tabEl.appendChild(nameSpan);
        tabEl.appendChild(closeSpan);
        tabsBar.appendChild(tabEl);
    });
}

window.switchFile = function(filepath) {
    if (!files[filepath]) return;
    activeFile = filepath;
    currentLanguage = files[filepath].lang;

    const label = document.getElementById('current-file-label');
    const langSelect = document.getElementById('language-select');
    if (label) label.innerText = '/' + filepath;
    if (langSelect) langSelect.value = currentLanguage;

    if (codeEditor) {
        const model = monaco.editor.createModel(files[filepath].content, files[filepath].lang);
        codeEditor.setModel(model);
    }

    renderTabs();
    renderFileTree();
};

function closeTab(filepath) {
    openTabs = openTabs.filter(f => f !== filepath);
    if (activeFile === filepath) {
        if (openTabs.length > 0) {
            switchFile(openTabs[openTabs.length - 1]);
        } else {
            activeFile = '';
            if (codeEditor) codeEditor.setValue('');
            const label = document.getElementById('current-file-label');
            if (label) label.innerText = 'Нет открытых файлов';
        }
    }
    renderTabs();
}

// --- File Tree & CRUD ---
function renderFileTree() {
    const ul = document.getElementById('file-list-ul');
    if (!ul) return;
    ul.innerHTML = '';

    Object.keys(files).forEach(filepath => {
        const li = document.createElement('li');
        li.innerText = (filepath === activeFile ? '▶ ' : '📄 ') + filepath;
        if (filepath === activeFile) li.style.color = '#38bdf8';
        li.onclick = () => {
            if (!openTabs.includes(filepath)) openTabs.push(filepath);
            switchFile(filepath);
        };
        ul.appendChild(li);
    });
}

window.createNewFile = function() {
    const filename = prompt('Введите путь нового файла (например: scripts/test.lua):');
    if (!filename) return;
    if (files[filename]) return alert('Файл уже существует!');

    let lang = 'javascript';
    if (filename.endsWith('.rs')) lang = 'rust';
    if (filename.endsWith('.lua')) lang = 'lua';
    if (filename.endsWith('.cpp')) lang = 'cpp';
    if (filename.endsWith('.c')) lang = 'c';

    files[filename] = { lang: lang, content: '// Новый файл\n' };
    if (!openTabs.includes(filename)) openTabs.push(filename);
    saveFileSystem();
    switchFile(filename);
    renderFileTree();
};

window.deleteActiveFile = function() {
    if (!activeFile) return;
    if (confirm(`Удалить файл ${activeFile}?`)) {
        delete files[activeFile];
        closeTab(activeFile);
        saveFileSystem();
        renderFileTree();
    }
};

window.changeLanguage = function(lang) {
    currentLanguage = lang;
    if (files[activeFile]) {
        files[activeFile].lang = lang;
        if (codeEditor) monaco.editor.setModelLanguage(codeEditor.getModel(), lang);
        saveFileSystem();
    }
};

// --- Runner Engine ---
window.runCurrentCode = async function() {
    if (!codeEditor) return;
    const code = codeEditor.getValue();
    console.log(`[Runner]: Запуск ${currentLanguage}...`);

    if (currentLanguage === 'lua') {
        try {
            const { LuaFactory } = window.wasmoon;
            const factory = new LuaFactory();
            const lua = await factory.createEngine();
            lua.global.set('print', (...args) => console.log('[Lua Output]:', ...args));
            await lua.doString(code);
        } catch (e) {
            console.error('[Lua Error]:', e.message);
        }
    } else if (currentLanguage === 'javascript') {
        try {
            eval(code);
        } catch (e) {
            console.error('[JS Error]:', e.message);
        }
    } else {
        console.log(`[Emulation]: Скомпилировано (${currentLanguage}).`);
    }
};

// --- AI Generator ---
window.generateAICode = async function() {
    const provider = document.getElementById('ai-provider').value;
    const promptText = document.getElementById('ai-prompt').value.trim();
    if (!promptText) return alert('Введи промпт для генерации кода!');

    const key = localStorage.getItem(`key_${provider}`);
    if (!key) {
        alert(`Добавь API ключ для ${provider.toUpperCase()} в настройках (🔑)`);
        return toggleSettingsModal();
    }

    // Если нет открытого файла, создаем main.rs по умолчанию
    if (!activeFile || !files[activeFile]) {
        activeFile = 'core/main.rs';
        files[activeFile] = { lang: 'rust', content: '' };
        if (!openTabs.includes(activeFile)) openTabs.push(activeFile);
        switchFile(activeFile);
    }

    console.log(`[AI Request]: Отправка в ${provider}...`);
    try {
        if (provider === 'gemini') {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`;
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: `Напиши чистый код для языка ${currentLanguage} по запросу: ${promptText}. Выдавай ТОЛЬКО код.` }] }]
                })
            });
            const data = await res.json();
            if (data.candidates && data.candidates[0].content.parts[0].text) {
                let aiCode = data.candidates[0].content.parts[0].text.replace(/```[a-z]*\n?/gi, '').replace(/```$/g, '');
                if (codeEditor) codeEditor.setValue(aiCode);
                files[activeFile].content = aiCode;
                saveFileSystem();
                console.log('[AI Success]: Код успешно сгенерирован!');
            } else if (data.error) {
                console.error('[AI Error]:', data.error.message);
                alert('Ошибка API: ' + data.error.message);
            }
        }
    } catch (err) {
        console.error('[AI Error]:', err.message);
    }
};

// --- DOM Loaded Setup ---
document.addEventListener('DOMContentLoaded', () => {
    // Рендерим дерево файлов сразу при загрузке DOM
    renderFileTree();
    renderTabs();

    // Обработчик ISO файлов
    const isoInput = document.getElementById('iso-input');
    if (isoInput) {
        isoInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;

            const screenContainer = document.getElementById('screen-container');
            screenContainer.innerHTML = `<div style="padding: 20px; color: #38bdf8; text-align: center;">Загрузка ISO (${(file.size / (1024*1024)).toFixed(1)} MB) в память v86...</div>`;

            const reader = new FileReader();
            reader.onload = function(event) {
                const buffer = event.target.result;
                screenContainer.innerHTML = ''; 

                try {
                    window.v86_emulator = new V86({
                        wasm_path: "https://cdn.jsdelivr.net/npm/v86@latest/build/v86.wasm",
                        screen_container: screenContainer,
                        bios: { url: "https://unpkg.com/v86@latest/bios/seabios.bin" },
                        vga_bios: { url: "https://unpkg.com/v86@latest/bios/vgabios.bin" },
                        cdrom: { buffer: buffer },
                        autostart: true,
                        memory_size: 512 * 1024 * 1024,
                        vga_memory_size: 8 * 1024 * 1024
                    });
                    console.log("[v86]: Успешный запуск образа:", file.name);
                } catch (err) {
                    console.error("[v86 Error]:", err.message);
                }
            };
            reader.readAsArrayBuffer(file);
        });
    }

    // Навигация бокового меню
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', () => {
            document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            item.classList.add('active');
            const target = document.getElementById(item.dataset.tab);
            if (target) target.classList.add('active');
        });
    });
});
