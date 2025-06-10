"use strict";
(() => {
var exports = {};
exports.id = 387;
exports.ids = [387];
exports.modules = {

/***/ 648:
/***/ ((module) => {

module.exports = import("axios");;

/***/ }),

/***/ 718:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ handler)
/* harmony export */ });
/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(648);
var __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([axios__WEBPACK_IMPORTED_MODULE_0__]);
axios__WEBPACK_IMPORTED_MODULE_0__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];

async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }
    try {
        const { digipin } = req.body;
        // Validate input
        if (!digipin || typeof digipin !== "string") {
            return res.status(400).json({
                error: "Invalid DIGIPIN. DIGIPIN must be a string."
            });
        }
        // Basic format validation (assuming 10-character alphanumeric)
        if (!/^[A-Za-z0-9]{10}$/.test(digipin.trim())) {
            return res.status(400).json({
                error: "Invalid DIGIPIN format. It should be a 10-character alphanumeric code."
            });
        }
        // Call the backend API
        const response = await axios__WEBPACK_IMPORTED_MODULE_0__["default"].post(`${process.env.BACKEND_URL}/api/decode`, {
            digipin: digipin.trim()
        });
        return res.status(200).json({
            latitude: response.data.latitude,
            longitude: response.data.longitude
        });
    } catch (error) {
        console.error("Error decoding DIGIPIN:", error);
        return res.status(500).json({
            error: "Failed to decode DIGIPIN. Please ensure it is correct and try again."
        });
    }
}

__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } });

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../webpack-api-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = (__webpack_exec__(718));
module.exports = __webpack_exports__;

})();