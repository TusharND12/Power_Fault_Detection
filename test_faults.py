#!/usr/bin/env python3
"""
Test script to demonstrate different fault types from the dataset
"""

import requests
import json

def test_fault_prediction(voltage, current, temperature, wind_speed, power_load, duration_of_fault, down_time, weather_condition, maintenance_status, component_health):
    """Test fault prediction with specific parameters"""
    
    data = {
        "voltage": voltage,
        "current": current,
        "temperature": temperature,
        "wind_speed": wind_speed,
        "power_load": power_load,
        "duration_of_fault": duration_of_fault,
        "down_time": down_time,
        "weather_condition": weather_condition,
        "maintenance_status": maintenance_status,
        "component_health": component_health
    }
    
    try:
        response = requests.post('http://localhost:5000/api/predict', json=data)
        result = response.json()
        
        print(f"\n{'='*60}")
        print(f"INPUT PARAMETERS:")
        print(f"  Voltage: {voltage}V")
        print(f"  Current: {current}A") 
        print(f"  Temperature: {temperature}°C")
        print(f"  Power Load: {power_load}MW")
        print(f"  Wind Speed: {wind_speed} km/h")
        print(f"{'='*60}")
        print(f"PREDICTION RESULT:")
        print(f"  Fault Type: {result['prediction']}")
        print(f"  Confidence: {result['confidence']:.2%}")
        print(f"  Probabilities:")
        for fault_type, prob in result['probabilities'].items():
            print(f"    {fault_type}: {prob:.2%}")
        print(f"{'='*60}")
        print(f"FAULT DETAILS:")
        fault_details = result['fault_details']
        print(f"  Severity: {fault_details['severity']}")
        print(f"  Risk Level: {fault_details['risk_level']}")
        print(f"  Estimated Downtime: {fault_details['estimated_downtime']}")
        print(f"  Description: {fault_details['description']}")
        print(f"{'='*60}")
        
        return result
        
    except Exception as e:
        print(f"Error: {e}")
        return None

if __name__ == "__main__":
    print("🔍 Testing Power Fault Prediction System")
    print("Based on actual dataset fault types:")
    print("  • Line Breakage (1630 cases)")
    print("  • Transformer Failure (1671 cases)")
    print("  • Overheating (1705 cases)")
    
    # Test cases based on actual dataset patterns
    
    print("\n🧪 TEST 1: Line Breakage (High Current)")
    test_fault_prediction(
        voltage=2200, current=250, temperature=25, wind_speed=25,
        power_load=50, duration_of_fault=2, down_time=1,
        weather_condition="windstorm", maintenance_status="pending", component_health="normal"
    )
    
    print("\n🧪 TEST 2: Transformer Failure (Low Voltage)")
    test_fault_prediction(
        voltage=1800, current=180, temperature=28, wind_speed=15,
        power_load=45, duration_of_fault=3, down_time=5,
        weather_condition="rainy", maintenance_status="completed", component_health="faulty"
    )
    
    print("\n🧪 TEST 3: Overheating (High Temperature)")
    test_fault_prediction(
        voltage=2100, current=230, temperature=38, wind_speed=25,
        power_load=55, duration_of_fault=4, down_time=6,
        weather_condition="clear", maintenance_status="pending", component_health="overheated"
    )
    
    print("\n✅ Testing completed! Check the server at http://localhost:5000")





