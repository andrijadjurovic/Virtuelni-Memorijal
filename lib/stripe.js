import Stripe from "stripe";

export function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY?.trim();
  if (!secretKey || secretKey.includes("...")) return null;
  return new Stripe(secretKey, { apiVersion: "2025-06-30.basil" });
}