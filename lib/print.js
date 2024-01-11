import {
    WAMessageStubType
} from '@whiskeysockets/baileys';
import PhoneNumber from 'awesome-phonenumber';
import ora from 'ora';
import chalk from 'chalk';
import {
    watchFile,
    readFile,
    writeFile
} from 'fs';
import terminalImage from 'terminal-image';
import urlRegex from 'url-regex-safe';
import {
    format
} from 'util';
import ms from 'ms';
let logCount = 0;
let codeUpdated = false;

export default async function(m, conn = {
    user: {}
}) {
    const formatType = (type) => type ? type.replace(/message$/i, '').replace('audio', m.msg.ptt ? 'PTT' : 'audio').replace(/^./, v => v.toUpperCase()) : 'Unknown';
    const formatTime = (timestamp) => (timestamp ? new Date(1000 * (timestamp.low || timestamp)).toLocaleString() : new Date().toLocaleString());

    const _name = await conn.getName(m.sender);
    const sender = PhoneNumber('+' + m.sender.replace('@s.whatsapp.net', '')).getNumber('international') + (_name ? ' ~' + _name : '');
    const chat = await conn.getName(m.chat);
    const filesize = m.msg && m.msg.vcard ? m.msg.vcard.length : m.msg && m.msg.fileLength ? m.msg.fileLength.low || m.msg.fileLength : m.text ? m.text.length : 0;

    if (m.sender) {
        // Output Message Info
        console.log(chalk.cyan('\n╭──────────────────────────────────────···'));
        console.log(`📨 ${chalk.redBright('Message Info')}:`);
        console.log(chalk.cyan('├──────────────────────────────────────···'));
        console.log(`   ${chalk.cyan('- Message Type')}: ${formatType(m.mtype) || 'N/A'}`);
        console.log(`   ${chalk.cyan('- Message ID')}: ${m.msg?.id || m.key.id || 'N/A'}`);
        console.log(`   ${chalk.cyan('- Sent Time')}: ${formatTime(m.messageTimestamp) || 'N/A'}`);
        console.log(`   ${chalk.cyan('- Message Size')}: ${formatSize(filesize || 0) || 'N/A'}`);
        console.log(`   ${chalk.cyan('- Sender ID')}: ${m.sender.split('@')[0] || m.key.remoteJid || 'N/A'}`);
        console.log(`   ${chalk.cyan('- Sender Name')}: ${m.name || m.pushName || conn.user.name || 'N/A'}`);
        console.log(`   ${chalk.cyan('- Chat ID')}: ${m.chat.split('@')[0] || m.key.remoteJid || 'N/A'}`);
        console.log(`   ${chalk.cyan('- Chat Name')}: ${chat || 'N/A'}`);
        console.log(`   ${chalk.cyan('- Total Log Messages')}: ${logCount}`);
        console.log(chalk.cyan('╰──────────────────────────────────────···\n'));
        if ((opts["antibot"] || (global.db.data.settings[conn.user.jid].antibot && m.isGroup)) && m.msg) {
            const idBot = m.msg?.id || m.key.id || 'N/A';
            if (idBot.includes("BAE5") && m.sender !== conn.user.jid) {
                const antiBotMessage = "[ *🚫 ANTI BOT 🚫* ]\n\n🛑 Group ini dilengkapi dengan anti bot\n\n⚠ Anda melanggar larangan bot\n\n✂ Anda berhak di kick";

                return conn.sendMessage(m.chat, {
                    text: antiBotMessage,
                    mentions: [m.sender]
                }, {
                    quoted: m
                });
                conn.logger.info('Bot detected ' + m.sender.split('@')[0]);
            }
        }

        if (m.isGroup && m.msg) {
            const idBot = m.msg?.id || m.key.id || 'N/A';
            if (idBot.includes("BAE5") && m.sender !== conn.user.jid) {
                conn.user.listbot = conn.user.listbot ? conn.user.listbot : [];
                const isNewBot = !conn.user.listbot.some(bot => bot.number === m.sender);
                isNewBot && conn.user.listbot.push({
                    name: m.name ?? m.pushName ?? conn.user.name ?? 'N/A',
                    number: m.sender
                });
                if (isNewBot) {
                    conn.logger.info('New bot number ' + m.sender.split('@')[0]);
                }
            }
        }
    }

    // Output text message with formatting
    if (typeof m?.text === 'string' && m.text && m.isCommand) {
        console.log(chalk.cyan('╭──────────────────────────────────────···'));
        let logMessage = m.text.replace(/\u200e+/g, '');

        // Formatting function for markdown-like text
        const mdRegex = /(?<=(?:^|[\s\n])\S?)(?:([*_~])(.+?)\1|```((?:.||[\n\r])+?)```)(?=\S?(?:[\s\n]|$))/g;
        const mdFormat = (depth = 4) => (_, type, text, monospace) => {
            const types = {
                _: 'italic',
                '*': 'bold',
                '~': 'strikethrough'
            };
            text = text || monospace;
            const formatted = !types[type] || depth < 1 ? text : chalk[types[type]](text.replace(mdRegex, mdFormat(depth - 1)));
            return formatted;
        };

        if (logMessage.length < 4096) {
            logMessage = logMessage.replace(urlRegex, (url, i, text) => {
                const end = url.length + i;
                return i === 0 || end === text.length || (/^\s$/.test(text[end]) && /^\s$/.test(text[i - 1])) ? chalk.blueBright(url) : url;
            });
        }

        logMessage = logMessage.replace(mdRegex, mdFormat(4));

        if (m.mentionedJid) {
            for (const user of m.mentionedJid) {
                logMessage = logMessage.replace('@' + user.split`@` [0], chalk.blueBright('@' + await conn.getName(user)));
            }
        }

        const maxLogLength = 200;
        const truncatedLog = logMessage.length > maxLogLength ? `${logMessage.slice(0, maxLogLength / 2)}...${logMessage.slice(-maxLogLength / 2)}` : logMessage;
        console.log((m.error != null ? `🚨 ${chalk.red(truncatedLog)}` : (m.isCommand ? `⚙️ ${chalk.yellow(truncatedLog)}` : truncatedLog)));
        console.log(chalk.cyan('╰──────────────────────────────────────···'));
    }

    if (m.msg) {
        const attachmentType = m.mtype.replace(/message$/i, '');

        if (/document/i.test(attachmentType)) {
            console.log(chalk.cyan('╭──────────────────────────────────────···'));
            console.log(chalk.redBright(`📄 Attached Document: ${m.msg.fileName || m.msg.displayName || 'Document'}`));
            console.log(chalk.cyan('╰──────────────────────────────────────···'));
        } else if (/contact/i.test(attachmentType)) {
            console.log(chalk.cyan('╭──────────────────────────────────────···'));
            console.log(chalk.redBright(`👨 Attached Contact: ${m.msg.displayName || 'N/A'}`));
            console.log(chalk.cyan('╰──────────────────────────────────────···'));
        } else if (/audio/i.test(attachmentType)) {
            console.log(chalk.cyan('╭──────────────────────────────────────···'));
            const duration = m.msg.seconds || 0;
            const formattedDuration = formatDuration(duration);
            console.log(chalk.redBright(`🎵 Attached Audio: ${m.msg.ptt ? '(PTT)' : '(Audio)'} - Duration: ${formattedDuration}`));
            console.log(chalk.cyan('╰──────────────────────────────────────···'));
        } else if (/image/i.test(attachmentType)) {
            console.log(chalk.cyan('╭──────────────────────────────────────···'));
            const attachmentName = m.msg.caption || attachmentType;
            console.log(chalk.redBright(`🟡 Attached Image: ${attachmentName}`));

            if (m.msg.url && global.opts["img"]) {
                try {
                    const imageBuffer = await m.download();
                    const terminalImg = await terminalImage.buffer(imageBuffer);
                    console.log(terminalImg);
                } catch (error) {
                    console.error(chalk.red('Error displaying image:'), error);
                }
            }

            console.log(chalk.cyan('╰──────────────────────────────────────···'));
        } else if (/video/i.test(attachmentType)) {
            console.log(chalk.cyan('╭──────────────────────────────────────···'));
            const attachmentName = m.msg.caption || attachmentType;
            console.log(chalk.redBright(`📹 Attached Video: ${attachmentName}`));
            console.log(chalk.cyan('╰──────────────────────────────────────···'));
        } else if (/sticker/i.test(attachmentType)) {
            console.log(chalk.cyan('╭──────────────────────────────────────···'));
            const attachmentName = m.msg.caption || attachmentType;
            console.log(chalk.redBright(`🎴 Attached Sticker: ${attachmentName}`));
            console.log(chalk.cyan('╰──────────────────────────────────────···'));
        }
    }

    if (m.sender) {
        console.log(chalk.greenBright(`\n  ${chalk.red('From')}: ${getPhoneNumber(m.sender)}`));
        console.log(chalk.blueBright(`  ${chalk.red('To')}: ${getPhoneNumber(conn.user?.jid)}`));
        console.log(chalk.magentaBright('\n'));
    }

    // Increase log count
    logCount++;
conn.spinner ||= { instance: {}, startTime: {}, intervalId: {}, spinning: false };

if (logCount >= 100) {
    console.clear();
    logCount = 0;
}

if (!(m?.text && m?.isCommand && m?.sender && m?.msg)) {
    if (!conn.spinner.spinning) {
        conn.spinner.startTime = new Date();
        conn.spinner.instance = ora({
            text: chalk.bold.magenta(`🌟 Waiting for message...`),
            spinner: 'moon'
        }).start();
        conn.spinner.intervalId = setInterval(() => {
            const elapsedTime = Math.round((new Date() - conn.spinner.startTime) / 1000);
            const formattedTime = new Date(elapsedTime * 1000).toISOString().substr(11, 8);
            conn.spinner.instance.text = `${chalk.bold.magenta('Waiting for message...')} ${chalk.cyan(`(${formattedTime})`)}`;
        }, 1000);
        conn.spinner.spinning = true;
    }
} else if (m?.text && m?.isCommand && m?.sender && m?.msg) {
    if (conn.spinner.spinning) {
        conn.spinner.instance.stop();
        clearInterval(conn.spinner.intervalId);
        conn.spinner.instance = {};
        conn.spinner.spinning = false;
    }
}

}

const getPhoneNumber = (jid) => PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international');
const getContactInfo = (jid) => `   - ${getPhoneNumber(jid)} ${conn.getName(jid) ? `~ ${conn.getName(jid)}` : ''}`;

// Watch the file for changes
const file = global.__filename(import.meta.url);
watchFile(file, async () => {
    console.log(chalk.redBright("Update 'lib/print.js'"));

    if (!codeUpdated) {
        // Read the current content of the file
        readFile(file, 'utf8', (err, data) => {
            if (err) {
                console.error(chalk.redBright('Error reading the file:'), err);
                return;
            }

            // Write the updated code back to the file
            writeFile(file, data, (writeErr) => {
                if (writeErr) {
                    console.error(chalk.redBright('Error saving the updated code:'), writeErr);
                } else {
                    codeUpdated = true;
                    console.log(chalk.greenBright('Updated code has been saved to the file.'));
                }
            });
        });
    }
});

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

function formatDuration(duration) {
    try {
        const formattedDuration = ms(duration, {
            long: true
        });
        return formattedDuration;
    } catch (error) {
        console.error('Terjadi kesalahan:', error.message);
        return 'Durasi tidak valid';
    }
}
