import { INVITE_MODE } from "../config";

export function inviteGate(req: any, res: any, next: any) {
  if (!INVITE_MODE) return next();
  
  // Allow if user is authenticated and allowed, or if they have the right invite code
  if (req.user?.isAllowed || req.query.invite === process.env.GG_INVITE_CODE) {
    return next();
  }
  
  return res.status(403).json({ error: "INVITE_REQUIRED" });
}