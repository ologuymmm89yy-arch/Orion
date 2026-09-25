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
        
        if (typeof dnsShield !== 'undefined') {
            const testResult = await dnsShield.resolve("security.cloudflare.com");
            if (testResult) {
                this.printLog(`[ОК] DNS Мост активен. IP: ${testResult}`);
            }
        }

        this.printLog(`User Agent: ${navigator.userAgent}`);
        this.printLog(`Память устройства: ${navigator.deviceMemory || 'Н/Д'} ГБ`);
        this.printLog(`Ядра процессора: ${navigator.hardwareConcurrency || 'Н/Д'}`);
    }

    printLog(message) {
        console.log(`[Admin] ${message}`);
        if (this.logContainer) {
            const p = document.createElement('p');
            p.style.margin = '4px 0';
            p.textContent = message;
            this.logContainer.appendChild(p);
        }
    }
}

const adminPanel = new SystemDiagnostics();
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => adminPanel.init(), 500);
});
