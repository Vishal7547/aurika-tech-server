import express from "express";
const router = express.Router();

import {
  deleteInvoice,
  getInvoice,
  postInvoice,
} from "../controller/inVoiceController.js";
import { upload } from "../middleware/signature.js";
router.get("/invoice", getInvoice);
router.post("/invoice", upload, postInvoice);
router.delete("/invoice/:id", deleteInvoice);

export default router;
