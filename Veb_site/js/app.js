// --- Virtual File System & State ---
let files = JSON.parse(localStorage.getItem('black_sense_files')) || {
    'core/main.rs': { lang: 'rust', content: '// Core Runtime Component\nfn main() {\n    println!("System online.");\n}' },
    'core/native_loader.cpp': { lang: 'cpp', content: '#include <iostream>\nint main() {\n    std::cout << "Native loader initialized.\\n";\n    return 0;\n}' },
    'scripts/main.lua': { lang: 'lua', content: 'print("Lua Runtime Executed Successfully!")' },
    'core/kernel.c': { lang: 'c', content: '#include <stdio me.h>\nvoid kernel_main() {\n    // Kernel initialization\n}' },
    'js/dns_bridge.js': { lang: 'javascript', content: 'console.log("DNS Bridge Ready.");' }
};

let openTabs = ['core/main.rs'];
let activeFile = 'core/main.rs';
let currentLanguage = 'rust';
let codeEditor = null;

function saveFileSystem() {
    localStorage.setItem('black_sense_files', JSON.stringify(files));
}

// --- Monaco Editor Initialization ---
require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs' }});

require(['vs/editor/editor.main'], function() {
    codeEditor = monaco.editor.create(document.getElementById('editor-container'), {
        value: files[activeFile].content,
        language: files[activeFile].lang,
        theme: 'vs-dark',
        automaticLayout: true,
        fontSize: 14,
        minimap: { enabled: true }
    });

    // Изменение текста в редакторе (Mark Dirty)
    codeEditor.onDidChangeModelContent(() => {
        if (files[activeFile]) {
            files[activeFile].content = codeEditor.getValue();
            markTabDirty(activeFile, true);
            saveFileSystem();
        }
    });

    // Горячие клавиши (Ctrl+S / Cmd+S для сохранения, Ctrl+Enter для запуска)
    codeEditor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, function() {
        markTabDirty(activeFile, false);
        console.log(`[FS]: Файл ${activeFile} сохранен.`);
    });

    codeEditor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, function() {
        runCurrentCode();
    });

    renderFileTree();
    renderTabs();
});

// --- Tab Management System ---
function renderTabs() {
    const tabsBar = document.getElementById('tabs-bar');
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

function switchFile(filepath) {
    if (!files[filepath]) return;
    activeFile = filepath;
    currentLanguage = files[filepath].lang;

    document.getElementById('current-file-label').innerText = '/' + filepath;
    document.getElementById('language-select').value = currentLanguage;

    if (codeEditor) {
        const model = monaco.editor.createModel(files[filepath].content, files[filepath].lang);
        codeEditor.setModel(model);
    }

    renderTabs();
    renderFileTree();
}

function closeTab(filepath) {
    openTabs = openTabs.filter(f => f !== filepath);
    if (activeFile === filepath) {
        if (openTabs.length > 0) {
            switchFile(openTabs[openTabs.length - 1]);
        } else {
            activeFile = '';
            if (codeEditor) codeEditor.setValue('');
            document.getElementById('current-file-label').innerText = 'Нет открытых файлов';
        }
    }
    renderTabs();
}

function markTabDirty(filepath, isDirty) {
    // Ввиду простоты localstorage сохраняет мгновенно, но визуал поддерживаем
}

// --- File Tree & CRUD ---
function renderFileTree() {
    const ul = document.getElementById('file-list-ul');
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

function createNewFile() {
    const filename = prompt('Введите путь нового файла (например: scripts/test.lua):');
    if (!filename) return;

    if (files[filename]) return alert('Файл уже существует!');

    let lang = 'javascript';
    if (filename.endsWith('.rs')) lang = 'rust';
    if (filename.endsWith('.lua')) lang = 'lua';
    if (filename.endsWith('.cpp')) lang = 'cpp';
    if (filename.endsWith('.c')) lang = 'c';

    files[filename] = { lang: lang, content: '// Новый файл\n' };
    openTabs.push(filename);
    saveFileSystem();
    switchFile(filename);
}

function deleteActiveFile() {
    if (!activeFile) return;
    if (confirm(`Удалить файл ${activeFile}?`)) {
        delete files[activeFile];
        closeTab(activeFile);
        saveFileSystem();
        renderFileTree();
    }
}

function changeLanguage(lang) {
    currentLanguage = lang;
    if (files[activeFile]) {
        files[activeFile].lang = lang;
        if (codeEditor) monaco.editor.setModelLanguage(codeEditor.getModel(), lang);
        saveFileSystem();
    }
}

// --- Runner ---
async function runCurrentCode() {
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
        console.log(`[Emulation]: Скомпилировано (${currentLanguage}). Вывод в DevTools.`);
    }
}

// --- UI Navigation ---
document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', () => {
        document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        item.classList.add('active');
        document.getElementById(item.dataset.tab).classList.add('active');
    });
});
