import uploadFile from '../../lib/uploadFile.js'
import uploadImage from '../../lib/uploadImage.js'

let handler = async (m, {
    usedPrefix,
    command
}) => {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''
    if (!mime) throw `Reply media dengan perintah *${usedPrefix + command}*`
    let media = await q.download()
    let isTele = /image\/(png|jpe?g|gif)|video\/mp4/.test(mime)
    let link = await (isTele ? uploadImage : uploadFile)(media)
    m.reply(`${link}
${formatBytes(media.length)}
${isTele ? '(Tidak Ada Tanggal Kedaluwarsa)' : '(Tidak diketahui)'}`)
}
handler.help = ['upload']
handler.tags = ['tools']
handler.command = /^upload$/i

export default handler

function formatBytes(sizeInBytes) {
    const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    let size = sizeInBytes,
        unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) size /= 1024, unitIndex++;
    return size.toFixed(2) + " " + units[unitIndex];
}