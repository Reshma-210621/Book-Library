import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Stripe from "stripe";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
const PORT = process.env.PORT || 4242;

app.post("/api/create-checkout-session", async (req, res) => {
  try {
    const { title, priceInRupees, bookKey, coverUrl } = req.body;
    if (!title || !priceInRupees) {
      return res.status(400).json({ error: "title and priceInRupees are required" });
    }

    const unitAmount = Math.round(Number(priceInRupees) * 100);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: title,
              images: coverUrl ? [coverUrl] : undefined,
              metadata: bookKey ? { bookKey } : undefined,
            },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
      success_url: `${CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${CLIENT_URL}/payment-cancel`,
    });

    res.json({ url: session.url, id: session.id });
  } catch (err) {
    console.error("Error creating checkout session:", err.message);
    res.status(500).json({ error: err.message });
  }
});


// Test route
app.get("/", (req, res) => {
  res.send("Book Library Payment Server is running!");
});

app.get("/api/session-status", async (req, res) => {
  try {
    const { session_id } = req.query;

    if (!session_id) {
      return res.status(400).json({
        error: "session_id is required"
      });
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);

    res.json({
      status: session.status,
      paymentStatus: session.payment_status,
      customerEmail: session.customer_details?.email || null,
      amountTotal: session.amount_total,
    });

  } catch (err) {
    console.error("Error retrieving session:", err.message);
    res.status(500).json({
      error: err.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Payment server running on http://localhost:${PORT}`);
});

