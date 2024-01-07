import os from 'os';
import express from 'express';
import {
    spawn
} from 'child_process';
import path from 'path';
import fs from 'fs';
import {
    promises as fsPromises
} from 'fs';
import chalk from 'chalk';
import * as glob from 'glob';

const app = express();
const port = process.env.PORT || 3000;

const basePath = new URL(import.meta.url).pathname;
const htmlDir = path.join(path.dirname(basePath), 'html');

const sendHtml = (req, res, name) => res.sendFile(path.join(htmlDir, `${name}.html`));

app.get('/', (req, res) => sendHtml(req, res, 'home'));
app.get('/chat', (req, res) => sendHtml(req, res, 'chat'));
app.get('/game', (req, res) => sendHtml(req, res, 'game'));
app.get('/tools', (req, res) => sendHtml(req, res, 'tools'));
app.get('/music', (req, res) => sendHtml(req, res, 'music'));

const server = app.listen(port, () => console.log(chalk.green(`🌐 Port ${port} is open`)));

let isRunning = false;

async function start(file) {
    if (isRunning) return;
    isRunning = true;

    const currentFilePath = new URL(import.meta.url).pathname;
    const args = [path.join(path.dirname(currentFilePath), file), ...process.argv.slice(2)];
    const p = spawn(process.argv[0], args, {
        stdio: ['inherit', 'inherit', 'inherit', 'ipc'],
    });

    p.on('message', (data) => {
        console.log(chalk.cyan(`🟢 RECEIVED ${data}`));
        switch (data) {
            case 'reset':
                p.kill();
                isRunning = false;
                start(file);
                break;
            case 'uptime':
                p.send(process.uptime());
                break;
        }
    });

    p.on('exit', (code) => {
        isRunning = false;
        console.error(chalk.red(`🛑 Exited with code: ${code}`));

        if (code !== 0) {
            fs.watchFile(args[0], () => {
                fs.unwatchFile(args[0]);
                start(file);
            });
        }
    });

    p.on('error', (err) => {
        console.error(chalk.red(`❌ Error: ${err}`));
        p.kill();
        isRunning = false;
        shutdownServer();
        start(file);
    });

    const pluginsFolder = path.join(path.dirname(currentFilePath), 'plugins');

    try {
        const {
            fetchLatestBaileysVersion
        } = await import('@whiskeysockets/baileys');
        const {
            version
        } = await fetchLatestBaileysVersion();
        console.log(chalk.yellow(`🟡 Baileys library version ${version} is installed`));
    } catch (e) {
        console.error(chalk.red('❌ Baileys library is not installed'));
        shutdownServer();
    }

    console.log(chalk.yellow(`🖥️ ${os.type()}, ${os.release()} - ${os.arch()}`));
    const ramInGB = os.totalmem() / (1024 * 1024 * 1024);
    console.log(chalk.yellow(`💾 Total RAM: ${ramInGB.toFixed(2)} GB`));
    const freeRamInGB = os.freemem() / (1024 * 1024 * 1024);
    console.log(chalk.yellow(`💽 Free RAM: ${freeRamInGB.toFixed(2)} GB`));
    console.log(chalk.yellow(`📃 Script by wudysoft`));

    const packageJsonPath = path.join(path.dirname(currentFilePath), './package.json');
    try {
        const packageJsonData = await fsPromises.readFile(packageJsonPath, 'utf-8');
        const packageJsonObj = JSON.parse(packageJsonData);
        console.log(chalk.blue.bold(`\n📦 Package Information`));
        console.log(chalk.cyan(`Name: ${packageJsonObj.name}`));
        console.log(chalk.cyan(`Version: ${packageJsonObj.version}`));
        console.log(chalk.cyan(`Description: ${packageJsonObj.description}`));
        console.log(chalk.cyan(`Author: ${packageJsonObj.author.name}`));
    } catch (err) {
        console.error(chalk.red(`❌ Unable to read package.json: ${err}`));
        shutdownServer();
    }

    const foldersInfo = getFoldersInfo(pluginsFolder);
    console.log(chalk.blue.bold(`\n📂 Folders in "plugins" folder and Total Files`));
    foldersInfo.forEach(({
        folder,
        files
    }) => {
        console.log(chalk.cyan(`Folder: ${folder}, Total Files: ${files}`));
    });

    console.log(chalk.blue.bold(`\n⏰ Current Time`));
    const currentTime = new Date().toLocaleString();
    console.log(chalk.cyan(`${currentTime}`));

    setInterval(() => {}, 1000);
}

function getFoldersInfo(folderPath) {
    const folders = glob.sync(path.join(folderPath, '*/'));
    const foldersInfo = folders.map((folder) => ({
        folder: path.basename(folder),
        files: getTotalFilesInFolder(folder),
    }));

    return foldersInfo;
}

function getTotalFilesInFolder(folderPath) {
    const files = fs.readdirSync(folderPath);
    return files.length;
}

function shutdownServer() {
    console.error(chalk.red('❌ Shutting down the server due to an error.'));
    server.close(() => {
        console.log(chalk.red('🛑 Server has been shut down.'));
    });
}

start('main.js');

process.on('unhandledRejection', () => {
    console.error(chalk.red(`❌ Unhandled promise rejection. Script will restart...`));
    start('main.js');
});

process.on('exit', (code) => {
    console.error(chalk.red(`🛑 Exited with code: ${code}`));
    console.error(chalk.red(`❌ Script will restart...`));
    start('main.js');
});