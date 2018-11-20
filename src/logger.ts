import { getENV } from './env';

export const log = (...values) => {
  if (getENV('DEBUG', false)) {
    const [message, ...rest] = values;
    global.console.log(message, rest);
  }
};
