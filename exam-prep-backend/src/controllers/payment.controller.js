
import Stripe from "stripe";
import Payment from "../models/Payment.js";
import User from "../models/User.js";
import Institution from "../models/Institution.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", { apiVersion: "2024-06-20" });

const getExpiryDate = (plan) => {
    const date = new Date();
    if (plan === 'monthly') date.setMonth(date.getMonth() + 1);
    else if (plan === 'yearly') date.setFullYear(date.getFullYear() + 1);
    else if (plan === 'lifetime') return null; // No expiry for lifetime
    return date;
};

export const createCheckout = async (req, res, next) => {
  try {
    const { plan, institutionId } = req.body; // institutionId is optional
    const pricing = { monthly: 1000, yearly: 10000, lifetime: 20000, institutional: 100000 };
    if (!pricing[plan]) return res.status(400).json({ message: "Invalid plan" });

    const payment = await Payment.create({
      userId: req.user.id, 
      plan, 
      amount: pricing[plan] * 100, // Stripe expects amount in cents
      currency: "pkr", 
      status: "pending",
      institutionId: institutionId,
    });

    const metadata = { 
        paymentId: payment._id.toString(), 
        userId: req.user.id,
    };
    if (institutionId) metadata.institutionId = institutionId;
    
    const productName = institutionId ? `PrepWise Institutional Plan` : `PrepWise ${plan} plan`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: "payment",
      line_items: [{
        price_data: {
          currency: "pkr",
          product_data: { name: productName },
          unit_amount: payment.amount
        },
        quantity: 1
      }],
      success_url: `http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:3000/pricing`,
      metadata
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
      const { paymentId, userId, institutionId } = session.metadata;
      
      const payment = await Payment.findById(paymentId);
      if (!payment) {
          console.error(`Payment not found for ID: ${paymentId}`);
          return res.json({ received: true });
      }

      payment.status = "succeeded";
      payment.providerPaymentId = session.id;
      await payment.save();

      const expiresAt = getExpiryDate(payment.plan);
      
      if (institutionId) {
          await Institution.findByIdAndUpdate(institutionId, {
              subscriptionStatus: 'active',
              subscriptionPlan: payment.plan,
              subscriptionId: session.id, // using session id as a mock subscription id
              subscriptionExpiresAt: expiresAt,
          });
      } else {
          await User.findByIdAndUpdate(userId, {
              subscriptionStatus: 'active',
              subscriptionPlan: payment.plan,
              subscriptionId: session.id,
              subscriptionExpiresAt: expiresAt,
          });
      }
    }
    
    // You could also handle `invoice.payment_failed` to revoke access

    res.json({ received: true });
  } catch (e) { next(e); }
};

    