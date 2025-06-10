"use strict";
(() => {
var exports = {};
exports.id = 598;
exports.ids = [598];
exports.modules = {

/***/ 648:
/***/ ((module) => {

module.exports = import("axios");;

/***/ }),

/***/ 242:
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
            digipin: "",
            error: "Method not allowed"
        });
    }
    try {
        const { latitude, longitude } = req.body;
        // Validate input
        if (typeof latitude !== "number" || typeof longitude !== "number") {
            return res.status(400).json({
                digipin: "",
                error: "Invalid coordinates. Latitude and longitude must be numbers."
            });
        }
        if (latitude < -90 || latitude > 90) {
            return res.status(400).json({
                digipin: "",
                error: "Invalid latitude. Must be between -90 and 90."
            });
        }
        if (longitude < -180 || longitude > 180) {
            return res.status(400).json({
                digipin: "",
                error: "Invalid longitude. Must be between -180 and 180."
            });
        }
        // Call the backend API
        const response = await axios__WEBPACK_IMPORTED_MODULE_0__["default"].post(`${process.env.BACKEND_URL}/api/encode`, {
            latitude,
            longitude
        });
        return res.status(200).json({
            digipin: response.data.digipin
        });
    } catch (error) {
        console.error("Error encoding coordinates:", error);
        return res.status(500).json({
            digipin: "",
            error: "Failed to encode coordinates. Please try again later."
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
var __webpack_exports__ = (__webpack_exec__(242));
module.exports = __webpack_exports__;

})();