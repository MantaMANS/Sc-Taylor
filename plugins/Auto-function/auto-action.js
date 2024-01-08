import {
    executeActions
} from '../../main.js';
import ora from 'ora';
import chalk from 'chalk';

export async function before(m) {
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    setInterval(async () => {
        try {
            const loadingSpinner = ora({
                text: chalk.cyan('Menjalankan tugas berkala...'),
                spinner: 'aesthetic'
            }).start();

            await executeActions();
            loadingSpinner.succeed(chalk.green('Tugas berkala selesai.'));
        } catch (error) {
            console.error(chalk.red(`Error during periodic execution: ${error.message}`));
        }
    }, 24 * 60 * 60 * 1000);
}