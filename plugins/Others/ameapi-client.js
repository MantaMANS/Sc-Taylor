import fetch from "node-fetch";
import crypto from "crypto";
import {
    FormData,
    Blob
} from 'formdata-node';
import {
    fileTypeFromBuffer
} from 'file-type';
import {
    webp2png
} from '../../lib/webp2mp4.js'
import {
    Sticker,
    StickerTypes
} from 'wa-sticker-formatter'
import ameClient from "amethyste-api"
const ameApi = new ameClient(ameapikey)

let handler = async (m, {
    conn,
    text,
    args,
    usedPrefix,
    command
}) => {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''
    if (!mime) return m.reply("balas gambar")
    await m.reply(wait)
    let img = await (await q.download())
    let stek = new Sticker(img, {
        pack: packname,
        author: author,
        type: StickerTypes.FULL
    })

    let out
    try {
        if (/webp/g.test(mime)) out = await webp2png(img)
        else if (/image/g.test(mime) || /video/g.test(mime) || /viewOnce/g.test(mime))
            out = await catbox(img)
        if (typeof out !== 'string') out = await catbox(img)
        else if (/gif/g.test(mime)) out = stek
    } catch (e) {
        console.error(e)
    }

    let effectimg = [
        "3000years", "afusion", "approved", "badge", "batslap", "beautiful", "blur", "blurple", "brazzers",
        "burn", "challenger", "circle", "contrast", "crush", "ddungeon", "deepfry", "dictator", "discordhouse",
        "distort", "dither565", "emboss", "facebook", "fire", "frame", "gay", "glitch", "greyple", "greyscale",
        "instagram", "invert", "jail", "lookwhatkarenhave", "magik", "missionpassed", "moustache", "pixelize",
        "posterize", "ps4", "redple", "rejected", "rip", "scary", "sepia", "sharpen", "sniper", "spin",
        "steamcard", "subzero", "symmetry", "thanos", "tobecontinued", "triggered", "trinity", "twitter",
        "unsharpen", "utatoo", "vs", "wanted", "wasted", "whowouldwin"
    ];

    if (!text) return 'Input Text';
    let index = parseInt(text);

    if (isNaN(index) || index < 1 || index > effectimg.length) {
        return m.reply(`Invalid index. Choose a number between 1 and ${effectimg.length}.`);
    }

    let one = effectimg[index - 1];

    if (!out) return 'Input URL';

    let outPut = await ameApi.generate(one, {
        url: out
    });
    await conn.sendFile(m.chat, outPut, '', '', m);

}
handler.help = ["ame"]
handler.tags = ["maker"]
handler.command = /^ame$/i
export default handler

async function catbox(content) {
    const {
        ext,
        mime
    } = await fileTypeFromBuffer(content) || {};
    const blob = new Blob([content.toArrayBuffer()], {
        type: mime
    });
    const formData = new FormData();
    const randomBytes = crypto.randomBytes(5).toString("hex");
    formData.append('reqtype', 'fileupload');
    formData.append('fileToUpload', blob, randomBytes + '.' + ext);

    const response = await fetch("https://catbox.moe/user/api.php", {
        method: "POST",
        body: formData,
        headers: {
            "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.157 Safari/537.36"
        },
    });

    return await response.text();
};