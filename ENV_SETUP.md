# Environment Configuration Setup

This project uses environment variables to securely manage Watson Assistant API credentials.

## Files Created

1. **`env.local`** - Contains your actual API credentials (not committed to git)
2. **`env.example`** - Template file showing required environment variables
3. **`static/config.js`** - JavaScript configuration loader
4. **`.gitignore`** - Updated to ignore environment files

## Setup Instructions

### 1. Create Environment File

Copy the example file and rename it to `.env.local`:

```bash
cp env.example .env.local
```

### 2. Update Your Credentials

Edit `.env.local` and replace the placeholder values with your actual Watson Assistant credentials:

```env
# Watson Assistant API Key
ASSISTANT_APIKEY=your_actual_api_key_here

# Watson Assistant IAM API Key
ASSISTANT_IAM_APIKEY=your_actual_iam_api_key_here

# Watson Assistant Service URL
ASSISTANT_URL=https://api.us-south.assistant.watson.cloud.ibm.com/instances/your_instance_id

# Watson Assistant ID
ASSISTANT_ID=your_actual_assistant_id_here
```

### 3. For Static Sites (GitHub Pages)

Since GitHub Pages serves static files, you have two options:

#### Option A: Use Meta Tags (Recommended)

Add your environment variables as meta tags in `index.html`:

```html
<meta name="ASSISTANT_APIKEY" content="your_api_key">
<meta name="ASSISTANT_URL" content="your_service_url">
<meta name="ASSISTANT_ID" content="your_assistant_id">
```

#### Option B: Update Default Values

Edit `static/config.js` and update the `DEFAULT_CONFIG` object with your actual values.

### 4. Security Notes

- **Never commit** `.env.local` to version control
- **Never expose** API keys in client-side code for production
- Use **environment-specific** configurations for different deployments
- Consider using a **backend proxy** for production applications

## Configuration Loading Order

The `static/config.js` file loads configuration in this order:

1. `window.env` (if loaded by a build tool like Vite/Webpack)
2. Meta tags in HTML
3. Default fallback values

## Current Configuration

The current setup includes:
- Watson Assistant API integration
- Environment variable management
- Secure credential handling
- Fallback configuration

## Troubleshooting

If Watson Assistant is not working:

1. Check browser console for configuration errors
2. Verify your API keys are correct
3. Ensure the service URL and assistant ID are valid
4. Check network connectivity to Watson services

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `ASSISTANT_APIKEY` | Watson Assistant API key | `abc123...` |
| `ASSISTANT_IAM_APIKEY` | IAM authentication key | `abc123...` |
| `ASSISTANT_URL` | Watson service URL | `https://api.us-south...` |
| `ASSISTANT_AUTH_TYPE` | Authentication type | `iam` |
| `ASSISTANT_VERSION` | API version | `2023-11-22` |
| `ASSISTANT_ID` | Assistant instance ID | `a082ae29-2af3-4c79-bdc6-3f4027c5493b` |
| `NODE_ENV` | Environment | `development` |
