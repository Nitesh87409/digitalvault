// DigitalVault Frontend Config
// Sabhi URLs aur settings yahan se aati hain — koi hardcoded value nahi

const Config = {
  // API Base URL — production mein change karo sirf yahan
  // API: 'http://localhost:5000',
//  API: 'https://digitalshop-e6xr.onrender.com/'
  API: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000'
    : window.__DV_API_URL__ || '', // Production mein server se inject hoga

  // App Name
  APP_NAME: 'DigitalVault',

  // Cart localStorage key
  CART_KEY: 'dv_cart',

  // Auth localStorage key
  AUTH_KEY: 'dv_customer',
  TOKEN_KEY: 'dv_token',
};

// Validate
if (!Config.API) {
  console.error('API URL not set! Check config.js');
}

// Global access
window.Config = Config;