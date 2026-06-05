/**
 * Helper to dynamically load a script from a CDN.
 * Returns a promise that resolves when the script is loaded.
 */
export function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      resolve();
      return;
    }

    // Check if script is already present in the DOM
    const existingScript = document.querySelector(`script[src="${src}"]`);
    if (existingScript) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.crossOrigin = 'anonymous';

    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load external script: ${src}`));

    document.head.appendChild(script);
  });
}
