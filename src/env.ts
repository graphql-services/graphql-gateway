export const getENV = <T>(name: string, defaultValue?: T): string | T => {
  const value = process.env[name] || defaultValue;

  if (typeof value === 'undefined') {
    throw new Error(`Missing environment varialbe '${name}'`);
  }

  return value;
};

export const getENVArray = (prefix: string): string[] => {
  let result: string[] = [];

  let value = getENV(prefix, null);
  if (typeof value === 'string') {
    result.push(value);
  }

  for (let i = 0; i < 100; i++) {
    let indexKey = `${prefix}_${i}`;
    let value = getENV(indexKey, null);
    if (typeof value === 'string') {
      result.push(value);
    } else {
      break;
    }
  }
  return result;
};
