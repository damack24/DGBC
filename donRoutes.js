import express from "express";
const router = express.Router();

// Needed to read JSON from frontend
router.use(express.json());

router.post("/don", (req, res) => {
  const { message } = req.body;

  if (!message || message.trim() === "") {
    return res.status(400).json({
      success: false,
      reply: "You must bring something to the table before speaking to the Don.",
    });
  }

  // Example logic: Don replies with wisdom based on message tone
  let reply;
  if (message.toLowerCase().includes("betrayal")) {
    reply = "Loyalty is everything. The disloyal will answer to the streets.";
  } else if (message.toLowerCase().includes("deal")) {
    reply = "Every deal comes with a price. Make sure you can pay it.";
  } else if (message.toLowerCase().includes("problem")) {
    reply = "Problems are just opportunities in disguise. Handle it quietly.";
  } else {
    reply = "The Don has heard your message. Silence will be your reward... for now.";
  }

  res.json({ success: true, reply });
});

export default router;
