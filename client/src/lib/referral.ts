export function captureReferral() {
  const params = new URLSearchParams(window.location.search);
  const ref = params.get("ref");
  if (!ref) return;
  if (localStorage.getItem("gg_ref_captured") === "1") return;
  localStorage.setItem("gg_ref_captured", "1");
  fetch("/api/referrals/capture", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    credentials: "include",
    body: JSON.stringify({ ref, ts: Date.now(), path: window.location.pathname })
  }).catch(()=>{});
}