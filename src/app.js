import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();

app.use(
  express.json({
    limit: "16kb",
  }),
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "16kb",
  }),
);

app.use(cookieParser());

app.use(express.static("public"));

app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "PUT", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

//import the routes
import healthCheckRouter from "./routes/healthCheck.routes.js";
import authRouter from "./routes/auth.routes.js";
import apiErrorHandler from "./middlewares/errors.middleware.js";
import projectRouter from "./routes/project.routes.js";
app.use("/api/v1/healthcheck", healthCheckRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/projects", projectRouter);
app.use(apiErrorHandler);

export default app;
