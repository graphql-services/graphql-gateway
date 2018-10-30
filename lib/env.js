"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getENV = (name, defaultValue) => {
    const value = process.env[name] || defaultValue;
    if (typeof value === 'undefined') {
        throw new Error(`Missing environment varialbe '${name}'`);
    }
    return value;
};
exports.getENVArray = (prefix) => {
    let result = [];
    let value = exports.getENV(prefix, null);
    if (typeof value === 'string') {
        result.push(value);
    }
    for (let i = 0; i < 100; i++) {
        let indexKey = `${prefix}_${i}`;
        let value = exports.getENV(indexKey, null);
        if (typeof value === 'string') {
            result.push(value);
        }
        else {
            break;
        }
    }
    return result;
};
//# sourceMappingURL=env.js.map