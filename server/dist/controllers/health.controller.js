"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHealthCheck = void 0;
const getHealthCheck = (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
};
exports.getHealthCheck = getHealthCheck;
