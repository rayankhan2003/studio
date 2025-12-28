
import Stripe from "stripe";
import Payment from "../models/Payment.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", { apiVersion: "2024-06-20" });

export const createCheckout = async (req, res, next) => {
  try {
    const { plan } = req.body; // "monthly" | "yearly" | "lifetime"
    const pricing = { monthly: 9, yearly: 79, lifetime: 199 };
    if (!pricing[plan]) return res.status(400).json({ message: "Invalid plan" });

    const payment = await Payment.create({
      userId: req.user.id, plan, amount: pricing[plan] * 100, currency: "usd", status: "pending"
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: { name: `Exam Prep ${plan} plan` },
          unit_amount: payment.amount
        },
        quantity: 1
      }],
      success_url: `http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:3000/cancel`,
      metadata: { paymentId: payment._id.toString(), userId: req.user.id }
    });

    res.json({ url: session.url });
  } catch (e) { next(e); }
};

// Webhook endpoint (set STRIPE_WEBHOOK_SECRET)
export const stripeWebhook = async (req, res, next) => {
  try {
    const sig = req.headers["stripe-signature"];
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, secret);
    } catch (err) {
      return res.status(400).send(`Webhook error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const paymentId = session.metadata?.paymentId;
      if (paymentId) {
        await Payment.findByIdAndUpdate(paymentId, {
          status: "succeeded",
          providerPaymentId: session.id
        });
      }
    }

    res.json({ received: true });
  } catch (e) { next(e); }
};
