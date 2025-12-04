import { Router } from "express";
import type { IStorage } from "../storage";

export const referrals = Router();

referrals.post("/api/referrals/capture", async (req: any, res) => {
  try {
    const { ref, ts, path } = req.body ?? {};
    if (!ref) {
      return res.status(400).json({ error: "Referral code required" });
    }

    // Store referral capture
    const referralData = {
      ref: ref,
      userId: req.user?.id ?? null,
      path: path ?? "/",
    };

    // For now, we'll store this in a simple way. In production, you'd want proper storage.
    // Since storage interface doesn't exist yet for referrals, we'll implement a basic version
    const storage: IStorage = req.db;
    
    // Simple storage - we'll create the method in storage later if needed
    // For now, just acknowledge the capture
    
    res.json({ ok: true, captured: ref });
  } catch (error) {
    console.error("Referral capture error:", error);
    res.status(500).json({ error: "Failed to capture referral" });
  }
});