import express, { Request, Response } from "express";
import http from "http";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(express.json());

app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok", service: "ai-service" });
});

const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
  console.log(`AI Service running on port ${PORT}`);
});
