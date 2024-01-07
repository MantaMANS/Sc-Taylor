import {
    uploadPomf2
} from '../../lib/scraper/scraper-toolv2.js';

let handler = async (m, {
    args,
    usedPrefix,
    command
}) => {
    try {
        let q = m.quoted ? m.quoted : m;
        let mime = (q.msg || q).mimetype || '';
        if (!mime) throw 'No media found';
        let media = await q.download();
        await m.reply(wait);
        let linkPom = await uploadPomf2(media);
        const response = linkPom;
        if (response.success) {
            const fileSize = formatBytes(response.files[0].size);
            const pesan = `*Pesan Anda berhasil terkirim! 🚀*\n\n*File Detail:*\n*URL:* ${response.files[0].url}\n*Ukuran:* ${fileSize}`;
            await m.reply(pesan);
        } else {
            await m.reply('Pesan Anda gagal terkirim. 🙁');
        }
    } catch (error) {
        console.error(error);
        await m.reply('Terjadi kesalahan dalam pemrosesan permintaan Anda. 🙁');
    }
};
handler.help = ["pomf2"];
handler.tags = ["tools"];
handler.command = /^(pomf2)$/i;
export default handler;

function formatBytes(sizeInBytes) {
    const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    let size = sizeInBytes,
        unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) size /= 1024, unitIndex++;
    return size.toFixed(2) + " " + units[unitIndex];
}