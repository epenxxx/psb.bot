const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, downloadMediaMessage, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const express = require('express');
const pino = require('pino');
const axios = require('axios');
const qrcode = require('qrcode-terminal');

const app = express();
app.use(express.json({ limit: '50mb' }));

const PORT = process.env.PORT || 8000;
const WA_API_TOKEN = process.env.WA_API_TOKEN || 'zylvemedia';
const WEBHOOK_URL = process.env.WEBHOOK_URL; 

let sock;

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    
    // KUNCI SOLUSI 405: Tarik versi WA terbaru secara dinamis
    const { version } = await fetchLatestBaileysVersion();
    console.log(`Menggunakan WhatsApp Web Versi: ${version.join('.')}`);
    
    sock = makeWASocket({
        version,
        auth: state,
        browser: ['Ubuntu', 'Chrome', '110.0.5481.192'],
        logger: pino({ level: "silent" }),
        printQRInTerminal: false,
        syncFullHistory: false
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
            console.log('\n==================================================');
            qrcode.generate(qr, { small: true });
            console.log('⬆️  SILAKAN SCAN QR CODE DI ATAS  ⬆️');
            console.log('==================================================\n');
        }

        if(connection === 'close') {
            const statusCode = lastDisconnect.error?.output?.statusCode;
            const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
            console.log('Koneksi terputus. Kode Error:', statusCode);
            
            if(shouldReconnect) {
                setTimeout(connectToWhatsApp, 5000); 
            } else {
                console.log("❌ Sesi Logged Out! Hapus folder auth_info_baileys.");
            }
        } else if(connection === 'open') {
            console.log(`✅ Terhubung ke WhatsApp (Port: ${PORT})`);
        }
    });

    sock.ev.on('messages.upsert', async m => {
        if (!WEBHOOK_URL) return; 
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const remoteJid = msg.key.remoteJid;
        const messageType = Object.keys(msg.message)[0];
        
        let text = '', type = 'chat', lat = '', lng = '', media_base64 = '';

        try {
            if (messageType === 'conversation') text = msg.message.conversation;
            else if (messageType === 'extendedTextMessage') text = msg.message.extendedTextMessage.text;
            else if (messageType === 'locationMessage') {
                type = 'location';
                lat = msg.message.locationMessage.degreesLatitude;
                lng = msg.message.locationMessage.degreesLongitude;
            } else if (messageType === 'imageMessage') {
                type = 'image';
                const buffer = await downloadMediaMessage(msg, 'buffer', {}, { logger: pino({ level: 'silent' }) });
                media_base64 = buffer.toString('base64');
            } else return; 

            const payload = { from: remoteJid, body: text, type, lat, lng, media_base64 };
            await axios.post(WEBHOOK_URL, payload).catch(() => {});
        } catch (err) {}
    });
}

app.post('/send-message', async (req, res) => {
    if (req.headers['authorization'] !== WA_API_TOKEN) return res.status(401).json({ error: 'Unauthorized' });
    const { target, message } = req.body;
    if (!target || !message) return res.status(400).json({ error: 'Target & Message required' });
    let jid = target.includes('@') ? target : target + '@s.whatsapp.net';
    
    try {
        await sock.sendMessage(jid, { text: message });
        res.status(200).json({ status: 'success' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.toString() });
    }
});

app.listen(PORT, () => {
    console.log(`Server Baileys berjalan di port ${PORT}`);
    connectToWhatsApp();
});
