try {
  require("dotenv").config();
} catch (err) {}

getENV = (name, defaultValue) => {
  const value = process.env[name];

  if (typeof value === "undefined") {
    if (typeof defaultValue === "undefined") {
      throw new Error(`Missing environment varialbe '${name}'`);
    }
    return defaultValue;
  }

  return value;
};
module.exports.getENV = getENV;

module.exports.getENVArray = (prefix) => {
  let result = [];

  let value = getENV(prefix, null);
  if (typeof value === "string") {
    result.push(value);
  }

  for (let i = 0; i < 100; i++) {
    let indexKey = `${prefix}_${i}`;
    let value = getENV(indexKey, null);
    if (typeof value === "string") {
      result.push(value);
    } else {
      break;
    }
  }
  return result;
};
