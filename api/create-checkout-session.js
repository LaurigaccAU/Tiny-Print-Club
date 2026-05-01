const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const products = {
  "rainy-day-pack": {
    name: "Rainy Day Activity Pack",
    price_cents: 599
  },
  "dinosaur-pack": {
    name: "Dinosaur Activity Pack",
    price_cents: 699
  },
  "travel-pack": {
    name: "Travel Activity Pack",
    price_cents: 499
  },
  "starter-bundle": {
    name: "Starter Activity Bundle",
    price_cents: 1299
  }
};

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { cart } = req.body;

    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    const line_items = cart.map((item) => {
      const product = products[item.id];

      if (!product) {
        throw new Error(`Invalid product: ${item.id}`);
      }

      return {
        price_data: {
          currency: "aud",
          product_data: {
            name: product.name
          },
          unit_amount: product.price_cents
        },
        quantity: item.quantity
      };
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items,
      success_url: `${req.headers.origin}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/cancel.html`
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return res.status(500).json({ error: "Unable to create checkout session" });
  }
};
