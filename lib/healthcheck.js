"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
exports.healthcheck = express.Router();
exports.healthcheck.get('/healthcheck', (req, res, next) => {
    res.send('OK');
});
//# sourceMappingURL=healthcheck.js.map