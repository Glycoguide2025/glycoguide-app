import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { captureReferral } from "./lib/referral";

// Stage 8 RC Hardening: Initialize performance monitoring
import "./lib/performance";

// Stage 8 RC Hardening: A11y dev checking
if (import.meta.env.DEV) {
  import('@axe-core/react').then((axeModule) => {
    import('react').then((ReactModule) => {
      import('react-dom/client').then((ReactDOMModule) => {
        const axe = axeModule.default;
        const React = ReactModule.default;
        const ReactDOM = ReactDOMModule;
        axe(React, ReactDOM, 1000);
      });
    });
  }).catch(() => {
    // Fail silently if axe-core not available
  });
}

// Capture referral parameters on page load
captureReferral();

createRoot(document.getElementById("root")!).render(
  <App />
);
