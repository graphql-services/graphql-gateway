"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const env_1 = require("./env");
exports.log = (...values) => {
    if (env_1.getENV('DEBUG', false)) {
        const [message, ...rest] = values;
        global.console.log(message, rest);
    }
};
//# sourceMappingURL=logger.js.map