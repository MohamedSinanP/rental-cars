"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const express_fileupload_1 = __importDefault(require("express-fileupload"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const passport_1 = __importDefault(require("passport"));
dotenv_1.default.config();
// Data base connection
const db_js_1 = __importDefault(require("./config/db.js"));
// Passport strategy setup
require("./config/passport.js");
// Routes
const auth_routes_js_1 = __importDefault(require("./routes/auth.routes.js"));
const google_auth_routes_js_1 = __importDefault(require("./routes/google.auth.routes.js"));
const owner_routes_js_1 = __importDefault(require("./routes/owner.routes.js"));
const user_routes_js_1 = __importDefault(require("./routes/user.routes.js"));
const payment_routes_js_1 = __importDefault(require("./routes/payment.routes.js"));
const admin_routes_js_1 = __importDefault(require("./routes/admin.routes.js"));
// Error middleware
const error_middleware_js_1 = require("./middlewares/error.middleware.js");
const app = (0, express_1.default)();
// Connect database
(0, db_js_1.default)();
// Middlewares
app.use('/user/webhook', express_1.default.raw({ type: 'application/json' }));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL,
    credentials: true,
}));
app.use((0, cookie_parser_1.default)());
app.use((0, express_fileupload_1.default)({
    useTempFiles: true,
    tempFileDir: "/tmp/",
}));
app.use(passport_1.default.initialize());
// Routes
app.use("/auth", auth_routes_js_1.default);
app.use("/auth", google_auth_routes_js_1.default);
app.use("/admin", admin_routes_js_1.default);
app.use("/owner", owner_routes_js_1.default);
app.use("/user", user_routes_js_1.default);
app.use("/payment", payment_routes_js_1.default);
// Global error handler
app.use(error_middleware_js_1.errorHandler);
app.listen(process.env.PORT, () => {
    console.log(`Server running on http://localhost:${process.env.PORT}`);
});
//# sourceMappingURL=server.js.map