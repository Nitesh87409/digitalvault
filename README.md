# DigitalVault – Setup Instructions

## Folder Structure
```
digitalvault/
├── frontend/
│   ├── index.html          ← Landing page
│   ├── download.html       ← Download page (after payment)
│   └── admin/
│       ├── login.html      ← Admin login
│       └── dashboard.html  ← Admin panel
└── backend/
    ├── app.js
    ├── .env.example
    ├── controllers/
    ├── models/
    ├── middleware/
    ├── routers/
    ├── utils/
    └── uploads/            ← Put your product files here
```

---

## Step 1: MongoDB Setup (Free Atlas)

1. Go to https://mongodb.com/atlas and create free account
2. Create a free cluster
3. Click "Connect" → "Connect your application"
4. Copy the connection string:
   `mongodb+srv://username:password@cluster.mongodb.net/digitalvault`

---

## Step 2: Razorpay Setup

1. Go to https://razorpay.com → Create account
2. Dashboard → Settings → API Keys → Generate Test Key
3. Copy Key ID and Key Secret
4. For live payments, complete KYC and generate Live keys

---

## Step 3: Gmail App Password (for emails)

1. Go to Google Account → Security
2. Enable 2-Factor Authentication
3. Go to "App Passwords" → Select "Mail" → Generate
4. Copy the 16-digit password

---

## Step 4: Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` file:
```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/digitalvault
JWT_SECRET=any_long_random_string_here
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxx
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_16_digit_app_password
SITE_URL=https://yourdomain.com
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=YourSecurePassword123
PORT=5000
```

Start backend:
```bash
npm start
```

---

## Step 5: Add Your Product Files

Put your downloadable files (zip, pdf, etc.) in:
```
backend/uploads/your-product.zip
```

Then in Admin Panel → Add Product → File URL:
```
/uploads/your-product.zip
```

---

## Step 6: Frontend Setup

Open `frontend/index.html` and `frontend/admin/login.html`

Change the API URL at the top of each file:
```javascript
const API = 'https://yourdomain.com'; // Your server URL
```

---

## Step 7: cPanel Shared Hosting Deployment

### Backend (Node.js on cPanel)

1. Login to cPanel → **Setup Node.js App**
2. Click "Create Application"
   - Node.js version: 18 or higher
   - Application mode: Production
   - Application root: `digitalvault/backend`
   - Application startup file: `app.js`
3. Click Create → then "Run NPM Install"
4. Add Environment Variables (same as .env)
5. Click Start App

### Frontend (Static HTML)

1. Go to cPanel → **File Manager**
2. Open `public_html`
3. Upload all files from `frontend/` folder:
   - index.html
   - download.html
   - admin/ folder

That's it! Your site is live.

---

## Step 8: Update API URL

After deployment, open each HTML file and update:
```javascript
const API = 'https://yourdomain.com'; // or your Node.js app URL
```

If Node.js runs on a port (e.g., 3000), use:
```javascript
const API = 'https://yourdomain.com:5000';
```

---

## Admin Panel Access

URL: `https://yourdomain.com/admin/login.html`

Default credentials (set in .env):
- Email: admin@yourdomain.com  
- Password: YourSecurePassword123

**Change password immediately after first login!**

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Payment not working | Check Razorpay keys in .env |
| Email not sending | Check Gmail App Password, enable 2FA |
| DB not connecting | Whitelist 0.0.0.0/0 in MongoDB Atlas Network Access |
| Download link not working | Check SITE_URL in .env matches your domain |
| Admin login fails | Check ADMIN_EMAIL and ADMIN_PASSWORD in .env |

---

## Support
Email: support@digitalvault.in
