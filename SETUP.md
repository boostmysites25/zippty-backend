# Zippty Backend Setup Guide

## Environment Variables Setup

Create a `.env` file in the root directory of the backend with the following variables:

```env
# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/zippty

# Razorpay Configuration
# Get these from your Razorpay dashboard: https://dashboard.razorpay.com/
RAZORPAY_KEY_ID=your_razorpay_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here

# JWT Secret (generate a random string for security)
JWT_SECRET=your_jwt_secret_here

# Server Configuration
PORT=7070
```

## Getting Razorpay Credentials

1. Sign up for a Razorpay account at https://razorpay.com/
2. Go to your Razorpay Dashboard
3. Navigate to Settings > API Keys
4. Generate a new API key pair
5. Copy the Key ID and Key Secret to your `.env` file

## Running the Application

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   npm start
   ```

## Notes

- The application will now start even without Razorpay credentials configured
- Payment-related features will return an error message if Razorpay is not configured
- Make sure to add the `.env` file to your `.gitignore` to keep your credentials secure
