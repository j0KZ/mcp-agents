/**
 * Pretty console logging utilities
 */

/* eslint-disable no-console */

import chalk from 'chalk';

export const logger = {
  header(message: string) {
    console.log(chalk.bold.cyan(`\n${message}`));
  },

  divider() {
    console.log(chalk.gray('─'.repeat(40)));
  },

  success(message: string) {
    console.log(chalk.green(message));
  },

  info(message: string) {
    console.log(chalk.blue(message));
  },

  warn(message: string) {
    console.log(chalk.yellow(message));
  },

  error(message: string) {
    console.log(chalk.red(message));
  },

  dim(message: string) {
    console.log(chalk.dim(message));
  },
};
