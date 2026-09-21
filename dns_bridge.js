// js/dns_bridge.js
const dnsShield = {
    // Используем эндпоинт Cloudflare DoH JSON API с поддержкой CORS
    endpoint: 'https://cloudflare-dns.com/dns-query',

    async resolve(domain) {
        try {
            console.log(`[DNS Shield] Запрашиваю IP для: ${domain}`);
            const response = await fetch(`${this.endpoint}?name=${encodeURIComponent(domain)}&type=A`, {
                headers: { 
                    'Accept': 'application/dns-json' 
                }
            });

            if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

            const data = await response.json();
            if (data.Status === 0 && data.Answer && data.Answer.length > 0) {
                // Находим первый A-запись IP
                const aRecord = data.Answer.find(record => record.type === 1);
                const ip = aRecord ? aRecord.data : data.Answer[0].data;
                console.log(`[DNS Shield] Защищенный маршрут: ${ip}`);
                return ip;
            } else {
                console.warn(`[DNS Shield] Не удалось разрешить ${domain}`);
                return '1.1.1.1'; // Резервный IP
            }
        } catch (error) {
            console.error(`[DNS Shield] Ошибка моста: ${error.message}`);
            return '1.1.1.1';
        }
    }
};
