const { default: makeWASocket, DisconnectReason, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const handler = require('./handler');
const { Boom } = require('@hapi/boom');

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('./session');
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
    defaultQueryTimeoutMs: 60000,
  });

  sock.ev.on('creds.update', saveCreds);
  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log('Connection closed. Reconnecting...', shouldReconnect);
      if (shouldReconnect) startBot();
    } else if (connection === 'open') {
      console.log('Astheric Bot connected!');
    }
  });

  sock.ev.on('messages.upsert', (m) => {
    handler(sock, m);
  });

  sock.ev.on('group-participants.update', async (event) => {
    const groupId = event.id;
    const userNumber = event.participants[0];
    if (event.action === 'add') {
      await sock.sendMessage(groupId, {
        text: `✨ Hello @${userNumber.split('@')[0]} 💖 Aku Astheric 🌷 yang akan menyambutmu sekarang 💗 Oh iya, kamu mau pakai aku? Klik salah satu tombol di bawah 🌸`,
        mentions: [userNumber],
        footer: 'Astheric Bot 🌷',
        templateButtons: [
          { index: 1, quickReplyButton: { displayText: 'Daftar 🌸', id: 'daftar' } },
          { index: 2, quickReplyButton: { displayText: 'Owner 💫', id: 'owner' } }
        ]
      });
    }
  });
}

startBot();
