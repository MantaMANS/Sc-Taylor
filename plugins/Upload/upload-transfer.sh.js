import fetch from "node-fetch";
import crypto from "crypto";
import {
    FormData,
    Blob
} from 'formdata-node';
import {
    fileTypeFromBuffer
} from 'file-type';

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
        const response = await transfersh(media);
        if (response) {
            const pesan = `*Pesan Anda berhasil terkirim! 🚀*\n\n*URL:* ${response}`;
            await m.reply(pesan);
        } else {
            await m.reply('Pesan Anda gagal terkirim. 🙁');
        }
    } catch (error) {
        console.error(error);
        await m.reply('Terjadi kesalahan dalam pemrosesan permintaan Anda. 🙁');
    }
};
handler.help = ["transfersh"];
handler.tags = ["tools"];
handler.command = /^(transfersh)$/i;
export default handler;

async function transfersh(content) {
    const {
        ext,
        mime
    } = await fileTypeFromBuffer(content) || {};
    const blob = new Blob([content.toArrayBuffer()], {
        type: mime
    });
    const formData = new FormData();
    const randomBytes = crypto.randomBytes(5).toString("hex");
    formData.append('file', blob, randomBytes + '.' + ext);

    const response = await fetch("https://transfer.sh/", {
        method: "POST",
        body: formData,
        headers: {
            "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.157 Safari/537.36"
        },
    });

    return await response.text();
};