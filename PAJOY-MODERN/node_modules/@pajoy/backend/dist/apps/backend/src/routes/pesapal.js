"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const errorHandler_1 = require("../middleware/errorHandler");
const router = (0, express_1.Router)();
router.get('/', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    res.json({ success: true, data: [], message: 'Pesapal endpoint - to be implemented' });
}));
exports.default = router;
//# sourceMappingURL=pesapal.js.map