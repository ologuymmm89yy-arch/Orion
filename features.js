// js/features.js

class VirtualMachineManager {
    constructor() {
        this.isoFile = null;
        this.emulator = null;
        this.initListeners();
    }

    initListeners() {
        const input = document.getElementById('iso-input');
        if (input) {
            input.addEventListener('change', (e) => this.handleIsoSelect(e));
        }
    }

    handleIsoSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        this.isoFile = file;
        this.logToTerminal(`Выбран образ: ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)`);
    }

    // Запуск v86 с выбранным ISO
    bootISO() {
        if (!this.isoFile) {
            this.logToTerminal('Ошибка: Сначала выберите ISO файл!');
            return;
        }

        this.logToTerminal(`Инициализация v86 эмулятора...`);
        
        // Пример вызова v86 (требуется подключение libv86.js в HTML)
        /*
        this.emulator = new V86Starter({
            wasm_path: "assets/v86.wasm",
            memory_size: 512 * 1024 * 1024,
            vga_memory_size: 8 * 1024 * 1024,
            screen_container: document.getElementById("screen-container"),
            cdrom: { buffer: this.isoFile }
        });
        */
        
        this.logToTerminal(`Готово к запуску контейнера для ${this.isoFile.name}`);
    }

    logToTerminal(text) {
        const output = document.getElementById('screen-container');
        if (output) {
            const line = document.createElement('div');
            line.textContent = `[v86 Engine] ${text}`;
            output.appendChild(line);
        }
    }
}

const vmm = new VirtualMachineManager();
