// js/admin-panel.js

class SystemDiagnostics {
    constructor() {
        this.logContainer = null;
    }

    init() {
        this.logContainer = document.getElementById('admin-output');
        this.runSecurityCheck();
    }

    async runSecurityCheck() {
        this.printLog("=== Запуск системной диагностики ===");
        
        // Проверка DoH Cloudflare
        if (typeof dnsShield !== 'undefined') {
            this.printLog("Проверка DNS Shield (security.cloudflare-dns.com)...");
            const testResult = await dnsShield.resolve("security.cloudflare.com");
            if (testResult) {
                this.printLog(`[ОК] DNS Мост активен. IP: ${testResult}`);
            } else {
                this.printLog("[WARN] Ошибка обращения к DNS Cloudflare.");
            }
        } else {
            this.printLog("[ERR] Модуль dns_bridge.js не найден.");
        }

        // Статус браузерного окружения
        this.printLog(`User Agent: ${navigator.userAgent}`);
        this.printLog(`Доступная память: ${navigator.deviceMemory || 'Н/Д'} ГБ`);
        this.printLog(`Ядер процессора: ${navigator.hardwareConcurrency || 'Н/Д'}`);
    }

    printLog(message) {
        console.log(`[Admin] ${message}`);
        if (this.logContainer) {
            const p = document.createElement('p');
            p.style.margin = '4px 0';
            p.style.fontFamily = 'monospace';
            p.textContent = message;
            this.logContainer.appendChild(p);
        }
    }
}

const adminPanel = new SystemDiagnostics();

document.addEventListener('DOMContentLoaded', () => {
    // Небольшая задержка для загрузки всех модулей
    setTimeout(() => adminPanel.init(), 500);
});
