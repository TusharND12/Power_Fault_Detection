// Global variables
let probabilityChart = null;

// DOM elements (will be set after DOM loads)
let form, resultsContainer, loadingOverlay;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements after DOM is loaded
    form = document.getElementById('predictionForm');
    resultsContainer = document.getElementById('resultsContainer');
    loadingOverlay = document.getElementById('loadingOverlay');
    
    setupEventListeners();
    checkModelInfo();
});

// Setup event listeners
function setupEventListeners() {
    if (!form) {
        console.error('Form element not found');
        return;
    }
    
    form.addEventListener('submit', handleFormSubmit);
    
    // Add real-time validation
    const inputs = form.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('input', validateInput);
    });
}

// Check model information
async function checkModelInfo() {
    try {
        // Simulate model info for static version
        const data = {
            input_shape: [null, 522],
            output_shape: [null, 3],
            num_classes: 3,
            class_labels: ['Line Breakage', 'Transformer Failure', 'Overheating'],
            feature_count: 522,
            model_type: 'Static Demo Model'
        };
        
        console.log('Model loaded successfully:', data);
        showNotification('Static demo model loaded successfully', 'success');
    } catch (error) {
        console.error('Error checking model info:', error);
        showNotification('Warning: Unable to load model', 'warning');
    }
}

// Handle form submission
async function handleFormSubmit(event) {
    event.preventDefault();
    
    // Validate form
    if (!validateForm()) {
        return;
    }
    
    // Update progress indicator
    updateProgressIndicator(2);
    
    // Show loading overlay
    showLoading();
    
    try {
        // Get form data
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // Convert numeric fields with 4-decimal precision
        const numericFields = ['voltage', 'current', 'power_load', 'temperature', 'wind_speed', 'duration_of_fault', 'down_time'];
        numericFields.forEach(field => {
            data[field] = parseFloat(data[field]);
        });
        
        // Make local prediction (no API call needed)
        const result = makeLocalPrediction(data);
        
        // Display results
        displayResults(result);
        
    } catch (error) {
        console.error('Error making prediction:', error);
        showNotification('Error making prediction: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

// Validate form
function validateForm() {
    if (!form) {
        console.error('Form element not found');
        return false;
    }
    
    const inputs = form.querySelectorAll('input[required], select[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            showInputError(input, 'This field is required');
            isValid = false;
        } else {
            clearInputError(input);
        }
    });
    
    // Additional validation for numeric fields with 4-decimal precision
    const voltage = parseFloat(document.getElementById('voltage').value);
    const current = parseFloat(document.getElementById('current').value);
    const powerLoad = parseFloat(document.getElementById('power_load').value);
    const temperature = parseFloat(document.getElementById('temperature').value);
    const windSpeed = parseFloat(document.getElementById('wind_speed').value);
    
    if (voltage < 1000 || voltage > 5000) {
        showInputError(document.getElementById('voltage'), 'Voltage should be between 1000.0000V and 5000.0000V');
        isValid = false;
    }
    
    if (current < 50 || current > 1000) {
        showInputError(document.getElementById('current'), 'Current should be between 50.0000A and 1000.0000A');
        isValid = false;
    }
    
    if (powerLoad < 5 || powerLoad > 200) {
        showInputError(document.getElementById('power_load'), 'Power load should be between 5.0000MW and 200.0000MW');
        isValid = false;
    }
    
    if (temperature < -50 || temperature > 100) {
        showInputError(document.getElementById('temperature'), 'Temperature should be between -50.0000°C and 100.0000°C');
        isValid = false;
    }
    
    if (windSpeed < 0 || windSpeed > 200) {
        showInputError(document.getElementById('wind_speed'), 'Wind speed should be between 0.0000 and 200.0000 km/h');
        isValid = false;
    }
    
    return isValid;
}

// Validate individual input
function validateInput(event) {
    const input = event.target;
    clearInputError(input);
    
    // Real-time validation for numeric inputs
    if (input.type === 'number') {
        const value = parseFloat(input.value);
        const min = parseFloat(input.min);
        const max = parseFloat(input.max);
        
        if (value < min || value > max) {
            showInputError(input, `Value should be between ${min} and ${max}`);
        }
    }
}

// Show input error
function showInputError(input, message) {
    clearInputError(input);
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'input-error';
    errorDiv.textContent = message;
    errorDiv.style.color = '#e74c3c';
    errorDiv.style.fontSize = '0.8rem';
    errorDiv.style.marginTop = '5px';
    
    input.style.borderColor = '#e74c3c';
    input.parentNode.appendChild(errorDiv);
}

// Clear input error
function clearInputError(input) {
    const existingError = input.parentNode.querySelector('.input-error');
    if (existingError) {
        existingError.remove();
    }
    input.style.borderColor = '#e1e8ed';
}

// Display results
function displayResults(result) {
    if (!resultsContainer) {
        console.error('Results container not found');
        return;
    }
    
    // Update progress indicator
    updateProgressIndicator(3);
    
    // Update prediction card
    updatePredictionCard(result);
    
    // Update probability chart
    updateProbabilityChart(result.probabilities);
    
    // Update input summary
    updateInputSummary(result.input_features);
    
    // Update fault details
    updateFaultDetails(result.fault_details);
    
    // Show results container
    resultsContainer.style.display = 'block';
    resultsContainer.scrollIntoView({ behavior: 'smooth' });
    
    // Animate badges after a short delay
    setTimeout(() => {
        animateBadges();
    }, 500);
    
    // Initialize live graph after results are displayed
    setTimeout(() => {
        if (document.getElementById('liveGraph')) {
            initializeLiveGraph();
        }
    }, 1000);
    
    // Update chatbot with form data for analysis
    updateFormDataForChatbot(result.input_features);
    
    // Update gauge values
    updateGaugeValues(
        parseFloat(result.input_features.voltage) || 0,
        parseFloat(result.input_features.current) || 0,
        parseFloat(result.input_features.temperature) || 0
    );
    
    // Show success notification
    showNotification('Prediction completed successfully!', 'success');
}

// Update prediction card
function updatePredictionCard(result) {
    const predictionIcon = document.getElementById('predictionIcon');
    const predictionLabel = document.getElementById('predictionLabel');
    const confidenceText = document.getElementById('confidenceText');
    
    // Set prediction label
    predictionLabel.textContent = result.prediction;
    
    // Set confidence
    confidenceText.textContent = `Confidence: ${(result.confidence * 100).toFixed(1)}%`;
    
    // Animate confidence bar
    const confidenceFill = document.getElementById('confidenceFill');
    if (confidenceFill) {
        setTimeout(() => {
            confidenceFill.style.width = `${result.confidence * 100}%`;
        }, 500);
    }
    
    // Update icon and colors based on prediction
    predictionIcon.className = 'fas';
    if (result.prediction === 'Line Breakage') {
        predictionIcon.classList.add('fa-bolt');
        predictionIcon.parentElement.classList.add('danger');
        predictionIcon.parentElement.classList.remove('warning');
    } else if (result.prediction === 'Transformer Failure') {
        predictionIcon.classList.add('fa-cog');
        predictionIcon.parentElement.classList.add('warning');
        predictionIcon.parentElement.classList.remove('danger');
    } else if (result.prediction === 'Overheating') {
        predictionIcon.classList.add('fa-thermometer-full');
        predictionIcon.parentElement.classList.add('danger');
        predictionIcon.parentElement.classList.remove('warning');
    } else {
        predictionIcon.classList.add('fa-check-circle');
        predictionIcon.parentElement.classList.remove('warning', 'danger');
    }
}

// Update probability chart
function updateProbabilityChart(probabilities) {
    const ctx = document.getElementById('probabilityChart').getContext('2d');
    
    // Destroy existing chart
    if (probabilityChart) {
        probabilityChart.destroy();
    }
    
    // Prepare data
    const labels = Object.keys(probabilities);
    const values = Object.values(probabilities);
    const colors = ['#3498db', '#f39c12', '#e74c3c']; // Line Breakage (blue), Transformer Failure (orange), Overheating (red)
    
    // Create new chart
    probabilityChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: values,
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
                            size: 14,
                            weight: 'bold'
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const percentage = (context.parsed * 100).toFixed(1);
                            return `${context.label}: ${percentage}%`;
                        }
                    }
                }
            },
            animation: {
                animateRotate: true,
                duration: 1000
            }
        }
    });
}

// Update input summary
function updateInputSummary(features) {
    const parametersGrid = document.getElementById('parametersGrid');
    parametersGrid.innerHTML = '';
    
    const featureLabels = {
        voltage: 'Voltage (V)',
        current: 'Current (A)',
        power_load: 'Power Load (MW)',
        temperature: 'Temperature (°C)',
        wind_speed: 'Wind Speed (km/h)',
        duration_of_fault: 'Duration of Fault (hrs)',
        down_time: 'Down Time (hrs)'
    };
    
    Object.entries(features).forEach(([key, value]) => {
        const parameterItem = document.createElement('div');
        parameterItem.className = 'parameter-item';
        
        parameterItem.innerHTML = `
            <div class="parameter-label">${featureLabels[key] || key}</div>
            <div class="parameter-value">${value}</div>
        `;
        
        parametersGrid.appendChild(parameterItem);
    });
}

// Update fault details
function updateFaultDetails(faultDetails) {
    // Create or update fault details section
    let faultDetailsSection = document.getElementById('faultDetailsSection');
    if (!faultDetailsSection) {
        faultDetailsSection = document.createElement('div');
        faultDetailsSection.id = 'faultDetailsSection';
        faultDetailsSection.className = 'fault-details';
        
        // Insert after input summary
        const inputSummary = document.querySelector('.input-summary');
        inputSummary.parentNode.insertBefore(faultDetailsSection, inputSummary.nextSibling);
    }
    
    // Create detailed fault information
    faultDetailsSection.innerHTML = `
        <div class="fault-details-header">
            <h3><i class="fas fa-exclamation-triangle"></i> Fault Analysis Details</h3>
        </div>
        
        <div class="fault-info-grid">
            <div class="fault-info-card primary">
                <div class="fault-info-label">
                    <i class="fas fa-bug"></i>
                    Fault Type
                </div>
                <div class="fault-info-value fault-type">${faultDetails.fault_type}</div>
            </div>
            
            <div class="fault-info-card severity-${faultDetails.severity.toLowerCase()}">
                <div class="fault-info-label">
                    <i class="fas fa-signal"></i>
                    Severity Level
                </div>
                <div class="fault-info-value severity-badge">${faultDetails.severity}</div>
            </div>
            
            <div class="fault-info-card">
                <div class="fault-info-label">
                    <i class="fas fa-clock"></i>
                    Estimated Downtime
                </div>
                <div class="fault-info-value">${faultDetails.estimated_downtime}</div>
            </div>
            
            <div class="fault-info-card risk-${faultDetails.risk_level.toLowerCase()}">
                <div class="fault-info-label">
                    <i class="fas fa-shield-alt"></i>
                    Risk Level
                </div>
                <div class="fault-info-value risk-badge">${faultDetails.risk_level}</div>
            </div>
        </div>
        
        <div class="fault-description">
            <h4><i class="fas fa-info-circle"></i> Description</h4>
            <p>${faultDetails.description}</p>
        </div>
        
        <div class="fault-actions">
            <div class="recommended-actions">
                <h4><i class="fas fa-list-check"></i> Recommended Actions</h4>
                <ul class="action-list">
                    ${faultDetails.recommended_actions.map(action => `<li><i class="fas fa-arrow-right"></i> ${action}</li>`).join('')}
                </ul>
            </div>
            
            <div class="immediate-steps">
                <h4><i class="fas fa-bolt"></i> Immediate Steps</h4>
                <ul class="action-list urgent">
                    ${faultDetails.immediate_steps.map(step => `<li><i class="fas fa-exclamation"></i> ${step}</li>`).join('')}
                </ul>
            </div>
        </div>
        
        <div class="affected-components">
            <h4><i class="fas fa-cogs"></i> Affected Components</h4>
            <div class="components-list">
                ${Array.isArray(faultDetails.affected_components) 
                    ? faultDetails.affected_components.map(component => `<span class="component-tag">${component}</span>`).join('')
                    : `<span class="component-tag">${faultDetails.affected_components}</span>`
                }
            </div>
        </div>
    `;
}

// Reset form
function resetForm() {
    if (!form || !resultsContainer) {
        console.error('Form or results container not found');
        return;
    }
    
    form.reset();
    resultsContainer.style.display = 'none';
    
    // Clear any validation errors
    const errorMessages = form.querySelectorAll('.input-error');
    errorMessages.forEach(error => error.remove());
    
    const inputs = form.querySelectorAll('input');
    inputs.forEach(input => {
        input.style.borderColor = '#e1e8ed';
    });
    
    // Stop live graph updates
    stopLiveUpdates();
    
    showNotification('Form reset successfully', 'info');
}

// Show loading overlay
function showLoading() {
    if (loadingOverlay) {
        loadingOverlay.classList.add('active');
    }
}

// Hide loading overlay
function hideLoading() {
    if (loadingOverlay) {
        loadingOverlay.classList.remove('active');
    }
}

// Show notification
function showNotification(message, type = 'info') {
    // Ensure document.body exists
    if (!document.body) {
        console.error('Document body not ready');
        return;
    }

    // Initialize live graph when results are shown
    if (document.getElementById('liveGraph')) {
        initializeLiveGraph();
    }
    
    // Initialize gauge charts (only if not already done)
    if (!voltageGauge && !currentGauge && !temperatureGauge) {
        initializeGaugeCharts();
    }
    
    // Initialize PDF download when results are shown
    initializePdfDownload();
    
    // Initialize interactive features
    initializeInteractiveFeatures();
    
    // Initialize chatbot immediately
    initializeChatbot();
    
    // Also try again after a short delay to ensure it's ON
    setTimeout(() => {
        initializeChatbot();
    }, 500);
    
    // Initialize theme toggle
    initializeThemeToggle();
    
    // Initialize gauge charts on page load (only if not already done)
    setTimeout(() => {
        if (!voltageGauge && !currentGauge && !temperatureGauge) {
            initializeGaugeCharts();
        }
    }, 1000);
    
    // Initialize PDF download functionality
    initializePdfDownload();
    
    // Also try again after a delay in case the button isn't ready yet
    setTimeout(() => {
        initializePdfDownload();
    }, 1000);
    
    // Initialize real-time dashboard
    initializeRealtimeDashboard();
    
    // Test real-time dashboard after delay
    setTimeout(() => {
        testRealtimeDashboard();
    }, 3000);
    
    // Test PDF libraries after a delay
    setTimeout(() => {
        testPdfLibraries();
    }, 2000);
    
    // Add test download button
    setTimeout(() => {
        addTestDownloadButton();
    }, 3000);
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${getNotificationColor(type)};
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        z-index: 1001;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 15px;
        max-width: 400px;
        animation: slideInRight 0.3s ease;
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Get notification icon
function getNotificationIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'times-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    return icons[type] || 'info-circle';
}

// Get notification color
function getNotificationColor(type) {
    const colors = {
        success: '#27ae60',
        error: '#e74c3c',
        warning: '#f39c12',
        info: '#3498db'
    };
    return colors[type] || '#3498db';
}

// Update progress indicator
function updateProgressIndicator(step) {
    const steps = document.querySelectorAll('.progress-step');
    steps.forEach((stepElement, index) => {
        if (index < step) {
            stepElement.classList.add('active');
        } else {
            stepElement.classList.remove('active');
        }
    });
}

// Animate badges when they appear
function animateBadges() {
    const badges = document.querySelectorAll('.risk-badge, .severity-badge');
    badges.forEach((badge, index) => {
        // Reset animation
        badge.style.animation = 'none';
        badge.offsetHeight; // Trigger reflow
        
        // Add staggered animation
        setTimeout(() => {
            badge.style.animation = '';
            badge.classList.add('badge-appear');
        }, index * 200);
    });
}

// Add CSS for badge appearance animation
const badgeStyle = document.createElement('style');
badgeStyle.textContent = `
    .badge-appear {
        animation: badgeAppear 0.6s ease-out;
    }
    
    @keyframes badgeAppear {
        0% {
            transform: scale(0) rotate(180deg);
            opacity: 0;
        }
        50% {
            transform: scale(1.2) rotate(90deg);
            opacity: 0.8;
        }
        100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
        }
    }
`;
document.head.appendChild(badgeStyle);

// Add CSS animation for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        padding: 5px;
        border-radius: 3px;
        transition: background 0.3s ease;
    }
    
    .notification-close:hover {
        background: rgba(255, 255, 255, 0.2);
    }
`;
document.head.appendChild(style);

// Local prediction function (replaces API call)
function makeLocalPrediction(data) {
    // Extract core features with zero defaults
    const voltage = data.voltage || 0.0;
    const current = data.current || 0.0;
    const powerLoad = data.power_load || 0.0;
    const temperature = data.temperature || 0.0;
    const windSpeed = data.wind_speed || 0.0;
    const durationOfFault = data.duration_of_fault || 0.0;
    const downTime = data.down_time || 0.0;
    
    // Enhanced prediction based on actual dataset fault types
    // Analyze patterns from the dataset to predict fault types
    
    // Check if all values are zero (system normal)
    const allZero = voltage === 0 && current === 0 && powerLoad === 0 && 
                   temperature === 0 && windSpeed === 0 && durationOfFault === 0 && downTime === 0;
    
    if (allZero) {
        // System normal - all values are zero
        const probabilities = [0.1, 0.1, 0.1]; // Low probability for all fault types
        const classLabels = ['Line Breakage', 'Transformer Failure', 'Overheating'];
        const predictedClassIdx = 0; // Default to first class
        const predictedClass = classLabels[predictedClassIdx];
        const confidence = 0.1;
        
        return {
            prediction: "System Normal",
            confidence: confidence,
            probabilities: {
                'Line Breakage': probabilities[0],
                'Transformer Failure': probabilities[1],
                'Overheating': probabilities[2]
            },
            input_features: {
                voltage: voltage,
                current: current,
                power_load: powerLoad,
                temperature: temperature,
                wind_speed: windSpeed,
                duration_of_fault: durationOfFault,
                down_time: downTime
            },
            fault_details: getFaultDetails(voltage, current, temperature, "System Normal", probabilities)
        };
    }
    
    // High temperature indicates Overheating
    const tempFactor = temperature > 35 ? 1.0 : (temperature > 30 ? 0.8 : 0.3);
    
    // Low voltage indicates Transformer Failure  
    const voltageFactor = voltage < 1900 ? 1.0 : (voltage < 2100 ? 0.7 : 0.2);
    
    // High current and wind speed indicate Line Breakage
    const currentFactor = current > 240 ? 1.0 : (current > 220 ? 0.6 : 0.2);
    const windFactor = windSpeed > 30 ? 0.8 : (windSpeed > 20 ? 0.4 : 0.1);
    
    // Calculate probabilities based on actual fault patterns
    const overheatingProb = tempFactor * 0.4;
    const transformerProb = voltageFactor * 0.4;  
    const lineBreakageProb = (currentFactor + windFactor) * 0.3;
    
    // Normalize probabilities
    const total = overheatingProb + transformerProb + lineBreakageProb;
    const probabilities = [
        lineBreakageProb / total,
        transformerProb / total, 
        overheatingProb / total
    ];
    
    const classLabels = ['Line Breakage', 'Transformer Failure', 'Overheating'];
    const predictedClassIdx = probabilities.indexOf(Math.max(...probabilities));
    const predictedClass = classLabels[predictedClassIdx];
    const confidence = probabilities[predictedClassIdx];
    
    // Get detailed fault information
    const faultDetails = getFaultDetails(voltage, current, temperature, predictedClass, probabilities);
    
    return {
        prediction: predictedClass,
        confidence: confidence,
        probabilities: {
            'Line Breakage': probabilities[0],
            'Transformer Failure': probabilities[1],
            'Overheating': probabilities[2]
        },
        input_features: {
            voltage: voltage,
            current: current,
            power_load: powerLoad,
            temperature: temperature,
            wind_speed: windSpeed,
            duration_of_fault: durationOfFault,
            down_time: downTime
        },
        fault_details: faultDetails
    };
}

// Get detailed fault information
function getFaultDetails(voltage, current, temperature, predictedClass, probabilities) {
    if (predictedClass === "Overheating") {
        return {
            "fault_type": "Overheating",
            "severity": temperature > 35 ? "HIGH" : "MODERATE",
            "description": `System temperature at ${temperature.toFixed(4)}°C indicates thermal stress on equipment. Overheating can cause equipment failure and power outages.`,
            "recommended_actions": [
                "Activate emergency cooling systems",
                "Reduce power load to decrease heat generation",
                "Check cooling fans and heat exchangers",
                "Monitor temperature sensors continuously",
                "Schedule immediate thermal inspection"
            ],
            "estimated_downtime": "2-6 hours",
            "risk_level": temperature > 35 ? "HIGH" : "MEDIUM",
            "affected_components": ["Cooling Systems", "Heat Exchangers", "Thermal Sensors", "Power Transformers"],
            "immediate_steps": [
                "Increase cooling capacity immediately",
                "Reduce system load by 20-30%",
                "Check for cooling system blockages",
                "Notify thermal monitoring team",
                "Prepare backup cooling systems"
            ]
        };
    } else if (predictedClass === "Transformer Failure") {
        return {
            "fault_type": "Transformer Failure", 
            "severity": voltage < 1900 ? "HIGH" : "MODERATE",
            "description": `Voltage at ${voltage.toFixed(4)}V indicates transformer malfunction. Low voltage can cause equipment damage and system instability.`,
            "recommended_actions": [
                "Check transformer oil levels and quality",
                "Inspect transformer connections and terminals",
                "Verify power source integrity",
                "Test transformer protection relays",
                "Schedule transformer maintenance"
            ],
            "estimated_downtime": "3-8 hours",
            "risk_level": voltage < 1900 ? "HIGH" : "MEDIUM",
            "affected_components": ["Power Transformers", "Voltage Regulators", "Protection Relays", "Distribution Panels"],
            "immediate_steps": [
                "Check transformer health indicators",
                "Verify power source connections",
                "Protect sensitive loads from voltage fluctuations",
                "Activate voltage compensation systems",
                "Prepare backup transformer if available"
            ]
        };
    } else if (predictedClass === "Line Breakage") {
        return {
            "fault_type": "Line Breakage",
            "severity": current > 240 ? "HIGH" : "MODERATE", 
            "description": `Current at ${current.toFixed(4)}A indicates potential line breakage. High current can cause conductor failure and power interruptions.`,
            "recommended_actions": [
                "Inspect power lines for physical damage",
                "Check conductor connections and joints",
                "Verify line protection systems",
                "Test circuit breakers and fuses",
                "Schedule line maintenance and repair"
            ],
            "estimated_downtime": "4-12 hours",
            "risk_level": current > 240 ? "HIGH" : "MEDIUM",
            "affected_components": ["Power Lines", "Conductors", "Insulators", "Circuit Breakers", "Protection Systems"],
            "immediate_steps": [
                "Isolate affected line sections",
                "Check for visible line damage",
                "Verify protection device operation",
                "Notify line maintenance crew",
                "Prepare emergency repair equipment"
            ]
        };
    } else if (predictedClass === "System Normal") {
        return {
            "fault_type": "System Normal",
            "severity": "NONE",
            "description": "All parameters are at zero values. System appears to be offline or not operational. Please enter actual system parameters for fault prediction.",
            "recommended_actions": [
                "Enter actual system parameters",
                "Verify system is operational",
                "Check sensor readings",
                "Ensure all monitoring systems are active"
            ],
            "estimated_downtime": "None",
            "risk_level": "LOW",
            "affected_components": "None",
            "immediate_steps": [
                "Enter real system values",
                "Verify system status",
                "Check monitoring equipment",
                "Contact system operator if needed"
            ]
        };
    } else {
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
        };
    }
}

// Live Graph Variables
let liveGraph = null;
let graphData = {
    voltage: [],
    current: [],
    power: [],
    frequency: []
};
let currentGraphType = 'voltage';
let graphUpdateInterval = null;

// Gauge Charts
let voltageGauge = null;
let currentGauge = null;
let temperatureGauge = null;
let isGeneratingPdf = false;
let pdfDownloadInProgress = false;

// Real-time Dashboard
let realtimeActive = false;
let realtimeInterval = null;
let connectionCount = 0;
let lastUpdateTime = null;
let liveDataHistory = [];

// Initialize Gauge Charts
function initializeGaugeCharts() {
    console.log('Initializing gauge charts...');
    
    // Destroy existing charts first
    if (voltageGauge) {
        console.log('Destroying existing voltage gauge');
        voltageGauge.destroy();
        voltageGauge = null;
    }
    if (currentGauge) {
        console.log('Destroying existing current gauge');
        currentGauge.destroy();
        currentGauge = null;
    }
    if (temperatureGauge) {
        console.log('Destroying existing temperature gauge');
        temperatureGauge.destroy();
        temperatureGauge = null;
    }
    
    // Voltage Gauge
    const voltageCtx = document.getElementById('voltageGauge');
    console.log('Voltage canvas found:', !!voltageCtx);
    if (voltageCtx) {
        voltageGauge = new Chart(voltageCtx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [75, 25],
                    backgroundColor: ['#2ecc71', '#ecf0f1'],
                    borderWidth: 0,
                    circumference: 270,
                    rotation: 225
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                cutout: '75%',
                plugins: {
                    legend: { display: false },
                    tooltip: { 
                        enabled: true,
                        callbacks: {
                            label: function(context) {
                                return 'Voltage Health: ' + Math.round(context.parsed) + '%';
                            }
                        }
                    }
                },
                elements: {
                    arc: {
                        borderWidth: 0
                    }
                }
            }
        });
        console.log('Voltage gauge created successfully');
    }
    
    // Current Gauge
    const currentCtx = document.getElementById('currentGauge');
    console.log('Current canvas found:', !!currentCtx);
    if (currentCtx) {
        currentGauge = new Chart(currentCtx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [60, 40],
                    backgroundColor: ['#f39c12', '#ecf0f1'],
                    borderWidth: 0,
                    circumference: 270,
                    rotation: 225
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                cutout: '75%',
                plugins: {
                    legend: { display: false },
                    tooltip: { 
                        enabled: true,
                        callbacks: {
                            label: function(context) {
                                return 'Current Load: ' + Math.round(context.parsed) + '%';
                            }
                        }
                    }
                },
                elements: {
                    arc: {
                        borderWidth: 0
                    }
                }
            }
        });
        console.log('Current gauge created successfully');
    }
    
    // Temperature Gauge
    const temperatureCtx = document.getElementById('temperatureGauge');
    console.log('Temperature canvas found:', !!temperatureCtx);
    if (temperatureCtx) {
        temperatureGauge = new Chart(temperatureCtx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [45, 55],
                    backgroundColor: ['#3498db', '#ecf0f1'],
                    borderWidth: 0,
                    circumference: 270,
                    rotation: 225
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                cutout: '75%',
                plugins: {
                    legend: { display: false },
                    tooltip: { 
                        enabled: true,
                        callbacks: {
                            label: function(context) {
                                return 'Temperature: ' + Math.round(context.parsed) + '%';
                            }
                        }
                    }
                },
                elements: {
                    arc: {
                        borderWidth: 0
                    }
                }
            }
        });
        console.log('Temperature gauge created successfully');
    }
    
    console.log('Gauge charts initialization completed');
    
    // If no gauges were created, try again after a delay
    if (!voltageGauge && !currentGauge && !temperatureGauge) {
        console.log('No gauges created, retrying...');
        setTimeout(() => {
            // Only retry if still no gauges exist
            if (!voltageGauge && !currentGauge && !temperatureGauge) {
                initializeGaugeCharts();
            }
        }, 2000);
    }
}

// Add Test Download Button
function addTestDownloadButton() {
    console.log('Adding test download button...');
    
    // Create a simple test button
    const testBtn = document.createElement('button');
    testBtn.innerHTML = '🧪 Test Download';
    testBtn.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        z-index: 9999;
        background: #e74c3c;
        color: white;
        border: none;
        padding: 10px 15px;
        border-radius: 5px;
        cursor: pointer;
        font-size: 12px;
    `;
    
    testBtn.onclick = function() {
        console.log('Test download button clicked');
        
        // Try simple text download first
        try {
            const content = 'Test download file\nGenerated: ' + new Date().toISOString();
            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'test_download.txt';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            console.log('Test download successful');
            showNotification('Test download successful!', 'success');
        } catch (error) {
            console.error('Test download failed:', error);
            showNotification('Test download failed: ' + error.message, 'error');
        }
    };
    
    document.body.appendChild(testBtn);
    console.log('Test download button added');
}

// Test PDF Libraries
function testPdfLibraries() {
    console.log('=== TESTING PDF LIBRARIES ===');
    console.log('html2canvas available:', typeof html2canvas !== 'undefined');
    console.log('jsPDF available:', typeof window.jspdf !== 'undefined');
    
    if (typeof window.jspdf !== 'undefined') {
        try {
            const { jsPDF } = window.jspdf;
            const testPdf = new jsPDF();
            testPdf.text('Test PDF', 20, 20);
            console.log('jsPDF test successful');
        } catch (error) {
            console.error('jsPDF test failed:', error);
        }
    }
    
    if (typeof html2canvas !== 'undefined') {
        console.log('html2canvas test available');
    }
}

// Single PDF Generation (Reliable)
function generateSinglePdf() {
    console.log('=== GENERATING SINGLE PDF ===');
    
    // Prevent multiple downloads with stronger check
    if (pdfDownloadInProgress) {
        console.log('PDF download already in progress, skipping...');
        showNotification('PDF download already in progress...', 'info');
        return;
    }
    
    // Set flags to prevent multiple downloads and gauge updates
    pdfDownloadInProgress = true;
    isGeneratingPdf = true;
    
    console.log('PDF generation started - flags set');
    
    try {
        // Try PDF generation first
        if (typeof window.jspdf !== 'undefined' || typeof window.jsPDF !== 'undefined') {
            console.log('Attempting PDF generation...');
            
            // Try different ways to access jsPDF
            let jsPDF;
            if (typeof window.jspdf !== 'undefined') {
                jsPDF = window.jspdf.jsPDF;
            } else if (typeof window.jsPDF !== 'undefined') {
                jsPDF = window.jsPDF;
            }
            
            if (jsPDF) {
                const pdf = new jsPDF();
                
                // Add content
                pdf.setFontSize(16);
                pdf.text('Power Fault Analysis Report', 20, 30);
                
                pdf.setFontSize(12);
                pdf.text(`Generated: ${new Date().toLocaleString()}`, 20, 50);
                
                // Add analysis results
                const predictionLabel = document.getElementById('predictionLabel');
                const confidenceText = document.getElementById('confidenceText');
                
                if (predictionLabel) {
                    pdf.text(`Fault Type: ${predictionLabel.textContent}`, 20, 70);
                }
                
                if (confidenceText) {
                    pdf.text(`Confidence: ${confidenceText.textContent}`, 20, 85);
                }
                
                // Add form data
                pdf.text('Input Parameters:', 20, 110);
                const inputs = document.querySelectorAll('input[type="number"]');
                let yPos = 130;
                
                inputs.forEach((input, index) => {
                    if (yPos > 250) {
                        pdf.addPage();
                        yPos = 30;
                    }
                    pdf.text(`${input.name || input.id}: ${input.value}`, 20, yPos);
                    yPos += 10;
                });
                
                // Save PDF
                const fileName = `Power_Fault_Report_${new Date().toISOString().split('T')[0]}.pdf`;
                console.log('Saving PDF:', fileName);
                
                pdf.save(fileName);
                console.log('PDF saved successfully');
                
                showNotification('PDF downloaded successfully!', 'success');
                
                // Reset flags and exit
                pdfDownloadInProgress = false;
                isGeneratingPdf = false;
                console.log('PDF generation completed successfully - flags reset');
                return;
            }
        }
        
        // Fallback to text file if PDF fails
        console.log('PDF generation failed, creating text file...');
        
        const content = `Power Fault Analysis Report
Generated: ${new Date().toLocaleString()}

Fault Type: ${document.getElementById('predictionLabel')?.textContent || 'Not available'}
Confidence: ${document.getElementById('confidenceText')?.textContent || 'Not available'}

Input Parameters:
${Array.from(document.querySelectorAll('input[type="number"]')).map(input => `${input.name || input.id}: ${input.value}`).join('\n')}

Note: This is a text file export of the analysis results.
`;
        
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Power_Fault_Report_${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log('Text file downloaded successfully');
        showNotification('Text file downloaded successfully!', 'success');
        
        // Reset flags and exit
        pdfDownloadInProgress = false;
        isGeneratingPdf = false;
        console.log('Text file generation completed - flags reset');
        
    } catch (error) {
        console.error('PDF generation failed:', error);
        showNotification('PDF generation failed: ' + error.message, 'error');
        
        // Reset flags on error
        pdfDownloadInProgress = false;
        isGeneratingPdf = false;
        console.log('PDF generation failed - flags reset');
    }
}

// Test Real-time Dashboard
function testRealtimeDashboard() {
    console.log('=== TESTING REAL-TIME DASHBOARD ===');
    
    const toggleButton = document.getElementById('toggleRealtime');
    const dashboardContent = document.getElementById('dashboardContent');
    
    console.log('Test results:');
    console.log('- Toggle button found:', !!toggleButton);
    console.log('- Dashboard content found:', !!dashboardContent);
    
    if (toggleButton) {
        console.log('- Button text:', toggleButton.textContent);
        console.log('- Button classes:', toggleButton.className);
    }
    
    if (dashboardContent) {
        console.log('- Content display:', dashboardContent.style.display);
    }
    
    // Try to manually trigger monitoring
    console.log('Attempting to start monitoring manually...');
    try {
        startRealtimeMonitoring();
    } catch (error) {
        console.error('Error starting monitoring:', error);
    }
    
    // Add manual test button
    if (!document.getElementById('manualTestBtn')) {
        const manualBtn = document.createElement('button');
        manualBtn.id = 'manualTestBtn';
        manualBtn.innerHTML = '🧪 Manual Test';
        manualBtn.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            z-index: 10000;
            background: #e74c3c;
            color: white;
            border: none;
            padding: 10px;
            border-radius: 5px;
            cursor: pointer;
        `;
        manualBtn.onclick = function() {
            console.log('Manual test button clicked');
            startRealtimeMonitoring();
        };
        document.body.appendChild(manualBtn);
        console.log('Manual test button added');
    }
}

// Real-time Dashboard Functions
function initializeRealtimeDashboard() {
    console.log('Initializing real-time dashboard...');
    
    const toggleButton = document.getElementById('toggleRealtime');
    console.log('Toggle button element:', toggleButton);
    
    if (toggleButton) {
        // Remove any existing listeners first
        toggleButton.removeEventListener('click', toggleRealtimeMonitoring);
        
        // Add click event listener
        toggleButton.addEventListener('click', function(e) {
            console.log('Toggle button clicked!');
            e.preventDefault();
            e.stopPropagation();
            toggleRealtimeMonitoring();
        });
        
        console.log('Real-time dashboard toggle button initialized successfully');
    } else {
        console.error('Real-time dashboard toggle button not found');
        // Try again after a delay
        setTimeout(() => {
            console.log('Retrying real-time dashboard initialization...');
            initializeRealtimeDashboard();
        }, 1000);
    }
}

function toggleRealtimeMonitoring() {
    console.log('toggleRealtimeMonitoring called, realtimeActive:', realtimeActive);
    
    if (realtimeActive) {
        console.log('Stopping real-time monitoring...');
        stopRealtimeMonitoring();
    } else {
        console.log('Starting real-time monitoring...');
        startRealtimeMonitoring();
    }
}

function startRealtimeMonitoring() {
    console.log('=== STARTING REAL-TIME MONITORING ===');
    
    realtimeActive = true;
    connectionCount = 1;
    lastUpdateTime = new Date();
    
    // Update UI
    const toggleButton = document.getElementById('toggleRealtime');
    const toggleIcon = document.getElementById('toggleIcon');
    const toggleText = document.getElementById('toggleText');
    const dashboardContent = document.getElementById('dashboardContent');
    const liveStatusDot = document.getElementById('liveStatusDot');
    const liveStatusText = document.getElementById('liveStatusText');
    const connectionCountEl = document.getElementById('connectionCount');
    
    console.log('UI elements found:');
    console.log('- toggleButton:', !!toggleButton);
    console.log('- dashboardContent:', !!dashboardContent);
    console.log('- liveStatusDot:', !!liveStatusDot);
    console.log('- liveStatusText:', !!liveStatusText);
    console.log('- connectionCountEl:', !!connectionCountEl);
    
    if (toggleButton) {
        toggleButton.classList.add('active');
        toggleButton.innerHTML = '<i class="fas fa-stop"></i><span>Stop Monitoring</span>';
    }
    
    if (dashboardContent) {
        dashboardContent.style.display = 'block';
    }
    
    if (liveStatusDot) {
        liveStatusDot.classList.add('online');
    }
    
    if (liveStatusText) {
        liveStatusText.textContent = 'Online';
    }
    
    if (connectionCountEl) {
        connectionCountEl.textContent = `${connectionCount} connection`;
    }
    
    // Add initial alert
    addLiveAlert('info', 'Real-time monitoring started');
    
    // Start data streaming
    console.log('Setting up data streaming interval...');
    realtimeInterval = setInterval(() => {
        console.log('Data streaming tick...');
        updateLiveData();
        connectionCount++;
        if (connectionCountEl) {
            connectionCountEl.textContent = `${connectionCount} connections`;
        }
    }, 5000); // Update every 5 seconds
    
    console.log('Interval set, realtimeInterval:', realtimeInterval);
    
    // Initial data update
    console.log('Running initial data update...');
    updateLiveData();
    
    showNotification('Real-time monitoring started', 'success');
    console.log('Real-time monitoring started successfully');
}

function stopRealtimeMonitoring() {
    console.log('Stopping real-time monitoring...');
    
    realtimeActive = false;
    
    // Clear interval
    if (realtimeInterval) {
        clearInterval(realtimeInterval);
        realtimeInterval = null;
    }
    
    // Update UI
    const toggleButton = document.getElementById('toggleRealtime');
    const dashboardContent = document.getElementById('dashboardContent');
    const liveStatusDot = document.getElementById('liveStatusDot');
    const liveStatusText = document.getElementById('liveStatusText');
    const connectionCountEl = document.getElementById('connectionCount');
    
    if (toggleButton) {
        toggleButton.classList.remove('active');
        toggleButton.innerHTML = '<i class="fas fa-play"></i><span>Start Live Monitoring</span>';
    }
    
    if (liveStatusDot) {
        liveStatusDot.classList.remove('online');
    }
    
    if (liveStatusText) {
        liveStatusText.textContent = 'Offline';
    }
    
    if (connectionCountEl) {
        connectionCountEl.textContent = '0 connections';
    }
    
    // Add alert
    addLiveAlert('warning', 'Real-time monitoring stopped');
    
    showNotification('Real-time monitoring stopped', 'info');
}

function updateLiveData() {
    console.log('updateLiveData called, realtimeActive:', realtimeActive);
    
    if (!realtimeActive) {
        console.log('Real-time not active, skipping update');
        return;
    }
    
    console.log('Generating live data...');
    
    // Generate realistic live data
    const liveData = {
        voltage: 220 + (Math.random() - 0.5) * 20, // 210-230V
        current: 15 + (Math.random() - 0.5) * 6,   // 12-18A
        temperature: 45 + (Math.random() - 0.5) * 20, // 35-55°C
        risk: Math.random() * 100 // 0-100%
    };
    
    console.log('Generated live data:', liveData);
    
    // Store in history (keep last 50 readings)
    liveDataHistory.push({
        ...liveData,
        timestamp: new Date()
    });
    
    if (liveDataHistory.length > 50) {
        liveDataHistory.shift();
    }
    
    // Update UI elements
    updateLiveMetric('liveVoltage', `${liveData.voltage.toFixed(1)} kV`, 'voltageTrend');
    updateLiveMetric('liveCurrent', `${liveData.current.toFixed(1)} A`, 'currentTrend');
    updateLiveMetric('liveTemperature', `${liveData.temperature.toFixed(1)} °C`, 'temperatureTrend');
    updateLiveRisk(liveData.risk);
    
    // Check for alerts
    checkForAlerts(liveData);
    
    lastUpdateTime = new Date();
}

function updateLiveMetric(elementId, value, trendId) {
    const element = document.getElementById(elementId);
    const trendElement = document.getElementById(trendId);
    
    if (element) {
        // Add animation class for value change
        element.style.transform = 'scale(1.1)';
        element.style.color = '#27ae60';
        
        setTimeout(() => {
            element.textContent = value;
            element.style.transform = 'scale(1)';
            element.style.color = '';
        }, 200);
    }
    
    if (trendElement && liveDataHistory.length > 1) {
        const currentValue = parseFloat(value);
        const previousValue = parseFloat(liveDataHistory[liveDataHistory.length - 2][elementId.replace('live', '').toLowerCase()]);
        
        if (currentValue > previousValue) {
            trendElement.textContent = '↗ +' + ((currentValue - previousValue) / previousValue * 100).toFixed(1) + '%';
            trendElement.className = 'metric-trend up';
        } else if (currentValue < previousValue) {
            trendElement.textContent = '↘ -' + ((previousValue - currentValue) / previousValue * 100).toFixed(1) + '%';
            trendElement.className = 'metric-trend down';
        } else {
            trendElement.textContent = '→ 0.0%';
            trendElement.className = 'metric-trend stable';
        }
    }
}

function updateLiveRisk(risk) {
    const riskElement = document.getElementById('liveRisk');
    const trendElement = document.getElementById('riskTrend');
    
    if (riskElement) {
        let riskLevel, riskColor;
        
        if (risk < 30) {
            riskLevel = 'Low';
            riskColor = '#27ae60';
        } else if (risk < 60) {
            riskLevel = 'Medium';
            riskColor = '#f39c12';
        } else {
            riskLevel = 'High';
            riskColor = '#e74c3c';
        }
        
        riskElement.textContent = riskLevel;
        riskElement.style.color = riskColor;
    }
    
    if (trendElement && liveDataHistory.length > 1) {
        const previousRisk = liveDataHistory[liveDataHistory.length - 2].risk;
        
        if (risk > previousRisk) {
            trendElement.textContent = '↗ +' + (risk - previousRisk).toFixed(1) + '%';
            trendElement.className = 'metric-trend up';
        } else if (risk < previousRisk) {
            trendElement.textContent = '↘ -' + (previousRisk - risk).toFixed(1) + '%';
            trendElement.className = 'metric-trend down';
        } else {
            trendElement.textContent = '→ 0.0%';
            trendElement.className = 'metric-trend stable';
        }
    }
}

function checkForAlerts(liveData) {
    // Voltage alerts
    if (liveData.voltage < 210 || liveData.voltage > 230) {
        addLiveAlert('danger', `Voltage out of range: ${liveData.voltage.toFixed(1)} kV`);
    }
    
    // Current alerts
    if (liveData.current > 20) {
        addLiveAlert('warning', `High current detected: ${liveData.current.toFixed(1)} A`);
    }
    
    // Temperature alerts
    if (liveData.temperature > 60) {
        addLiveAlert('danger', `High temperature: ${liveData.temperature.toFixed(1)} °C`);
    }
    
    // Risk alerts
    if (liveData.risk > 80) {
        addLiveAlert('danger', 'High risk level detected!');
    } else if (liveData.risk > 60) {
        addLiveAlert('warning', 'Elevated risk level');
    }
}

function addLiveAlert(type, message) {
    const alertsList = document.getElementById('alertsList');
    if (!alertsList) return;
    
    const alertItem = document.createElement('div');
    alertItem.className = `alert-item ${type}`;
    
    const icon = type === 'danger' ? 'fa-exclamation-triangle' :
                type === 'warning' ? 'fa-exclamation-circle' :
                type === 'success' ? 'fa-check-circle' : 'fa-info-circle';
    
    alertItem.innerHTML = `
        <i class="fas ${icon}"></i>
        <span>${message}</span>
        <span class="alert-time">${new Date().toLocaleTimeString()}</span>
    `;
    
    // Add to top of list
    alertsList.insertBefore(alertItem, alertsList.firstChild);
    
    // Keep only last 10 alerts
    while (alertsList.children.length > 10) {
        alertsList.removeChild(alertsList.lastChild);
    }
    
    // Auto-remove after 30 seconds
    setTimeout(() => {
        if (alertItem.parentNode) {
            alertItem.style.opacity = '0';
            alertItem.style.transform = 'translateX(-20px)';
            setTimeout(() => {
                if (alertItem.parentNode) {
                    alertItem.parentNode.removeChild(alertItem);
                }
            }, 300);
        }
    }, 30000);
}

// Old PDF methods removed - using single method only

// Old PDF generation functions removed

// Old text download function removed

// Old blob download function removed

// Old window open function removed

// Old PDF function removed
function removedOldPDFFunction() {
    return; // This function is disabled
    console.log('=== GENERATING BASIC PDF ===');
    
    try {
        // Check if jsPDF is available
        if (typeof window.jspdf === 'undefined' && typeof window.jsPDF === 'undefined') {
            console.error('jsPDF not available');
            throw new Error('jsPDF library not loaded');
        }
        
        // Try different ways to access jsPDF
        let jsPDF;
        if (typeof window.jspdf !== 'undefined') {
            jsPDF = window.jspdf.jsPDF;
        } else if (typeof window.jsPDF !== 'undefined') {
            jsPDF = window.jsPDF;
        } else {
            throw new Error('Cannot access jsPDF');
        }
        
        console.log('jsPDF accessed successfully');
        
        // Create PDF
        const pdf = new jsPDF();
        console.log('PDF object created');
        
        // Add simple content
        pdf.setFontSize(16);
        pdf.text('Power Fault Analysis Report', 20, 30);
        
        pdf.setFontSize(12);
        pdf.text(`Generated: ${new Date().toLocaleString()}`, 20, 50);
        pdf.text('This is a test PDF to verify functionality.', 20, 70);
        
        // Save PDF
        const fileName = `Power_Fault_Test_${new Date().getTime()}.pdf`;
        console.log('Attempting to save PDF:', fileName);
        
        pdf.save(fileName);
        console.log('PDF save called successfully');
        
        // Show success notification
        showNotification('PDF downloaded successfully!', 'success');
        
    } catch (error) {
        console.error('Basic PDF generation failed:', error);
        showNotification('PDF Error: ' + error.message, 'error');
        
        // Alternative approach removed
    }
}

// Old alternative PDF function removed

// Simple PDF Generation (guaranteed to work)
function generateSimplePdf() {
    console.log('=== GENERATING SIMPLE PDF ===');
    
    try {
        if (typeof window.jspdf === 'undefined') {
            throw new Error('jsPDF library not loaded');
        }
        
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF();
        
        // Add title
        pdf.setFontSize(20);
        pdf.text('Power Fault Analysis Report', 20, 30);
        
        // Add date
        pdf.setFontSize(12);
        pdf.text(`Generated: ${new Date().toLocaleString()}`, 20, 50);
        
        // Add basic content
        pdf.setFontSize(14);
        pdf.text('System Analysis Results:', 20, 70);
        
        // Add prediction results if available
        const predictionLabel = document.getElementById('predictionLabel');
        const confidenceText = document.getElementById('confidenceText');
        
        if (predictionLabel) {
            pdf.setFontSize(12);
            pdf.text(`Fault Type: ${predictionLabel.textContent}`, 20, 90);
        }
        
        if (confidenceText) {
            pdf.text(`Confidence: ${confidenceText.textContent}`, 20, 100);
        }
        
        // Add form data
        pdf.setFontSize(12);
        pdf.text('Input Parameters:', 20, 120);
        
        const form = document.getElementById('predictionForm');
        if (form) {
            const inputs = form.querySelectorAll('input[type="number"]');
            let yPos = 140;
            inputs.forEach((input, index) => {
                if (yPos > 250) {
                    pdf.addPage();
                    yPos = 30;
                }
                pdf.text(`${input.name || input.id}: ${input.value}`, 20, yPos);
                yPos += 10;
            });
        }
        
        // Add note
        pdf.setFontSize(10);
        pdf.text('Note: This is a simplified report. For full visualizations,', 20, 270);
        pdf.text('please use the web interface.', 20, 280);
        
        // Save PDF
        const fileName = `Power_Fault_Report_${new Date().toISOString().split('T')[0]}.pdf`;
        console.log('Saving PDF:', fileName);
        pdf.save(fileName);
        console.log('PDF saved successfully!');
        
        showNotification('PDF report generated successfully!', 'success');
        
    } catch (error) {
        console.error('Simple PDF generation failed:', error);
        showNotification('Error generating PDF: ' + error.message, 'error');
    }
}

// PDF Download Functionality
function initializePdfDownload() {
    console.log('Initializing PDF download...');
    const downloadBtn = document.getElementById('downloadPdfBtn');
    console.log('PDF button found:', !!downloadBtn);
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function(e) {
            console.log('PDF button clicked!');
            e.preventDefault();
            e.stopPropagation();
            showNotification('PDF generation started...', 'info');
            
            // Add a small delay to ensure the notification shows
            setTimeout(() => {
                // Use single reliable PDF method
                generateSinglePdf();
            }, 100);
        });
        console.log('PDF download event listener added');
    } else {
        console.error('PDF download button not found!');
    }
}

async function generatePdfReport() {
    console.log('=== PDF GENERATION FUNCTION CALLED ===');
    console.log('PDF generation started...');
    const downloadBtn = document.getElementById('downloadPdfBtn');
    console.log('Download button found in function:', !!downloadBtn);
    const originalText = downloadBtn ? downloadBtn.innerHTML : 'Button not found';
    
    try {
        // Show loading state
        if (downloadBtn) {
            downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating PDF...';
            downloadBtn.disabled = true;
        }
        
        // Check if required libraries are loaded
        console.log('Checking libraries...');
        console.log('html2canvas available:', typeof html2canvas !== 'undefined');
        console.log('jsPDF available:', typeof window.jspdf !== 'undefined');
        
        if (typeof html2canvas === 'undefined') {
            throw new Error('html2canvas library not loaded');
        }
        if (typeof window.jspdf === 'undefined') {
            throw new Error('jsPDF library not loaded');
        }
        
        // Wait for charts to be fully rendered
        console.log('Waiting for charts to render...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Get the results container
        const resultsContainer = document.getElementById('resultsContainer');
        if (!resultsContainer) {
            throw new Error('Results container not found');
        }
        console.log('Results container found:', !!resultsContainer);
        
        // Create a temporary container for PDF generation
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'absolute';
        tempContainer.style.left = '-9999px';
        tempContainer.style.top = '0';
        tempContainer.style.width = '800px';
        tempContainer.style.backgroundColor = 'white';
        tempContainer.style.padding = '20px';
        tempContainer.style.fontFamily = 'Arial, sans-serif';
        
        // Clone the results container
        const clonedResults = resultsContainer.cloneNode(true);
        clonedResults.style.display = 'block';
        clonedResults.style.position = 'static';
        clonedResults.style.width = '100%';
        clonedResults.style.backgroundColor = 'white';
        clonedResults.style.color = 'black';
        
        // Remove animations and transitions for PDF
        const allElements = clonedResults.querySelectorAll('*');
        allElements.forEach(el => {
            el.style.animation = 'none';
            el.style.transition = 'none';
            el.style.transform = 'none';
        });
        
        // Add header
        const header = document.createElement('div');
        header.style.textAlign = 'center';
        header.style.marginBottom = '30px';
        header.style.borderBottom = '2px solid #3498db';
        header.style.paddingBottom = '20px';
        header.innerHTML = `
            <h1 style="color: #2c3e50; margin: 0; font-size: 28px;">Power Fault Analysis Report</h1>
            <p style="color: #7f8c8d; margin: 10px 0 0 0; font-size: 16px;">Generated on ${new Date().toLocaleString()}</p>
        `;
        
        tempContainer.appendChild(header);
        tempContainer.appendChild(clonedResults);
        document.body.appendChild(tempContainer);
        
        // Generate PDF using html2canvas and jsPDF
        console.log('Starting html2canvas...');
        const canvas = await html2canvas(tempContainer, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            width: 800,
            height: tempContainer.scrollHeight
        });
        console.log('html2canvas completed, canvas size:', canvas.width, 'x', canvas.height);
        
        // Clean up temporary container
        document.body.removeChild(tempContainer);
        
        // Create PDF
        console.log('Creating PDF...');
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        console.log('PDF object created');
        const imgWidth = 210;
        const pageHeight = 295;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        
        let position = 0;
        
        // Add image to PDF
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        
        // Add new pages if content is longer than one page
        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }
        
        // Add footer to each page
        const pageCount = pdf.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            pdf.setPage(i);
            pdf.setFontSize(8);
            pdf.setTextColor(128, 128, 128);
            pdf.text(`Page ${i} of ${pageCount}`, 20, 285);
            pdf.text('Power Fault Prediction System - AI-Powered Analysis', 105, 285, { align: 'center' });
        }
        
        // Save the PDF
        console.log('Saving PDF...');
        const fileName = `Power_Fault_Report_${new Date().toISOString().split('T')[0]}.pdf`;
        console.log('PDF filename:', fileName);
        pdf.save(fileName);
        console.log('PDF saved successfully');
        
        // Show success message
        showNotification('PDF report generated successfully!', 'success');
        
    } catch (error) {
        console.error('Error generating PDF:', error);
        console.log('Trying fallback PDF generation...');
        
        // Fallback: Simple text-based PDF
        try {
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF();
            
            // Add title
            pdf.setFontSize(20);
            pdf.text('Power Fault Analysis Report', 20, 30);
            
            // Add date
            pdf.setFontSize(12);
            pdf.text(`Generated: ${new Date().toLocaleString()}`, 20, 50);
            
            // Add basic content
            pdf.setFontSize(14);
            pdf.text('System Analysis Results:', 20, 70);
            
            // Add prediction results if available
            const predictionLabel = document.getElementById('predictionLabel');
            const confidenceText = document.getElementById('confidenceText');
            
            if (predictionLabel) {
                pdf.setFontSize(12);
                pdf.text(`Fault Type: ${predictionLabel.textContent}`, 20, 90);
            }
            
            if (confidenceText) {
                pdf.text(`Confidence: ${confidenceText.textContent}`, 20, 100);
            }
            
            // Add note
            pdf.setFontSize(10);
            pdf.text('Note: This is a simplified report. For full visualizations,', 20, 120);
            pdf.text('please use the web interface.', 20, 130);
            
            // Save fallback PDF
            const fileName = `Power_Fault_Report_Simple_${new Date().toISOString().split('T')[0]}.pdf`;
            pdf.save(fileName);
            
            showNotification('Simple PDF report generated successfully!', 'success');
        } catch (fallbackError) {
            console.error('Fallback PDF generation failed:', fallbackError);
            showNotification('Error generating PDF report. Please try again.', 'error');
        }
    } finally {
        // Reset button state
        if (downloadBtn) {
            downloadBtn.innerHTML = originalText;
            downloadBtn.disabled = false;
        }
    }
}

// Update Gauge Values
function updateGaugeValues(voltage, current, temperature) {
    // Skip gauge updates during PDF generation
    if (isGeneratingPdf) {
        console.log('Skipping gauge updates during PDF generation');
        return;
    }
    
    // If no gauges exist, try to initialize them first
    if (!voltageGauge && !currentGauge && !temperatureGauge) {
        console.log('No gauges found, initializing...');
        initializeGaugeCharts();
        // Wait a bit for initialization to complete
        setTimeout(() => {
            updateGaugeValues(voltage, current, temperature);
        }, 500);
        return;
    }
    
    if (voltageGauge) {
        const voltagePercent = Math.min(Math.max((voltage / 2500) * 100, 0), 100);
        voltageGauge.data.datasets[0].data = [voltagePercent, 100 - voltagePercent];
        voltageGauge.update();
        
        // Add text label
        addGaugeText('voltageGauge', Math.round(voltagePercent) + '%', voltage + 'V');
    }
    
    if (currentGauge) {
        const currentPercent = Math.min(Math.max((current / 200) * 100, 0), 100);
        currentGauge.data.datasets[0].data = [currentPercent, 100 - currentPercent];
        currentGauge.update();
        
        // Add text label
        addGaugeText('currentGauge', Math.round(currentPercent) + '%', current + 'A');
    }
    
    if (temperatureGauge) {
        const tempPercent = Math.min(Math.max((temperature / 50) * 100, 0), 100);
        temperatureGauge.data.datasets[0].data = [tempPercent, 100 - tempPercent];
        temperatureGauge.update();
        
        // Add text label
        addGaugeText('temperatureGauge', Math.round(tempPercent) + '%', temperature + '°C');
    }
}

// Add text labels to gauges
function addGaugeText(canvasId, percentage, value) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    // Remove existing text if any
    const existingText = canvas.parentNode.querySelector('.gauge-text');
    if (existingText) {
        existingText.remove();
    }
    
    // Create text overlay
    const textDiv = document.createElement('div');
    textDiv.className = 'gauge-text';
    textDiv.innerHTML = `
        <div class="gauge-percentage">${percentage}</div>
        <div class="gauge-value">${value}</div>
    `;
    
    canvas.parentNode.appendChild(textDiv);
}
let dataPointCount = 0;

// Initialize Live Graph
function initializeLiveGraph() {
    // Prevent multiple initializations
    if (liveGraph) {
        console.log('Live graph already initialized');
        return;
    }

    const canvas = document.getElementById('liveGraph');
    if (!canvas) {
        console.log('Live graph canvas not found, retrying...');
        setTimeout(() => {
            const retryCanvas = document.getElementById('liveGraph');
            if (retryCanvas) {
                initializeLiveGraph();
            }
        }, 500);
        return;
    }

    console.log('Initializing live graph...');
    const ctx = canvas.getContext('2d');
    
    // Initialize with sample data
    initializeGraphData();
    
    // Create Chart.js instance
    liveGraph = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Voltage (V)',
                data: [],
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#3498db',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 750,
                easing: 'easeInOutQuart'
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: {
                            size: 12,
                            weight: 'bold'
                        }
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    borderColor: '#3498db',
                    borderWidth: 1,
                    cornerRadius: 8,
                    displayColors: true
                }
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Time',
                        font: {
                            size: 12,
                            weight: 'bold'
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)',
                        drawBorder: false
                    },
                    ticks: {
                        maxTicksLimit: 10,
                        font: {
                            size: 10
                        }
                    }
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Value',
                        font: {
                            size: 12,
                            weight: 'bold'
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)',
                        drawBorder: false
                    },
                    ticks: {
                        font: {
                            size: 10
                        }
                    }
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        }
    });

    // Setup graph controls
    setupGraphControls();
    
    // Start live updates
    startLiveUpdates();
}

// Initialize graph data with realistic electrical values
function initializeGraphData() {
    const now = new Date();
    const baseTime = now.getTime();
    
    // Generate initial data points
    for (let i = 0; i < 20; i++) {
        const time = new Date(baseTime - (19 - i) * 1000);
        const timeLabel = time.toLocaleTimeString();
        
        // Generate realistic electrical data
        graphData.voltage.push({
            x: timeLabel,
            y: 2200 + Math.random() * 100 - 50
        });
        
        graphData.current.push({
            x: timeLabel,
            y: 150 + Math.random() * 20 - 10
        });
        
        graphData.power.push({
            x: timeLabel,
            y: 330000 + Math.random() * 20000 - 10000
        });
        
        graphData.frequency.push({
            x: timeLabel,
            y: 50 + Math.random() * 0.2 - 0.1
        });
    }
}

// Setup graph control buttons
function setupGraphControls() {
    const buttons = document.querySelectorAll('.graph-btn');
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            buttons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Update graph type
            currentGraphType = button.dataset.type;
            updateGraphType();
        });
    });
}

// Update graph type and data
function updateGraphType() {
    if (!liveGraph) return;

    const configs = {
        voltage: {
            label: 'Voltage (V)',
            color: '#3498db',
            data: graphData.voltage
        },
        current: {
            label: 'Current (A)',
            color: '#e74c3c',
            data: graphData.current
        },
        power: {
            label: 'Power (W)',
            color: '#f39c12',
            data: graphData.power
        },
        frequency: {
            label: 'Frequency (Hz)',
            color: '#27ae60',
            data: graphData.frequency
        }
    };

    const config = configs[currentGraphType];
    
    liveGraph.data.datasets[0].label = config.label;
    liveGraph.data.datasets[0].borderColor = config.color;
    liveGraph.data.datasets[0].backgroundColor = config.color + '20';
    liveGraph.data.datasets[0].pointBackgroundColor = config.color;
    liveGraph.data.datasets[0].data = config.data;
    
    // Update labels
    liveGraph.data.labels = config.data.map(d => d.x);
    
    liveGraph.update('active');
}

// Start live data updates
function startLiveUpdates() {
    if (graphUpdateInterval) {
        clearInterval(graphUpdateInterval);
    }
    
    graphUpdateInterval = setInterval(() => {
        updateLiveData();
    }, 1000); // Update every second
}

// Update live data
function updateLiveData() {
    if (!liveGraph) return;

    const now = new Date();
    const timeLabel = now.toLocaleTimeString();
    
    // Generate new data point based on current graph type
    let newValue;
    const baseValues = {
        voltage: 2200,
        current: 150,
        power: 330000,
        frequency: 50
    };
    
    const variations = {
        voltage: 100,
        current: 20,
        power: 20000,
        frequency: 0.2
    };
    
    const baseValue = baseValues[currentGraphType];
    const variation = variations[currentGraphType];
    
    // Add some realistic variation and trends
    const trend = Math.sin(Date.now() / 10000) * 0.1; // Slow trend
    const noise = (Math.random() - 0.5) * 2; // Random noise
    newValue = baseValue + (trend + noise) * variation;
    
    // Add new data point
    graphData[currentGraphType].push({
        x: timeLabel,
        y: newValue
    });
    
    // Keep only last 30 data points
    if (graphData[currentGraphType].length > 30) {
        graphData[currentGraphType].shift();
    }
    
    // Update data point count
    dataPointCount++;
    updateGraphStatus();
    
    // Update chart
    updateGraphType();
}

// Update graph status display
function updateGraphStatus() {
    const updateRateEl = document.getElementById('updateRate');
    const dataPointsEl = document.getElementById('dataPoints');
    const graphStatusEl = document.getElementById('graphStatus');
    
    if (updateRateEl) updateRateEl.textContent = '1.0s';
    if (dataPointsEl) dataPointsEl.textContent = dataPointCount.toString();
    if (graphStatusEl) {
        graphStatusEl.textContent = 'Live';
        graphStatusEl.className = 'status-value live-indicator';
    }
}

// Stop live updates
function stopLiveUpdates() {
    if (graphUpdateInterval) {
        clearInterval(graphUpdateInterval);
        graphUpdateInterval = null;
    }
    
    const graphStatusEl = document.getElementById('graphStatus');
    if (graphStatusEl) {
        graphStatusEl.textContent = 'Paused';
        graphStatusEl.className = 'status-value';
    }
}

// Interactive Features
// Initialize interactive features
function initializeInteractiveFeatures() {
    addMicroInteractions();
}

// Micro-interactions
function addMicroInteractions() {
    // Add ripple effect to buttons
    const buttons = document.querySelectorAll('.btn, .fab');
    buttons.forEach(button => {
        button.addEventListener('click', createRipple);
    });
    
    // Add hover effects to cards
    const cards = document.querySelectorAll('.prediction-card, .fault-info-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-5px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
        });
    });
}

// Ripple Effect
function createRipple(event) {
    const button = event.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');
    
    button.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// Add ripple CSS
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple-animation 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(rippleStyle);

// Theme Management
let isDarkTheme = false;

// Initialize Theme Toggle
function initializeThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    
    if (!themeToggle || !themeIcon) return;
    
    // Load saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        toggleTheme();
    }
    
    themeToggle.addEventListener('click', () => {
        toggleTheme();
    });
}

// Toggle Theme
function toggleTheme() {
    isDarkTheme = !isDarkTheme;
    const body = document.body;
    const themeIcon = document.getElementById('themeIcon');
    
    if (isDarkTheme) {
        body.classList.add('dark-theme');
        themeIcon.className = 'fas fa-sun';
        localStorage.setItem('theme', 'dark');
    } else {
        body.classList.remove('dark-theme');
        themeIcon.className = 'fas fa-moon';
        localStorage.setItem('theme', 'light');
    }
}

// AI Chatbot
let currentFormData = null;
let isChatbotOpen = false;

// Initialize Chatbot
function initializeChatbot() {
    const chatbotToggle = document.getElementById('chatbotToggle');
    const chatbotContainer = document.getElementById('chatbotContainer');
    const chatbotWindow = document.getElementById('chatbotWindow');
    const chatbotInput = document.getElementById('chatbotInput');
    const chatbotSend = document.getElementById('chatbotSend');
    const quickActions = document.querySelectorAll('.quick-action-btn');

    if (!chatbotContainer) {
        console.log('Chatbot container not found');
        return;
    }

    console.log('Initializing chatbot...');
    
    // Make sure chatbot is visible
    chatbotContainer.style.display = 'flex';
    chatbotContainer.style.visibility = 'visible';
    chatbotContainer.style.opacity = '1';
    chatbotContainer.style.transform = 'translateY(0)';
    
    // Start in collapsed state
    isChatbotOpen = false;
    
    console.log('Chatbot is now ON and visible!');
    
    // Add welcome message
    setTimeout(() => {
        addMessage("Hello! I'm your AI Safety Advisor. I can help you with electrical fault prevention and provide personalized recommendations. How can I assist you today?", 'bot');
    }, 1000);
    
    // Add a test message to show the chatbot can reply
    setTimeout(() => {
        addMessage("Try asking me about prevention, maintenance, emergency procedures, or data analysis. I can also analyze your electrical system parameters!", 'bot');
    }, 3000);
    
    // Click handler for the container (only when collapsed)
    chatbotContainer.addEventListener('click', function(e) {
        // Only handle clicks when chatbot is collapsed
        if (!isChatbotOpen && !chatbotContainer.classList.contains('expanded')) {
            console.log('Chatbot clicked - opening!');
            isChatbotOpen = true;
            chatbotContainer.classList.add('expanded');
            if (chatbotWindow) {
                chatbotWindow.classList.add('active');
            }
            console.log('Chatbot opened');
        }
    });

    // Close button handler
    if (chatbotToggle) {
        chatbotToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            isChatbotOpen = false;
            chatbotContainer.classList.remove('expanded');
            if (chatbotWindow) {
                chatbotWindow.classList.remove('active');
            }
            console.log('Chatbot closed via X button');
        });
    }

    // Send message
    function sendMessage() {
        const message = chatbotInput.value.trim();
        if (!message) return;

        addMessage(message, 'user');
        chatbotInput.value = '';

        // Simulate typing delay
        setTimeout(() => {
            const response = generateAIResponse(message);
            addMessage(response, 'bot');
        }, 1000 + Math.random() * 1000);
    }

    // Event listeners
    if (chatbotSend) {
        chatbotSend.addEventListener('click', (e) => {
            e.stopPropagation();
            sendMessage();
        });
    }
    
    if (chatbotInput) {
        chatbotInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.stopPropagation();
                sendMessage();
            }
        });
        
        // Prevent clicks on input from closing chatbot
        chatbotInput.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    // Quick actions
    quickActions.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const action = btn.dataset.action;
            handleQuickAction(action);
        });
    });
    
    // Prevent clicks inside the chat window from closing the chatbot
    if (chatbotWindow) {
        chatbotWindow.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
    
    // Prevent clicks on messages from closing the chatbot
    const messagesContainer = document.getElementById('chatbotMessages');
    if (messagesContainer) {
        messagesContainer.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
}

// Add message to chat
function addMessage(content, sender) {
    const messagesContainer = document.getElementById('chatbotMessages');
    if (!messagesContainer) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.innerHTML = sender === 'bot' ? '<i class="fas fa-robot"></i>' : '<i class="fas fa-user"></i>';

    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    const messageText = document.createElement('p');
    messageText.textContent = content;
    
    const messageTime = document.createElement('div');
    messageTime.className = 'message-time';
    messageTime.textContent = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

    messageContent.appendChild(messageText);
    messageContent.appendChild(messageTime);
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(messageContent);
    messagesContainer.appendChild(messageDiv);

    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Show typing indicator
function showTypingIndicator() {
    const messagesContainer = document.getElementById('chatbotMessages');
    if (!messagesContainer) return;

    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot-message typing-message';
    typingDiv.id = 'typing-indicator';
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.innerHTML = '<i class="fas fa-robot"></i>';
    
    const typingContent = document.createElement('div');
    typingContent.className = 'typing-indicator';
    typingContent.innerHTML = `
        <span>AI is thinking</span>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
    `;
    
    typingDiv.appendChild(avatar);
    typingDiv.appendChild(typingContent);
    
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Hide typing indicator
function hideTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// Handle quick actions
function handleQuickAction(action) {
    let response = '';
    
    switch(action) {
        case 'prevention':
            response = `🛡️ **Electrical Fault Prevention Tips:**

• **Regular Inspections**: Check equipment monthly for signs of wear, corrosion, or damage
• **Proper Maintenance**: Follow manufacturer schedules for cleaning and calibration
• **Environmental Control**: Maintain stable temperature (15-35°C) and humidity (40-60%)
• **Load Management**: Avoid overloading circuits and ensure proper load distribution
• **Protection Devices**: Install and test circuit breakers, fuses, and surge protectors
• **Grounding**: Ensure proper grounding and bonding of all electrical equipment
• **Training**: Keep staff trained on electrical safety procedures
• **Documentation**: Maintain detailed logs of all maintenance activities

Would you like specific advice for your system parameters?`;
            break;
            
        case 'maintenance':
            response = `🔧 **Maintenance Schedule Guide:**

**Daily Checks:**
• Visual inspection of equipment
• Check for unusual sounds or vibrations
• Monitor temperature readings
• Verify alarm systems

**Weekly Tasks:**
• Clean equipment surfaces
• Check connection tightness
• Review operational logs
• Test backup systems

**Monthly Procedures:**
• Calibrate measuring instruments
• Inspect protective devices
• Check grounding systems
• Review maintenance records

**Quarterly Activities:**
• Comprehensive equipment testing
• Update safety procedures
• Staff training refreshers
• System performance analysis

Need help with specific maintenance tasks?`;
            break;
            
        case 'emergency':
            response = `🚨 **Emergency Response Protocol:**

**Immediate Actions:**
1. **Isolate Power**: Turn off main power supply immediately
2. **Evacuate Area**: Clear personnel from danger zone
3. **Call Emergency**: Contact emergency services (911)
4. **Notify Supervisor**: Alert management and safety team
5. **Document Incident**: Record time, location, and circumstances

**Safety Measures:**
• Never touch electrical equipment with wet hands
• Use proper PPE (Personal Protective Equipment)
• Follow lockout/tagout procedures
• Keep emergency contact numbers visible
• Maintain first aid supplies nearby

**Post-Emergency:**
• Conduct thorough investigation
• Review and update safety procedures
• Provide staff training if needed
• Document lessons learned

Need specific emergency procedures for your situation?`;
            break;
            
        case 'analysis':
            if (currentFormData) {
                response = analyzeUserData(currentFormData);
            } else {
                response = `📊 **Data Analysis Available:**

I can analyze your system parameters to provide personalized recommendations. Please submit a fault prediction first, and I'll be able to:

• Analyze your specific voltage, current, and power readings
• Identify potential risk factors in your system
• Provide targeted prevention strategies
• Suggest maintenance priorities
• Recommend monitoring improvements

Go ahead and run a prediction to get started!`;
            }
            break;
            
        case 'current-fault':
            if (currentFormData) {
                response = analyzeCurrentFault(currentFormData);
            } else {
                response = `⚡ **Current Fault Analysis:**

I can provide detailed analysis of your current fault prediction. Please submit a fault prediction first, and I'll be able to:

• Analyze your specific fault type and severity
• Provide targeted solutions for your fault
• Suggest immediate actions to take
• Recommend long-term prevention strategies
• Create a customized action plan

Run a prediction to get personalized fault analysis!`;
            }
            break;
    }
    
    addMessage(response, 'bot');
}

// Generate AI response
function generateAIResponse(userMessage) {
    // Show typing indicator
    showTypingIndicator();
    
    // Simulate thinking time
    setTimeout(() => {
        hideTypingIndicator();
        const message = userMessage.toLowerCase();
    
    // Keywords for different topics
    const preventionKeywords = ['prevent', 'avoid', 'prevention', 'safety', 'protect', 'secure', 'shield'];
    const maintenanceKeywords = ['maintain', 'maintenance', 'repair', 'fix', 'service', 'check', 'inspect'];
    const emergencyKeywords = ['emergency', 'urgent', 'danger', 'hazard', 'accident', 'critical', 'alarm'];
    const analysisKeywords = ['analyze', 'analysis', 'data', 'parameters', 'values', 'monitor', 'check'];
    const generalKeywords = ['hello', 'hi', 'help', 'what', 'how', 'why', 'explain', 'tell'];
    const faultKeywords = ['fault', 'error', 'problem', 'issue', 'failure', 'breakdown'];
    
    if (preventionKeywords.some(keyword => message.includes(keyword))) {
        return `🛡️ **Prevention is Key!** Here are essential electrical safety measures:

• **Regular Monitoring**: Check parameters every 4 hours
• **Environmental Control**: Maintain stable conditions
• **Load Management**: Never exceed 80% of rated capacity
• **Protection Systems**: Ensure all safety devices are functional
• **Staff Training**: Keep everyone updated on safety procedures
• **Documentation**: Record all readings and incidents

Would you like specific prevention strategies for your system?`;
    }
    
    if (maintenanceKeywords.some(keyword => message.includes(keyword))) {
        return `🔧 **Maintenance Best Practices:**

**Critical Maintenance Tasks:**
• Clean all electrical contacts monthly
• Check insulation resistance quarterly
• Calibrate measuring instruments every 6 months
• Inspect protective devices annually
• Update safety procedures as needed

**Warning Signs to Watch:**
• Unusual temperature readings
• Fluctuating voltage levels
• Increased current consumption
• Equipment vibration or noise
• Discolored or damaged components

Need a maintenance checklist for your specific equipment?`;
    }
    
    if (emergencyKeywords.some(keyword => message.includes(keyword))) {
        return `🚨 **Emergency Response Steps:**

**If Fault Detected:**
1. **Immediate**: Isolate power source
2. **Safety**: Evacuate affected area
3. **Communication**: Alert emergency services
4. **Documentation**: Record incident details
5. **Investigation**: Conduct thorough analysis

**Prevention Focus:**
• Regular system monitoring
• Proactive maintenance
• Staff training updates
• Equipment upgrades when needed

Is this an emergency situation requiring immediate assistance?`;
    }
    
    if (analysisKeywords.some(keyword => message.includes(keyword))) {
        if (currentFormData) {
            return analyzeUserData(currentFormData);
        } else {
            return `📊 **Data Analysis Ready!** 

I can provide detailed analysis once you submit system parameters. Please run a fault prediction first, then I'll analyze your specific data and provide personalized recommendations.

What specific aspects would you like me to analyze?`;
        }
    }
    
    if (faultKeywords.some(keyword => message.includes(keyword))) {
        return `⚡ **Fault Analysis & Solutions**

**Common Electrical Faults:**
• **Short Circuits** - Caused by insulation failure
• **Overloads** - Excessive current draw
• **Ground Faults** - Current leakage to ground
• **Arc Faults** - High-resistance connections
• **Equipment Failures** - Component degradation

**Immediate Actions:**
1. **Isolate** affected circuits immediately
2. **Assess** the severity and impact
3. **Document** all observations
4. **Notify** appropriate personnel
5. **Implement** safety protocols

**Prevention Strategies:**
• Regular insulation testing
• Load monitoring and management
• Proper grounding systems
• Equipment maintenance schedules
• Staff training programs

Need specific guidance for your fault type?`;
    }
    
    if (generalKeywords.some(keyword => message.includes(keyword))) {
        return `👋 **Hello! I'm your AI Safety Advisor.**

I can help you with:
• **Prevention Tips** - Avoid electrical faults
• **Maintenance Guides** - Keep systems running safely  
• **Emergency Response** - Handle critical situations
• **Data Analysis** - Understand your system parameters
• **Fault Solutions** - Troubleshoot specific issues

What would you like to know about electrical safety?`;
    }
    
        // Default response
        const defaultResponse = `I understand you're asking about "${userMessage}". 

As your AI Safety Advisor, I can help with:
• Electrical fault prevention strategies
• Maintenance scheduling and procedures
• Emergency response protocols
• Analysis of your system parameters

Could you be more specific about what you'd like to know? I'm here to help keep your electrical systems safe!`;
        
        addMessage(defaultResponse, 'bot');
    }, 1500); // 1.5 second delay
}

// Analyze user data
function analyzeUserData(formData) {
    const voltage = parseFloat(formData.voltage) || 0;
    const current = parseFloat(formData.current) || 0;
    const power = parseFloat(formData.power) || 0;
    const frequency = parseFloat(formData.frequency) || 0;
    const temperature = parseFloat(formData.temperature) || 0;
    const humidity = parseFloat(formData.humidity) || 0;
    const windSpeed = parseFloat(formData.wind_speed) || 0;
    const pressure = parseFloat(formData.pressure) || 0;

    let analysis = `📊 **System Analysis Based on Your Data:**

**Current Parameters:**
• Voltage: ${voltage}V
• Current: ${current}A  
• Power: ${power}W
• Frequency: ${frequency}Hz
• Temperature: ${temperature}°C
• Humidity: ${humidity}%
• Wind Speed: ${windSpeed} m/s
• Pressure: ${pressure} Pa

**Risk Assessment:**`;

    // Risk analysis
    const risks = [];
    
    if (voltage > 2500 || voltage < 2000) {
        risks.push("⚠️ Voltage outside normal range (2000-2500V)");
    }
    
    if (current > 200) {
        risks.push("⚠️ High current load detected");
    }
    
    if (temperature > 40) {
        risks.push("⚠️ Elevated temperature may cause equipment stress");
    }
    
    if (humidity > 80) {
        risks.push("⚠️ High humidity increases corrosion risk");
    }
    
    if (windSpeed > 15) {
        risks.push("⚠️ High wind speed may affect outdoor equipment");
    }
    
    if (risks.length === 0) {
        analysis += "\n✅ **Low Risk** - Parameters within acceptable ranges";
    } else {
        analysis += "\n" + risks.join("\n");
    }

    analysis += `\n\n**Recommendations:**
• Monitor parameters every 2 hours
• Schedule maintenance if risks detected
• Consider environmental controls
• Update safety procedures as needed

Need specific action plans for any of these issues?`;

    return analysis;
}

// Analyze current fault
function analyzeCurrentFault(formData) {
    const voltage = parseFloat(formData.voltage) || 0;
    const current = parseFloat(formData.current) || 0;
    const power = parseFloat(formData.power) || 0;
    const frequency = parseFloat(formData.frequency) || 0;
    const temperature = parseFloat(formData.temperature) || 0;
    const humidity = parseFloat(formData.humidity) || 0;
    const windSpeed = parseFloat(formData.wind_speed) || 0;
    const pressure = parseFloat(formData.pressure) || 0;

    // Determine fault type based on parameters
    let faultType = "System Normal";
    let severity = "LOW";
    let immediateActions = [];
    let longTermSolutions = [];

    // Analyze parameters for fault patterns
    if (voltage === 0 && current === 0 && power === 0) {
        faultType = "System Offline";
        severity = "MEDIUM";
        immediateActions = [
            "Check main power supply",
            "Verify circuit breakers",
            "Inspect power connections",
            "Test backup systems"
        ];
        longTermSolutions = [
            "Implement redundant power systems",
            "Install UPS backup",
            "Regular power system testing",
            "Staff training on power restoration"
        ];
    } else if (voltage > 2500 || voltage < 2000) {
        faultType = "Voltage Anomaly";
        severity = "HIGH";
        immediateActions = [
            "Isolate affected circuits immediately",
            "Check voltage regulators",
            "Monitor other system parameters",
            "Alert maintenance team"
        ];
        longTermSolutions = [
            "Install voltage monitoring systems",
            "Upgrade voltage regulation equipment",
            "Implement automatic voltage correction",
            "Regular voltage calibration"
        ];
    } else if (current > 200) {
        faultType = "Overload Condition";
        severity = "HIGH";
        immediateActions = [
            "Reduce load immediately",
            "Check for short circuits",
            "Monitor temperature rise",
            "Prepare for emergency shutdown"
        ];
        longTermSolutions = [
            "Load balancing analysis",
            "Upgrade conductor capacity",
            "Install load monitoring",
            "Implement load shedding systems"
        ];
    } else if (temperature > 40) {
        faultType = "Thermal Stress";
        severity = "MEDIUM";
        immediateActions = [
            "Improve ventilation",
            "Check cooling systems",
            "Monitor temperature trends",
            "Reduce load if necessary"
        ];
        longTermSolutions = [
            "Install better cooling systems",
            "Improve equipment spacing",
            "Regular thermal inspections",
            "Environmental controls"
        ];
    }

    let analysis = `⚡ **Current Fault Analysis:**

**Detected Fault Type:** ${faultType}
**Severity Level:** ${severity}
**Analysis Time:** ${new Date().toLocaleString()}

**System Parameters:**
• Voltage: ${voltage}V ${voltage > 2500 || voltage < 2000 ? '⚠️' : '✅'}
• Current: ${current}A ${current > 200 ? '⚠️' : '✅'}
• Power: ${power}W
• Temperature: ${temperature}°C ${temperature > 40 ? '⚠️' : '✅'}
• Humidity: ${humidity}% ${humidity > 80 ? '⚠️' : '✅'}

**🚨 Immediate Actions Required:**
${immediateActions.map(action => `• ${action}`).join('\n')}

**🔧 Long-term Solutions:**
${longTermSolutions.map(solution => `• ${solution}`).join('\n')}

**📋 Recommended Timeline:**
• **Immediate (0-1 hour):** ${immediateActions[0]}
• **Short-term (1-24 hours):** Complete immediate actions
• **Medium-term (1-7 days):** Implement monitoring improvements
• **Long-term (1-4 weeks):** Execute long-term solutions

Need specific guidance for any of these actions?`;

    return analysis;
}

// Update form data for analysis
function updateFormDataForChatbot(data) {
    currentFormData = data;
}
