# ⚡ Power Fault Prediction System

[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-2.3+-green.svg)](https://flask.palletsprojects.com/)
[![TensorFlow](https://img.shields.io/badge/TensorFlow-2.13+-orange.svg)](https://tensorflow.org)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A comprehensive AI-powered web application for predicting electrical power system faults using machine learning. This system analyzes power grid parameters with 4-decimal precision and provides real-time fault predictions with confidence scores and detailed visualizations.

![Power Fault Prediction Demo](https://via.placeholder.com/800x400/667eea/ffffff?text=Power+Fault+Prediction+System)

## 🚀 Features

- **🧠 Real-time Fault Prediction**: Input power system parameters and get instant AI-powered fault predictions
- **📊 Interactive Dashboard**: Modern, responsive web interface with intuitive controls
- **📈 Visual Analytics**: Chart.js-powered visualizations showing probability distributions
- **🎯 Confidence Scoring**: Detailed confidence metrics for each prediction
- **✅ Parameter Validation**: Real-time input validation with helpful hints
- **📱 Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **🎨 Modern UI/UX**: Beautiful gradient design with smooth animations
- **🔢 4-Decimal Precision**: Support for complex values with high precision
- **🔍 Detailed Analysis**: Comprehensive fault analysis with actionable recommendations

## 🏗️ Architecture

### Backend (Flask)
- **Model Loading**: Automatically loads the trained Keras model
- **RESTful API**: Clean API endpoints for predictions and model information
- **Error Handling**: Comprehensive error handling and validation
- **CORS Support**: Cross-origin resource sharing enabled for frontend integration
- **High Precision**: 4-decimal precision support for complex calculations

### Frontend (HTML/CSS/JavaScript)
- **Responsive Design**: Mobile-first approach with CSS Grid and Flexbox
- **Interactive Forms**: Real-time validation and user feedback
- **Data Visualization**: Chart.js integration for probability charts
- **Modern Styling**: CSS animations, gradients, and glass-morphism effects
- **Progressive Web App**: PWA capabilities with offline support

## 📊 Model Information

- **Input Features**: 522 parameters including voltage, current, power load, temperature, wind speed, and more
- **Output Classes**: 3 fault categories based on actual dataset
  - 🔌 **Line Breakage** (1630 cases)
  - ⚡ **Transformer Failure** (1671 cases)  
  - 🌡️ **Overheating** (1705 cases)
- **Architecture**: Deep neural network with dense layers, batch normalization, and dropout
- **Activation**: Softmax output for probability distribution
- **Precision**: 4-decimal precision support for accurate predictions

## 🌐 Live Demo

**Try the live demo**: [Power Fault Prediction System](https://yourusername.github.io/Indicators-of-Anxiety-or-Depression-Model/)

## 🛠️ Installation & Setup

### Prerequisites
- Python 3.8 or higher
- pip (Python package installer)
- Git (for cloning the repository)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/power-fault-prediction.git
cd power-fault-prediction
```

### 2. Create Virtual Environment (Recommended)
```bash
python -m venv venv

# On Windows
venv\Scripts\activate

# On macOS/Linux
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Verify Model File
Ensure `power_faults_best.keras` is in the project root directory.

### 5. Run the Application
```bash
python app.py
```

### 6. Access the Application
Open your web browser and navigate to:
```
http://localhost:5000
```

## 🚀 GitHub Pages Deployment

This project is automatically deployed to GitHub Pages. To deploy your own version:

### 1. Fork and Clone
```bash
git clone https://github.com/yourusername/Indicators-of-Anxiety-or-Depression-Model.git
cd Indicators-of-Anxiety-or-Depression-Model
```

### 2. Enable GitHub Pages
1. Go to your repository settings
2. Scroll to "Pages" section
3. Select "GitHub Actions" as source
4. Save the settings

### 3. Deploy
Simply push to the main branch - the site will automatically deploy:
```bash
git add .
git commit -m "Deploy to GitHub Pages"
git push origin main
```

### 4. Access Your Site
Your site will be available at:
```
https://yourusername.github.io/Indicators-of-Anxiety-or-Depression-Model/
```

**Note**: Replace `yourusername` with your actual GitHub username.

## 📱 Usage

### 1. Input Parameters
Fill in the power system parameters with 4-decimal precision:
- **Voltage (V)**: System voltage (1000-5000V) - e.g., `2156.7892`
- **Current (A)**: Current flow (50-1000A) - e.g., `247.3456`
- **Power Load (MW)**: Power consumption (5-200MW) - e.g., `48.2345`
- **Temperature (°C)**: Operating temperature (-50 to 100°C) - e.g., `35.6789`
- **Wind Speed (km/h)**: Environmental conditions (0-200 km/h) - e.g., `23.4567`
- **Duration of Fault (hrs)**: How long the fault has been active (0-24 hrs)
- **Down Time (hrs)**: System downtime duration (0-24 hrs)
- **Weather Condition**: Current weather (Clear, Rainy, Snowy, Windstorm, Thunderstorm)
- **Maintenance Status**: Maintenance state (Completed, Scheduled, Pending)
- **Component Health**: Equipment condition (Normal, Faulty, Overheated)

### 2. Get Prediction
Click "Predict Fault" to analyze the parameters and get:
- **Fault Classification**: Line Breakage, Transformer Failure, or Overheating
- **Confidence Score**: Prediction reliability percentage
- **Probability Distribution**: Visual chart showing class probabilities
- **Input Summary**: Review of entered parameters with 4-decimal precision
- **Detailed Analysis**: Comprehensive fault analysis with recommendations

## 🔧 API Endpoints

### GET `/api/model-info`
Returns model information including input/output shapes and class labels.

**Response:**
```json
{
    "input_shape": [null, 522],
    "output_shape": [null, 3],
    "num_classes": 3,
    "class_labels": ["Line Breakage", "Transformer Failure", "Overheating"],
    "feature_count": 522
}
```

### POST `/api/predict`
Makes a fault prediction based on input parameters.

**Request Body:**
```json
{
    "voltage": 2156.7892,
    "current": 247.3456,
    "power_load": 48.2345,
    "temperature": 35.6789,
    "wind_speed": 23.4567,
    "duration_of_fault": 2.3456,
    "down_time": 1.2345,
    "weather_condition": "clear",
    "maintenance_status": "completed",
    "component_health": "normal"
}
```

**Response:**
```json
{
    "prediction": "Overheating",
    "confidence": 0.8567,
    "probabilities": {
        "Line Breakage": 0.1234,
        "Transformer Failure": 0.0199,
        "Overheating": 0.8567
    },
    "input_features": {
        "voltage": 2156.7892,
        "current": 247.3456,
        "power_load": 48.2345,
        "temperature": 35.6789,
        "wind_speed": 23.4567,
        "duration_of_fault": 2.3456,
        "down_time": 1.2345
    },
    "fault_details": {
        "fault_type": "Overheating",
        "severity": "HIGH",
        "description": "System temperature at 35.6789°C indicates thermal stress...",
        "recommended_actions": [...],
        "immediate_steps": [...],
        "affected_components": [...],
        "estimated_downtime": "2-6 hours",
        "risk_level": "HIGH"
    }
}
```

## 🎨 Customization

### Styling
Modify `static/style.css` to customize:
- Color schemes and gradients
- Typography and fonts
- Layout and spacing
- Animations and transitions

### Functionality
Update `static/script.js` to add:
- Additional validation rules
- Custom notification styles
- Enhanced chart configurations
- New interactive features

### Backend
Modify `app.py` to:
- Add new API endpoints
- Implement additional preprocessing
- Add authentication/authorization
- Integrate with databases

## 🚨 Troubleshooting

### Common Issues

1. **Model Loading Error**
   - Ensure `power_faults_best.keras` exists in the project root
   - Check TensorFlow version compatibility
   - Verify file permissions

2. **Port Already in Use**
   - Change the port in `app.py`: `app.run(port=5001)`
   - Or kill the process using port 5000

3. **CORS Errors**
   - Ensure Flask-CORS is installed
   - Check browser console for specific error messages

4. **Precision Errors**
   - Ensure all numeric inputs are properly formatted
   - Check for string/number conversion issues

### Performance Optimization

- **Model Loading**: The model is loaded once at startup for optimal performance
- **Caching**: Consider implementing Redis for caching frequent predictions
- **Scaling**: Use Gunicorn or similar WSGI server for production deployment

## 📈 Future Enhancements

- [ ] User authentication and session management
- [ ] Historical prediction tracking
- [ ] Batch prediction capabilities
- [ ] Advanced data visualization dashboards
- [ ] Model retraining interface
- [ ] Database integration for data persistence
- [ ] Real-time monitoring and alerting
- [ ] Mobile app development
- [ ] API rate limiting and security
- [ ] Automated testing suite
- [ ] Docker containerization
- [ ] CI/CD pipeline setup

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- TensorFlow/Keras for the machine learning framework
- Flask for the web framework
- Chart.js for data visualization
- Font Awesome for icons
- The power systems engineering community for domain expertise

## 📞 Support

For support, please:
- Open an issue on GitHub
- Check the troubleshooting section
- Review the documentation

## 🌟 Show Your Support

Give a ⭐️ if this project helped you!

---

**Built with ❤️ for the power systems industry**

*Empowering electrical grid monitoring with AI-driven fault prediction*