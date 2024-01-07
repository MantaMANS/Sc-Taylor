import fetch from 'node-fetch';
import {
    FormData,
    Blob
} from 'formdata-node';
import {
    fileTypeFromBuffer
} from 'file-type';
import cheerio from "cheerio"
let handler = async (m, {
    conn,
    text,
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
        let linkPom = await top4top(media);
        let {
            upBoxTitle,
            imgSrc,
            imgURL,
            imgBBC,
            imgHTML,
            delCode
        } = linkPom
        let caption = `${upBoxTitle}
📮 *L I N K:*
${imgURL || imgSrc}

*Del Code*
${delCode}
📊 *S I Z E :* ${media.length} Byte
`
        await conn.reply(m.chat, caption, m)
    } catch (error) {
        console.error(error);
        await m.reply('Terjadi kesalahan dalam pemrosesan permintaan Anda. 🙁');
    }
}
handler.help = ["top4top"]
handler.tags = ["porm"]
handler.command = /^(top4top)$/i
export default handler

const top4top = async buffer => {
    try {
        const {
            ext,
            mime
        } = await fileTypeFromBuffer(buffer) || {};
        let form = new FormData();
        const blob = new Blob([buffer.toArrayBuffer()], {
            type: mime
        });
        form.append('file_1_', blob, 'tmp.' + ext);
        form.append("submitr", "[ رفع الملفات ]");
        let res = await fetch('https://www.top4top.me/#uploader', {
            method: 'POST',
            body: form
        });
        const html = await res.text();
        const $ = cheerio.load(html);
        const data = $('.list-group-item').map((index, element) => ({
            upBoxTitle: $(element).find('.up-box-title').text().trim(),
            imgSrc: $(element).find('img').attr('src'),
            imgURL: $(element).find('#image1').val(),
            imgBBC: $(element).find('#imageBBC').val(),
            imgHTML: $(element).find('#imageHTML').val(),
            delCode: $(element).find('#imagedelCode').val(),
        })).get();
        return data[0];
    } catch (error) {
        console.error(error);
        throw error; // Rethrow the error to the calling function
    }
};

function formatBytes(sizeInBytes) {
    const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    let size = sizeInBytes,
        unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) size /= 1024, unitIndex++;
    return size.toFixed(2) + " " + units[unitIndex];
}