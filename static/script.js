// Global variables
let probabilityChart = null;

// DOM elements
const form = document.getElementById('predictionForm');
const resultsContainer = document.getElementById('resultsContainer');
const loadingOverlay = document.getElementById('loadingOverlay');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    checkModelInfo();
});

// Setup event listeners
function setupEventListeners() {
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
        const response = await fetch('/api/model-info');
        const data = await response.json();
        
        if (data.error) {
            console.error('Error getting model info:', data.error);
            showNotification('Warning: Model information unavailable', 'warning');
        } else {
            console.log('Model loaded successfully:', data);
        }
    } catch (error) {
        console.error('Error checking model info:', error);
        showNotification('Warning: Unable to connect to model', 'warning');
    }
}

// Handle form submission
async function handleFormSubmit(event) {
    event.preventDefault();
    
    // Validate form
    if (!validateForm()) {
        return;
    }
    
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
        
        // Make API request
        const response = await fetch('/api/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.error) {
            throw new Error(result.error);
        }
        
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
    form.reset();
    resultsContainer.style.display = 'none';
    
    // Clear any validation errors
    const errorMessages = form.querySelectorAll('.input-error');
    errorMessages.forEach(error => error.remove());
    
    const inputs = form.querySelectorAll('input');
    inputs.forEach(input => {
        input.style.borderColor = '#e1e8ed';
    });
    
    showNotification('Form reset successfully', 'info');
}

// Show loading overlay
function showLoading() {
    loadingOverlay.classList.add('active');
}

// Hide loading overlay
function hideLoading() {
    loadingOverlay.classList.remove('active');
}

// Show notification
function showNotification(message, type = 'info') {
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
