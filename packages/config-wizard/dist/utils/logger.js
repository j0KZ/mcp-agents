/**
 * Pretty console logging utilities
 */
/* eslint-disable no-console */
import chalk from 'chalk';
export const logger = {
    header(message) {
        console.log(chalk.bold.cyan(`\n${message}`));
    },
    divider() {
        console.log(chalk.gray('─'.repeat(40)));
    },
    success(message) {
        console.log(chalk.green(message));
    },
    info(message) {
        console.log(chalk.blue(message));
    },
    warn(message) {
        console.log(chalk.yellow(message));
    },
    error(message) {
        console.log(chalk.red(message));
    },
    dim(message) {
        console.log(chalk.dim(message));
    },
};
//# sourceMappingURL=logger.js.map