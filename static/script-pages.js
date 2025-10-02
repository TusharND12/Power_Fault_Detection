// Power Fault Prediction System - GitHub Pages Version
// This version includes demo functionality for static hosting

// Demo mode flag
let demoMode = false;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    showDemoNotice();
});

function initializeApp() {
    console.log('🚀 Power Fault Prediction System - GitHub Pages Version');
    
    // Set default values with 4-decimal precision
    setDefaultValues();
    
    // Initialize form validation
    initializeValidation();
}

function setupEventListeners() {
    const form = document.getElementById('predictionForm');
    const inputs = form.querySelectorAll('input, select');
    
    // Add real-time validation
    inputs.forEach(input => {
        input.addEventListener('input', validateInput);
        input.addEventListener('blur', validateInput);
    });
    
    // Form submission
    form.addEventListener('submit', handleSubmit);
    
    // Demo mode toggle
    const demoToggle = document.querySelector('.demo-toggle');
    if (demoToggle) {
        demoToggle.addEventListener('click', toggleDemoMode);
    }
}

function setDefaultValues() {
    // Set all numeric inputs to 4-decimal precision
    const numericInputs = [
        'voltage', 'current', 'power_load', 'temperature', 
        'wind_speed', 'duration_of_fault', 'down_time'
    ];
    
    numericInputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.value = parseFloat(input.value).toFixed(4);
        }
    });
}

function initializeValidation() {
    const form = document.getElementById('predictionForm');
    const inputs = form.querySelectorAll('input[type="number"]');
    
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            // Ensure 4-decimal precision
            if (this.value && !isNaN(this.value)) {
                this.value = parseFloat(this.value).toFixed(4);
            }
        });
    });
}

function validateInput(event) {
    const input = event.target;
    const value = parseFloat(input.value);
    const min = parseFloat(input.min);
    const max = parseFloat(input.max);
    
    // Clear previous validation
    input.classList.remove('error');
    
    if (input.value && !isNaN(value)) {
        if (value < min || value > max) {
            input.classList.add('error');
            showNotification(`Invalid ${input.name}: must be between ${min} and ${max}`, 'error');
            return false;
        }
    }
    
    return true;
}

function validateForm() {
    const form = document.getElementById('predictionForm');
    const inputs = form.querySelectorAll('input[required], select[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.classList.add('error');
            showNotification(`Please fill in ${input.name}`, 'error');
            isValid = false;
        } else if (input.type === 'number') {
            const value = parseFloat(input.value);
            const min = parseFloat(input.min);
            const max = parseFloat(input.max);
            
            if (value < min || value > max) {
                input.classList.add('error');
                showNotification(`Invalid ${input.name}: must be between ${min} and ${max}`, 'error');
                isValid = false;
            }
        }
    });
    
    return isValid;
}

async function handleSubmit(event) {
    event.preventDefault();
    
    if (!validateForm()) {
        return;
    }
    
    if (!demoMode) {
        showNotification('Demo mode is disabled. Please enable demo predictions to see results.', 'info');
        return;
    }
    
    showLoading();
    
    try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Generate demo prediction
        const result = generateDemoPrediction();
        
        // Display results
        displayResults(result);
        
        // Hide loading
        hideLoading();
        
        // Show success notification
        showNotification('Prediction completed successfully!', 'success');
        
    } catch (error) {
        console.error('Demo prediction error:', error);
        hideLoading();
        showNotification('Demo prediction failed. Please try again.', 'error');
    }
}

function generateDemoPrediction() {
    const formData = new FormData(document.getElementById('predictionForm'));
    const data = Object.fromEntries(formData.entries());
    
    // Convert numeric fields
    const numericFields = ['voltage', 'current', 'power_load', 'temperature', 'wind_speed', 'duration_of_fault', 'down_time'];
    numericFields.forEach(field => {
        data[field] = parseFloat(data[field]);
    });
    
    // Generate realistic demo prediction based on input
    const faultTypes = ['Line Breakage', 'Transformer Failure', 'Overheating'];
    const probabilities = generateRealisticProbabilities(data);
    const predictedIndex = probabilities.indexOf(Math.max(...probabilities));
    const predictedClass = faultTypes[predictedIndex];
    const confidence = probabilities[predictedIndex];
    
    // Generate fault details
    const faultDetails = generateFaultDetails(predictedClass, data, confidence);
    
    return {
        prediction: predictedClass,
        confidence: confidence,
        probabilities: {
            'Line Breakage': probabilities[0],
            'Transformer Failure': probabilities[1],
            'Overheating': probabilities[2]
        },
        input_features: {
            voltage: data.voltage,
            current: data.current,
            power_load: data.power_load,
            temperature: data.temperature,
            wind_speed: data.wind_speed,
            duration_of_fault: data.duration_of_fault,
            down_time: data.down_time
        },
        fault_details: faultDetails
    };
}

function generateRealisticProbabilities(data) {
    // Generate realistic probabilities based on input parameters
    let lineBreakage = 0.2;
    let transformerFailure = 0.3;
    let overheating = 0.5;
    
    // Adjust based on temperature
    if (data.temperature > 60) {
        overheating += 0.3;
        transformerFailure += 0.1;
        lineBreakage -= 0.1;
    } else if (data.temperature > 40) {
        overheating += 0.2;
        transformerFailure += 0.05;
    }
    
    // Adjust based on current
    if (data.current > 400) {
        transformerFailure += 0.2;
        overheating += 0.1;
    }
    
    // Adjust based on wind speed
    if (data.wind_speed > 100) {
        lineBreakage += 0.3;
        transformerFailure -= 0.1;
        overheating -= 0.1;
    }
    
    // Adjust based on duration of fault
    if (data.duration_of_fault > 10) {
        overheating += 0.2;
        transformerFailure += 0.1;
    }
    
    // Normalize probabilities
    const total = lineBreakage + transformerFailure + overheating;
    return [
        lineBreakage / total,
        transformerFailure / total,
        overheating / total
    ];
}

function generateFaultDetails(faultType, data, confidence) {
    const details = {
        fault_type: faultType,
        confidence: confidence,
        severity: confidence > 0.7 ? 'HIGH' : confidence > 0.4 ? 'MEDIUM' : 'LOW',
        risk_level: confidence > 0.7 ? 'HIGH' : confidence > 0.4 ? 'MEDIUM' : 'LOW',
        estimated_downtime: confidence > 0.7 ? '4-8 hours' : confidence > 0.4 ? '2-4 hours' : '1-2 hours'
    };
    
    // Generate description based on fault type and input data
    switch (faultType) {
        case 'Line Breakage':
            details.description = `Line breakage detected with voltage at ${data.voltage.toFixed(4)}V and wind speed at ${data.wind_speed.toFixed(4)} km/h. High wind conditions likely caused physical damage to transmission lines.`;
            details.recommended_actions = [
                'Immediately isolate the affected line section',
                'Deploy maintenance crew for visual inspection',
                'Check for fallen trees or debris near transmission lines',
                'Implement load balancing on adjacent lines'
            ];
            details.immediate_steps = [
                'Switch to backup power sources',
                'Notify emergency response team',
                'Update system status dashboard',
                'Prepare restoration equipment'
            ];
            details.affected_components = ['Transmission Lines', 'Support Structures', 'Insulators', 'Conductors'];
            break;
            
        case 'Transformer Failure':
            details.description = `Transformer failure detected with current at ${data.current.toFixed(4)}A and power load at ${data.power_load.toFixed(4)}MW. Overloading conditions have caused internal component failure.`;
            details.recommended_actions = [
                'Immediately reduce load on the transformer',
                'Check transformer oil temperature and quality',
                'Inspect cooling systems and fans',
                'Prepare for transformer replacement if necessary'
            ];
            details.immediate_steps = [
                'Transfer load to backup transformers',
                'Monitor transformer temperature closely',
                'Prepare emergency replacement procedures',
                'Notify transformer maintenance team'
            ];
            details.affected_components = ['Transformer Windings', 'Cooling System', 'Tap Changer', 'Bushings'];
            break;
            
        case 'Overheating':
            details.description = `System overheating detected with temperature at ${data.temperature.toFixed(4)}°C and current at ${data.current.toFixed(4)}A. Thermal stress has exceeded safe operating limits.`;
            details.recommended_actions = [
                'Immediately reduce system load',
                'Increase cooling system operation',
                'Check ventilation and air circulation',
                'Monitor temperature trends continuously'
            ];
            details.immediate_steps = [
                'Activate emergency cooling systems',
                'Reduce power generation or consumption',
                'Monitor all temperature sensors',
                'Prepare for controlled shutdown if needed'
            ];
            details.affected_components = ['Cooling Systems', 'Temperature Sensors', 'Control Systems', 'Power Electronics'];
            break;
    }
    
    return details;
}

function displayResults(result) {
    // Show results section
    const resultsSection = document.getElementById('resultsSection');
    resultsSection.style.display = 'block';
    
    // Update prediction card
    updatePredictionCard(result);
    
    // Update probability chart
    updateProbabilityChart(result);
    
    // Update input summary
    updateInputSummary(result);
    
    // Update fault details
    updateFaultDetails(result.fault_details);
    
    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

function updatePredictionCard(result) {
    const card = document.getElementById('predictionCard');
    const faultType = result.prediction;
    const confidence = (result.confidence * 100).toFixed(2);
    
    // Get appropriate icon and color for fault type
    let icon, color;
    switch (faultType) {
        case 'Line Breakage':
            icon = 'fas fa-unlink';
            color = '#3498db';
            break;
        case 'Transformer Failure':
            icon = 'fas fa-bolt';
            color = '#f39c12';
            break;
        case 'Overheating':
            icon = 'fas fa-fire';
            color = '#e74c3c';
            break;
        default:
            icon = 'fas fa-exclamation-triangle';
            color = '#95a5a6';
    }
    
    card.innerHTML = `
        <div class="prediction-header">
            <div class="fault-icon" style="color: ${color}">
                <i class="${icon}"></i>
            </div>
            <div class="prediction-info">
                <h3>Predicted Fault: ${faultType}</h3>
                <div class="confidence-meter">
                    <div class="confidence-bar">
                        <div class="confidence-fill" style="width: ${confidence}%; background: ${color}"></div>
                    </div>
                    <span class="confidence-text">${confidence}% Confidence</span>
                </div>
            </div>
        </div>
        <div class="prediction-details">
            <p><strong>Model Prediction:</strong> ${faultType} detected with ${confidence}% confidence</p>
            <p><strong>Analysis:</strong> Based on current system parameters, this fault type is most likely to occur.</p>
        </div>
    `;
}

function updateProbabilityChart(result) {
    const ctx = document.getElementById('probabilityChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (window.probabilityChart) {
        window.probabilityChart.destroy();
    }
    
    const faultTypes = ['Line Breakage', 'Transformer Failure', 'Overheating'];
    const probabilities = faultTypes.map(type => (result.probabilities[type] * 100).toFixed(2));
    const colors = ['#3498db', '#f39c12', '#e74c3c'];
    
    window.probabilityChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: faultTypes,
            datasets: [{
                data: probabilities,
                backgroundColor: colors,
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + context.parsed + '%';
                        }
                    }
                }
            }
        }
    });
}

function updateInputSummary(result) {
    const summary = document.getElementById('inputSummary');
    const features = result.input_features;
    
    summary.innerHTML = `
        <h3><i class="fas fa-list"></i> Input Parameters Summary</h3>
        <div class="input-grid">
            <div class="input-item">
                <span class="input-label">Voltage:</span>
                <span class="input-value">${features.voltage.toFixed(4)} V</span>
            </div>
            <div class="input-item">
                <span class="input-label">Current:</span>
                <span class="input-value">${features.current.toFixed(4)} A</span>
            </div>
            <div class="input-item">
                <span class="input-label">Power Load:</span>
                <span class="input-value">${features.power_load.toFixed(4)} MW</span>
            </div>
            <div class="input-item">
                <span class="input-label">Temperature:</span>
                <span class="input-value">${features.temperature.toFixed(4)} °C</span>
            </div>
            <div class="input-item">
                <span class="input-label">Wind Speed:</span>
                <span class="input-value">${features.wind_speed.toFixed(4)} km/h</span>
            </div>
            <div class="input-item">
                <span class="input-label">Duration of Fault:</span>
                <span class="input-value">${features.duration_of_fault.toFixed(4)} hrs</span>
            </div>
            <div class="input-item">
                <span class="input-label">Down Time:</span>
                <span class="input-value">${features.down_time.toFixed(4)} hrs</span>
            </div>
        </div>
    `;
}

function updateFaultDetails(faultDetails) {
    const detailsContainer = document.getElementById('faultDetails');
    
    // Determine severity color
    let severityColor = '#95a5a6';
    switch (faultDetails.severity) {
        case 'HIGH':
            severityColor = '#e74c3c';
            break;
        case 'MEDIUM':
            severityColor = '#f39c12';
            break;
        case 'LOW':
            severityColor = '#27ae60';
            break;
    }
    
    // Determine risk color
    let riskColor = '#95a5a6';
    switch (faultDetails.risk_level) {
        case 'HIGH':
            riskColor = '#e74c3c';
            break;
        case 'MEDIUM':
            riskColor = '#f39c12';
            break;
        case 'LOW':
            riskColor = '#27ae60';
            break;
    }
    
    detailsContainer.innerHTML = `
        <h3><i class="fas fa-info-circle"></i> Detailed Fault Analysis</h3>
        <div class="fault-info-grid">
            <div class="fault-info-card">
                <div class="fault-info-header">
                    <i class="fas fa-bug"></i>
                    <h4>Fault Type</h4>
                </div>
                <div class="fault-info-content">
                    <p>${faultDetails.fault_type}</p>
                </div>
            </div>
            
            <div class="fault-info-card">
                <div class="fault-info-header">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h4>Severity</h4>
                </div>
                <div class="fault-info-content">
                    <span class="severity-badge" style="background: ${severityColor}">
                        ${faultDetails.severity}
                    </span>
                </div>
            </div>
            
            <div class="fault-info-card">
                <div class="fault-info-header">
                    <i class="fas fa-shield-alt"></i>
                    <h4>Risk Level</h4>
                </div>
                <div class="fault-info-content">
                    <span class="risk-badge" style="background: ${riskColor}">
                        ${faultDetails.risk_level}
                    </span>
                </div>
            </div>
            
            <div class="fault-info-card">
                <div class="fault-info-header">
                    <i class="fas fa-clock"></i>
                    <h4>Estimated Downtime</h4>
                </div>
                <div class="fault-info-content">
                    <p>${faultDetails.estimated_downtime}</p>
                </div>
            </div>
        </div>
        
        <div class="fault-description">
            <h4><i class="fas fa-file-alt"></i> Description</h4>
            <p>${faultDetails.description}</p>
        </div>
        
        <div class="fault-actions">
            <div class="recommended-actions">
                <h4><i class="fas fa-tools"></i> Recommended Actions</h4>
                <ul class="action-list">
                    ${faultDetails.recommended_actions.map(action => `<li>${action}</li>`).join('')}
                </ul>
            </div>
            
            <div class="immediate-steps">
                <h4><i class="fas fa-bolt"></i> Immediate Steps</h4>
                <ul class="action-list">
                    ${faultDetails.immediate_steps.map(step => `<li>${step}</li>`).join('')}
                </ul>
            </div>
        </div>
        
        <div class="affected-components">
            <h4><i class="fas fa-cogs"></i> Affected Components</h4>
            <div class="component-tags">
                ${faultDetails.affected_components.map(component => 
                    `<span class="component-tag">${component}</span>`
                ).join('')}
            </div>
        </div>
    `;
}

function toggleDemoMode() {
    demoMode = !demoMode;
    const toggleBtn = document.querySelector('.demo-toggle');
    const notice = document.querySelector('.demo-notice');
    
    if (demoMode) {
        toggleBtn.textContent = 'Disable Demo Predictions';
        toggleBtn.style.background = '#e74c3c';
        notice.style.background = 'linear-gradient(135deg, #27ae60, #2ecc71)';
        showNotification('Demo mode enabled! You can now make predictions.', 'success');
    } else {
        toggleBtn.textContent = 'Enable Demo Predictions';
        toggleBtn.style.background = '#3498db';
        notice.style.background = 'linear-gradient(135deg, #3498db, #2980b9)';
        showNotification('Demo mode disabled. Enable it to make predictions.', 'info');
    }
}

function showDemoNotice() {
    const notice = document.querySelector('.demo-notice');
    if (notice) {
        notice.style.display = 'block';
        setTimeout(() => {
            notice.style.opacity = '1';
            notice.style.transform = 'translateY(0)';
        }, 100);
    }
}

function showLoading() {
    const overlay = document.getElementById('loadingOverlay');
    overlay.style.display = 'flex';
    setTimeout(() => {
        overlay.style.opacity = '1';
    }, 10);
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    overlay.style.opacity = '0';
    setTimeout(() => {
        overlay.style.display = 'none';
    }, 300);
}

function showNotification(message, type = 'info') {
    const container = document.getElementById('notificationContainer');
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    let icon = 'fas fa-info-circle';
    switch (type) {
        case 'success':
            icon = 'fas fa-check-circle';
            break;
        case 'error':
            icon = 'fas fa-exclamation-circle';
            break;
        case 'warning':
            icon = 'fas fa-exclamation-triangle';
            break;
    }
    
    notification.innerHTML = `
        <div class="notification-content">
            <i class="${icon}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    container.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    }, 10);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(-100%)';
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }
    }, 5000);
}
