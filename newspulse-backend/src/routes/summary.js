import express from "express";
import { summaryController } from "../config/di.js";

const router = express.Router();

router.post("/", (req, res, next) =>
  summaryController.summarizeHandler(req, res, next)
);

export default router;