import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import mongoose from "mongoose";
import Auth from "./Route/Auth.route.js"
dotenv.config();
const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "https://thecleaningcrew.netlify.app",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(cookieParser());
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("Database is connected!");
  })
  .catch((err) => {
    console.log("Showing some error in database", err);
  });
  app.use('/auth',Auth)
app.get("/", (req, res) => {
  res.send("App is working fine");
});
const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log("App working on port");
});
