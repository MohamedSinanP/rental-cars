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
require("./cron/tasks.cron");
const container_1 = require("./di/container");
dotenv_1.default.config();
// Data base connection
const db_1 = __importDefault(require("./config/db"));
// Passport strategy setup
require("./config/passport");
// Routes
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const google_auth_routes_1 = __importDefault(require("./routes/google.auth.routes"));
const owner_routes_1 = __importDefault(require("./routes/owner.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const payment_routes_1 = __importDefault(require("./routes/payment.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
// Error middleware
const error_middleware_1 = require("./middlewares/error.middleware");
const app = (0, express_1.default)();
// Connect database
(0, db_1.default)();
// wehook router 
app.post('/api/user/webhook', express_1.default.raw({ type: 'application/json' }), container_1.subscriptionController.handleWebhook.bind(container_1.subscriptionController));
// Middlewares
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
app.use("/api/auth", auth_routes_1.default);
app.use("/api/auth", google_auth_routes_1.default);
app.use("/api/admin", admin_routes_1.default);
app.use("/api/owner", owner_routes_1.default);
app.use("/api/user", user_routes_1.default);
app.use("/api/payment", payment_routes_1.default);
// Global error handler
app.use(error_middleware_1.errorHandler);
app.listen(process.env.PORT, () => {
    console.log(`Server running on http://localhost:${process.env.PORT}`);
});
