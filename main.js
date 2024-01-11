process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
import {
    loadConfig
} from './config.js';
import {
    runSyntaxCheck
} from './test.js';

import {
    createRequire
} from "module";
import * as path from 'path';
import {
    fileURLToPath,
    pathToFileURL
} from 'url';
import {
    platform
} from 'process';
global.__filename = function filename(pathURL = import.meta.url, rmPrefix = platform !== 'win32') {
    return rmPrefix ? /file:\/\/\//.test(pathURL) ? fileURLToPath(pathURL) : pathURL : pathToFileURL(pathURL).toString()
}
global.__dirname = function dirname(pathURL) {
    return path.dirname(global.__filename(pathURL, true))
}
global.__require = function require(dir = import.meta.url) {
    return createRequire(dir)
}

import * as ws from 'ws';
import * as glob from 'glob';
import {
    readdirSync,
    statSync,
    unlinkSync,
    existsSync,
    mkdirSync,
    readFileSync,
    rmSync,
    watch
} from 'fs';
import fs from 'fs/promises';
import yargs from 'yargs';
import {
    spawn
} from 'child_process';
import lodash from 'lodash';
import ora from 'ora';
import chalk from 'chalk';
import syntaxerror from 'syntax-error';
import {
    tmpdir
} from 'os';
import chokidar from 'chokidar';
import {
    format,
    promisify
} from 'util';
import {
    Boom
} from "@hapi/boom";
import Pino from 'pino';
import {
    makeWaSocket,
    protoType,
    serialize
} from './lib/simple.js';
import {
    Low,
    JSONFile
} from 'lowdb';
import {
    mongoDB,
    mongoDBV2
} from './lib/mongoDB.js';
import {
    cloudDBAdapter
} from './lib/cloudDBAdapter.js';

const {
    DisconnectReason,
    useMultiFileAuthState,
    MessageRetryMap,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    makeInMemoryStore,
    proto,
    jidNormalizedUser,
    PHONENUMBER_MCC,
    Browsers
} = await (await import('@whiskeysockets/baileys')).default;

import readline from "readline"
import {
    parsePhoneNumber
} from "libphonenumber-js"

import single2multi from './lib/single2multi.js';
import storeSystem from './lib/store-multi.js';
import Helper from './lib/helper.js';
import emojiRegex from 'emoji-regex';

const pairingCode = process.argv.includes("--pairing-code")
const useMobile = process.argv.includes("--mobile")
const useQr = process.argv.includes("--qr")
const singleToMulti = process.argv.includes("--singleauth")

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})
const question = (text) => new Promise((resolve) => rl.question(text, resolve))
import NodeCache from "node-cache"
const msgRetryCounterCache = new NodeCache()
const {
    CONNECTING
} = ws
const {
    chain
} = lodash
const PORT = process.env.PORT || process.env.SERVER_PORT || 3000

protoType()
serialize()

global.API = (name, path = '/', query = {}, apikeyqueryname) => (name in global.APIs ? global.APIs[name] : name) + path + (query || apikeyqueryname ? '?' + new URLSearchParams(Object.entries({
    ...query,
    ...(apikeyqueryname ? {
        [apikeyqueryname]: global.APIKeys[name in global.APIs ? global.APIs[name] : name]
    } : {})
})) : '')
global.timestamp = {
    start: new Date
}

const __dirname = global.__dirname(import.meta.url)
global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse())
const symbolRegex = /^[^\w\s\d]/u;
const emojiAndSymbolRegex = new RegExp(`(${symbolRegex.source}|${emojiRegex().source})`, 'u');
global.prefix = emojiAndSymbolRegex;
global.db = new Low(
    /https?:\/\//.test(opts['db'] || '') ?
    new cloudDBAdapter(opts['db']) : /mongodb(\+srv)?:\/\//i.test(opts['db']) ?
    (opts['mongodbv2'] ? new mongoDBV2(opts['db']) : new mongoDB(opts['db'])) :
    new JSONFile(`${opts._[0] ? opts._[0] + '_' : ''}database.json`)
)

global.DATABASE = global.db
global.loadDatabase = async function loadDatabase() {
    if (global.db.READ) return new Promise((resolve) => setInterval(async function() {
        if (!global.db.READ) {
            clearInterval(this)
            resolve(global.db.data == null ? global.loadDatabase() : global.db.data)
        }
    }, 1 * 1000))
    if (global.db.data !== null) return
    global.db.READ = true
    await global.db.read().catch(console.error)
    global.db.READ = null
    global.db.data = {
        users: {},
        chats: {},
        stats: {},
        msgs: {},
        sticker: {},
        settings: {},
        ...(global.db.data || {})
    }
    global.db.chain = chain(global.db.data)
}

global.authFile = `TaylorSession`;

const msgRetryCounterMap = (MessageRetryMap) => {};
const {
    version
} = await fetchLatestBaileysVersion();

if (!pairingCode && !useMobile && !useQr && !singleToMulti) {
    console.clear();
    const title = "OPTIONS";
    const message = ["--pairing-code", "--mobile", "--qr", "--singleauth"];
    const tableData = message.map(option => ({
        Option: option
    }));
    const tableColumns = ["Option"];
    const boxWidth = 40;

    console.table(tableData, tableColumns, [`background-color: red; color: white; width: ${boxWidth}px; border-radius: 10px;`]);

    process.exit(1);
}

var authFolder = storeSystem.fixFileName(`${Helper.opts._[0] || ''}TaylorSession`)
var authFile = `${Helper.opts._[0] || 'session'}.data.json`

var [
    isCredsExist,
    isAuthSingleFileExist,
    authState
] = await Promise.all([
    Helper.checkFileExists(authFolder + '/creds.json'),
    Helper.checkFileExists(authFile),
    storeSystem.useMultiFileAuthState(authFolder)
])

var store = storeSystem.makeInMemoryStore()

// Convert single auth to multi auth
if (Helper.opts['singleauth'] || Helper.opts['singleauthstate']) {
    if (!isCredsExist && isAuthSingleFileExist) {
        console.debug(chalk.blue('- singleauth -'), chalk.yellow('creds.json not found'), chalk.green('compiling singleauth to multiauth...'));
        await single2multi(authFile, authFolder, authState);
        console.debug(chalk.blue('- singleauth -'), chalk.green('compiled successfully'));
        authState = await storeSystem.useMultiFileAuthState(authFolder);
    } else if (!isAuthSingleFileExist) console.error(chalk.blue('- singleauth -'), chalk.red('singleauth file not found'));
}

var storeFile = `${Helper.opts._[0] || 'data'}.store.json`
store.readFromFile(storeFile)

const connectionOptions = {
    ...(!pairingCode && !useMobile && !useQr && {
        printQRInTerminal: false,
        mobile: !useMobile
    }),
    ...(pairingCode && {
        printQRInTerminal: !pairingCode
    }),
    ...(useMobile && {
        mobile: !useMobile
    }),
    ...(useQr && {
        printQRInTerminal: true
    }),
    patchMessageBeforeSending: (message) => {
        const requiresPatch = !!(message.buttonsMessage || message.templateMessage || message.listMessage);
        if (requiresPatch) {
            message = {
                viewOnceMessage: {
                    message: {
                        messageContextInfo: {
                            deviceListMetadataVersion: 2,
                            deviceListMetadata: {}
                        },
                        ...message
                    }
                }
            };
        }
        return message;
    },
    msgRetryCounterMap,
    logger: Pino({
        level: 'fatal'
    }),
    auth: {
        creds: authState.state.creds,
        keys: makeCacheableSignalKeyStore(authState.state.keys, Pino().child({
            level: 'fatal',
            stream: 'store'
        })),
    },
    browser: ['Chrome (Linux)', '', ''],
    version,
    getMessage: async (key) => {
        let jid = jidNormalizedUser(key.remoteJid)
        let msg = await store.loadMessage(jid, key.id)
        return msg?.message || ""
    },
    msgRetryCounterCache,
    connectTimeoutMs: 60000,
    defaultQueryTimeoutMs: 0,
    keepAliveIntervalMs: 10000,
    emitOwnEvents: true,
    fireInitQueries: true,
    generateHighQualityLinkPreview: true,
    syncFullHistory: true,
    markOnlineOnConnect: true
};

global.conn = makeWaSocket(connectionOptions);
store.bind(conn.ev)
conn.isInit = false

if (pairingCode && !conn.authState.creds.registered) {
    console.clear();
    if (useMobile) conn.logger.error('\nCannot use pairing code with mobile api')
    console.log(chalk.cyan('╭──────────────────────────────────────···'));
    console.log(`📨 ${chalk.redBright('Please type your WhatsApp number')}:`);
    console.log(chalk.cyan('├──────────────────────────────────────···'));
    let phoneNumber = await question(`   ${chalk.cyan('- Number')}: `);
    console.log(chalk.cyan('╰──────────────────────────────────────···'));
    phoneNumber = phoneNumber.replace(/[^0-9]/g, '')
    if (!Object.keys(PHONENUMBER_MCC).some(v => phoneNumber.startsWith(v))) {
        console.log(chalk.cyan('╭─────────────────────────────────────────────────···'));
        console.log(`💬 ${chalk.redBright("Start with your country's WhatsApp code, Example 62xxx")}:`);
        console.log(chalk.cyan('╰─────────────────────────────────────────────────···'));
        console.log(chalk.cyan('╭──────────────────────────────────────···'));
        console.log(`📨 ${chalk.redBright('Please type your WhatsApp number')}:`);
        console.log(chalk.cyan('├──────────────────────────────────────···'));
        phoneNumber = await question(`   ${chalk.cyan('- Number')}: `);
        console.log(chalk.cyan('╰──────────────────────────────────────···'));
        phoneNumber = phoneNumber.replace(/[^0-9]/g, '')
    }
    let code = await conn.requestPairingCode(phoneNumber)
    code = code?.match(/.{1,4}/g)?.join("-") || code
    global.codePairing = code
    console.log(chalk.cyan('╭──────────────────────────────────────···'));
    console.log(` 💻 ${chalk.redBright('Your Pairing Code')}:`);
    console.log(chalk.cyan('├──────────────────────────────────────···'));
    console.log(`   ${chalk.cyan('- Code')}: ${code}`);
    console.log(chalk.cyan('╰──────────────────────────────────────···'));
    rl.close()
}

if (useMobile && !conn.authState.creds.registered) {
    console.clear();
    const {
        registration
    } = conn.authState.creds || {
        registration: {}
    }
    if (!registration.phoneNumber) {
        console.log(chalk.cyan('╭──────────────────────────────────────···'));
        console.log(`📨 ${chalk.redBright('Please type your WhatsApp number')}:`);
        console.log(chalk.cyan('├──────────────────────────────────────···'));
        let phoneNumber = await question(`   ${chalk.cyan('- Number')}: `);
        console.log(chalk.cyan('╰──────────────────────────────────────···'));
        phoneNumber = phoneNumber.replace(/[^0-9]/g, '')
        if (!Object.keys(PHONENUMBER_MCC).some(v => phoneNumber.startsWith(v))) {
            console.log(chalk.cyan('╭─────────────────────────────────────────────────···'));
            console.log(`💬 ${chalk.redBright("Start with your country's WhatsApp code, Example 62xxx")}:`);
            console.log(chalk.cyan('╰─────────────────────────────────────────────────···'));
            console.log(chalk.cyan('╭──────────────────────────────────────···'));
            console.log(`📨 ${chalk.redBright('Please type your WhatsApp number')}:`);
            console.log(chalk.cyan('├──────────────────────────────────────···'));
            phoneNumber = await question(`   ${chalk.cyan('- Number')}: `);
            console.log(chalk.cyan('╰──────────────────────────────────────···'));
            phoneNumber = phoneNumber.replace(/[^0-9]/g, '')
        }
        registration.phoneNumber = "+" + phoneNumber
    }

    const phoneNumber = parsePhoneNumber(registration.phoneNumber)
    if (!phoneNumber.isValid()) conn.logger.error('\nInvalid phone number: ' + registration.phoneNumber)
    registration.phoneNumber = phoneNumber.format("E.164")
    registration.phoneNumberCountryCode = phoneNumber.countryCallingCode
    registration.phoneNumberNationalNumber = phoneNumber.nationalNumber
    const mcc = PHONENUMBER_MCC[phoneNumber.countryCallingCode]
    registration.phoneNumberMobileCountryCode = mcc
    async function enterCode() {
        try {
            console.log(chalk.cyan('╭──────────────────────────────────────···'));
            console.log(`📨 ${chalk.redBright('Please Enter Your OTP Code')}:`);
            console.log(chalk.cyan('├──────────────────────────────────────···'));
            const code = await question(`   ${chalk.cyan('- Code')}: `);
            console.log(chalk.cyan('╰──────────────────────────────────────···'));
            const response = await conn.register(code.replace(/[^0-9]/g, '').trim().toLowerCase())
            console.log(chalk.cyan('╭─────────────────────────────────────────────────···'));
            console.log(`💬 ${chalk.redBright("Successfully registered your phone number.")}`);
            console.log(chalk.cyan('╰─────────────────────────────────────────────────···'));
            console.log(response)
            rl.close()
        } catch (error) {
            conn.logger.error('\nFailed to register your phone number. Please try again.\n', error)
            await askOTP()
        }
    }

    async function askOTP() {
        console.clear();
        console.log(chalk.cyan('╭──────────────────────────────────────···'));
        console.log(`📨 ${chalk.redBright('What method do you want to use? "sms" or "voice"')}`);
        console.log(chalk.cyan('├──────────────────────────────────────···'));
        let code = await question(`   ${chalk.cyan('- Method')}: `);
        console.log(chalk.cyan('╰──────────────────────────────────────···'));
        code = code.replace(/["']/g, '').trim().toLowerCase()
        if (code !== 'sms' && code !== 'voice') return await askOTP()
        registration.method = code
        try {
            await conn.requestRegistrationCode(registration)
            await enterCode()
        } catch (error) {
            conn.logger.error('\nFailed to request registration code. Please try again.\n', error)
            await askOTP()
        }
    }
    await askOTP()
}

conn.logger.info('\n🚩 W A I T I N G\n');

if (!opts['test']) {
    if (global.db) {
        setInterval(async () => {
            if (global.db.data) await global.db.write();
            if (opts['autocleartmp'] && (global.support || {}).find)(tmp = [os.tmpdir(), 'tmp', 'jadibot'], tmp.forEach((filename) => cp.spawn('find', [filename, '-amin', '3', '-type', 'f', '-delete'])));
        }, 30 * 1000);
    }
}

if (opts['server'])(await import('./server.js')).default(global.conn, PORT);

async function clearTmp() {
    try {
        const tmp = [tmpdir(), path.join(__dirname, './tmp')];
        const filenames = await Promise.all(tmp.map(async (dirname) => {
            try {
                const files = await readdirSync(dirname);
                return Promise.all(files.map(async (file) => {
                    try {
                        const filePath = path.join(dirname, file);
                        const stats = await statSync(filePath);
                        if (stats.isFile() && Date.now() - stats.mtimeMs >= 1000 * 60 * 3) {
                            await unlinkSync(filePath);
                            console.log('Successfully cleared tmp:', filePath);
                            return filePath;
                        }
                    } catch (err) {
                        console.error(`Error processing ${file}: ${err.message}`);
                        
                    }
                }));
            } catch (err) {
                console.error(`Error reading directory ${dirname}: ${err.message}`);
                return [];
            }
        }));
        return filenames.flat().filter((file) => file !== null);
    } catch (err) {
        console.error(`Error in clearTmp: ${err.message}`);
        return [];
    }
}

async function clearSessions(folder = './TaylorSession') {
    try {
        const filenames = await readdirSync(folder);
        const deletedFiles = await Promise.all(filenames.map(async (file) => {
            try {
                const filePath = path.join(folder, file);
                const stats = await statSync(filePath);
                if (stats.isFile() && Date.now() - stats.mtimeMs >= 1000 * 60 * 120 && file !== 'creds.json') {
                    await unlinkSync(filePath);
                    console.log('Deleted session:', filePath);
                    return filePath;
                }
                
            } catch (err) {
                console.error(`Error processing ${file}: ${err.message}`);
                
            }
        }));
        return deletedFiles.filter((file) => file !== null);
    } catch (err) {
        console.error(`Error in clearSessions: ${err.message}`);
        return [];
    }
}

async function purgeSession() {
    try {
        const prekeyFolder = './TaylorSession';
        const prekeyFiles = await readdirSync(prekeyFolder);
        await Promise.all(prekeyFiles.map(async (file) => {
            try {
                if (file !== 'creds.json') {
                    await unlinkSync(path.join(prekeyFolder, file));
                }
            } catch (err) {
                console.error(`Error unlinking ${file}: ${err.message}`);
            }
        }));
    } catch (err) {
        console.error(`Error in purgeSession: ${err.message}`);
    }
}

async function purgeSessionSB() {
    try {
        const directories = ['./TaylorSession/', './jadibot/'];
        await Promise.all(directories.map(async (folderPath) => {
            try {
                if (!existsSync(folderPath)) {
                    await mkdirSync(folderPath);
                    console.log(`\nFolder ${folderPath} successfully created.`);
                }
                const listaDirectorios = await readdirSync(folderPath);
                await Promise.all(listaDirectorios.map(async (filesInDir) => {
                    const dirPath = path.join(folderPath, filesInDir);

                    try {
                        const isDirectory = (await statSync(dirPath)).isDirectory();
                        if (isDirectory) {
                            const SBprekeyFiles = await readdirSync(dirPath);
                            await Promise.all(SBprekeyFiles.map(async (fileInDir) => {
                                try {
                                    if (fileInDir !== 'creds.json') {
                                        await unlinkSync(path.join(dirPath, fileInDir));
                                    }
                                } catch (err) {
                                    console.error(`Error unlinking ${fileInDir}: ${err.message}`);
                                }
                            }));
                        }
                    } catch (err) {
                        console.error(`Error checking directory ${dirPath}: ${err.message}`);
                    }
                }));
            } catch (err) {
                console.error(`Error in purgeSessionSB: ${err.message}`);
            }
        }));
    } catch (err) {
        console.error(`Error in purgeSessionSB: ${err.message}`);
    }
}

async function purgeOldFiles() {
    try {
        const directories = ['./TaylorSession/', './jadibot/'];
        const oneHourAgo = Date.now() - (60 * 60 * 1000);
        await Promise.all(directories.map(async (dir) => {
            const files = await readdirSync(dir);
            await Promise.all(files.map(async (file) => {
                try {
                    const filePath = path.join(dir, file);
                    const stats = await statSync(filePath);
                    if (stats.isFile() && stats.mtimeMs < oneHourAgo && file !== 'creds.json') {
                        await unlinkSync(filePath);
                        console.log(`\nFile ${file} successfully deleted`);
                    } else {
                        console.warn(`\nFile ${file} not deleted`);
                    }
                } catch (err) {
                    console.error(`Error processing ${file}: ${err.message}`);
                }
            }));
        }));
    } catch (err) {
        console.error(`Error in purgeOldFiles: ${err.message}`);
    }
}

global.connectionAttempts = 0
async function connectionUpdate(update) {
    const {
        connection,
        lastDisconnect,
        isNewLogin,
        qr,
        isOnline,
        receivedPendingNotifications
    } = update;
    if (isNewLogin) conn.isInit = true;
    const code = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode;
    if (code && code !== DisconnectReason.loggedOut && conn?.ws.socket == null) {
        conn.logger.info(await global.reloadHandler(true).catch(console.error));
    }
    if (global.db.data == null) loadDatabase();
    
    if (connection === 'connecting') {
    global.connectionAttempts++
    console.log(chalk.redBright('⚡ Mengaktifkan Bot, Mohon tunggu sebentar...'));

    if (global.connectionAttempts >= 5) {
        console.clear();
        console.log(chalk.redBright('Tidak bisa terhubung. Kemungkinan akun Anda di banned.'));
        process.exit(1);
    }
}

    if (connection === 'open') {
        try {
            const {
                jid
            } = conn.user;
            const name = await conn.getName(jid);
            conn.user.name = name || 'Taylor';

            const currentTime = new Date();
            const pingStart = new Date();
            const pingSpeed = pingStart - currentTime;
            const formattedPingSpeed = pingSpeed < 0 ? 'N/A' : `${pingSpeed}ms`;

            const infoMsg = `🤖 *Bot Info* 🤖
🕰️ *Current Time:* ${currentTime}
👤 *Name:* *${name || 'Taylor'}*
🏷️ *Tag:* *@${jid.split('@')[0]}*
⚡ *Ping Speed:* *${formattedPingSpeed}*
📅 *Date:* ${currentTime.toDateString()}
🕒 *Time:* ${currentTime.toLocaleTimeString()}
📆 *Day:* ${currentTime.toLocaleDateString('id-ID', { weekday: 'long' })}
📝 *Description:* Bot *${name || 'Taylor'}* is now active.`;

            await conn.reply(
                `${nomorown}@s.whatsapp.net`,
                infoMsg,
                null, {
                    contextInfo: {
                        mentionedJid: [nomorown + '@s.whatsapp.net', jid]
                    },
                }
            );
        } catch (e) {
        console.clear();
            console.log('Bot is now active.');
        }
        console.clear();
        conn.logger.info(chalk.yellow('\n🚩 R E A D Y'));
    }
    if (isOnline == true) {
    console.clear();
        conn.logger.info(chalk.green('Status Aktif'));
    }
    if (isOnline == false) {
    console.clear();
        conn.logger.error(chalk.red('Status Mati'));
    }
    if (receivedPendingNotifications) {
    console.clear();
        conn.logger.warn(chalk.yellow('Menunggu Pesan Baru'));
    }

    if (!pairingCode && !useMobile && qr !== 0 && qr !== undefined && connection === 'close') {
    console.clear();
        conn.logger.error(chalk.yellow(`\n🚩 Koneksi ditutup, harap hapus folder ${global.authFile} dan pindai ulang kode QR`));
        process.exit(1);
    }

    if (!pairingCode && !useMobile && useQr && qr !== 0 && qr !== undefined && connection === 'close') {
    console.clear();
        conn.logger.info(chalk.yellow(`\n🚩ㅤPindai kode QR ini, kode QR akan kedaluwarsa dalam 60 detik.`));
        process.exit(1);
    }

}

global.loggedErrors = global.loggedErrors || new Set();

process.on('uncaughtException', err => {
    if (!global.loggedErrors.has(err)) {
    console.clear();
        console.error(chalk.red.bold('Uncaught Exception:'), err);
        global.loggedErrors.add(err);
    }
});

process.on('rejectionHandled', promise => {
    if (!global.loggedErrors.has(promise)) {
    console.clear();
        console.error(chalk.red.bold('Rejection Handled:'), promise);
        global.loggedErrors.add(promise);
    }
});

process.on('warning', warning => console.warn(chalk.yellow.bold('Warning:'), warning));

process.on('unhandledRejection', err => {
    if (!global.loggedErrors.has(err)) {
    console.clear();
        console.error(chalk.red.bold('Unhandled Rejection:'), err);
        global.loggedErrors.add(err);
    }
});

let isInit = true;
let handler = await import('./handler.js');
global.reloadHandler = async function(restatConn) {
    try {
        const Handler = await import(`./handler.js?update=${Date.now()}`).catch(console.error);
        if (Object.keys(Handler || {}).length) handler = Handler;
    } catch (error) {
        console.error;
    }
    if (restatConn) {
        const oldChats = global.conn.chats;
        try {
            global.conn.ws.close();
        } catch {}
        conn.ev.removeAllListeners();
        global.conn = makeWaSocket(connectionOptions, {
            chats: oldChats
        });
        isInit = true;
    }
    if (!isInit) {
        conn.ev.off('messages.upsert', conn.handler);
        conn.ev.off('messages.update', conn.pollUpdate);
        conn.ev.off('group-participants.update', conn.participantsUpdate);
        conn.ev.off('groups.update', conn.groupsUpdate);
        conn.ev.off('message.delete', conn.onDelete);
        conn.ev.off('presence.update', conn.presenceUpdate);
        conn.ev.off('connection.update', conn.connectionUpdate);
        conn.ev.off('creds.update', conn.credsUpdate);
    }

    const emoji = {
        welcome: '👋',
        bye: '👋',
        promote: '👤👑',
        demote: '👤🙅‍♂️',
        desc: '📝',
        subject: '📌',
        icon: '🖼️',
        revoke: '🔗',
        announceOn: '🔒',
        announceOff: '🔓',
        restrictOn: '🚫',
        restrictOff: '✅',
    };

    conn.welcome = `${emoji.welcome} Hallo @user\n\n   *W E L C O M E*\n⫹⫺ Di grup @subject\n\n⫹⫺ Baca *DESKRIPSI*\n@desc`;
    conn.bye = `   *G O O D B Y E*\n${emoji.bye} Sampai jumpa @user`;
    conn.spromote = `*${emoji.promote} @user* sekarang menjadi admin!`;
    conn.sdemote = `*${emoji.demote} @user* tidak lagi menjadi admin!`;
    conn.sDesc = `${emoji.desc} Deskripsi telah diubah menjadi:\n@desc`;
    conn.sSubject = `${emoji.subject} Judul grup telah diubah menjadi:\n@subject`;
    conn.sIcon = `${emoji.icon} Icon grup telah diubah!`;
    conn.sRevoke = `${emoji.revoke} Link grup telah diubah ke:\n@revoke`;
    conn.sAnnounceOn = `${emoji.announceOn} Grup telah ditutup!\nSekarang hanya admin yang dapat mengirim pesan.`;
    conn.sAnnounceOff = `${emoji.announceOff} Grup telah dibuka!\nSekarang semua peserta dapat mengirim pesan.`;
    conn.sRestrictOn = `${emoji.restrictOn} Edit Info Grup diubah ke hanya admin!`;
    conn.sRestrictOff = `${emoji.restrictOff} Edit Info Grup diubah ke semua peserta!`;

    conn.handler = handler.handler.bind(global.conn);
    conn.pollUpdate = handler.pollUpdate.bind(global.conn);
    conn.participantsUpdate = handler.participantsUpdate.bind(global.conn);
    conn.groupsUpdate = handler.groupsUpdate.bind(global.conn);
    conn.onDelete = handler.deleteUpdate.bind(global.conn);
    conn.presenceUpdate = handler.presenceUpdate.bind(global.conn);
    conn.connectionUpdate = connectionUpdate.bind(global.conn);
    conn.credsUpdate = authState.saveCreds.bind(global.conn, true);

    const currentDateTime = new Date();
    const messageDateTime = new Date(conn.ev);
    if (currentDateTime >= messageDateTime) {
        const chats = Object.entries(conn.chats).filter(([jid, chat]) => !jid.endsWith('@g.us') && chat.isChats).map((v) => v[0]);
    } else {
        const chats = Object.entries(conn.chats).filter(([jid, chat]) => !jid.endsWith('@g.us') && chat.isChats).map((v) => v[0]);
    }

    conn.ev.on('messages.upsert', conn.handler);
    conn.ev.on('messages.update', conn.pollUpdate);
    conn.ev.on('group-participants.update', conn.participantsUpdate);
    conn.ev.on('groups.update', conn.groupsUpdate);
    conn.ev.on('message.delete', conn.onDelete);
    conn.ev.on('presence.update', conn.presenceUpdate);
    conn.ev.on('connection.update', conn.connectionUpdate);
    conn.ev.on('creds.update', conn.credsUpdate);

    isInit = false;
    return true;
};

const pluginFolder = path.resolve(__dirname, 'plugins');
const pluginFilter = (filename) => /\.js$/.test(filename);
const filename = (file) => file.replace(/^.*[\\\/]/, '');
global.plugins = {};

async function filesInit() {
    try {
        const pluginsDirectory = path.resolve(__dirname, 'plugins');
        const pattern = path.resolve(pluginsDirectory, '**/*.js');
        const CommandsFiles = glob.sync(pattern, {
            ignore: ['**/node_modules/**']
        });

        const importPromises = CommandsFiles.map(async (file) => {
            const moduleName = path.join('/plugins', path.relative(pluginsDirectory, file));

            try {
                const module = await import(file);
                global.plugins[moduleName] = module.default || module;

                return moduleName;
            } catch (e) {
                conn.logger.error(e);
                delete global.plugins[moduleName];
                return {
                    moduleName,
                    filePath: file
                };
            }
        });

        const results = await Promise.all(importPromises);
        const successMessages = results.filter((result) => typeof result === 'string');
        const errorMessages = results.filter((result) => typeof result === 'object');

        conn.logger.warn(`Loaded ${CommandsFiles.length} JS Files total.`);
        conn.logger.info(`✅ Success Plugins:\n${successMessages.length} total.`);
        conn.logger.error(`❌ Error Plugins:\n${errorMessages.length} total`);

        try {
            await conn.reply(
                nomorown + '@s.whatsapp.net',
                '🤖 *Loaded Plugins Report* 🤖\n' +
                `🔧 *Total Plugins:* ${CommandsFiles.length}\n` +
                `✅ *Success:* ${successMessages.length}\n` +
                `❌ *Error:* ${errorMessages.length}\n` +
                (errorMessages.length > 0 ?
                    `  ❗ *Errors:* ${errorMessages.map((error, index) => `\n    ${index + 1}. ${error.filePath}`).join('')}\n` : ''),
                null
            );
        } catch (e) {
        console.clear();
            console.log('Bot loaded plugins.');
        }
    } catch (e) {
        conn.logger.error(e);
    }
}

global.reload = async (_ev, filename) => {
    if (pluginFilter(filename)) {
        let dir = path.join(pluginFolder, filename);
        if (filename in global.plugins) {
            if (existsSync(dir))
                conn.logger.info(`re-require plugin '${filename}'`);
            else {
                conn.logger.warn(`deleted plugin '${filename}'`);
                return delete global.plugins[filename];
            }
        } else conn.logger.info(`requiring new plugin '${filename}'`);

        try {
            const fileContent = await readFileSync(dir, 'utf-8');
            const err = syntaxerror(fileContent, filename, {
                sourceType: 'module',
                ecmaVersion: 2020,
                allowAwaitOutsideFunction: true,
                allowReturnOutsideFunction: true,
                allowImportExportEverywhere: true
            });
            if (err)
                conn.logger.error(`syntax error while loading '${filename}'\n${format(err)}`);
            else {
                const module = await import(`${global.__filename(dir)}?update=${Date.now()}`);
                global.plugins[filename] = module.default || module;
            }
        } catch (e) {
            conn.logger.error(`error require plugin '${filename}\n${format(e)}'`);
        } finally {
            global.plugins = Object.fromEntries(
                Object.entries(global.plugins).sort(([a], [b]) => a.localeCompare(b))
            );
        }
    }
};

async function FileEv(type, file) {
    console.log(file);
    try {
        switch (type) {
            case 'delete':
                delete global.plugins[file];
                break;
            case 'change':
            case 'add':
                const module = await import(
                    `${global.__filename(file)}?update=${Date.now()}`
                );
                global.plugins[file] = module.default || module;
                break;
        }
    } catch (e) {
        conn.logger.error(`Error processing file event '${type}' for '${file}': ${e.message}`);
    } finally {
        global.plugins = Object.fromEntries(
            Object.entries(global.plugins).sort(([a], [b]) => a.localeCompare(b))
        );
    }
}

async function watchFiles() {
    const watcher = chokidar.watch(['lib/**/*.js', 'plugins/**/*.js'], {
        usePolling: true,
        interval: 100,
        awaitWriteFinish: {
            stabilityThreshold: 2000,
            pollInterval: 100
        },
        binaryInterval: 300,
        followSymlinks: false,
        depth: 99,
        ignored: /(^|[\/\\])\../,
        persistent: true,
        ignoreInitial: true,
        alwaysState: true,
    });

    watcher
        .on('add', async (path) => {
            try {
                conn.logger.info(`New plugin - '${path}'`);
                await FileEv('add', `./${path}`);
            } catch (e) {
                conn.logger.error(`Error handling 'add' event for '${path}': ${e.message}`);
            }
        })
        .on('change', async (path) => {
            try {
                conn.logger.info(`Updated plugin - '${path}'`);
                await FileEv('change', `./${path}`);
            } catch (e) {
                conn.logger.error(`Error handling 'change' event for '${path}': ${e.message}`);
            }
        })
        .on('unlink', async (path) => {
            try {
                conn.logger.warn(`Deleted plugin - '${path}'`);
                await FileEv('delete', `./${path}`);
            } catch (e) {
                conn.logger.error(`Error handling 'unlink' event for '${path}': ${e.message}`);
            }
        })
        .on('error', (error) => {
            conn.logger.error(`Watcher error: ${error.message}`);
        })
        .on('ready', () => {
            conn.logger.info('Initial scan complete. Ready for changes.');
        });
};

function createSpinner(text, spinnerType) {
    const spinner = ora({
        text,
        spinner: spinnerType
    });
    return {
        start: () => spinner.start(),
        succeed: (successText) => spinner.succeed(chalk.green(successText + '\n')),
        fail: (errorText) => spinner.fail(chalk.red(errorText + '\n')),
        stop: () => spinner.stop(),
    };
}

let loadDBSpinner;
let loadConfigSpinner = createSpinner(chalk.cyan('Memuat konfigurasi...\n'), 'moon');
let filesInitSpinner;
let watchFilesSpinner;
let quickTestSpinner;
let runSyntaxCheckSpinner;
let executeActionsSpinner;

loadDBSpinner = createSpinner(chalk.cyan('Load Database...\n'), 'moon').start();
loadDatabase()
    .then(() => {
        loadDBSpinner.succeed('Sukses Load Database');
        loadDBSpinner.stop();
        loadConfigSpinner = createSpinner(chalk.cyan('Memuat konfigurasi...\n'), 'moon').start();
        return loadConfig();
    })
    .then(() => {
        loadConfigSpinner.succeed('Sukses memuat konfigurasi.');
        loadConfigSpinner.stop();
        filesInitSpinner = createSpinner(chalk.cyan('Inisialisasi file...\n'), 'moon').start();
        return filesInit();
    })
    .then(() => {
        filesInitSpinner.succeed('Sukses menginisialisasi file.');
        filesInitSpinner.stop();
        watchFilesSpinner = createSpinner(chalk.cyan('Mengawasi file...\n'), 'moon').start();
        return watchFiles();
    })
    .then(() => {
        watchFilesSpinner.succeed('Sukses mengawasi file.');
        watchFilesSpinner.stop();
        quickTestSpinner = createSpinner(chalk.cyan('Melakukan Quick Test...\n'), 'moon').start();
        return _quickTest();
    })
    .then(() => {
        quickTestSpinner.succeed('Sukses Quick Test.');
        quickTestSpinner.stop();
        runSyntaxCheckSpinner = createSpinner(chalk.cyan('Melakukan Check Syntax File ES6...\n'), 'moon').start();
        return runSyntaxCheck();
    })
    .then(() => {
        runSyntaxCheckSpinner.succeed('Sukses Check Syntax File ES6.');
        runSyntaxCheckSpinner.stop();
        executeActionsSpinner = createSpinner(chalk.cyan('Menjalankan Aksi...\n'), 'moon').start();
        return executeActions();
    })
    .then(() => {
        executeActionsSpinner.succeed('Semua proses berhasil dieksekusi.');
        executeActionsSpinner.stop();
    })
    .catch((error) => {
    console.clear();
        console.error(chalk.red(`Error saat mengeksekusi aksi: ${error.message}`));
        if (filesInitSpinner) filesInitSpinner.fail('Gagal menginisialisasi file.');
        if (watchFilesSpinner) watchFilesSpinner.fail('Gagal mengawasi file.');
        if (quickTestSpinner) quickTestSpinner.fail('Gagal Quick Test.');
        if (runSyntaxCheckSpinner) runSyntaxCheckSpinner.fail('Gagal Check Syntax File ES6.');
        if (executeActionsSpinner) executeActionsSpinner.fail('Gagal mengeksekusi aksi.');
        if (loadDBSpinner) loadDBSpinner.fail('Gagal Load Database');
        process.exit(1);
    });
    
    if (global.codePairing) {
    console.log(chalk.cyan('╭──────────────────────────────────────···'));
    console.log(` 💻 ${chalk.redBright('Your Pairing Code')}:`);
    console.log(chalk.cyan('├──────────────────────────────────────···'));
    console.log(`   ${chalk.cyan('- Code')}: ${global.codePairing}`);
    console.log(chalk.cyan('╰──────────────────────────────────────···'));
    }

Object.freeze(global.reload);
watch(pluginFolder, global.reload);

await global.reloadHandler();
async function _quickTest() {
    const binaries = [
        'ffmpeg',
        'ffprobe',
        ['ffmpeg', '-hide_banner', '-loglevel', 'error', '-filter_complex', 'color', '-frames:v', '1', '-f', 'webp', '-'],
        'convert',
        'magick',
        'gm',
        ['find', '--version'],
    ];

    try {
        const testResults = await Promise.all(binaries.map(async binary => {
            const [command, ...args] = Array.isArray(binary) ? binary : [binary];
            const process = spawn(command, args);

            try {
                const closePromise = new Promise(resolve => process.on('close', code => resolve(code !== 127)));
                const errorPromise = new Promise(resolve => process.on('error', _ => resolve(false)));

                return await Promise.race([closePromise, errorPromise]);
            } finally {
                process.kill();
            }
        }));

        const [ffmpeg, ffprobe, ffmpegWebp, convert, magick, gm, find] = testResults;
        const support = {
            ffmpeg,
            ffprobe,
            ffmpegWebp,
            convert,
            magick,
            gm,
            find,
        };

        Object.freeze(global.support = support);
    } catch (error) {
        console.error(`Error in _quickTest: ${error.message}`);
    }
}

const actions = [{
        func: clearTmp,
        message: '\nPenyegaran Tempat Penyimpanan Berhasil ✅'
    },
    {
        func: purgeSession,
        message: '\nSesi-Sesi Tersimpan Sudah Dihapus ✅'
    },
    {
        func: purgeSessionSB,
        message: '\nSesi-Sesi Sub-Bot Telah Dihapus ✅'
    },
    {
        func: purgeOldFiles,
        message: '\nBerkas Lama Telah Dihapus ✅'
    },
    {
        func: loadConfig,
        message: '\nSukses Re-load config. ✅'
    },
];

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

export const executeActions = async () => {
    for (const {
            func,
            message
        }
        of actions) {
        try {
            await func();
            console.log(chalk.cyanBright(`\n╭───────────────────────────────────···\n│\n│  ${message}\n│\n╰───────────────────────────────────···\n`));
        } catch (error) {
            console.error(chalk.red(`Error executing action: ${error.message}`));
            throw error;
        }
    }
};

function clockString(ms) {
    if (isNaN(ms)) return '-- Hari -- Jam -- Menit -- Detik';
    const units = [{
            label: 'Hari',
            value: Math.floor(ms / 86400000)
        },
        {
            label: 'Jam',
            value: Math.floor(ms / 3600000) % 24
        },
        {
            label: 'Menit',
            value: Math.floor(ms / 60000) % 60
        },
        {
            label: 'Detik',
            value: Math.floor(ms / 1000) % 60
        }
    ];
    return units.map(unit => `${unit.value.toString().padStart(2, '0')} ${unit.label}`).join(' ');
}