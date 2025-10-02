from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import numpy as np
import json
import os

app = Flask(__name__)
CORS(app)

# Mock model for demonstration (replace with actual model loading when TensorFlow is available)
class MockModel:
    def predict(self, input_data):
        # Simulate prediction with some logic based on input features
        voltage = input_data[0][0] if len(input_data[0]) > 0 else 2200
        current = input_data[0][1] if len(input_data[0]) > 1 else 250
        temperature = input_data[0][3] if len(input_data[0]) > 3 else 25
        
        # Enhanced prediction based on actual dataset fault types
        # Analyze patterns from the dataset to predict fault types
        
        # High temperature indicates Overheating
        temp_factor = 1.0 if temperature > 35 else (0.8 if temperature > 30 else 0.3)
        
        # Low voltage indicates Transformer Failure  
        voltage_factor = 1.0 if voltage < 1900 else (0.7 if voltage < 2100 else 0.2)
        
        # High current and wind speed indicate Line Breakage
        current_factor = 1.0 if current > 240 else (0.6 if current > 220 else 0.2)
        
        # Calculate probabilities based on actual fault patterns
        overheating_prob = temp_factor * 0.4
        transformer_prob = voltage_factor * 0.4  
        line_breakage_prob = current_factor * 0.4
        
        # Normalize probabilities
        total = overheating_prob + transformer_prob + line_breakage_prob
        probabilities = [
            line_breakage_prob / total,
            transformer_prob / total, 
            overheating_prob / total
        ]
        
        return np.array([probabilities])
    
    def get_fault_details(self, input_data):
        """Get detailed fault information based on actual dataset fault types"""
        voltage = input_data[0][0] if len(input_data[0]) > 0 else 2200
        current = input_data[0][1] if len(input_data[0]) > 1 else 250
        temperature = input_data[0][3] if len(input_data[0]) > 3 else 25
        
        # Get the predicted fault type
        prediction = self.predict(input_data)
        predicted_class_idx = np.argmax(prediction[0])
        fault_type = CLASS_LABELS[predicted_class_idx]
        
        # Return details based on actual fault types from dataset
        if fault_type == "Overheating":
            return {
                "fault_type": "Overheating",
                "severity": "HIGH" if temperature > 35 else "MODERATE",
                "description": f"System temperature at {temperature}°C indicates thermal stress on equipment. Overheating can cause equipment failure and power outages.",
                "recommended_actions": [
                    "Activate emergency cooling systems",
                    "Reduce power load to decrease heat generation",
                    "Check cooling fans and heat exchangers",
                    "Monitor temperature sensors continuously",
                    "Schedule immediate thermal inspection"
                ],
                "estimated_downtime": "2-6 hours",
                "risk_level": "HIGH" if temperature > 35 else "MEDIUM",
                "affected_components": ["Cooling Systems", "Heat Exchangers", "Thermal Sensors", "Power Transformers"],
                "immediate_steps": [
                    "Increase cooling capacity immediately",
                    "Reduce system load by 20-30%",
                    "Check for cooling system blockages",
                    "Notify thermal monitoring team",
                    "Prepare backup cooling systems"
                ]
            }
        elif fault_type == "Transformer Failure":
            return {
                "fault_type": "Transformer Failure", 
                "severity": "HIGH" if voltage < 1900 else "MODERATE",
                "description": f"Voltage at {voltage}V indicates transformer malfunction. Low voltage can cause equipment damage and system instability.",
                "recommended_actions": [
                    "Check transformer oil levels and quality",
                    "Inspect transformer connections and terminals",
                    "Verify power source integrity",
                    "Test transformer protection relays",
                    "Schedule transformer maintenance"
                ],
                "estimated_downtime": "3-8 hours",
                "risk_level": "HIGH" if voltage < 1900 else "MEDIUM",
                "affected_components": ["Power Transformers", "Voltage Regulators", "Protection Relays", "Distribution Panels"],
                "immediate_steps": [
                    "Check transformer health indicators",
                    "Verify power source connections",
                    "Protect sensitive loads from voltage fluctuations",
                    "Activate voltage compensation systems",
                    "Prepare backup transformer if available"
                ]
            }
        elif fault_type == "Line Breakage":
            return {
                "fault_type": "Line Breakage",
                "severity": "HIGH" if current > 240 else "MODERATE", 
                "description": f"Current at {current}A indicates potential line breakage. High current can cause conductor failure and power interruptions.",
                "recommended_actions": [
                    "Inspect power lines for physical damage",
                    "Check conductor connections and joints",
                    "Verify line protection systems",
                    "Test circuit breakers and fuses",
                    "Schedule line maintenance and repair"
                ],
                "estimated_downtime": "4-12 hours",
                "risk_level": "HIGH" if current > 240 else "MEDIUM",
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

model = MockModel()

# Class labels
CLASS_LABELS = ['Line Breakage', 'Transformer Failure', 'Overheating']

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/predict', methods=['POST'])
def predict():
    try:
        # Get input data from request
        data = request.get_json()
        
        # Extract features from the request
        features = []
        
        # Core features from the dataset
        features.extend([
            data.get('voltage', 2200.0),
            data.get('current', 250.0),
            data.get('power_load', 50.0),
            data.get('temperature', 25.0),
            data.get('wind_speed', 20.0),
            data.get('duration_of_fault', 2.0),
            data.get('down_time', 1.0)
        ])
        
        # Add additional features (simplified for demo)
        for i in range(7, 522):
            if i < 100:
                features.append(np.random.normal(0, 1))
            elif i < 200:
                features.append(data.get('voltage', 2200.0) / 1000)
            elif i < 300:
                features.append(data.get('current', 250.0) / 100)
            elif i < 400:
                features.append(data.get('temperature', 25.0) / 50)
            elif i < 500:
                features.append(data.get('wind_speed', 20.0) / 30)
            else:
                features.append(np.random.normal(0, 0.5))
        
        # Convert to numpy array and reshape for model input
        features_array = np.array(features).reshape(1, -1)
        
        # Make prediction
        prediction = model.predict(features_array)
        
        # Get class probabilities
        probabilities = prediction[0]
        predicted_class_idx = np.argmax(probabilities)
        predicted_class = CLASS_LABELS[predicted_class_idx]
        confidence = float(probabilities[predicted_class_idx])
        
        # Get detailed fault information
        fault_details = model.get_fault_details(features_array)
        
        # Prepare response
        response = {
            'prediction': predicted_class,
            'confidence': confidence,
            'probabilities': {
                CLASS_LABELS[i]: float(prob) for i, prob in enumerate(probabilities)
            },
            'input_features': {
                'voltage': features[0],
                'current': features[1],
                'power_load': features[2],
                'temperature': features[3],
                'wind_speed': features[4],
                'duration_of_fault': features[5],
                'down_time': features[6]
            },
            'fault_details': fault_details
        }
        
        return jsonify(response)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/model-info', methods=['GET'])
def model_info():
    try:
        return jsonify({
            'input_shape': [None, 522],
            'output_shape': [None, 3],
            'num_classes': len(CLASS_LABELS),
            'class_labels': CLASS_LABELS,
            'feature_count': 522,
            'model_type': 'Mock Model (Demo)'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("Starting Power Fault Prediction System (Demo Mode)")
    print("Using mock model for demonstration")
    print("Server will be available at: http://localhost:5000")
    print("Note: Install TensorFlow to use the actual trained model")
    app.run(debug=True, host='0.0.0.0', port=5000)
