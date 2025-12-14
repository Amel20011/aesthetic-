const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const sharp = require('sharp');
const fs = require('fs');

module.exports = async (sock, msg, from) => {
  const buffer = await downloadMediaMessage(msg, 'buffer');
  const out = './temp.webp';
  await sharp(buffer)
    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp()
    .toFile(out);
  await sock.sendMessage(from, { sticker: fs.readFileSync(out) });
  fs.unlinkSync(out);
};
