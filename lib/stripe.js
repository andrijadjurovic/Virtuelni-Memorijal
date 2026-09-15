import Stripe from "stripe";

// Stripe stays disabled until STRIPE_SECRET_KEY is configured.
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-06-30.basil" })
  : null;