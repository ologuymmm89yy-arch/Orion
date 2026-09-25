const dnsShield = {
    endpoint: 'https://cloudflare-dns.com/dns-query',

    async resolve(domain) {
        try {
            console.log(`[DNS Shield] Запрос IP для: ${domain}`);
            const response = await fetch(`${this.endpoint}?name=${encodeURIComponent(domain)}&type=A`, {
                headers: { 'Accept': 'application/dns-json' }
            });

            if (!response.ok) throw new Error(`HTTP: ${response.status}`);

            const data = await response.json();
            if (data.Status === 0 && data.Answer && data.Answer.length > 0) {
                const aRecord = data.Answer.find(record => record.type === 1);
                return aRecord ? aRecord.data : data.Answer[0].data;
            }
            return '1.1.1.1';
        } catch (error) {
            console.error(`[DNS Shield Error]: ${error.message}`);
            return '1.1.1.1';
        }
    }
};
