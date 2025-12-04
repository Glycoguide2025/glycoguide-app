// Stage 8: Invite mode toggle configuration
export const INVITE_MODE = process.env.GG_INVITE_MODE === "on"; // default off

console.log(`🔒 Invite mode: ${INVITE_MODE ? 'ON - restricted access' : 'OFF - public access'}`);