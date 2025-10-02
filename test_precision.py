#!/usr/bin/env python3
"""
Test script to verify 4-decimal precision support
"""

import requests
import json

def test_precision_prediction():
    """Test prediction with 4-decimal precision values"""
    
    # Test data with complex 4-decimal values
    test_data = {
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
    
    try:
        print("🧪 Testing 4-Decimal Precision Support")
        print("=" * 50)
        print(f"Input Values:")
        for key, value in test_data.items():
            if isinstance(value, (int, float)):
                print(f"  {key}: {value:.4f}")
            else:
                print(f"  {key}: {value}")
        print("=" * 50)
        
        response = requests.post('http://localhost:5000/api/predict', json=test_data)
        result = response.json()
        
        if 'error' in result:
            print(f"❌ Error: {result['error']}")
            return False
        
        print(f"✅ Prediction: {result['prediction']}")
        print(f"✅ Confidence: {result['confidence']:.4f}")
        print(f"✅ Probabilities:")
        for fault_type, prob in result['probabilities'].items():
            print(f"    {fault_type}: {prob:.4f}")
        
        print(f"\n📊 Input Features (4-decimal precision):")
        for key, value in result['input_features'].items():
            print(f"    {key}: {value:.4f}")
        
        print(f"\n🔍 Fault Details:")
        fault_details = result['fault_details']
        print(f"    Type: {fault_details['fault_type']}")
        print(f"    Severity: {fault_details['severity']}")
        print(f"    Risk Level: {fault_details['risk_level']}")
        print(f"    Downtime: {fault_details['estimated_downtime']}")
        print(f"    Description: {fault_details['description']}")
        
        return True
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Starting 4-Decimal Precision Test")
    print("Make sure the server is running at http://localhost:5000")
    print()
    
    success = test_precision_prediction()
    
    if success:
        print("\n✅ 4-Decimal Precision Test PASSED!")
        print("The system correctly handles complex values with 4-decimal precision.")
    else:
        print("\n❌ 4-Decimal Precision Test FAILED!")
        print("Check the server logs for errors.")
