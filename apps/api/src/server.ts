import dotenv from "dotenv";
dotenv.config();

import { createApp } from "./app.js";

const app = createApp();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

app.listen(PORT, () => {
  console.log(`[Wayfarer API] Server listening on port ${PORT}`);
  console.log(`[Wayfarer API] Health check at http://localhost:${PORT}/health`);
  console.log(`[Wayfarer API] REST API base at http://localhost:${PORT}/api`);
});

