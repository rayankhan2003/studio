
import express from "express";
import helmet from "helmet";
import cors from "cors";
import xss from "xss-clean";
import hpp from "hpp";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/auth.routes.js";
import courseRoutes from "./routes/course.routes.js";
import questionRoutes from "./routes/question.routes.js";
import testRoutes from "./routes/test.routes.js";
import attemptRoutes from "./routes/attempt.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import { errorHandler } from "./middleware/error.js";

const app = express();

// Security & parsers
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(",") || "*" }));
app.use(express.json({ limit: "500kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(xss());
app.use(hpp());
app.use(morgan("dev"));

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use("/api/auth", authLimiter);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/tests", testRoutes);
app.use("/api/attempts", attemptRoutes);
app.use("/api/payments", paymentRoutes);

// Health
app.get("/health", (_req, res) => res.json({ ok: true }));

// Error handler
app.use(errorHandler);

export default app;
