import express from "express";
import { summarizeHandler } from "../controllers/summaryController.js";

const router = express.Router();

router.post("/", summarizeHandler);

export default router;