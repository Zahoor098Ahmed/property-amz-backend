import express from "express";
import Partner from "../models/Partner.js";

const router = express.Router();

// ✅ Public: Get all partners
router.get("/", async (req, res) => {
  try {
    const partners = await Partner.find();
    res.json(partners);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Admin: Create partner
router.post("/", async (req, res) => {
  try {
    const partner = new Partner(req.body);
    await partner.save();
    res.json({ success: true, partner });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ Admin: Update partner
router.put("/:id", async (req, res) => {
  try {
    const partner = await Partner.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(partner);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Admin: Delete partner
router.delete("/:id", async (req, res) => {
  try {
    await Partner.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Partner deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
