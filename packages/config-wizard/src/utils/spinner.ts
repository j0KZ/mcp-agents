/**
 * Loading spinner utilities
 */

import ora, { Ora } from 'ora';

export function spinner(text: string): Ora {
  return ora(text).start();
}
