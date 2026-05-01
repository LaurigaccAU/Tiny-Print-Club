const Stripe = require("stripe");
const { createClient } = require("@supabase/supabase-js");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const productFiles = {
  "Rainy Day Activity Pack": {
    filePath: "rainy-day-pack.pdf",
    label: "Rainy Day Activity Pack"
  },
  "Dinosaur Activity Pack": {
    filePath: "dinosaur-pack.pdf",
    label: "Dinosaur Activity Pack"
  },
  "Travel Activity Pack": {
    filePath: "travel-pack.pdf",
    label: "Travel Activity Pack"
  },
  "Starter Activity Bundle": {
    filePath: "starter-bundle.pdf",
    label: "Starter Activity Bundle"
  }
};

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { session_id } = req.query;

    if (!session_id) {
      return res.status(400).json({ error: "Missing session_id" });
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== "paid") {
      return res.status(403).json({ error: "Payment has not been completed" });
    }

    const lineItems = await stripe.checkout.sessions.listLineItems(session_id, {
      limit: 100
    });

    const downloads = [];
    const addedFiles = new Set();

    for (const item of lineItems.data) {
      const product = productFiles[item.description];

      if (!product) continue;

      if (addedFiles.has(product.filePath)) continue;
      addedFiles.add(product.filePath);

      const { data, error } = await supabase.storage
        .from("digital-products")
        .createSignedUrl(product.filePath, 60 * 60);

      if (error) {
        throw error;
      }

      downloads.push({
        label: product.label,
        url: data.signedUrl
      });
    }

    if (downloads.length === 0) {
      return res.status(404).json({ error: "No downloads found for this order" });
    }

    return res.status(200).json({ downloads });
  } catch (error) {
    console.error("Download link error:", error);
    return res.status(500).json({ error: "Unable to generate download links" });
  }
};
