/**
 * Google Analytics 4 Initialization
 * Includes a check to prevent tracking on localhost.
 */
(function () {
    // ---- CONFIGURATION ----
    const MEASUREMENT_ID = 'G-XXXXXXXXXX'; // Replace with your GA4 Measurement ID
    // -----------------------

    // Skip if on localhost or 127.0.0.1
    const isLocalhost = Boolean(
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.protocol === 'file:'
    );

    if (isLocalhost) {
        console.log('Google Analytics: Local environment detected. Skipping initialization.');
        return;
    }

    // Standard GA4 snippet
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    gtag('js', new Date());
    gtag('config', MEASUREMENT_ID);
})();
