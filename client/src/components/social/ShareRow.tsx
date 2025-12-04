export default function ShareRow() {
  const url = window.location.origin;
  const text = "I'm trying GlycoGuide — a calm, wellness-first companion for everyday food habits.";
  const tw = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
  const fb = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  const ln = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;

  async function nativeShare() {
    if ((navigator as any).share) {
      await (navigator as any).share({ title: "GlycoGuide", text, url });
    } else {
      navigator.clipboard.writeText(url);
      alert("Link copied!");
    }
  }

  return (
    <div className="flex gap-2" data-testid="share-buttons-row">
      <button 
        className="border rounded-lg px-3 py-2 hover:bg-gray-50" 
        onClick={nativeShare}
        data-testid="button-share-native"
      >
        Share
      </button>
      <a 
        className="border rounded-lg px-3 py-2 hover:bg-gray-50" 
        href={tw} 
        target="_blank" 
        rel="noreferrer"
        data-testid="link-share-twitter"
      >
        Twitter
      </a>
      <a 
        className="border rounded-lg px-3 py-2 hover:bg-gray-50" 
        href={fb} 
        target="_blank" 
        rel="noreferrer"
        data-testid="link-share-facebook"
      >
        Facebook
      </a>
      <a 
        className="border rounded-lg px-3 py-2 hover:bg-gray-50" 
        href={ln} 
        target="_blank" 
        rel="noreferrer"
        data-testid="link-share-linkedin"
      >
        LinkedIn
      </a>
    </div>
  );
}