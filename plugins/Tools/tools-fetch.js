import {
    fetch as fetchUndici
} from 'undici';
import got from 'got';
import fetch from 'node-fetch';
import axios from 'axios';
import {
    format
} from 'util';
import userAgent from 'fake-useragent';

const MAX_CONTENT_SIZE = 1 * 1024 * 1024 * 1024;

let handler = async (m, {
    conn,
    text
}) => {
    if (!text) throw '*Masukkan Link*\n*Ex:* s.id';

    text = addHttpsIfNeeded(text);
    let {
        href: url,
        origin
    } = new URL(text);
    let response, contentType, contentLength, txt;

    try {
        response = await fetchUndici(url, {
            redirect: 'follow',
            headers: {
                'Referer': origin,
                'User-Agent': userAgent()
            }
        });
        contentType = response.headers.get('content-type');
        contentLength = response.headers.get('content-length');
        txt = await response.text();
    } catch {
        try {
            response = await got(url, {
                followRedirect: true,
                maxRedirects: 5,
                headers: {
                    'Referer': origin,
                    'User-Agent': userAgent()
                }
            });
            contentType = response.headers['content-type'];
            contentLength = response.headers['content-length'];
            txt = response.body;
        } catch {
            try {
                response = await fetch(url, {
                    redirect: 'follow',
                    headers: {
                        'Referer': origin,
                        'User-Agent': userAgent()
                    }
                });
                contentType = response.headers.get('content-type');
                contentLength = response.headers.get('content-length');
                txt = await response.text();
            } catch {
                try {
                    response = await axios.get(url, {
                        maxRedirects: 5,
                        validateStatus: null,
                        headers: {
                            'referer': origin,
                            'User-Agent': userAgent()
                        }
                    });
                    contentType = response.headers['content-type'];
                    contentLength = response.headers['content-length'];
                    txt = response.data;
                } catch {
                    throw "Gagal mengambil data dari semua sumber";
                }
            }
        }
    }

    const contentLengthArray = [contentLength || (txt && txt.length) || 0];
    const maxContentLength = Math.max(...contentLengthArray);

    if (maxContentLength > MAX_CONTENT_SIZE) {
        return m.reply(`File terlalu besar. Ukuran maksimum adalah ${formatSize(MAX_CONTENT_SIZE)}`);
    }

    const finalContentLength = contentLength !== null && contentLength !== undefined ? contentLength : (txt.length !== null && txt.length !== undefined ? txt.length : 0);
    const finalContentType = contentType !== null && contentType !== undefined ? contentType : 'Tidak diketahui';

    if (!isTextContent(finalContentType)) {
        return conn.sendFile(
            m.chat,
            url,
            finalContentType,
            `📄 *Type:* ${finalContentType}\n📊 *Size:* ${formatSize(finalContentLength)}`,
            m
        );
    }

    try {
        txt = format(JSON.parse(txt + ''));
    } catch {
        txt = txt + '';
    } finally {
        m.reply(txt.slice(0, 65536) + '');
    }
};

handler.help = ['fetch'];
handler.tags = ['tools'];
handler.alias = ['get', 'fetch'];
handler.command = /^(fetch|get)$/i;

export default handler;

function addHttpsIfNeeded(link) {
    if (!/^https?:\/\//i.test(link)) {
        link = "https://" + link;
    }
    return link;
}

function formatSize(size) {
    const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'YB'];
    let i = 0;

    while (size >= 1024 && i < units.length - 1) {
        size /= 1024;
        i++;
    }

    const formattedSize = (typeof size === 'number' ? size.toFixed(2) : '0').toString();
    return `${formattedSize} ${units[i]}`;
}

function isTextContent(contentType) {
    return /^(text\/(plain|html|xml)|application\/(json|(.*\+)?xml))/.test(contentType);
}