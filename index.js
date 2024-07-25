import express from "express";
import colors from "colors";
import { configDotenv } from "dotenv";
import { connectDb } from "./config/db.js";
import inVoiceRouter from "./routes/inVoice.js";
import cors from "cors";
configDotenv({
  path: "./config/config.env",
});
const app = express();
connectDb();
app.use(cors());
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/v1", inVoiceRouter);
app.get("/", (req, res) => {
  return res.send({
    success: true,
    message: "welcome to Aurika Tech",
  });
});
app.use((req, res, next) => {
  res.status(404).send({
    success: false,
    message: "Route not found",
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({
    success: false,
    message: "Something went wrong!",
  });
});
app.listen(process.env.PORT, () => {
  console.log(`port is running at ${process.env.PORT}`.bgBlue.white);
});
