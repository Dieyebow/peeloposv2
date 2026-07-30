import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

export function DynamicManifest() {
  const { chatbotId } = useParams<{ chatbotId: string }>();

  useEffect(() => {
    if (chatbotId) {
      // Create dynamic manifest
      const manifest = {
        name: "Peelo POS",
        short_name: "PeeloPOS",
        start_url: `/#/pos-login/${chatbotId}`,
        display: "standalone",
        background_color: "#f8fafc",
        theme_color: "#000000",
        orientation: "any",
        icons: [
          {
            src: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 192 192'><rect fill='%23000000' width='192' height='192'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='80' fill='white' font-family='Arial'>P</text></svg>",
            sizes: "192x192",
            type: "image/svg+xml"
          },
          {
            src: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'><rect fill='%23000000' width='512' height='512'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='220' fill='white' font-family='Arial'>P</text></svg>",
            sizes: "512x512",
            type: "image/svg+xml"
          }
        ]
      };

      const manifestBlob = new Blob([JSON.stringify(manifest)], { type: 'application/json' });
      const manifestURL = URL.createObjectURL(manifestBlob);

      // Remove old manifest link if exists
      const oldLink = document.querySelector('link[rel="manifest"]');
      if (oldLink) {
        oldLink.remove();
      }

      // Add new manifest link
      const link = document.createElement('link');
      link.rel = 'manifest';
      link.href = manifestURL;
      document.head.appendChild(link);
    }
  }, [chatbotId]);

  return null;
}
