import dotenv from "dotenv";
import morgan from "morgan";
import { register } from "prom-client"; //prometheus client
import cookieParser from "cookie-parser";
import { rateLimit } from "express-rate-limit";
import urlRouter from "./modules/url/url.routes";
import express, { Request, Response } from "express";
import authRouter from "./modules/auth/auth.routes";
import { collectDefaultMetrics } from "prom-client"; //prometheus client

dotenv.config();

const app = express();

// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   limit: 10, // Limit each IP to 5 requests per `window` (here, per 15 minutes).
//   standardHeaders: "draft-8", // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
//   legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
//   ipv6Subnet: 56, // Set to 60 or 64 to be less aggressive, or 52 or 48 to be more aggressive
//   skip: ()=> process.env.NODE_ENV === "test",
//   // store: ... , // Redis, Memcached, etc. See below.
// });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));
// app.use(limiter);

collectDefaultMetrics({ register: register }); // collect default metrics 

// Home route
app.get("/", (req, res) => {
  res.send("Hello, World!");
});

// health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});


// expose the metrics endpoint to prometheus [ this just gives the raw metrics ]
app.get("/metrics", async (req: Request, res: Response) => {
  try {
    res.setHeader("Content-Type", register.contentType);
    const metrics = await register.metrics();
    res.send(metrics);
  } catch (error) {
    console.error("Error fetching metrics:", error);
    res.status(500).send("Error fetching metrics");
  }
});

// Auth routes
app.use("/api/auth", authRouter);
app.use("/api/urls", urlRouter);


export default app;