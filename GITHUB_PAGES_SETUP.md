# 🚀 GitHub Pages Deployment Guide

This guide will help you deploy your Power Fault Prediction System to GitHub Pages for free static hosting.

## 📋 Prerequisites

- GitHub account
- Git installed on your computer
- Your project files ready

## 🔧 Step-by-Step Deployment

### 1. Create GitHub Repository

1. Go to [GitHub.com](https://github.com) and sign in
2. Click the "+" icon in the top right corner
3. Select "New repository"
4. Name your repository: `power-fault-prediction`
5. Make it **Public** (required for free GitHub Pages)
6. Add description: "AI-powered electrical grid monitoring with 4-decimal precision"
7. Click "Create repository"

### 2. Connect Local Repository to GitHub

Run these commands in your project directory:

```bash
# Add GitHub repository as remote origin
git remote add origin https://github.com/YOUR_USERNAME/power-fault-prediction.git

# Push your code to GitHub
git push -u origin main
```

### 3. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click on **Settings** tab
3. Scroll down to **Pages** section in the left sidebar
4. Under **Source**, select **GitHub Actions**
5. The workflow will automatically deploy your site

### 4. Configure GitHub Actions (Automatic)

The repository includes a `.github/workflows/deploy.yml` file that will automatically:
- Deploy your site when you push to the `main` branch
- Build and serve your static files
- Make your site available at `https://YOUR_USERNAME.github.io/power-fault-prediction`

### 5. Custom Domain (Optional)

If you have a custom domain:

1. Create a `CNAME` file in your repository root:
   ```
   yourdomain.com
   ```
2. In your domain provider's DNS settings, add a CNAME record:
   ```
   www.yourdomain.com → YOUR_USERNAME.github.io
   ```

## 🌐 Your Live Site

Once deployed, your site will be available at:
```
https://YOUR_USERNAME.github.io/power-fault-prediction
```

## 🔄 Updating Your Site

To update your site:

1. Make changes to your files
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Update: Description of changes"
   git push origin main
   ```
3. GitHub Actions will automatically redeploy your site

## 📁 File Structure for GitHub Pages

Your repository should have this structure:
```
power-fault-prediction/
├── index.html              # Main page (required)
├── static/
│   ├── style.css          # Styles
│   └── script-pages.js    # GitHub Pages compatible JavaScript
├── templates/
│   └── index.html         # Flask template (not used in static version)
├── .github/
│   └── workflows/
│       └── deploy.yml     # Deployment workflow
├── _config.yml            # Jekyll configuration
├── README.md              # Project documentation
├── LICENSE                # License file
└── CONTRIBUTING.md        # Contribution guidelines
```

## 🎯 Features Available on GitHub Pages

### ✅ What Works:
- **Static Website**: Fully functional frontend
- **Demo Mode**: Interactive predictions using simulated data
- **Responsive Design**: Works on all devices
- **4-Decimal Precision**: High-precision input handling
- **Visual Charts**: Chart.js powered visualizations
- **Modern UI**: Beautiful gradient design

### ⚠️ What Doesn't Work:
- **Real ML Predictions**: Requires Flask backend
- **API Endpoints**: No server-side processing
- **Model Loading**: Keras model can't run in browser

## 🔧 Troubleshooting

### Common Issues:

1. **Site Not Loading**
   - Check if repository is public
   - Verify GitHub Pages is enabled
   - Wait 5-10 minutes for deployment

2. **404 Error**
   - Ensure `index.html` exists in root directory
   - Check file paths are correct

3. **Styling Issues**
   - Verify CSS files are in correct location
   - Check for typos in file paths

4. **JavaScript Not Working**
   - Open browser developer tools (F12)
   - Check console for errors
   - Verify script files are loaded

### Debug Steps:

1. **Check GitHub Actions**:
   - Go to Actions tab in your repository
   - Look for failed deployments
   - Check error messages

2. **Validate Files**:
   - Ensure all required files are present
   - Check file permissions
   - Verify file encoding (UTF-8)

3. **Test Locally**:
   - Open `index.html` in browser
   - Test all functionality
   - Check console for errors

## 🚀 Advanced Features

### 1. Custom 404 Page
Create a `404.html` file for custom error pages.

### 2. Analytics
Add Google Analytics by including the tracking code in `index.html`.

### 3. SEO Optimization
The `_config.yml` file includes SEO settings for better search engine visibility.

### 4. Automated Testing
Add tests to the GitHub Actions workflow for quality assurance.

## 📞 Support

If you encounter issues:

1. Check the [GitHub Pages documentation](https://docs.github.com/en/pages)
2. Review the [GitHub Actions logs](https://docs.github.com/en/actions)
3. Open an issue in your repository
4. Check browser console for JavaScript errors

## 🎉 Success!

Once deployed, you'll have:
- ✅ Free hosting on GitHub Pages
- ✅ Custom domain support
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Version control integration
- ✅ Easy updates and maintenance

Your Power Fault Prediction System is now live on the web! 🌐





