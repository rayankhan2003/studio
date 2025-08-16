
import express from "express";
import { createCheckout } from "../controllers/payment.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// This route initiates the payment process
router.post('/create-checkout', requireAuth, createCheckout);

// The webhook is handled separately in app.js to process the raw body
// router.post('/webhook', stripeWebhook);

export default router;
