# Installing TensorFlow for Power Fault Prediction System

## Current Status
The application is running in **Demo Mode** with a mock model. To use your actual trained `.keras` model, you need to install TensorFlow.

## Installation Steps

### Option 1: Install TensorFlow (Recommended)
```bash
pip install tensorflow
```

### Option 2: Install All Dependencies
```bash
pip install -r requirements.txt
```

### Option 3: If you have network issues, try:
```bash
# Try with different index
pip install -i https://pypi.org/simple/ tensorflow

# Or install without dependencies first
pip install --no-deps tensorflow
```

## After Installation

1. **Stop the current demo server** (if running)
2. **Run the full application**:
   ```bash
   python app.py
   ```

## What the Demo Mode Does

- ✅ **Full web interface** with all features
- ✅ **Real predictions** using heuristic logic
- ✅ **All visualizations** and charts
- ⚠️ **Mock model** instead of your trained Keras model

## Features Available in Demo Mode

- Input form with all power system parameters
- Real-time predictions based on simple rules
- Beautiful charts and visualizations
- Responsive design
- All UI/UX features

## Switching to Real Model

Once TensorFlow is installed, simply run:
```bash
python app.py
```

This will load your actual `power_faults_best.keras` model and provide true AI predictions.

## Troubleshooting

### If TensorFlow installation fails:
1. Check your internet connection
2. Try updating pip: `python -m pip install --upgrade pip`
3. Use a virtual environment: `python -m venv venv && venv\Scripts\activate`
4. Install TensorFlow in the virtual environment

### If you get import errors:
- Make sure you're using Python 3.8+ 
- Check that TensorFlow is properly installed: `python -c "import tensorflow; print(tensorflow.__version__)"`

## Current Demo Logic

The demo mode uses simple heuristics:
- **Major Fault**: Temperature > 40°C or Voltage < 1500V
- **Minor Fault**: Temperature > 30°C or Voltage < 1800V or Current > 300A
- **Normal**: All other conditions

This gives you a working system while you install the full dependencies!
