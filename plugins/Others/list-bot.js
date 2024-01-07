let handler = async (m, {
    conn
}) => {
    try {
        const listbot = conn.user.listbot || [];
        const formattedText = listbot.map(({
            name,
            number
        }, i) => `*${i + 1}.* Bot yang Tersedia di Grup:\n   - *Nama:* ${name}\n   - *Nomor:* ${number.split('@')[0]}`).join('\n');

        conn.reply(m.chat, formattedText.trim() === '' ? 'Tidak ada bot yang tersedia di grup ini.' : formattedText, m);
    } catch (e) {
        console.error(e);
        conn.reply(m.chat, 'Terjadi kesalahan.', m);
    }
};
handler.help = ['listbot'];
handler.tags = ['listbot'];
handler.command = /^(listbot|bots)$/i;
handler.group = true
export default handler;