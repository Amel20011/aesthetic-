const fs = require('fs');
const userDB = './user.json';
const groupDB = './group.json';

let users = JSON.parse(fs.readFileSync(userDB, 'utf-8'));
let groups = JSON.parse(fs.readFileSync(groupDB, 'utf-8'));

function isRegistered(user) {
  return users.includes(user);
}
function addUser(user) {
  if (!isRegistered(user)) {
    users.push(user);
    fs.writeFileSync(userDB, JSON.stringify(users, null, 2));
  }
}
function isGroupAdmin(groupId, user) {
  const g = groups.find(g => g.id === groupId);
  return g && g.admins.includes(user);
}
function isOwner(user) {
  return user.includes('13658700681'); // ganti nomor owner
}

module.exports = async (sock, m) => {
  const msg = m.messages[0];
  if (!msg.message || msg.key.fromMe) return;

  const from = msg.key.remoteJid;
  const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
  const sender = msg.key.participant || msg.key.remoteJid;
  const prefix = '.';
  const args = text.slice(prefix.length).trim().split(' ');
  const cmd = args.shift().toLowerCase();

  // handle button response
  if (!text.startsWith(prefix)) {
    if (msg.message.buttonsResponseMessage) {
      const id = msg.message.buttonsResponseMessage.selectedButtonId;
      if (id === 'daftar') {
        if (isRegistered(sender)) {
          await sock.sendMessage(from, { text: 'Kamu sudah terdaftar 🌸' });
        } else {
          addUser(sender);
          await sock.sendMessage(from, { text: '✅ Kamu berhasil daftar! Selamat datang di Astheric Bot 🌷' });
        }
      } else if (id === 'owner') {
        await sock.sendMessage(from, { text: 'Owner: +1 (365) 870-0681 💫' });
      }
    }
    return;
  }

  switch (cmd) {
    case 'menu':
      await sock.sendMessage(from, {
        text: `╭─── 🎀 ASTHERIC BOT MENU 🎀 ───╮
│ Bot : Astheric
│ User : 🌸 @${sender.split('@')[0]}
│ Mode : Multi Device
╰─────────────────────────────╯

🌸 MAIN MENU
♡ .menu       → Tampilkan menu
♡ .allmenu    → Semua command
♡ .info       → Info bot
♡ .ping       → Cek bot aktif
♡ .profile    → Cek profil user
♡ .daftar     → Daftar user baru
♡ .rules      → Peraturan bot
♡ .donasi     → Info donasi / support

💞 GROUP MENU
♡ .antilink on/off     → Blokir link otomatis
♡ .welcome on/off      → Nyalakan pesan welcome
♡ .goodbye on/off      → Nyalakan pesan keluar
♡ .group open/close    → Buka/tutup grup
♡ .add <nomor>         → Tambah member
♡ .kick <nomor>        → Keluarkan member
♡ .promote <nomor>     → Jadikan admin
♡ .demote <nomor>      → Turunkan admin
♡ .tagall              → Tag semua member
♡ .mute on/off         → Heningkan grup
♡ .unmute              → Buka hening

🛡 ADMIN MENU
♡ .del <reply>         → Hapus pesan
♡ .warn <nomor>        → Beri peringatan
♡ .stickers            → Buat sticker dari gambar
♡ .setdesc <teks>      → Ganti deskripsi grup
♡ .setname <teks>      → Ganti nama grup
♡ .hidetag             → Kirim pesan tanpa tag terlihat

💗 OWNER MENU
♡ .owner               → Info owner
♡ .broadcast <pesan>   → Kirim ke semua user
♡ .eval <kode>         → Jalankan kode JS
♡ .restart             → Restart bot
♡ .setprefix <prefix>  → Ganti prefix bot
♡ .block <nomor>       → Block user
♡ .unblock <nomor>     → Unblock user
♡ .setppbot            → Ganti foto profil bot
♡ .setwm <teks>        → Set watermark / footer
♡ .setmenu <teks>      → Set tampilan menu
        `,
        mentions: [sender]
      });
      break;

    case 'ping':
      await sock.sendMessage(from, { text: 'Bot aktif! 🌸' });
      break;

    case 'owner':
      await sock.sendMessage(from, { text: 'Owner: +1 (365) 870-0681 💫' });
      break;

    case 'daftar':
      if (isRegistered(sender)) {
        await sock.sendMessage(from, { text: 'Kamu sudah terdaftar 🌸' });
      } else {
        addUser(sender);
        await sock.sendMessage(from, { text: '✅ Kamu berhasil daftar! Selamat datang di Astheric Bot 🌷' });
      }
      break;

    case 'stickers':
    case 'sticker':
    case 's':
      if (!msg.message.imageMessage) {
        await sock.sendMessage(from, { text: 'Reply gambar untuk jadi sticker!' });
        return;
      }
      require('./sticker')(sock, msg, from);
      break;

    case 'kick':
      if (!isGroupAdmin(from, sender) && !isOwner(sender)) {
        await sock.sendMessage(from, { text: '❌ Kamu bukan admin!' });
        return;
      }
      const kickTarget = args[0] + '@s.whatsapp.net';
      await sock.groupParticipantsUpdate(from, [kickTarget], 'remove');
      await sock.sendMessage(from, { text: '✅ Member dikeluarkan!' });
      break;

    case 'add':
      if (!isGroupAdmin(from, sender) && !isOwner(sender)) {
        await sock.sendMessage(from, { text: '❌ Kamu bukan admin!' });
        return;
      }
      const addTarget = args[0].replace('+', '') + '@s.whatsapp.net';
      await sock.groupParticipantsUpdate(from, [addTarget], 'add');
      await sock.sendMessage(from, { text: '✅ Member ditambahkan!' });
      break;

    case 'promote':
      if (!isGroupAdmin(from, sender) && !isOwner(sender)) {
        await sock.sendMessage(from, { text: '❌ Kamu bukan admin!' });
        return;
      }
      const promoteTarget = args[0] + '@s.whatsapp.net';
      await sock.groupParticipantsUpdate(from, [promoteTarget], 'promote');
      await sock.sendMessage(from, { text: '✅ Member dipromote!' });
      break;

    case 'demote':
      if (!isGroupAdmin(from, sender) && !isOwner(sender)) {
        await sock.sendMessage(from, { text: '❌ Kamu bukan admin!' });
        return;
      }
      const demoteTarget = args[0] + '@s.whatsapp.net';
      await sock.groupParticipantsUpdate(from, [demoteTarget], 'demote');
      await sock.sendMessage(from, { text: '✅ Member didemote!' });
      break;

    case 'tagall':
      if (!isGroupAdmin(from, sender) && !isOwner(sender)) {
        await sock.sendMessage(from, { text: '❌ Kamu bukan admin!' });
        return;
      }
      const meta = await sock.groupMetadata(from);
      const all = meta.participants.map(p => p.id);
      const tagText = args.join(' ') || 'Halo semua!';
      await sock.sendMessage(from, { text: tagText, mentions: all });
      break;

    case 'del':
      if (!msg.message.extendedTextMessage?.contextInfo?.stanzaId) {
        await sock.sendMessage(from, { text: 'Reply pesan yang ingin dihapus!' });
        return;
      }
      const key = {
        remoteJid: from,
        id: msg.message.extendedTextMessage.contextInfo.stanzaId,
        participant: msg.message.extendedTextMessage.contextInfo.participant
      };
      await sock.sendMessage(from, { delete: key });
      break;

    case 'setname':
      if (!isGroupAdmin(from, sender) && !isOwner(sender)) {
        await sock.sendMessage(from, { text: '❌ Kamu bukan admin!' });
        return;
      }
      const newName = args.join(' ');
      await sock.groupUpdateSubject(from, newName);
      await sock.sendMessage(from, { text: '✅ Nama grup diubah!' });
      break;

    case 'setdesc':
      if (!isGroupAdmin(from, sender) && !isOwner(sender)) {
        await sock.sendMessage(from, { text: '❌ Kamu bukan admin!' });
        return;
      }
      const newDesc = args.join(' ');
      await sock.groupUpdateDescription(from, newDesc);
      await sock.sendMessage(from, { text: '✅ Deskripsi grup diubah!' });
      break;

    case 'broadcast':
      if (!isOwner(sender)) {
        await sock.sendMessage(from, { text: '❌ Command ini khusus owner!' });
        return;
      }
      const bcMsg = args.join(' ');
      for (const u of users) {
        await sock.sendMessage(u, { text: `📢 Broadcast dari Owner:\n\n${bcMsg}` });
      }
      await sock.sendMessage(from, { text: '✅ Broadcast selesai!' });
      break;

    case 'eval':
      if (!isOwner(sender)) {
        await sock.sendMessage(from, { text: '❌ Command ini khusus owner!' });
        return;
      }
      try {
        const code = args.join(' ');
        const result = eval(code);
        await sock.sendMessage(from, { text: `Result:\n${JSON.stringify(result)}` });
      } catch (e) {
        await sock.sendMessage(from, { text: `Error:\n${e.message}` });
      }
      break;

    default:
      await sock.sendMessage(from, { text: 'Command tidak dikenal. Ketik .menu untuk bantuan.' });
  }
};
