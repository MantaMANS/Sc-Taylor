import {
    uploadPomf2
} from '../../lib/scraper/scraper-toolv2.js';
import fetch from 'node-fetch';

let handler = async (m, {
    args,
    usedPrefix,
    command
}) => {
    try {
        let q = m.quoted ? m.quoted : m;
        let mime = (q.msg || q).mimetype || '';
        let [start, end] = args;

        if (!mime) throw 'Media not found';

        let media = await q.download();
        let waitMessage = 'Please wait...';
        await m.reply(waitMessage);

        let linkPom = await uploadPomf2(media);

        const response = linkPom;
        if (response.success) {
            const fileSize = formatBytes(response.files[0].size);
            let linkVideo = await cutVideo(response.files[0].url, start, end);

            const message = `*Your message was successfully sent! 🚀*\n\n*File Details:*\n*URL:* ${linkVideo}\n*Size:* ${fileSize}`;
            await conn.sendFile(m.chat, await fetchData(linkVideo), '', message, m);
        } else {
            await m.reply('Your message failed to send. 🙁');
        }
    } catch (error) {
        console.error(error);
        await m.reply('An error occurred while processing your request. 🙁');
    }
};

handler.help = ['cutmp4'].map(v => `${v} <start_time> <end_time>`);
handler.tags = ['tools'];
handler.command = /^(potong(video|mp4)|cut(video|mp4))$/i;
export default handler;

function formatBytes(bytes) {
    if (bytes === 0) {
        return '0 B';
    }
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / 1024 ** i).toFixed(2)} ${sizes[i]}`;
}

const cutVideo = async (link, start, end) => {
    try {
        const response = await fetch('https://api.creatomate.com/v1/renders', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer 960789f9b7ea4a9b9311e7b35eb3d3b515492c525dd19f54b692ba3027d3c424d6d0595595a6ba8b368d8226fda382a6',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "source": {
                    "output_format": "mp4",
                    "elements": [{
                        "type": "video",
                        "source": link,
                        "trim_start": start,
                        "trim_duration": end
                    }]
                }
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return data[0].url;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};

const fetchData = async (url) => {
    try {
        const referer = new URL(url).origin;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Referer': referer,
                'Accept': '*/*',
            },
        });

        const data = await response.arrayBuffer();

        return data;
    } catch (error) {
        throw new Error('Error fetching data:', error);
    }
};