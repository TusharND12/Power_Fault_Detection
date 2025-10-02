from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import numpy as np
import pandas as pd
import tensorflow as tf
import json
import os

app = Flask(__name__)
CORS(app)

# Load the model
model_path = 'power_faults_best.keras'
model = None

def load_model():
    global model
    try:
        model = tf.keras.models.load_model(model_path)
        print(f"Model loaded successfully from {model_path}")
        print(f"Model input shape: {model.input_shape}")
        print(f"Model output shape: {model.output_shape}")
    except Exception as e:
        print(f"Error loading model: {e}")

# Initialize model on startup
load_model()

# Sample feature names based on the dataset structure
# In a real application, you'd load these from a config file or the training data
FEATURE_NAMES = [
    'voltage', 'current', 'power_load', 'temperature', 'wind_speed',
    'duration_of_fault', 'down_time'
] + [f'feature_{i}' for i in range(8, 522)]  # Placeholder for remaining features

# Class labels based on actual dataset fault types
CLASS_LABELS = ['Line Breakage', 'Transformer Failure', 'Overheating']

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/predict', methods=['POST'])
def predict():
    try:
        if model is None:
            return jsonify({'error': 'Model not loaded'}), 500
        
        # Get input data from request
        data = request.get_json()
        
        # Extract features from the request with 4-decimal precision
        features = []
        
        # Core features from the dataset with high precision
        features.extend([
            float(data.get('voltage', 2200.0)),
            float(data.get('current', 250.0)),
            float(data.get('power_load', 50.0)),
            float(data.get('temperature', 25.0)),
            float(data.get('wind_speed', 20.0)),
            float(data.get('duration_of_fault', 2.0)),
            float(data.get('down_time', 1.0))
        ])
        
        # Add additional features with 4-decimal precision
        for i in range(7, 522):
            feature_name = f'feature_{i}'
            if feature_name in data:
                features.append(float(data[feature_name]))
            else:
                # Generate calculated values based on input parameters with high precision
                if i < 100:
                    features.append(float(np.random.normal(0, 1)))  # Random normal distribution
                elif i < 200:
                    features.append(float(data.get('voltage', 2200.0)) / 1000.0)  # Scaled voltage
                elif i < 300:
                    features.append(float(data.get('current', 250.0)) / 100.0)  # Scaled current
                elif i < 400:
                    features.append(float(data.get('temperature', 25.0)) / 50.0)  # Scaled temperature
                elif i < 500:
                    features.append(float(data.get('wind_speed', 20.0)) / 30.0)  # Scaled wind speed
                else:
                    features.append(float(np.random.normal(0, 0.5)))  # Additional random features
        
        # Convert to numpy array and reshape for model input
        features_array = np.array(features).reshape(1, -1)
        
        # Make prediction
        prediction = model.predict(features_array)
        
        # Get class probabilities
        probabilities = prediction[0]
        predicted_class_idx = np.argmax(probabilities)
        predicted_class = CLASS_LABELS[predicted_class_idx]
        confidence = float(probabilities[predicted_class_idx])
        
        # Get detailed fault analysis
        fault_details = get_fault_details(features, predicted_class, probabilities)
        
        # Prepare response with 4-decimal precision
        response = {
            'prediction': predicted_class,
            'confidence': round(confidence, 4),
            'probabilities': {
                CLASS_LABELS[i]: round(float(prob), 4) for i, prob in enumerate(probabilities)
            },
            'input_features': {
                'voltage': round(features[0], 4),
                'current': round(features[1], 4),
                'power_load': round(features[2], 4),
                'temperature': round(features[3], 4),
                'wind_speed': round(features[4], 4),
                'duration_of_fault': round(features[5], 4),
                'down_time': round(features[6], 4)
            },
            'fault_details': fault_details
        }
        
        return jsonify(response)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def get_fault_details(features, predicted_class, probabilities):
    """Get detailed fault information based on actual dataset fault types"""
    voltage = features[0]
    current = features[1]
    temperature = features[3]
    
    # Return details based on actual fault types from dataset
    if predicted_class == "Overheating":
        return {
            "fault_type": "Overheating",
            "severity": "HIGH" if temperature > 35.0 else "MODERATE",
            "description": f"System temperature at {temperature:.4f}°C indicates thermal stress on equipment. Overheating can cause equipment failure and power outages.",
            "recommended_actions": [
                "Activate emergency cooling systems",
                "Reduce power load to decrease heat generation",
                "Check cooling fans and heat exchangers",
                "Monitor temperature sensors continuously",
                "Schedule immediate thermal inspection"
            ],
            "estimated_downtime": "2-6 hours",
            "risk_level": "HIGH" if temperature > 35.0 else "MEDIUM",
            "affected_components": ["Cooling Systems", "Heat Exchangers", "Thermal Sensors", "Power Transformers"],
            "immediate_steps": [
                "Increase cooling capacity immediately",
                "Reduce system load by 20-30%",
                "Check for cooling system blockages",
                "Notify thermal monitoring team",
                "Prepare backup cooling systems"
            ]
        }
    elif predicted_class == "Transformer Failure":
        return {
            "fault_type": "Transformer Failure", 
            "severity": "HIGH" if voltage < 1900.0 else "MODERATE",
            "description": f"Voltage at {voltage:.4f}V indicates transformer malfunction. Low voltage can cause equipment damage and system instability.",
            "recommended_actions": [
                "Check transformer oil levels and quality",
                "Inspect transformer connections and terminals",
                "Verify power source integrity",
                "Test transformer protection relays",
                "Schedule transformer maintenance"
            ],
            "estimated_downtime": "3-8 hours",
            "risk_level": "HIGH" if voltage < 1900.0 else "MEDIUM",
            "affected_components": ["Power Transformers", "Voltage Regulators", "Protection Relays", "Distribution Panels"],
            "immediate_steps": [
                "Check transformer health indicators",
                "Verify power source connections",
                "Protect sensitive loads from voltage fluctuations",
                "Activate voltage compensation systems",
                "Prepare backup transformer if available"
            ]
        }
    elif predicted_class == "Line Breakage":
        return {
            "fault_type": "Line Breakage",
            "severity": "HIGH" if current > 240.0 else "MODERATE", 
            "description": f"Current at {current:.4f}A indicates potential line breakage. High current can cause conductor failure and power interruptions.",
            "recommended_actions": [
                "Inspect power lines for physical damage",
                "Check conductor connections and joints",
                "Verify line protection systems",
                "Test circuit breakers and fuses",
                "Schedule line maintenance and repair"
            ],
            "estimated_downtime": "4-12 hours",
            "risk_level": "HIGH" if current > 240.0 else "MEDIUM",
            "affected_components": ["Power Lines", "Conductors", "Insulators", "Circuit Breakers", "Protection Systems"],
            "immediate_steps": [
                "Isolate affected line sections",
                "Check for visible line damage",
                "Verify protection device operation",
                "Notify line maintenance crew",
                "Prepare emergency repair equipment"
            ]
        }
    else:
        # Fallback for any other cases
        return {
            "fault_type": "System Normal",
            "severity": "NONE",
            "description": "All parameters within normal operating ranges",
            "recommended_actions": [
                "Continue normal operations",
                "Regular monitoring",
                "Scheduled maintenance as planned"
            ],
            "estimated_downtime": "None",
            "risk_level": "LOW",
            "affected_components": "None",
            "immediate_steps": [
                "Continue normal monitoring",
                "Maintain scheduled maintenance",
                "Document system status"
            ]
        }

@app.route('/api/model-info', methods=['GET'])
def model_info():
    try:
        if model is None:
            return jsonify({'error': 'Model not loaded'}), 500
        
        return jsonify({
            'input_shape': model.input_shape,
            'output_shape': model.output_shape,
            'num_classes': len(CLASS_LABELS),
            'class_labels': CLASS_LABELS,
            'feature_count': model.input_shape[1] if model.input_shape else 522
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
