import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

import { userAuthenticatedMiddlware } from "./middlewares/userAuthentication.middleware.js";
import userRoutes from "./routes/user.routes.js";
import authRoutes from "./routes/auth.routes.js";

dotenv.config();

const app = express();

// CORS (only once)
app.use(
  cors({
    origin: process.env.CORS_ORIGIN, // http://localhost:5173
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hi backend working!");
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userAuthenticatedMiddlware, userRoutes);

export { app };