// Environment Configuration
// This file loads environment variables for Watson Assistant

// Default configuration (fallback values)
const DEFAULT_CONFIG = {
    ASSISTANT_APIKEY: 'oGVubRECEeFhuFc5F4CvIk58koNLwW5jcwBX5NtKka46',
    ASSISTANT_IAM_APIKEY: 'oGVubRECEeFhuFc5F4CvIk58koNLwW5jcwBX5NtKka46',
    ASSISTANT_URL: 'https://api.us-south.assistant.watson.cloud.ibm.com/instances/a082ae29-2af3-4c79-bdc6-3f4027c5493b',
    ASSISTANT_AUTH_TYPE: 'iam',
    ASSISTANT_VERSION: '2023-11-22',
    ASSISTANT_ID: 'a082ae29-2af3-4c79-bdc6-3f4027c5493b'
};

// Function to get environment variable
function getEnvVar(key) {
    // Try to get from window.env first (if loaded by a build tool)
    if (window.env && window.env[key]) {
        return window.env[key];
    }
    
    // Try to get from meta tags (for static sites)
    const metaTag = document.querySelector(`meta[name="${key}"]`);
    if (metaTag) {
        return metaTag.getAttribute('content');
    }
    
    // Fall back to default values
    return DEFAULT_CONFIG[key];
}

// Watson Assistant Configuration
const WATSON_CONFIG = {
    apikey: getEnvVar('ASSISTANT_APIKEY'),
    serviceUrl: getEnvVar('ASSISTANT_URL'),
    version: getEnvVar('ASSISTANT_VERSION'),
    assistantId: getEnvVar('ASSISTANT_ID'),
    authType: getEnvVar('ASSISTANT_AUTH_TYPE')
};

// Export for use in other scripts
window.WATSON_CONFIG = WATSON_CONFIG;

// Log configuration (without sensitive data)
console.log('Watson Assistant Configuration loaded:');
console.log('- Service URL:', WATSON_CONFIG.serviceUrl);
console.log('- Version:', WATSON_CONFIG.version);
console.log('- Assistant ID:', WATSON_CONFIG.assistantId);
console.log('- Auth Type:', WATSON_CONFIG.authType);
console.log('- API Key configured:', !!WATSON_CONFIG.apikey);
