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
    
    // Initialize enhanced probability chart
    setTimeout(() => {
        initializeEnhancedProbabilityChart();
    }, 1000);
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
        
        // Update enhanced chart with new data
        updateEnhancedChartData({
            overheating: Math.round((result.faultDetails?.overheating || 0.4) * 100),
            transformer: Math.round((result.faultDetails?.transformer_failure || 0.2) * 100),
            lineBreakage: Math.round((result.faultDetails?.line_breakage || 0.4) * 100)
        });
        
        // Show AI recommendations popup after 2 seconds
        setTimeout(() => {
            showAIRecommendationsPopup(result);
        }, 2000);
        
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

// Show AI Recommendations Popup
function showAIRecommendationsPopup(result) {
    // Create popup overlay
    const overlay = document.createElement('div');
    overlay.className = 'ai-recommendations-overlay';
    overlay.innerHTML = `
        <div class="ai-recommendations-popup">
            <div class="ai-popup-header">
                <div class="ai-popup-icon">🤖</div>
                <h3>AI Safety Recommendations</h3>
                <button class="ai-popup-close" onclick="closeAIRecommendationsPopup()">×</button>
            </div>
            <div class="ai-popup-content">
                ${generateAIRecommendations(result)}
            </div>
            <div class="ai-popup-footer">
                <button class="ai-popup-button ai-popup-primary" onclick="openChatbotForRecommendations()">
                    💬 Chat with AI
                </button>
                <button class="ai-popup-button ai-popup-secondary" onclick="closeAIRecommendationsPopup()">
                    Close
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Add animation
    setTimeout(() => {
        overlay.classList.add('show');
    }, 100);
}

// Close AI Recommendations Popup
function closeAIRecommendationsPopup() {
    const overlay = document.querySelector('.ai-recommendations-overlay');
    if (overlay) {
        overlay.classList.remove('show');
        setTimeout(() => {
            overlay.remove();
        }, 300);
    }
}

// Generate AI Recommendations based on prediction results
function generateAIRecommendations(result) {
    const prediction = result.prediction;
    const confidence = result.confidence;
    const faultDetails = result.faultDetails || {};
    
    let recommendations = '';
    
    if (prediction === 'Line Breakage') {
        recommendations = `
            <div class="ai-recommendation-item critical">
                <div class="recommendation-icon">⚡</div>
                <div class="recommendation-content">
                    <h4>Line Breakage Detected - Immediate Action Required</h4>
                    <p><strong>High Risk Alert:</strong> Electrical line breakage detected. This poses significant safety hazards and requires immediate intervention.</p>
                    <ul>
                        <li><strong>IMMEDIATE:</strong> Isolate affected line sections</li>
                        <li><strong>IMMEDIATE:</strong> Contact emergency electrical services</li>
                        <li>Evacuate area within 100 meters of breakage</li>
                        <li>Establish safety perimeter with warning signs</li>
                        <li>Document exact location and time of detection</li>
                    </ul>
                </div>
            </div>
            
            <div class="ai-recommendation-item warning">
                <div class="recommendation-icon">🔧</div>
                <div class="recommendation-content">
                    <h4>Recovery Actions</h4>
                    <p>After securing the area, implement these recovery measures:</p>
                    <ul>
                        <li>Coordinate with utility company for line repair</li>
                        <li>Inspect adjacent line sections for damage</li>
                        <li>Test backup power systems if available</li>
                        <li>Review weather conditions and line loading history</li>
                        <li>Update maintenance schedule for line inspection</li>
                    </ul>
                </div>
            </div>
        `;
    } else if (prediction === 'Transformer Failure') {
        recommendations = `
            <div class="ai-recommendation-item critical">
                <div class="recommendation-icon">🔌</div>
                <div class="recommendation-content">
                    <h4>Transformer Failure Detected - Critical Alert</h4>
                    <p><strong>Critical System Alert:</strong> Transformer failure detected. This will cause power outages and potential equipment damage.</p>
                    <ul>
                        <li><strong>IMMEDIATE:</strong> Isolate transformer from grid</li>
                        <li><strong>IMMEDIATE:</strong> Activate backup transformer if available</li>
                        <li>Contact transformer maintenance team</li>
                        <li>Monitor temperature and oil levels</li>
                        <li>Prepare for extended downtime</li>
                    </ul>
                </div>
            </div>
            
            <div class="ai-recommendation-item warning">
                <div class="recommendation-icon">📋</div>
                <div class="recommendation-content">
                    <h4>Restoration Plan</h4>
                    <p>System restoration and prevention measures:</p>
                    <ul>
                        <li>Schedule transformer replacement/repair</li>
                        <li>Implement load shedding to protect other equipment</li>
                        <li>Review transformer maintenance history</li>
                        <li>Check environmental protection systems</li>
                        <li>Update transformer monitoring protocols</li>
                    </ul>
                </div>
            </div>
        `;
    } else if (prediction === 'Overheating') {
        recommendations = `
            <div class="ai-recommendation-item warning">
                <div class="recommendation-icon">🌡️</div>
                <div class="recommendation-content">
                    <h4>Overheating Detected - Thermal Alert</h4>
                    <p><strong>Thermal Warning:</strong> System overheating detected. Immediate cooling measures required to prevent equipment damage.</p>
                    <ul>
                        <li><strong>IMMEDIATE:</strong> Reduce load on affected equipment</li>
                        <li><strong>IMMEDIATE:</strong> Activate cooling systems</li>
                        <li>Monitor temperature trends continuously</li>
                        <li>Check ventilation and airflow</li>
                        <li>Prepare for emergency shutdown if temperature rises</li>
                    </ul>
                </div>
            </div>
            
            <div class="ai-recommendation-item info">
                <div class="recommendation-icon">❄️</div>
                <div class="recommendation-content">
                    <h4>Cooling Solutions</h4>
                    <p>Immediate and long-term cooling measures:</p>
                    <ul>
                        <li>Increase forced air circulation</li>
                        <li>Check and clean air filters</li>
                        <li>Review ambient temperature conditions</li>
                        <li>Schedule thermal imaging inspection</li>
                        <li>Consider additional cooling equipment</li>
                    </ul>
                </div>
            </div>
        `;
    } else if (prediction === 'System Offline') {
        recommendations = `
            <div class="ai-recommendation-item warning">
                <div class="recommendation-icon">🔌</div>
                <div class="recommendation-content">
                    <h4>System Offline - Power Issue</h4>
                    <p><strong>System Alert:</strong> System appears to be offline or not operational. All parameters are at zero values.</p>
                    <ul>
                        <li><strong>PRIORITY:</strong> Check main power supply connections</li>
                        <li><strong>PRIORITY:</strong> Verify circuit breakers and fuses</li>
                        <li>Test backup power systems</li>
                        <li>Inspect power distribution equipment</li>
                        <li>Contact system operator for status</li>
                    </ul>
                </div>
            </div>
            
            <div class="ai-recommendation-item info">
                <div class="recommendation-icon">🔍</div>
                <div class="recommendation-content">
                    <h4>Diagnostic Steps</h4>
                    <p>System restoration procedures:</p>
                    <ul>
                        <li>Enter actual system parameters for analysis</li>
                        <li>Verify sensor and monitoring equipment</li>
                        <li>Check communication systems</li>
                        <li>Review system logs and alarms</li>
                        <li>Test system startup procedures</li>
                    </ul>
                </div>
            </div>
        `;
    } else if (prediction === 'System Normal') {
        recommendations = `
            <div class="ai-recommendation-item success">
                <div class="recommendation-icon">✅</div>
                <div class="recommendation-content">
                    <h4>System Normal - Optimal Operation</h4>
                    <p><strong>Status:</strong> All system parameters are within normal operating ranges. System is functioning optimally.</p>
                    <ul>
                        <li>Continue current monitoring schedule</li>
                        <li>Maintain preventive maintenance routine</li>
                        <li>Document all system readings</li>
                        <li>Stay vigilant for parameter changes</li>
                        <li>Keep emergency procedures updated</li>
                    </ul>
                </div>
            </div>
            
            <div class="ai-recommendation-item info">
                <div class="recommendation-icon">📊</div>
                <div class="recommendation-content">
                    <h4>Optimization Recommendations</h4>
                    <p>To maintain and improve system performance:</p>
                    <ul>
                        <li>Regular parameter trend analysis</li>
                        <li>Environmental condition monitoring</li>
                        <li>Load management optimization</li>
                        <li>Staff training and certification updates</li>
                        <li>Technology upgrade planning</li>
                    </ul>
                </div>
            </div>
        `;
    } else {
        // Fallback for unknown prediction types
        recommendations = `
            <div class="ai-recommendation-item warning">
                <div class="recommendation-icon">❓</div>
                <div class="recommendation-content">
                    <h4>Unknown System Status</h4>
                    <p><strong>Analysis Result:</strong> ${prediction} - This prediction type requires manual review.</p>
                    <ul>
                        <li>Review system parameters manually</li>
                        <li>Consult with technical experts</li>
                        <li>Check system documentation</li>
                        <li>Verify sensor readings</li>
                        <li>Contact system administrator</li>
                    </ul>
                </div>
            </div>
            
            <div class="ai-recommendation-item info">
                <div class="recommendation-icon">🔍</div>
                <div class="recommendation-content">
                    <h4>Further Investigation</h4>
                    <p>Recommended next steps:</p>
                    <ul>
                        <li>Double-check input parameters</li>
                        <li>Review system logs</li>
                        <li>Perform manual system inspection</li>
                        <li>Update system software if needed</li>
                        <li>Document findings and recommendations</li>
                    </ul>
                </div>
            </div>
        `;
    }
    
    // Add confidence-based recommendations
    if (confidence < 0.7) {
        recommendations += `
            <div class="ai-recommendation-item info">
                <div class="recommendation-icon">🤔</div>
                <div class="recommendation-content">
                    <h4>Low Confidence Alert</h4>
                    <p>Prediction confidence is ${Math.round(confidence * 100)}%. Consider additional testing or expert consultation.</p>
                    <ul>
                        <li>Perform additional measurements</li>
                        <li>Consult with electrical engineer</li>
                        <li>Review historical data</li>
                        <li>Consider environmental factors</li>
                    </ul>
                </div>
            </div>
        `;
    }
    
    return recommendations;
}

// Open chatbot for detailed recommendations
function openChatbotForRecommendations() {
    // Close the popup first
    closeAIRecommendationsPopup();
    
    // Open chatbot
    const chatbotContainer = document.getElementById('chatbotContainer');
    if (chatbotContainer) {
        chatbotContainer.click(); // This will open the chatbot
        
        // Add a message to the chatbot
        setTimeout(() => {
            const chatbotInput = document.getElementById('chatbotInput');
            if (chatbotInput) {
                chatbotInput.value = '';
                // Trigger the send button
                const chatbotSend = document.getElementById('chatbotSend');
                if (chatbotSend) {
                    chatbotSend.click();
                }
            }
        }, 500);
    }
}

// Enhanced Probability Distribution Functions
function initializeEnhancedProbabilityChart() {
    console.log('Initializing enhanced probability chart...');
    
    // Add interactive tooltips
    addChartTooltips();
    
    // Add legend click events
    addLegendInteractions();
    
    // Animate chart on load
    animateChart();
    
    // Update stats with animation
    updateProbabilityStats();
}

function addChartTooltips() {
    const chart = document.getElementById('enhancedProbabilityChart');
    const tooltip = document.getElementById('chartTooltip');
    
    if (!chart || !tooltip) return;
    
    const segments = [
        { start: 0, end: 144, type: 'overheating', percentage: 40, color: '#dc2626', name: 'Overheating' },
        { start: 144, end: 216, type: 'transformer', percentage: 20, color: '#ea580c', name: 'Transformer Failure' },
        { start: 216, end: 360, type: 'line-breakage', percentage: 40, color: '#2563eb', name: 'Line Breakage' }
    ];
    
    chart.addEventListener('mousemove', (e) => {
        const rect = chart.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const mouseX = e.clientX - centerX;
        const mouseY = e.clientY - centerY;
        const angle = Math.atan2(mouseY, mouseX) * 180 / Math.PI;
        const normalizedAngle = (angle + 360) % 360;
        
        let hoveredSegment = null;
        for (const segment of segments) {
            if (normalizedAngle >= segment.start && normalizedAngle < segment.end) {
                hoveredSegment = segment;
                break;
            }
        }
        
        if (hoveredSegment) {
            const distance = Math.sqrt(mouseX * mouseX + mouseY * mouseY);
            const maxRadius = rect.width / 2;
            
            if (distance <= maxRadius && distance >= maxRadius * 0.4) {
                tooltip.innerHTML = `
                    <strong>${hoveredSegment.name}</strong><br>
                    Probability: ${hoveredSegment.percentage}%<br>
                    Risk Level: ${getRiskLevel(hoveredSegment.type)}
                `;
                tooltip.style.left = e.clientX + 'px';
                tooltip.style.top = (e.clientY - 10) + 'px';
                tooltip.classList.add('show');
                
                // Add glow effect to chart
                chart.style.filter = `drop-shadow(0 0 12px ${hoveredSegment.color}30)`;
            } else {
                tooltip.classList.remove('show');
                chart.style.filter = '';
            }
        } else {
            tooltip.classList.remove('show');
            chart.style.filter = '';
        }
    });
    
    chart.addEventListener('mouseleave', () => {
        tooltip.classList.remove('show');
        chart.style.filter = '';
    });
}

function addLegendInteractions() {
    const legendItems = document.querySelectorAll('.legend-item');
    
    legendItems.forEach(item => {
        item.addEventListener('click', () => {
            const type = item.dataset.type;
            const percentage = item.dataset.percentage;
            
            // Highlight the legend item
            legendItems.forEach(l => l.classList.remove('active'));
            item.classList.add('active');
            
            // Show detailed information
            showFaultDetails(type, percentage);
            
            // Add pulse effect to chart
            const chart = document.getElementById('enhancedProbabilityChart');
            if (chart) {
                chart.style.animation = 'chartPulse 0.5s ease-in-out 3';
                setTimeout(() => {
                    chart.style.animation = 'chartPulse 3s ease-in-out infinite';
                }, 1500);
            }
        });
        
        item.addEventListener('mouseenter', () => {
            item.style.transform = 'translateY(-3px) scale(1.05)';
        });
        
        item.addEventListener('mouseleave', () => {
            if (!item.classList.contains('active')) {
                item.style.transform = 'translateY(0) scale(1)';
            }
        });
    });
}

function animateChart() {
    const chart = document.getElementById('enhancedProbabilityChart');
    if (!chart) return;
    
    // Add loading state
    chart.classList.add('loading');
    
    // Initial state
    chart.style.transform = 'scale(0) rotate(0deg)';
    chart.style.opacity = '0';
    
    // Animate in
    setTimeout(() => {
        chart.classList.remove('loading');
        chart.style.transition = 'all 1s ease-out';
        chart.style.transform = 'scale(1) rotate(360deg)';
        chart.style.opacity = '1';
    }, 800);
    
    // Animate legend items
    const legendItems = document.querySelectorAll('.legend-item');
    legendItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            item.style.transition = 'all 0.5s ease-out';
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, 1000 + (index * 100));
    });
    
    // Animate stat cards
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.6s ease-out';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 1500 + (index * 100));
    });
}

function updateProbabilityStats() {
    // Animate counter for stat values
    const statValues = document.querySelectorAll('.stat-value');
    
    statValues.forEach(stat => {
        const targetValue = parseInt(stat.textContent);
        let currentValue = 0;
        const increment = targetValue / 30; // 30 steps
        const timer = setInterval(() => {
            currentValue += increment;
            if (currentValue >= targetValue) {
                currentValue = targetValue;
                clearInterval(timer);
            }
            stat.textContent = Math.round(currentValue);
        }, 50);
    });
}

function getRiskLevel(type) {
    const riskLevels = {
        'overheating': 'High',
        'transformer': 'Medium',
        'line-breakage': 'High'
    };
    return riskLevels[type] || 'Unknown';
}

function showFaultDetails(type, percentage) {
    const details = {
        'overheating': {
            title: 'Overheating Fault',
            description: 'Equipment temperature exceeds safe operating limits',
            causes: ['Poor ventilation', 'Overloading', 'Loose connections', 'Ambient temperature'],
            prevention: ['Regular temperature monitoring', 'Adequate ventilation', 'Load management', 'Connection inspection']
        },
        'transformer': {
            title: 'Transformer Failure',
            description: 'Transformer component malfunction or degradation',
            causes: ['Insulation breakdown', 'Oil contamination', 'Overloading', 'Age-related wear'],
            prevention: ['Regular oil testing', 'Load monitoring', 'Insulation checks', 'Preventive maintenance']
        },
        'line-breakage': {
            title: 'Line Breakage',
            description: 'Electrical conductor damage or disconnection',
            causes: ['Mechanical stress', 'Environmental damage', 'Corrosion', 'Overcurrent'],
            prevention: ['Regular inspection', 'Environmental protection', 'Load monitoring', 'Corrosion prevention']
        }
    };
    
    const detail = details[type];
    if (detail) {
        showNotification(`${detail.title}: ${detail.description}`, 'info');
        console.log(`${detail.title} - ${percentage}% probability`);
        console.log('Causes:', detail.causes);
        console.log('Prevention:', detail.prevention);
    }
}

function updateEnhancedChartData(data) {
    // Update chart colors based on data
    const chart = document.getElementById('enhancedProbabilityChart');
    if (!chart) return;
    
    // Update legend percentages
    const legendItems = document.querySelectorAll('.legend-item');
    if (legendItems.length >= 3) {
        legendItems[0].querySelector('.legend-percentage').textContent = data.overheating + '%';
        legendItems[0].dataset.percentage = data.overheating;
        
        legendItems[1].querySelector('.legend-percentage').textContent = data.transformer + '%';
        legendItems[1].dataset.percentage = data.transformer;
        
        legendItems[2].querySelector('.legend-percentage').textContent = data.lineBreakage + '%';
        legendItems[2].dataset.percentage = data.lineBreakage;
    }
    
    // Update chart gradient
    const total = data.overheating + data.transformer + data.lineBreakage;
    const overheatingDeg = (data.overheating / total) * 360;
    const transformerDeg = (data.transformer / total) * 360;
    const lineBreakageDeg = (data.lineBreakage / total) * 360;
    
    chart.style.background = `conic-gradient(
        from 0deg,
        #dc2626 0deg ${overheatingDeg}deg,
        #ea580c ${overheatingDeg}deg ${overheatingDeg + transformerDeg}deg,
        #2563eb ${overheatingDeg + transformerDeg}deg 360deg
    )`;
    
    // Update center text
    const centerText = chart.querySelector('.chart-center-text p');
    if (centerText) {
        const maxRisk = Math.max(data.overheating, data.transformer, data.lineBreakage);
        const riskType = maxRisk === data.overheating ? 'Overheating' : 
                        maxRisk === data.transformer ? 'Transformer' : 'Line Breakage';
        centerText.textContent = `${riskType} Risk: ${maxRisk}%`;
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
    
    // Initialize PDF download when results are shown (only once)
    if (!pdfDownloadInitialized) {
        initializePdfDownload();
    }
    
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
    
    // Test Watson Assistant after delay
    setTimeout(() => {
        testWatsonAssistant();
    }, 5000);
    
    // Initialize gauge charts on page load (only if not already done)
    setTimeout(() => {
        if (!voltageGauge && !currentGauge && !temperatureGauge) {
            initializeGaugeCharts();
        }
    }, 1000);
    
    // Initialize PDF download functionality (only once)
    if (!pdfDownloadInitialized) {
        initializePdfDownload();
    }
    
    // Also try again after a delay in case the button isn't ready yet (only if not initialized)
    setTimeout(() => {
        if (!pdfDownloadInitialized) {
            initializePdfDownload();
        }
    }, 1000);
    
    
    
    // Test PDF libraries after a delay
    setTimeout(() => {
        testPdfLibraries();
    }, 2000);
    
    
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
let lastPdfClickTime = 0; // Track last click time to prevent rapid clicks
let pdfGenerationCount = 0; // Track how many PDFs have been generated


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

// Helper function to reset PDF download button state
function resetPdfButton() {
    const downloadBtn = document.getElementById('downloadPdfBtn');
    if (downloadBtn) {
        downloadBtn.disabled = false;
        downloadBtn.innerHTML = '<i class="fas fa-download"></i> Download PDF Report';
        console.log('PDF button state reset');
    }
}

// Single PDF Generation (Reliable)
function generateSinglePdf() {
    pdfGenerationCount++;
    console.log(`=== GENERATING SINGLE PDF (Attempt #${pdfGenerationCount}) ===`);
    
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

                // Reset flags and button state
                pdfDownloadInProgress = false;
                isGeneratingPdf = false;
                resetPdfButton();
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

        // Reset flags and button state
        pdfDownloadInProgress = false;
        isGeneratingPdf = false;
        resetPdfButton();
        console.log('Text file generation completed - flags reset');
        
    } catch (error) {
        console.error('PDF generation failed:', error);
        showNotification('PDF generation failed: ' + error.message, 'error');

        // Reset flags and button state on error
        pdfDownloadInProgress = false;
        isGeneratingPdf = false;
        resetPdfButton();
        console.log('PDF generation failed - flags reset');
    }
}



// Old PDF methods removed - using single method only

// Old PDF generation functions removed

// Old text download function removed

// Old blob download function removed

// Reset PDF download state (for debugging)
function resetPdfDownloadState() {
    console.log('Resetting PDF download state...');
    pdfDownloadInProgress = false;
    isGeneratingPdf = false;
    lastPdfClickTime = 0;
    pdfGenerationCount = 0;
    pdfDownloadInitialized = false;
    console.log('PDF download state reset');
}

// Make reset function available globally for debugging
window.resetPdfDownloadState = resetPdfDownloadState;

// Debug function to check PDF download state
function debugPdfDownload() {
    console.log('=== PDF DOWNLOAD DEBUG ===');
    console.log('pdfDownloadInitialized:', pdfDownloadInitialized);
    console.log('pdfDownloadInProgress:', pdfDownloadInProgress);
    console.log('isGeneratingPdf:', isGeneratingPdf);
    console.log('lastPdfClickTime:', lastPdfClickTime);
    console.log('Time since last click:', Date.now() - lastPdfClickTime);
    console.log('pdfGenerationCount:', pdfGenerationCount);
    
    const downloadBtn = document.getElementById('downloadPdfBtn');
    console.log('Download button found:', !!downloadBtn);
    
    if (downloadBtn) {
        console.log('Button disabled:', downloadBtn.disabled);
        console.log('Button innerHTML:', downloadBtn.innerHTML);
        
        // Check for multiple event listeners (this is tricky to detect)
        console.log('Button onclick:', downloadBtn.onclick);
        console.log('Button event listeners:', getEventListeners ? getEventListeners(downloadBtn) : 'getEventListeners not available');
    }
    
    console.log('=== DEBUG COMPLETE ===');
}

// Enhanced PDF download with better debugging
function enhancedPdfDownload() {
    console.log('=== ENHANCED PDF DOWNLOAD DEBUG ===');
    
    const downloadBtn = document.getElementById('downloadPdfBtn');
    if (!downloadBtn) {
        console.error('Download button not found!');
        return;
    }
    
    // Remove ALL existing event listeners by cloning the button
    const newBtn = downloadBtn.cloneNode(true);
    downloadBtn.parentNode.replaceChild(newBtn, downloadBtn);
    
    console.log('Button cloned and replaced to remove all event listeners');
    
    // Disable the button initially to prevent rapid clicks
    newBtn.disabled = true;
    
    // Add single event listener to new button
    newBtn.addEventListener('click', function(e) {
        console.log('=== PDF BUTTON CLICKED ===');
        e.preventDefault();
        e.stopPropagation();
        
        // Disable button immediately to prevent multiple clicks
        newBtn.disabled = true;
        newBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
        
        const currentTime = Date.now();
        console.log('Current time:', currentTime);
        console.log('Last click time:', lastPdfClickTime);
        console.log('Time difference:', currentTime - lastPdfClickTime);
        console.log('Current generation count:', pdfGenerationCount);
        
        // Prevent rapid successive clicks (debounce)
        if (currentTime - lastPdfClickTime < 3000) {
            console.log('PDF click too soon after last click, ignoring');
            showNotification('Please wait before downloading again...', 'info');
            // Re-enable button after delay
            setTimeout(() => {
                newBtn.disabled = false;
                newBtn.innerHTML = '<i class="fas fa-download"></i> Download PDF Report';
            }, 1000);
            return;
        }
        
        // Prevent multiple simultaneous downloads
        if (pdfDownloadInProgress) {
            console.log('PDF download already in progress, ignoring click');
            showNotification('PDF download already in progress...', 'info');
            // Re-enable button after delay
            setTimeout(() => {
                newBtn.disabled = false;
                newBtn.innerHTML = '<i class="fas fa-download"></i> Download PDF Report';
            }, 1000);
            return;
        }
        
        // Update last click time
        lastPdfClickTime = currentTime;
        
        console.log('Starting PDF generation...');
        showNotification('PDF generation started...', 'info');
        
        // Add a small delay to ensure the notification shows
        setTimeout(() => {
            console.log('Calling generateSinglePdf...');
            generateSinglePdf();
            // Button state is reset inside generateSinglePdf when complete
        }, 100);
    });
    
    console.log('Single event listener added to new button');

    // Enable the button now that setup is complete
    newBtn.disabled = false;
    console.log('Button enabled and ready for clicks');

    console.log('=== ENHANCED PDF DOWNLOAD SETUP COMPLETE ===');
}

// Make debug functions available globally
window.debugPdfDownload = debugPdfDownload;
window.enhancedPdfDownload = enhancedPdfDownload;

// Debug prediction functionality
function debugPrediction() {
    console.log('=== PREDICTION DEBUG ===');
    
    // Check DOM elements
    console.log('1. DOM Elements:');
    console.log('- form:', !!form);
    console.log('- resultsContainer:', !!resultsContainer);
    console.log('- loadingOverlay:', !!loadingOverlay);
    
    // Check form element directly
    const formElement = document.getElementById('predictionForm');
    console.log('- predictionForm element:', !!formElement);
    
    if (formElement) {
        console.log('- form action:', formElement.action);
        console.log('- form method:', formElement.method);
        console.log('- form children count:', formElement.children.length);
    }
    
    // Check form inputs
    console.log('2. Form Inputs:');
    const inputs = document.querySelectorAll('#predictionForm input');
    console.log('- input count:', inputs.length);
    inputs.forEach((input, index) => {
        console.log(`  Input ${index + 1}:`, input.name, input.type, input.value);
    });
    
    // Test form validation
    console.log('3. Form Validation:');
    try {
        const isValid = validateForm();
        console.log('- validateForm() result:', isValid);
    } catch (error) {
        console.error('- validateForm() error:', error);
    }
    
    // Test prediction function
    console.log('4. Prediction Function:');
    try {
        const testData = {
            voltage: 2200,
            current: 250,
            power_load: 550,
            temperature: 40,
            wind_speed: 25,
            duration_of_fault: 30,
            down_time: 15
        };
        const result = makeLocalPrediction(testData);
        console.log('- makeLocalPrediction() result:', result);
    } catch (error) {
        console.error('- makeLocalPrediction() error:', error);
    }
    
    // Check event listeners
    console.log('5. Event Listeners:');
    if (formElement) {
        console.log('- form has submit listener:', formElement.onsubmit !== null);
    }
    
    console.log('=== PREDICTION DEBUG COMPLETE ===');
}

// Test prediction with sample data
function testPrediction() {
    console.log('=== TESTING PREDICTION ===');
    
    // Create test data
    const testData = {
        voltage: 2200,
        current: 250,
        power_load: 550,
        temperature: 40,
        wind_speed: 25,
        duration_of_fault: 30,
        down_time: 15
    };
    
    console.log('Test data:', testData);
    
    try {
        // Test prediction
        const result = makeLocalPrediction(testData);
        console.log('Prediction result:', result);
        
        // Test display
        displayResults(result);
        console.log('Results displayed');
        
        // Show notification
        showNotification('Test prediction completed!', 'success');
        
    } catch (error) {
        console.error('Test prediction failed:', error);
        showNotification('Test prediction failed: ' + error.message, 'error');
    }
    
    console.log('=== TEST COMPLETE ===');
}

// Simulate form submission
function simulateFormSubmit() {
    console.log('=== SIMULATING FORM SUBMISSION ===');
    
    const formElement = document.getElementById('predictionForm');
    if (!formElement) {
        console.error('Form not found');
        return;
    }
    
    // Fill form with test data
    const testData = {
        voltage: '2200',
        current: '250',
        power_load: '550',
        temperature: '40',
        wind_speed: '25',
        duration_of_fault: '30',
        down_time: '15'
    };
    
    Object.keys(testData).forEach(key => {
        const input = formElement.querySelector(`[name="${key}"]`);
        if (input) {
            input.value = testData[key];
            console.log(`Set ${key} to ${testData[key]}`);
        } else {
            console.log(`Input ${key} not found`);
        }
    });
    
    // Trigger form submission
    console.log('Triggering form submission...');
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    formElement.dispatchEvent(submitEvent);
    
    console.log('=== FORM SUBMISSION SIMULATED ===');
}

// Make prediction debug functions available globally
window.debugPrediction = debugPrediction;
window.testPrediction = testPrediction;
window.simulateFormSubmit = simulateFormSubmit;

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
let pdfDownloadInitialized = false; // Flag to prevent multiple initializations

function initializePdfDownload() {
    console.log('Initializing PDF download...');
    const downloadBtn = document.getElementById('downloadPdfBtn');
    console.log('PDF button found:', !!downloadBtn);
    
    if (downloadBtn) {
        // Use enhanced PDF download to ensure clean state
        enhancedPdfDownload();
        pdfDownloadInitialized = true;
        console.log('PDF download initialized with enhanced method');
    } else {
        console.error('PDF download button not found!');
    }
}

// Separate function for PDF download handling
function handlePdfDownload(e) {
    console.log('PDF button clicked!');
    e.preventDefault();
    e.stopPropagation();
    
    const currentTime = Date.now();
    
    // Prevent rapid successive clicks (debounce)
    if (currentTime - lastPdfClickTime < 2000) {
        console.log('PDF click too soon after last click, ignoring');
        showNotification('Please wait before downloading again...', 'info');
        return;
    }
    
    // Prevent multiple simultaneous downloads
    if (pdfDownloadInProgress) {
        console.log('PDF download already in progress, ignoring click');
        showNotification('PDF download already in progress...', 'info');
        return;
    }
    
    // Update last click time
    lastPdfClickTime = currentTime;
    
    showNotification('PDF generation started...', 'info');
    
    // Add a small delay to ensure the notification shows
    setTimeout(() => {
        // Use single reliable PDF method
        generateSinglePdf();
    }, 100);
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

// Watson Assistant Configuration (loaded from config.js)
// Configuration is now loaded from static/config.js which reads from environment variables

// Watson Assistant session
let watsonSession = null;

// Send message to Watson Assistant
async function sendToWatsonAssistant(message) {
    try {
        console.log('Sending message to Watson:', message);
        console.log('Watson session:', watsonSession);
        
        if (!watsonSession) {
            throw new Error('Watson session not initialized');
        }

        const assistant = new window.WatsonAssistantV2({
            version: window.WATSON_CONFIG.version,
            authenticator: new window.IamAuthenticator({
                apikey: window.WATSON_CONFIG.apikey
            }),
            serviceUrl: window.WATSON_CONFIG.serviceUrl
        });

        console.log('Calling Watson message API...');
        const response = await assistant.message({
            assistantId: window.WATSON_CONFIG.assistantId,
            sessionId: watsonSession,
            input: {
                message_type: 'text',
                text: message
            }
        });

        console.log('Watson response received:', response);

        // Extract response text
        const output = response.result.output;
        if (output.generic && output.generic.length > 0) {
            const responseText = output.generic[0].text;
            console.log('Watson response text:', responseText);
            return responseText;
        } else {
            console.log('No generic response, using fallback');
            return "I understand your message. How can I help you with electrical fault prevention?";
        }
    } catch (error) {
        console.error('Watson Assistant error:', error);
        console.error('Error details:', error.message);
        throw error;
    }
}

// Initialize Watson Assistant
async function initializeWatsonAssistant() {
    try {
        console.log('Initializing Watson Assistant...');
        console.log('Watson SDK available:', typeof window.WatsonAssistantV2 !== 'undefined');
        console.log('IamAuthenticator available:', typeof window.IamAuthenticator !== 'undefined');
        console.log('Watson Config:', window.WATSON_CONFIG);
        
        // Wait a bit for SDK to load if not immediately available
        if (typeof window.WatsonAssistantV2 === 'undefined' || typeof window.IamAuthenticator === 'undefined') {
            console.log('Watson SDK not loaded yet, waiting...');
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            if (typeof window.WatsonAssistantV2 === 'undefined' || typeof window.IamAuthenticator === 'undefined') {
                console.error('Watson Assistant SDK failed to load after waiting');
                console.log('WatsonAssistantV2:', typeof window.WatsonAssistantV2);
                console.log('IamAuthenticator:', typeof window.IamAuthenticator);
                return false;
            }
        }
        
        console.log('Creating Watson Assistant instance...');
        const assistant = new window.WatsonAssistantV2({
            version: window.WATSON_CONFIG.version,
            authenticator: new window.IamAuthenticator({
                apikey: window.WATSON_CONFIG.apikey
            }),
            serviceUrl: window.WATSON_CONFIG.serviceUrl
        });
        
        console.log('Creating Watson session...');
        // Create session
        const sessionResponse = await assistant.createSession({
            assistantId: window.WATSON_CONFIG.assistantId
        });
        
        watsonSession = sessionResponse.result.session_id;
        console.log('Watson Assistant initialized successfully with session:', watsonSession);
        return true;
    } catch (error) {
        console.error('Failed to initialize Watson Assistant:', error);
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
        return false;
    }
}

// Initialize Chatbot
function initializeChatbot() {
    const chatbotToggle = document.getElementById('chatbotToggle');
    const chatbotContainer = document.getElementById('chatbotContainer');
    const chatbotWindow = document.getElementById('chatbotWindow');
    const chatbotInput = document.getElementById('chatbotInput');
    const chatbotSend = document.getElementById('chatbotSend');

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
    
    // Initialize Watson Assistant in background
    initializeWatsonAssistant().then(success => {
        console.log('Watson initialization result:', success);
        // Don't add duplicate welcome messages - HTML already has one
    }).catch(error => {
        console.error('Watson initialization failed:', error);
        // Don't add duplicate welcome messages - HTML already has one
    });
    
    // Click handler for the container (only when collapsed)
    console.log('Attaching chatbot container click listener');
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

    // Send message to Watson Assistant
    async function sendMessage() {
        const message = chatbotInput.value.trim();
        if (!message) return;

        addMessage(message, 'user');
        chatbotInput.value = '';
        
        // Show typing indicator
        showTypingIndicator();

        try {
            console.log('Attempting to send message to Watson...');
            console.log('Watson session available:', !!watsonSession);
            console.log('Watson SDK available:', typeof window.WatsonAssistantV2 !== 'undefined');
            
            let response;
            if (watsonSession && typeof window.WatsonAssistantV2 !== 'undefined') {
                // Use Watson Assistant
                console.log('Using Watson Assistant for response...');
                response = await sendToWatsonAssistant(message);
                console.log('Received Watson response:', response);
            } else {
                console.log('Watson not available, using fallback AI...');
                console.log('Calling generateAIResponse with message:', message);
                // Fallback to local AI
                hideTypingIndicator();
                generateAIResponse(message);
                return;
            }
            
            hideTypingIndicator();
            addMessage(response, 'bot');
        } catch (error) {
            hideTypingIndicator();
            console.error('Error sending message to Watson:', error);
            console.error('Error details:', error.message);
            console.log('Falling back to local AI response...');
            // Fallback response
            generateAIResponse(message);
        }
    }

    // Event listeners
    if (chatbotSend) {
        console.log('Attaching send button event listener');
        chatbotSend.addEventListener('click', (e) => {
            e.stopPropagation();
            console.log('Send button clicked');
            sendMessage();
        });
    } else {
        console.error('Chatbot send button not found');
    }
    
    if (chatbotInput) {
        console.log('Attaching input field event listeners');
        chatbotInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.stopPropagation();
                console.log('Enter key pressed in input');
                sendMessage();
            }
        });
        
        // Prevent clicks on input from closing chatbot
        chatbotInput.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    } else {
        console.error('Chatbot input field not found');
    }

    
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

// Format bot message content
function formatBotMessage(content) {
    console.log('formatBotMessage called with:', content);
    if (!content) {
        console.log('Empty content, returning empty string');
        return '';
    }
    
    let formatted = content
        // Convert **bold** to <strong>bold</strong>
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        // Convert *italic* to <em>italic</em>
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        // Convert line breaks to <br>
        .replace(/\n/g, '<br>')
        // Convert bullet points to proper HTML
        .replace(/^•\s*(.*)$/gm, '<li>$1</li>')
        // Wrap consecutive list items in <ul>
        .replace(/(<li>.*<\/li>)(<br>)*(<li>.*<\/li>)/g, function(match, p1, p2, p3) {
            return '<ul>' + p1.replace(/<br>/g, '') + p2 + p3.replace(/<br>/g, '') + '</ul>';
        })
        // Handle numbered lists
        .replace(/^(\d+)\.\s*(.*)$/gm, '<li class="numbered">$1. $2</li>')
        // Convert emojis to proper display
        .replace(/🛡️/g, '<span class="emoji">🛡️</span>')
        .replace(/🔧/g, '<span class="emoji">🔧</span>')
        .replace(/🚨/g, '<span class="emoji">🚨</span>')
        .replace(/📊/g, '<span class="emoji">📊</span>')
        .replace(/⚡/g, '<span class="emoji">⚡</span>')
        .replace(/🤖/g, '<span class="emoji">🤖</span>')
        .replace(/👋/g, '<span class="emoji">👋</span>')
        .replace(/😊/g, '<span class="emoji">😊</span>')
        .replace(/🤗/g, '<span class="emoji">🤗</span>')
        .replace(/🤔/g, '<span class="emoji">🤔</span>')
        .replace(/📚/g, '<span class="emoji">📚</span>')
        .replace(/💼/g, '<span class="emoji">💼</span>')
        .replace(/🕐/g, '<span class="emoji">🕐</span>')
        .replace(/📅/g, '<span class="emoji">📅</span>')
        .replace(/🌤️/g, '<span class="emoji">🌤️</span>')
        .replace(/⚠️/g, '<span class="emoji">⚠️</span>')
        .replace(/✅/g, '<span class="emoji">✅</span>')
        .replace(/❌/g, '<span class="emoji">❌</span>')
        // Clean up extra line breaks
        .replace(/<br><br><br>/g, '<br><br>')
        .replace(/<br><ul>/g, '<ul>')
        .replace(/<\/ul><br>/g, '</ul>');
    
    console.log('formatBotMessage result:', formatted);
    return formatted;
}

// Add message to chat
function addMessage(content, sender) {
    try {
        console.log('addMessage called with:', { content, sender });
        const messagesContainer = document.getElementById('chatbotMessages');
        if (!messagesContainer) {
            console.log('chatbotMessages container not found');
            return;
        }
        console.log('Adding message to chat:', content);

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.innerHTML = sender === 'bot' ? '<i class="fas fa-robot"></i>' : '<i class="fas fa-user"></i>';

    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    const messageText = document.createElement('div');
    messageText.className = 'message-text';
    
    // Format the content with proper HTML rendering
    if (sender === 'bot') {
        console.log('Formatting bot message:', content);
        const formatted = formatBotMessage(content);
        console.log('Formatted message:', formatted);
        messageText.innerHTML = formatted;
    } else {
        console.log('Adding user message:', content);
        messageText.textContent = content;
    }
    
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
    
    } catch (error) {
        console.error('Error in addMessage:', error);
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
        
        // Show error message in a simple way
        const messagesContainer = document.getElementById('chatbotMessages');
        if (messagesContainer) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'message bot-message';
            errorDiv.innerHTML = '<div class="message-content">Error displaying message. Please try again.</div>';
            messagesContainer.appendChild(errorDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }
}

// Show typing indicator
function showTypingIndicator() {
    const messagesContainer = document.getElementById('chatbotMessages');
    if (!messagesContainer) return;

    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot-message typing-indicator';
    typingDiv.id = 'typingIndicator';

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.innerHTML = '<i class="fas fa-robot"></i>';

    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    const typingText = document.createElement('div');
    typingText.className = 'typing-dots';
    typingText.innerHTML = '<span></span><span></span><span></span>';

    messageContent.appendChild(typingText);
    typingDiv.appendChild(avatar);
    typingDiv.appendChild(messageContent);
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Hide typing indicator
function hideTypingIndicator() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// Test Watson Assistant
async function testWatsonAssistant() {
    console.log('=== TESTING WATSON ASSISTANT ===');
    console.log('Watson SDK loaded:', typeof window.WatsonAssistantV2 !== 'undefined');
    console.log('IamAuthenticator loaded:', typeof window.IamAuthenticator !== 'undefined');
    console.log('Watson session:', watsonSession);

    if (watsonSession) {
        try {
            console.log('Testing Watson message...');
            const testResponse = await sendToWatsonAssistant('Hello, can you help me with electrical safety?');
            console.log('Watson test response:', testResponse);
        } catch (error) {
            console.error('Watson test failed:', error);
        }
    } else {
        console.log('Watson session not available for testing');
    }
}

// Test fallback AI
function testFallbackAI() {
    console.log('=== TESTING FALLBACK AI ===');
    console.log('Testing generateAIResponse function...');
    generateAIResponse('hi');
}

// Simple test function
function testChatbot() {
    console.log('=== TESTING CHATBOT ===');
    
    // Check if DOM elements exist
    console.log('1. Checking DOM elements:');
    console.log('- chatbotContainer:', !!document.getElementById('chatbotContainer'));
    console.log('- chatbotMessages:', !!document.getElementById('chatbotMessages'));
    console.log('- chatbotInput:', !!document.getElementById('chatbotInput'));
    console.log('- chatbotSend:', !!document.getElementById('chatbotSend'));
    
    // Check if greetingKeywords is defined
    console.log('2. Testing greetingKeywords:', typeof greetingKeywords !== 'undefined' ? greetingKeywords : 'UNDEFINED');
    
    if (typeof greetingKeywords !== 'undefined') {
        console.log('3. Testing message "good morning":');
        const testMessage = 'good morning';
        const testMessageLower = testMessage.toLowerCase();
        console.log('4. Message to lowercase:', testMessageLower);
        console.log('5. Checking if message includes greeting keywords...');
        
        const hasGreeting = greetingKeywords.some(keyword => testMessageLower.includes(keyword));
        console.log('6. Has greeting keyword?', hasGreeting);
        
        if (hasGreeting) {
            console.log('7. Should match greeting pattern');
            generateAIResponse(testMessage);
        } else {
            console.log('7. No greeting pattern matched');
        }
    } else {
        console.log('3. greetingKeywords not defined - chatbot may not be initialized');
    }
    
    // Test addMessage directly
    console.log('8. Testing addMessage function:');
    addMessage('Test message from console', 'bot');
}

// Make test functions globally available
window.testFallbackAI = testFallbackAI;
window.testWatsonAssistant = testWatsonAssistant;
window.testChatbot = testChatbot;


// Generate AI response
function generateAIResponse(userMessage) {
    try {
        console.log('generateAIResponse called with:', userMessage);
        
        // Handle empty or invalid messages
        if (!userMessage || typeof userMessage !== 'string' || userMessage.trim().length === 0) {
            console.log('Empty or invalid message received');
            showTypingIndicator();
            setTimeout(() => {
                hideTypingIndicator();
                addMessage("I didn't receive a clear message. Could you please rephrase your question?", 'bot');
            }, 1000);
            return;
        }
    
    const message = userMessage.toLowerCase().trim();
    const cleanMessage = message.replace(/\s+/g, ''); // Remove all spaces for better matching
    
    // Enhanced keywords for different topics
    const preventionKeywords = ['prevent', 'avoid', 'prevention', 'safety', 'protect', 'secure', 'shield', 'safe', 'protection', 'precaution', 'reduce', 'minimize', 'decrease'];
    const maintenanceKeywords = ['maintain', 'maintenance', 'repair', 'fix', 'service', 'check', 'inspect', 'upkeep', 'servicing', 'repairing', 'calibrate', 'clean', 'lubricate'];
    const emergencyKeywords = ['emergency', 'urgent', 'danger', 'hazard', 'accident', 'critical', 'alarm', 'crisis', 'disaster', 'malfunction', 'fire', 'explosion'];
    const analysisKeywords = ['analyze', 'analysis', 'data', 'parameters', 'values', 'monitor', 'check', 'examine', 'review', 'assess', 'evaluate', 'measure', 'test'];
    const generalKeywords = ['hello', 'hi', 'help', 'what', 'how', 'why', 'explain', 'tell', 'ask', 'question', 'information', 'know'];
    const faultKeywords = ['fault', 'error', 'problem', 'issue', 'failure', 'breakdown', 'malfunction', 'defect', 'glitch', 'bug', 'leakage', 'leak'];
    const greetingKeywords = ['good morning', 'good afternoon', 'good evening', 'good night', 'morning', 'afternoon', 'evening', 'night', 'hello', 'hi', 'hey', 'greetings', 'good day', 'howdy'];
    const timeKeywords = ['time', 'clock', 'date', 'today', 'now', 'current', 'what time', 'what date'];
    const weatherKeywords = ['weather', 'temperature', 'rain', 'sunny', 'cloudy', 'storm', 'wind', 'hot', 'cold'];
    const technicalKeywords = ['voltage', 'current', 'power', 'electric', 'electrical', 'circuit', 'wiring', 'transformer', 'generator', 'load', 'frequency', 'insulation', 'grounding', 'resistance'];
    const leakageKeywords = ['leakage', 'leak', 'ground fault', 'insulation', 'isolation', 'leakage current', 'earth fault', 'grounding'];
    
    // General knowledge categories for ChatGPT-like responses
    const technologyKeywords = ['technology', 'computer', 'software', 'programming', 'coding', 'ai', 'artificial intelligence', 'machine learning', 'data science', 'internet', 'website', 'app', 'mobile', 'phone'];
    const scienceKeywords = ['science', 'physics', 'chemistry', 'biology', 'mathematics', 'math', 'research', 'experiment', 'theory', 'hypothesis', 'discovery', 'innovation'];
    const healthKeywords = ['health', 'medical', 'medicine', 'doctor', 'hospital', 'treatment', 'disease', 'symptoms', 'cure', 'therapy', 'wellness', 'fitness', 'exercise', 'diet', 'nutrition'];
    const educationKeywords = ['education', 'school', 'university', 'college', 'student', 'teacher', 'learning', 'study', 'course', 'degree', 'academic', 'research', 'knowledge', 'skill'];
    const businessKeywords = ['business', 'company', 'management', 'marketing', 'finance', 'economy', 'investment', 'stock', 'market', 'entrepreneur', 'startup', 'career', 'job', 'work'];
    const entertainmentKeywords = ['movie', 'film', 'music', 'game', 'sport', 'book', 'novel', 'art', 'culture', 'entertainment', 'fun', 'hobby', 'travel', 'vacation'];
    const foodKeywords = ['food', 'cooking', 'recipe', 'restaurant', 'meal', 'drink', 'coffee', 'tea', 'wine', 'beer', 'dessert', 'cuisine', 'ingredient'];
    const lifestyleKeywords = ['lifestyle', 'home', 'family', 'relationship', 'marriage', 'friendship', 'social', 'community', 'environment', 'sustainability', 'climate', 'nature', 'animal'];
    
    let response = '';
    let responseGenerated = false;
    
    // Determine response based on keywords - check greetings first
    if (greetingKeywords.some(keyword => message.includes(keyword))) {
        const timeOfDay = new Date().getHours();
        let greeting = 'Hello';
        
        if (timeOfDay < 12) {
            greeting = 'Good morning';
        } else if (timeOfDay < 17) {
            greeting = 'Good afternoon';
        } else if (timeOfDay < 21) {
            greeting = 'Good evening';
        } else {
            greeting = 'Good evening';
        }
        
        response = `${greeting}! 👋 I'm your AI assistant. I'm here to help you with electrical fault prevention and safety guidance, but I can also chat about general topics. What would you like to discuss today?`;
        console.log('Matched greeting pattern, response:', response);
        responseGenerated = true;
    } else if (timeKeywords.some(keyword => cleanMessage.includes(keyword.replace(/\s+/g, '')))) {
        const now = new Date();
        const timeString = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        const dateString = now.toLocaleDateString();
        
        if (cleanMessage.includes('whattime') || cleanMessage.includes('whattimeisit') || cleanMessage.includes('whattimeis')) {
            response = `🕐 The current time is ${timeString}. Is there anything else you'd like to know about electrical safety or other topics?`;
        } else if (cleanMessage.includes('whatdate') || cleanMessage.includes('whatdateisit') || cleanMessage.includes('whatdateis')) {
            response = `📅 Today's date is ${dateString}. How can I help you with electrical fault prevention or other questions today?`;
        } else {
            response = `🕐 Current time: ${timeString}\n📅 Today's date: ${dateString}\n\nIs there anything specific about electrical safety I can help you with?`;
        }
        console.log('Matched time/date pattern, response:', response);
        responseGenerated = true;
    } else if (weatherKeywords.some(keyword => message.includes(keyword))) {
        response = `🌤️ I understand you're asking about weather conditions. While I specialize in electrical fault prevention, I can tell you that weather conditions significantly impact electrical systems:

**Weather Impact on Electrical Systems:**
• **High Temperature**: Can cause overheating and thermal stress
• **Rain/Moisture**: Increases corrosion and insulation breakdown risk
• **Wind**: Can cause mechanical stress on power lines
• **Storms**: Create electromagnetic interference and physical damage

**Protective Measures:**
• Regular weather monitoring
• Enhanced insulation for wet conditions
• Temperature sensors for overheating prevention
• Storm surge protection systems

Would you like specific guidance on weather-related electrical safety measures?`;
        console.log('Matched weather pattern, response:', response);
        responseGenerated = true;
    } else if (leakageKeywords.some(keyword => message.includes(keyword))) {
        response = `⚡ **Electrical Leakage Reduction Guide:**

**Understanding Electrical Leakage:**
• **Leakage Current**: Unwanted current flow through insulation or to ground
• **Ground Fault**: Current leaking to earth instead of returning through neutral
• **Insulation Breakdown**: Deterioration allowing current leakage paths

**Causes of Electrical Leakage:**
• **Poor Insulation**: Damaged or degraded insulating materials
• **Moisture Ingress**: Water contamination in electrical systems
• **Aging Equipment**: Deterioration over time
• **Poor Installation**: Incorrect wiring or connections
• **Environmental Factors**: Humidity, temperature, contamination

**Methods to Reduce Electrical Leakage:**

**1. Insulation Improvements:**
• Replace damaged insulation immediately
• Use high-quality insulating materials
• Ensure proper insulation thickness
• Apply protective coatings where needed

**2. Environmental Control:**
• Maintain dry conditions (humidity < 60%)
• Control temperature (15-35°C optimal)
• Prevent moisture ingress
• Use sealed enclosures for outdoor equipment

**3. Grounding & Bonding:**
• Install proper grounding systems
• Ensure equipment bonding continuity
• Use ground fault circuit interrupters (GFCIs)
• Test ground resistance regularly (should be < 1Ω)

**4. Preventive Measures:**
• Regular insulation resistance testing (IR tests)
• Thermal imaging surveys
• Moisture detection systems
• Routine maintenance schedules

**5. Monitoring & Detection:**
• Install ground fault monitors
• Use leakage current relays
• Implement continuous monitoring systems
• Regular electrical safety inspections

**Testing Procedures:**
• **Insulation Resistance Test**: Should be > 1MΩ
• **Ground Fault Testing**: Verify GFCI operation
• **Leakage Current Measurement**: Monitor continuously
• **Polarization Index**: Ratio of 10-minute to 1-minute IR readings

**Safety Considerations:**
• Always de-energize equipment before testing
• Use proper test equipment and procedures
• Follow lockout/tagout protocols
• Consult qualified electricians for complex issues

Need specific guidance for your electrical system?`;
        console.log('Matched leakage pattern, response:', response);
        responseGenerated = true;
    } else if (technicalKeywords.some(keyword => message.includes(keyword))) {
        response = `⚡ **Electrical System Guidance**

**Key Electrical Parameters:**
• **Voltage**: Critical for proper equipment operation
• **Current**: Indicates load levels and potential issues
• **Power**: Shows system capacity utilization
• **Frequency**: Affects motor and transformer performance

**Safety Considerations:**
• Always follow proper lockout/tagout procedures
• Use appropriate personal protective equipment
• Regular testing and calibration of instruments
• Maintain proper documentation of all measurements

**Common Issues:**
• Voltage fluctuations can damage equipment
• Overcurrent conditions indicate potential faults
• Power factor problems affect efficiency
• Frequency variations impact motor performance

Would you like specific guidance on any particular electrical parameter or safety procedure?`;
        console.log('Matched technical pattern, response:', response);
        responseGenerated = true;
    } else if (preventionKeywords.some(keyword => message.includes(keyword))) {
        response = `🛡️ **Comprehensive Electrical Prevention Guide:**

**Core Prevention Strategies:**

**1. System Monitoring & Inspection:**
• **Regular Parameter Checks**: Voltage, current, temperature every 4 hours
• **Visual Inspections**: Daily equipment condition assessment
• **Thermal Imaging**: Monthly hot spot detection surveys
• **Insulation Testing**: Quarterly IR measurements (>1MΩ required)
• **Ground Resistance**: Annual testing (<1Ω recommended)

**2. Environmental Control:**
• **Temperature Management**: Maintain 15-35°C optimal range
• **Humidity Control**: Keep below 60% to prevent condensation
• **Ventilation**: Ensure adequate airflow for heat dissipation
• **Clean Environment**: Prevent dust and contamination buildup
• **Moisture Protection**: Use sealed enclosures for outdoor equipment

**3. Load Management:**
• **Capacity Limits**: Never exceed 80% of rated capacity
• **Load Distribution**: Balance loads across all phases
• **Power Factor**: Maintain above 0.85 for efficiency
• **Harmonic Control**: Use filters to reduce harmonic distortion
• **Peak Demand**: Monitor and manage peak power consumption

**4. Protection Systems:**
• **Circuit Breakers**: Install appropriate overcurrent protection
• **GFCIs**: Ground fault circuit interrupters for safety
• **Surge Protection**: Install SPDs to prevent voltage spikes
• **Arc Fault Protection**: AFCI devices for fire prevention
• **Emergency Shutdown**: Quick disconnect systems

**5. Grounding & Bonding:**
• **Equipment Grounding**: Connect all metal parts to ground
• **System Grounding**: Proper neutral grounding configuration
• **Bonding Jumpers**: Ensure continuity between bonded parts
• **Ground Electrodes**: Multiple grounding paths for reliability
• **Ground Fault Monitoring**: Continuous leakage current detection

**6. Maintenance Programs:**
• **Preventive Maintenance**: Scheduled equipment servicing
• **Predictive Maintenance**: Condition-based maintenance strategies
• **Corrective Maintenance**: Immediate repair of identified issues
• **Documentation**: Detailed maintenance logs and records
• **Spare Parts**: Maintain critical component inventory

**7. Training & Safety:**
• **Safety Training**: Regular electrical safety education
• **Emergency Procedures**: Clear fault response protocols
• **Lockout/Tagout**: Proper energy isolation procedures
• **PPE Requirements**: Appropriate personal protective equipment
• **Qualified Personnel**: Certified electricians for complex work

**8. Technology & Automation:**
• **Smart Monitoring**: IoT sensors for continuous monitoring
• **Predictive Analytics**: AI-powered fault prediction
• **Remote Monitoring**: 24/7 system surveillance
• **Automated Alerts**: Immediate notification of anomalies
• **Data Analytics**: Trend analysis for proactive maintenance

**Implementation Priority:**
1. **Immediate**: Fix any existing safety hazards
2. **Short-term**: Implement basic monitoring and protection
3. **Medium-term**: Establish comprehensive maintenance programs
4. **Long-term**: Deploy advanced monitoring and automation

Need specific guidance for implementing these prevention measures?`;
        console.log('Matched prevention pattern, response:', response);
        responseGenerated = true;
    } else if (maintenanceKeywords.some(keyword => message.includes(keyword))) {
        response = `🔧 **Comprehensive Electrical Maintenance Guide:**

**Maintenance Categories & Schedules:**

**1. Daily Maintenance (Visual Inspections):**
• **Equipment Condition**: Look for physical damage, corrosion, or wear
• **Temperature Check**: Feel for excessive heat on equipment surfaces
• **Sound Monitoring**: Listen for unusual noises, humming, or buzzing
• **Smell Detection**: Check for burning odors or chemical smells
• **Connection Tightness**: Verify all connections are secure
• **Environmental Conditions**: Monitor temperature, humidity, and cleanliness

**2. Weekly Maintenance Tasks:**
• **Contact Cleaning**: Clean electrical contacts and terminals
• **Insulation Inspection**: Check for cracks, cuts, or degradation
• **Grounding Verification**: Ensure ground connections are intact
• **Protective Device Testing**: Test circuit breakers and fuses
• **Load Monitoring**: Check current levels and power consumption
• **Documentation**: Record all observations and measurements

**3. Monthly Maintenance Procedures:**
• **Insulation Resistance Testing**: Measure IR values (>1MΩ required)
• **Thermal Imaging**: Scan for hot spots using infrared cameras
• **Electrical Measurements**: Voltage, current, power factor analysis
• **Mechanical Inspection**: Check moving parts, bearings, and mechanisms
• **Safety System Testing**: Verify emergency shutdown systems
• **Environmental Control**: Clean filters, check ventilation systems

**4. Quarterly Maintenance Activities:**
• **Comprehensive Testing**: Full electrical system evaluation
• **Calibration**: Verify accuracy of measuring instruments
• **Protective Device Coordination**: Test and adjust protection settings
• **Ground Resistance Testing**: Measure earth resistance (<1Ω target)
• **Harmonic Analysis**: Check for power quality issues
• **Load Analysis**: Evaluate system loading and capacity utilization

**5. Annual Maintenance Programs:**
• **Complete System Overhaul**: Comprehensive equipment inspection
• **Component Replacement**: Replace aging or worn components
• **System Upgrades**: Implement technology improvements
• **Training Updates**: Refresh staff knowledge and certifications
• **Documentation Review**: Update maintenance procedures and records
• **Compliance Audit**: Ensure adherence to safety standards

**Critical Maintenance Tasks by Equipment Type:**

**Transformers:**
• Oil sampling and analysis (quarterly)
• Winding resistance testing (annually)
• Tap changer inspection and maintenance
• Cooling system cleaning and testing
• Bushing condition assessment

**Circuit Breakers:**
• Contact resistance measurement
• Operating mechanism lubrication
• Arc chute inspection and cleaning
• Trip unit calibration and testing
• Insulation resistance verification

**Motors:**
• Bearing lubrication and replacement
• Winding insulation testing
• Air gap measurement and adjustment
• Vibration analysis and correction
• Cooling system maintenance

**Cables:**
• Insulation resistance testing
• Partial discharge measurement
• Thermal imaging surveys
• Mechanical protection inspection
• Termination point maintenance

**Switchgear:**
• Bus bar connection inspection
• Insulator cleaning and testing
• Protection relay calibration
• Interlock mechanism verification
• Arc flash hazard assessment

**Maintenance Tools & Equipment:**
• **Test Equipment**: Multimeters, clamp meters, insulation testers
• **Safety Equipment**: Lockout/tagout devices, PPE, safety barriers
• **Cleaning Supplies**: Contact cleaners, degreasers, protective coatings
• **Documentation**: Maintenance logs, test reports, procedure manuals
• **Spare Parts**: Critical components for immediate replacement

**Warning Signs Requiring Immediate Attention:**
• **Temperature**: Equipment running hotter than normal
• **Electrical**: Voltage fluctuations, current spikes, power quality issues
• **Mechanical**: Vibration, noise, binding, or rough operation
• **Physical**: Discoloration, corrosion, cracks, or damage
• **Environmental**: Moisture, contamination, or excessive dust
• **Performance**: Reduced efficiency, increased energy consumption

**Maintenance Best Practices:**
• **Safety First**: Always follow lockout/tagout procedures
• **Documentation**: Maintain detailed records of all maintenance activities
• **Qualified Personnel**: Use certified electricians for complex tasks
• **Proper Tools**: Use appropriate test equipment and safety devices
• **Regular Scheduling**: Follow manufacturer recommendations and industry standards
• **Continuous Improvement**: Update procedures based on experience and new technology

Need specific maintenance guidance for your equipment type?`;
        console.log('Matched maintenance pattern, response:', response);
        responseGenerated = true;
    } else if (emergencyKeywords.some(keyword => message.includes(keyword))) {
        response = `🚨 **Comprehensive Emergency Response Protocol:**

**IMMEDIATE EMERGENCY ACTIONS (First 5 Minutes):**

**1. Personal Safety (Priority #1):**
• **STOP** - Do not touch anything electrical
• **STEP BACK** - Move to a safe distance (minimum 10 feet)
• **ASSESS** - Look for immediate hazards (fire, smoke, sparks)
• **CALL** - Dial emergency services immediately (911/Fire Department)
• **EVACUATE** - Clear all personnel from the affected area

**2. Power Isolation:**
• **Main Disconnect**: Turn off main electrical supply if safe to do so
• **Circuit Breakers**: Trip affected circuit breakers
• **Emergency Stop**: Activate emergency shutdown systems
• **Lockout/Tagout**: Secure all energy sources
• **Verify De-energization**: Use proper test equipment to confirm power is off

**3. Fire Emergency Response:**
• **Fire Extinguisher**: Use Class C (electrical) fire extinguisher only
• **Never Use Water**: Water conducts electricity and can cause electrocution
• **Evacuation Routes**: Follow established evacuation procedures
• **Assembly Point**: Gather at designated safe location
• **Head Count**: Ensure all personnel are accounted for

**SHORT-TERM RESPONSE (5-30 Minutes):**

**4. Communication & Notification:**
• **Emergency Services**: Call 911 and provide detailed information
• **Management**: Notify supervisors and safety personnel
• **Electrical Utility**: Contact power company if needed
• **Contractors**: Call qualified electrical contractors
• **Insurance**: Notify insurance company of incident

**5. Incident Documentation:**
• **Time & Date**: Record exact time of incident
• **Location**: Document specific equipment and area affected
• **Witnesses**: Collect names and contact information
• **Photos**: Take pictures (from safe distance) if possible
• **Initial Assessment**: Document what was observed

**6. Safety Perimeter:**
• **Barricade Area**: Set up safety barriers and warning signs
• **Restrict Access**: Prevent unauthorized personnel entry
• **Ventilation**: Ensure adequate ventilation if smoke present
• **Lighting**: Provide emergency lighting if power is out

**MEDIUM-TERM RESPONSE (30 Minutes - 2 Hours):**

**7. Qualified Personnel:**
• **Licensed Electrician**: Have certified electrician assess situation
• **Safety Inspector**: Request safety department inspection
• **Equipment Manufacturer**: Contact for technical support
• **Insurance Adjuster**: Coordinate with insurance representative

**8. System Assessment:**
• **Damage Evaluation**: Determine extent of electrical system damage
• **Safety Inspection**: Check for hidden hazards or damage
• **Equipment Testing**: Test unaffected systems for safety
• **Temporary Power**: Arrange temporary power if critical systems affected

**POST-EMERGENCY RECOVERY (2+ Hours):**

**9. Investigation & Analysis:**
• **Root Cause Analysis**: Determine what caused the emergency
• **Failure Analysis**: Examine failed components and systems
• **Documentation**: Complete detailed incident report
• **Regulatory Compliance**: Ensure all reporting requirements met

**10. System Restoration:**
• **Safety Clearance**: Obtain clearance from qualified electrician
• **Repair Work**: Perform necessary repairs and replacements
• **Testing & Commissioning**: Test all systems before restoration
• **Gradual Restoration**: Restore power in stages with monitoring

**11. Prevention Measures:**
• **Immediate Fixes**: Address immediate safety hazards
• **System Improvements**: Implement upgrades to prevent recurrence
• **Training Updates**: Provide additional safety training
• **Procedure Updates**: Revise emergency procedures based on lessons learned

**EMERGENCY CONTACTS & RESOURCES:**

**Emergency Services:**
• **Fire Department**: 911
• **Medical Emergency**: 911
• **Poison Control**: 1-800-222-1222
• **Electrical Utility**: [Local utility emergency number]

**Professional Services:**
• **Licensed Electrician**: [Emergency contact]
• **Electrical Contractor**: [24/7 service number]
• **Safety Consultant**: [Contact information]
• **Insurance Company**: [Claims hotline]

**INTERNAL CONTACTS:**
• **Safety Manager**: [Contact information]
• **Facilities Manager**: [Contact information]
• **Management**: [Emergency contact list]
• **Maintenance Team**: [On-call personnel]

**CRITICAL SAFETY REMINDERS:**
• **NEVER** touch electrical equipment during an emergency
• **ALWAYS** assume electrical equipment is energized
• **USE** appropriate personal protective equipment (PPE)
• **FOLLOW** established emergency procedures
• **COORDINATE** with qualified professionals
• **DOCUMENT** everything for insurance and regulatory purposes

**Remember: Human safety is always the top priority. Equipment can be replaced, but lives cannot.**

Is this an active emergency requiring immediate response?`;
        console.log('Matched emergency pattern, response:', response);
        responseGenerated = true;
    } else if (analysisKeywords.some(keyword => message.includes(keyword))) {
        if (currentFormData) {
            response = analyzeUserData(currentFormData);
        } else {
            response = `📊 **Data Analysis Ready!** 

I can provide detailed analysis once you submit system parameters. Please run a fault prediction first, then I'll analyze your specific data and provide personalized recommendations.

What specific aspects would you like me to analyze?`;
        }
        responseGenerated = true;
    } else if (faultKeywords.some(keyword => message.includes(keyword))) {
        response = `⚡ **Fault Analysis & Solutions**

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
        responseGenerated = true;
    } else if (message.includes('how are you') || message.includes('how do you do')) {
        response = `I'm doing great, thank you for asking! 😊 I'm here and ready to help you with any questions you have. Whether it's about electrical safety, general topics, or just a friendly chat, I'm here for you. How can I assist you today?`;
    } else if (message.includes('thank you') || message.includes('thanks')) {
        response = `You're very welcome! 😊 I'm always happy to help. Feel free to ask me anything else - I'm here to assist you with electrical safety guidance or any other questions you might have.`;
    } else if (message.includes('bye') || message.includes('goodbye') || message.includes('see you')) {
        response = `Goodbye! 👋 It was great chatting with you. Remember to stay safe with electrical equipment, and feel free to come back anytime if you need help or just want to chat. Take care!`;
    } else if (message.includes('what is') || message.includes('explain')) {
        if (message.includes('electric') || message.includes('voltage') || message.includes('current')) {
            response = `I'd be happy to explain electrical concepts! ⚡ 

**Basic Electrical Concepts:**
• **Voltage** - The electrical pressure that pushes current through a circuit
• **Current** - The flow of electrical charge through a conductor
• **Resistance** - Opposition to the flow of current
• **Power** - The rate at which electrical energy is used

**Safety Note:** Always consult qualified electricians for hands-on electrical work.

Would you like me to explain any specific electrical concept in more detail?`;
        } else {
            response = `I'd be happy to help explain that! 🤔 Could you be more specific about what you'd like me to explain? I can help with:

• Electrical concepts and safety
• General knowledge questions
• Problem-solving
• Technical explanations

What would you like to know more about?`;
        }
        responseGenerated = true;
    } else if (message.includes('time') || message.includes('what time') || message.includes('clock') || cleanMessage.includes('whattime') || cleanMessage.includes('whattimeisit') || cleanMessage.includes('whattimeis')) {
        const now = new Date();
        const currentTime = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        const currentDate = now.toLocaleDateString([], {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'});
        
        response = `The current time is **${currentTime}** and today is **${currentDate}**. ⏰

**Time Zone Information:**
• Local time: ${currentTime}
• Date: ${currentDate}
• Time zone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}

**Electrical Safety Note:** Time-based maintenance schedules are crucial for electrical equipment. Regular inspections at consistent times help prevent faults and ensure system reliability.

Is there a specific time-related electrical maintenance question I can help with?`;
        responseGenerated = true;
    } else if (message.includes('weather')) {
        response = `I don't have access to real-time weather data, but I can help you understand how weather affects electrical systems! 🌤️

**Weather Impact on Electrical Equipment:**
• **Humidity** - Can cause corrosion and insulation breakdown
• **Temperature** - Affects equipment performance and lifespan
• **Storms** - Can cause power surges and equipment damage
• **Lightning** - Major cause of electrical faults and fires

**Safety Tips:**
• Install surge protectors
• Regular inspection after severe weather
• Keep equipment dry and ventilated
• Have emergency backup plans

Is there a specific weather-related electrical concern you have?`;
        responseGenerated = true;
    } else if (message.includes('date') || message.includes('today') || message.includes('calendar') || cleanMessage.includes('whatdate') || cleanMessage.includes('whatdateisit') || cleanMessage.includes('whatdateis')) {
        const now = new Date();
        const currentDate = now.toLocaleDateString([], {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'});
        const dayOfWeek = now.toLocaleDateString([], {weekday: 'long'});
        
        response = `Today is **${currentDate}**. 📅

**Date Information:**
• Day: ${dayOfWeek}
• Date: ${now.toLocaleDateString()}
• Year: ${now.getFullYear()}

**Electrical Maintenance Note:** Regular calendar-based maintenance schedules are essential for electrical equipment. Weekly, monthly, and annual inspections help prevent faults and ensure system reliability.

Is there a specific date-related electrical maintenance question I can help with?`;
        responseGenerated = true;
    } else if (message.includes('name') || message.includes('who are you') || message.includes('what are you') || cleanMessage.includes('whorue') || cleanMessage.includes('whoru') || cleanMessage.includes('whatru') || cleanMessage.includes('whatareu')) {
        response = `I'm your AI Safety Advisor! 🤖

**About Me:**
• I'm an AI assistant specializing in electrical fault prevention and safety guidance
• I can help with electrical safety, maintenance, and general questions
• I'm here to provide expert advice and support

**My Expertise:**
• Electrical fault prevention and analysis
• Safety protocols and procedures
• Maintenance scheduling and best practices
• General knowledge and problem-solving

**How I Can Help:**
• Answer electrical safety questions
• Provide maintenance guidance
• Assist with general topics
• Offer expert recommendations

What would you like to know about electrical safety or any other topic?`;
        responseGenerated = true;
    } else if (message.includes('help') || message.includes('assistance') || message.includes('support') || cleanMessage.includes('helpe') || cleanMessage.includes('helpu')) {
        response = `I'm here to help! 🤗

**How I Can Assist You:**

**Electrical Safety:**
• Fault prevention strategies
• Maintenance procedures
• Safety protocols
• Emergency response guidance

**General Topics:**
• Problem-solving assistance
• Educational explanations
• Technical guidance
• General conversation

**Quick Actions Available:**
• Prevention tips
• Maintenance guides
• Emergency protocols
• Data analysis

**Just Ask Me:**
• "How do I prevent electrical faults?"
• "What maintenance should I perform?"
• "Explain electrical safety concepts"
• "Help me solve a problem"

What specific help do you need today?`;
        responseGenerated = true;
    } else if (message.includes('technology') || message.includes('ai') || message.includes('artificial intelligence')) {
        response = `Great question about technology! 🤖

**About AI and Technology:**
• I'm an AI assistant designed to help with electrical safety
• AI can analyze patterns and predict potential issues
• Technology helps monitor electrical systems in real-time
• Smart systems can prevent faults before they happen

**My Capabilities:**
• Electrical safety guidance and prevention
• General conversation and assistance
• Problem-solving and analysis
• Educational explanations

**The Future of AI in Electrical Safety:**
• Predictive maintenance
• Real-time monitoring
• Automated safety systems
• Smart grid management

What aspect of technology or AI interests you most?`;
        responseGenerated = true;
    } else if (message.includes('work') || message.includes('job') || message.includes('career')) {
        response = `I can help with work-related topics, especially electrical safety in the workplace! 💼

**Workplace Electrical Safety:**
• Follow OSHA regulations and company policies
• Use proper personal protective equipment
• Report unsafe conditions immediately
• Participate in safety training programs

**Career Development:**
• Continuous learning and skill development
• Networking and professional relationships
• Staying updated with industry standards
• Building expertise in your field

**Work-Life Balance:**
• Set clear boundaries between work and personal time
• Take breaks and manage stress effectively
• Pursue hobbies and interests outside work
• Maintain good relationships with colleagues

What aspect of work or career would you like to discuss?`;
        responseGenerated = true;
    } else if (message.includes('problem') || message.includes('issue') || message.includes('trouble')) {
        response = `I'm here to help you work through problems! 🤔

**Problem-Solving Approach:**
1. **Define the problem** clearly
2. **Gather information** and analyze the situation
3. **Consider multiple solutions** and their consequences
4. **Choose the best approach** and implement it
5. **Evaluate results** and learn from the experience

**For Electrical Issues:**
• Safety first - always prioritize safety
• Consult qualified professionals for complex problems
• Document issues for future reference
• Follow proper procedures and protocols

**General Problem-Solving Tips:**
• Break large problems into smaller parts
• Seek advice from experts when needed
• Learn from mistakes and experiences
• Stay calm and think logically

What specific problem are you facing? I'd be happy to help you work through it!`;
        responseGenerated = true;
    } else if (message.includes('learn') || message.includes('study') || message.includes('education')) {
        response = `Learning is a lifelong journey! 📚

**Effective Learning Strategies:**
• Set clear goals and objectives
• Practice regularly and consistently
• Seek feedback and guidance
• Apply knowledge in real-world situations

**Electrical Safety Education:**
• Take certified safety courses
• Read industry publications and standards
• Attend workshops and seminars
• Learn from experienced professionals

**General Learning Tips:**
• Find learning methods that work for you
• Join study groups or communities
• Use technology to enhance learning
• Stay curious and ask questions

**Resources for Learning:**
• Online courses and tutorials
• Books and technical manuals
• Professional organizations
• Mentorship programs

What would you like to learn more about? I'm here to help guide your learning journey!`;
        responseGenerated = true;
    } else {
        // Default response for any other message - ChatGPT-like responses
        const responses = [
            `I'd be happy to help you with "${userMessage}"! As your AI assistant, I specialize in electrical fault prevention and safety guidance, but I can also assist with general topics. What specific information would you like to know?`,
            
            `That's a great question about "${userMessage}"! I'm here to help you with electrical safety guidance or any other topics you'd like to discuss. How can I assist you today?`,
            
            `Thanks for asking about "${userMessage}"! I'm your AI assistant, and I'm ready to help with electrical safety information or general questions. What would you like to explore?`,
            
            `I understand you're asking about "${userMessage}". I'm your AI assistant specializing in electrical safety, but I can help with a wide range of topics. What specific guidance are you looking for?`,
            
            `Interesting question about "${userMessage}"! I'm here to help you with electrical fault prevention and safety guidance, or any other topics you'd like to discuss. How can I be of assistance?`,
            
            `I'd be glad to help with "${userMessage}"! As your AI assistant, I can provide electrical safety guidance or assist with general questions. What would you like to know more about?`,
            
            `That's an interesting topic - "${userMessage}"! I'm your AI assistant, and I'm here to help with electrical safety guidance or any other questions you might have. What specific information are you looking for?`,
            
            `I understand you're interested in "${userMessage}". I'm your AI assistant specializing in electrical safety, but I can help with various topics. What would you like to discuss?`
        ];
        
        // Select a random response to make it more natural
        response = responses[Math.floor(Math.random() * responses.length)];
        console.log('Using default response pattern, response:', response);
        responseGenerated = true;
    }
    
    // General Knowledge Categories for ChatGPT-like responses
    if (!responseGenerated) {
        if (technologyKeywords.some(keyword => message.includes(keyword))) {
            response = `💻 **Technology and Innovation Guide:**

**Current Technology Trends:**
• **Artificial Intelligence**: Machine learning, deep learning, neural networks
• **Cloud Computing**: AWS, Azure, Google Cloud, serverless architecture
• **Mobile Development**: iOS, Android, React Native, Flutter
• **Web Development**: React, Vue, Angular, Node.js, full-stack development
• **Data Science**: Python, R, SQL, big data analytics, visualization

**Programming Languages:**
• **Python**: Data science, AI, web development, automation
• **JavaScript**: Web development, mobile apps, server-side programming
• **Java**: Enterprise applications, Android development
• **C++**: System programming, game development, performance-critical applications
• **Go**: Cloud services, microservices, concurrent programming

**Development Tools:**
• **Version Control**: Git, GitHub, GitLab, Bitbucket
• **IDEs**: VS Code, IntelliJ, PyCharm, Sublime Text
• **DevOps**: Docker, Kubernetes, CI/CD pipelines, monitoring
• **Databases**: PostgreSQL, MongoDB, Redis, Elasticsearch
• **Testing**: Unit testing, integration testing, automation frameworks

**Emerging Technologies:**
• **Blockchain**: Cryptocurrency, smart contracts, DeFi
• **IoT**: Internet of Things, sensors, connected devices
• **AR/VR**: Augmented reality, virtual reality, mixed reality
• **Quantum Computing**: Quantum algorithms, cryptography, optimization
• **5G**: Next-generation wireless networks, edge computing

**Career in Technology:**
• **Software Engineer**: Full-stack development, system design
• **Data Scientist**: Analytics, machine learning, business intelligence
• **DevOps Engineer**: Infrastructure, automation, cloud platforms
• **Product Manager**: Strategy, user experience, technical leadership
• **Cybersecurity**: Security analysis, penetration testing, compliance

**Learning Resources:**
• **Online Courses**: Coursera, Udemy, edX, Pluralsight
• **Documentation**: Official docs, Stack Overflow, GitHub
• **Communities**: Reddit, Discord, LinkedIn, technical blogs
• **Practice**: LeetCode, HackerRank, CodeWars, personal projects
• **Certifications**: AWS, Google Cloud, Microsoft, CompTIA

Would you like specific guidance on any technology topic?`;
            console.log('Matched technology pattern, response:', response);
            responseGenerated = true;
        } else if (scienceKeywords.some(keyword => message.includes(keyword))) {
            response = `🔬 **Science and Research Guide:**

**Core Scientific Disciplines:**
• **Physics**: Quantum mechanics, relativity, particle physics, cosmology
• **Chemistry**: Organic, inorganic, physical, analytical chemistry
• **Biology**: Genetics, evolution, ecology, molecular biology
• **Mathematics**: Algebra, calculus, statistics, discrete mathematics
• **Earth Sciences**: Geology, meteorology, oceanography, environmental science

**Scientific Method:**
• **Observation**: Gathering data and identifying patterns
• **Hypothesis**: Formulating testable explanations
• **Experiment**: Designing controlled tests and measurements
• **Analysis**: Statistical analysis and data interpretation
• **Conclusion**: Drawing evidence-based conclusions

**Research Process:**
• **Literature Review**: Analyzing existing research and knowledge
• **Experimental Design**: Planning methodology and controls
• **Data Collection**: Systematic measurement and recording
• **Statistical Analysis**: Using appropriate statistical methods
• **Peer Review**: Publication and scientific validation

**Modern Scientific Tools:**
• **Computational**: MATLAB, R, Python, simulation software
• **Laboratory**: Microscopes, spectrometers, chromatography
• **Field Work**: Sensors, drones, GPS, data loggers
• **Analysis**: Statistical software, visualization tools
• **Collaboration**: Research networks, open science platforms

**Scientific Careers:**
• **Researcher**: Academia, industry, government laboratories
• **Engineer**: Applied science, product development, innovation
• **Data Analyst**: Scientific data interpretation and modeling
• **Science Writer**: Communicating complex concepts to public
• **Educator**: Teaching science at various levels

**Recent Scientific Breakthroughs:**
• **Gene Editing**: CRISPR technology, personalized medicine
• **Climate Science**: Global warming research, renewable energy
• **Space Exploration**: Mars missions, exoplanet discovery
• **Quantum Physics**: Quantum computers, quantum communication
• **Neuroscience**: Brain mapping, artificial neural networks

**Scientific Ethics:**
• **Research Integrity**: Honest reporting, avoiding bias
• **Animal Welfare**: Ethical treatment in research
• **Environmental Impact**: Sustainable research practices
• **Data Privacy**: Protecting research participants
• **Open Science**: Sharing knowledge and collaboration

Need guidance on any specific scientific topic or research area?`;
            console.log('Matched science pattern, response:', response);
            responseGenerated = true;
        } else if (healthKeywords.some(keyword => message.includes(keyword))) {
            response = `🏥 **Health and Wellness Guide:**

**Physical Health:**
• **Exercise**: Cardiovascular fitness, strength training, flexibility
• **Nutrition**: Balanced diet, vitamins, minerals, hydration
• **Sleep**: Quality rest, sleep hygiene, circadian rhythms
• **Preventive Care**: Regular checkups, screenings, vaccinations
• **Chronic Disease Management**: Diabetes, hypertension, heart disease

**Mental Health:**
• **Stress Management**: Meditation, mindfulness, relaxation techniques
• **Emotional Well-being**: Therapy, counseling, support groups
• **Cognitive Health**: Brain training, memory exercises, learning
• **Social Connections**: Relationships, community involvement
• **Work-Life Balance**: Boundaries, time management, self-care

**Common Health Conditions:**
• **Cardiovascular**: Heart disease, stroke, hypertension
• **Respiratory**: Asthma, COPD, allergies, infections
• **Digestive**: IBS, GERD, food intolerances, digestive health
• **Mental Health**: Anxiety, depression, PTSD, bipolar disorder
• **Chronic Pain**: Arthritis, migraines, back pain, fibromyalgia

**Healthy Lifestyle Habits:**
• **Diet**: Whole foods, fruits, vegetables, lean proteins
• **Exercise**: 150 minutes moderate activity weekly
• **Hydration**: 8 glasses of water daily, limit sugary drinks
• **Sleep**: 7-9 hours nightly, consistent sleep schedule
• **Stress Relief**: Yoga, meditation, hobbies, social activities

**Medical Specialties:**
• **Primary Care**: General practitioners, family medicine
• **Specialists**: Cardiology, dermatology, neurology, orthopedics
• **Mental Health**: Psychiatry, psychology, therapy, counseling
• **Preventive Medicine**: Public health, epidemiology, wellness
• **Emergency Medicine**: Trauma care, urgent care, critical care

**Health Technology:**
• **Telemedicine**: Remote consultations, health monitoring
• **Wearables**: Fitness trackers, heart rate monitors, sleep tracking
• **Health Apps**: Medication reminders, symptom tracking, nutrition
• **Medical Devices**: Blood pressure monitors, glucose meters
• **Electronic Health Records**: Digital health information systems

**Health Education:**
• **Self-Care**: Recognizing symptoms, basic first aid
• **Health Literacy**: Understanding medical information
• **Prevention**: Vaccinations, screenings, healthy behaviors
• **Emergency Preparedness**: First aid, emergency contacts
• **Health Advocacy**: Navigating healthcare system, insurance

**Mental Health Support:**
• **Crisis Resources**: Suicide prevention hotlines, emergency services
• **Therapy Options**: Individual, group, family, couples therapy
• **Medication Management**: Psychiatric medications, side effects
• **Support Groups**: Peer support, community resources
• **Self-Help**: Books, apps, online resources, mindfulness

**Important Note**: This information is for educational purposes only and should not replace professional medical advice. Always consult healthcare providers for medical concerns.

Need guidance on any specific health topic or wellness practice?`;
            console.log('Matched health pattern, response:', response);
            responseGenerated = true;
        } else if (educationKeywords.some(keyword => message.includes(keyword))) {
            response = `🎓 **Education and Learning Guide:**

**Educational Levels:**
• **Early Childhood**: Preschool, kindergarten, foundational skills
• **Primary Education**: Elementary school, basic literacy and numeracy
• **Secondary Education**: High school, college preparation, career exploration
• **Higher Education**: University, college, professional degrees
• **Continuing Education**: Professional development, lifelong learning

**Learning Methods:**
• **Visual Learning**: Diagrams, charts, videos, infographics
• **Auditory Learning**: Lectures, discussions, podcasts, music
• **Kinesthetic Learning**: Hands-on activities, experiments, practice
• **Reading/Writing**: Books, articles, note-taking, essays
• **Digital Learning**: Online courses, interactive platforms, apps

**Study Strategies:**
• **Time Management**: Scheduling, prioritization, goal setting
• **Active Learning**: Note-taking, summarizing, teaching others
• **Memory Techniques**: Mnemonics, repetition, spaced practice
• **Problem-Solving**: Breaking down complex problems, practice
• **Collaborative Learning**: Study groups, peer tutoring, discussion

**Educational Technology:**
• **Learning Management Systems**: Canvas, Blackboard, Moodle
• **Online Platforms**: Coursera, Khan Academy, edX, Udemy
• **Educational Apps**: Duolingo, Quizlet, Photomath, Notion
• **Virtual Reality**: Immersive learning experiences, simulations
• **Artificial Intelligence**: Personalized learning, adaptive systems

**Academic Skills:**
• **Research**: Information literacy, critical thinking, analysis
• **Writing**: Essays, reports, academic papers, citations
• **Mathematics**: Problem-solving, logical reasoning, calculations
• **Science**: Experimental design, data analysis, hypothesis testing
• **Languages**: Grammar, vocabulary, communication, cultural understanding

**Career Preparation:**
• **Skills Development**: Technical skills, soft skills, leadership
• **Internships**: Work experience, networking, career exploration
• **Certifications**: Professional credentials, industry standards
• **Portfolio Building**: Projects, achievements, work samples
• **Networking**: Professional relationships, mentors, industry contacts

**Specialized Education:**
• **STEM**: Science, Technology, Engineering, Mathematics
• **Liberal Arts**: Humanities, social sciences, critical thinking
• **Vocational**: Trade skills, technical training, apprenticeships
• **Professional**: Law, medicine, business, engineering degrees
• **Creative**: Arts, design, music, writing, performance

**Learning Challenges:**
• **Learning Disabilities**: ADHD, dyslexia, processing disorders
• **Language Barriers**: ESL learners, multilingual support
• **Financial Constraints**: Scholarships, grants, financial aid
• **Time Management**: Balancing work, family, and education
• **Motivation**: Goal setting, accountability, support systems

**Educational Resources:**
• **Libraries**: Books, databases, research assistance, quiet study spaces
• **Online Resources**: Open educational resources, free courses
• **Tutoring**: One-on-one help, peer tutoring, professional services
• **Study Materials**: Textbooks, workbooks, practice tests, flashcards
• **Academic Support**: Writing centers, math labs, study skills workshops

**Future of Education:**
• **Personalized Learning**: AI-driven adaptive learning systems
• **Micro-credentials**: Short-term skill certifications, badges
• **Global Learning**: International programs, cultural exchange
• **Lifelong Learning**: Continuous skill development, career changes
• **Digital Transformation**: Virtual classrooms, hybrid learning models

Need guidance on any specific educational topic or learning strategy?`;
            console.log('Matched education pattern, response:', response);
            responseGenerated = true;
        } else if (businessKeywords.some(keyword => message.includes(keyword))) {
            response = `💼 **Business and Career Guide:**

**Business Fundamentals:**
• **Strategy**: Planning, vision, mission, competitive analysis
• **Operations**: Processes, efficiency, quality control, supply chain
• **Marketing**: Branding, advertising, customer acquisition, retention
• **Finance**: Budgeting, accounting, investment, risk management
• **Human Resources**: Recruitment, training, performance management

**Entrepreneurship:**
• **Business Planning**: Market research, business model, feasibility
• **Startup Launch**: Funding, legal structure, team building
• **Growth Strategies**: Scaling, market expansion, partnerships
• **Innovation**: Product development, technology adoption, disruption
• **Risk Management**: Insurance, compliance, financial planning

**Career Development:**
• **Skill Building**: Technical skills, soft skills, leadership development
• **Networking**: Professional relationships, industry connections, mentors
• **Job Search**: Resume writing, interviewing, salary negotiation
• **Career Advancement**: Promotions, lateral moves, career changes
• **Professional Branding**: LinkedIn, personal website, thought leadership

**Financial Management:**
• **Personal Finance**: Budgeting, saving, investing, retirement planning
• **Business Finance**: Cash flow, profit margins, financial statements
• **Investment**: Stocks, bonds, real estate, alternative investments
• **Risk Management**: Insurance, diversification, emergency funds
• **Tax Planning**: Deductions, credits, tax-efficient strategies

**Leadership and Management:**
• **Team Leadership**: Motivation, delegation, conflict resolution
• **Strategic Thinking**: Long-term planning, decision-making, problem-solving
• **Communication**: Presentations, meetings, written communication
• **Change Management**: Organizational change, cultural transformation
• **Performance Management**: Goal setting, feedback, development plans

**Industry Sectors:**
• **Technology**: Software, hardware, digital services, tech startups
• **Healthcare**: Medical devices, pharmaceuticals, healthcare services
• **Finance**: Banking, insurance, investment, fintech
• **Manufacturing**: Production, supply chain, quality control
• **Retail**: E-commerce, brick-and-mortar, customer experience

**Market Analysis:**
• **Market Research**: Customer needs, competitive landscape, trends
• **Financial Analysis**: Revenue, costs, profitability, growth potential
• **SWOT Analysis**: Strengths, weaknesses, opportunities, threats
• **Porter's Five Forces**: Industry analysis, competitive positioning
• **Customer Segmentation**: Target markets, buyer personas, positioning

**Business Operations:**
• **Project Management**: Planning, execution, monitoring, delivery
• **Quality Control**: Standards, testing, continuous improvement
• **Supply Chain**: Sourcing, logistics, inventory management
• **Customer Service**: Support, satisfaction, retention strategies
• **Data Analytics**: Performance metrics, insights, decision-making

**Professional Development:**
• **Certifications**: Industry credentials, professional qualifications
• **Continuing Education**: Courses, workshops, conferences, seminars
• **Mentorship**: Finding mentors, being a mentor, career guidance
• **Industry Involvement**: Professional associations, networking events
• **Skill Assessment**: Identifying strengths, development areas, goals

**Global Business:**
• **International Markets**: Expansion, cultural considerations, regulations
• **Supply Chain Management**: Global sourcing, logistics, risk management
• **Cross-Cultural Communication**: Working with diverse teams, clients
• **Trade and Commerce**: Import/export, tariffs, international agreements
• **Digital Transformation**: Technology adoption, remote work, automation

Need guidance on any specific business topic or career development area?`;
            console.log('Matched business pattern, response:', response);
            responseGenerated = true;
        } else if (entertainmentKeywords.some(keyword => message.includes(keyword))) {
            response = `🎬 **Entertainment and Leisure Guide:**

**Movies and Film:**
• **Genres**: Action, comedy, drama, horror, sci-fi, romance, documentary
• **Film Production**: Scriptwriting, directing, cinematography, editing
• **Film History**: Classic movies, influential directors, film movements
• **Streaming Platforms**: Netflix, Disney+, Amazon Prime, HBO Max
• **Film Analysis**: Themes, symbolism, cinematography, storytelling

**Music and Audio:**
• **Genres**: Pop, rock, classical, jazz, hip-hop, electronic, folk
• **Music Production**: Recording, mixing, mastering, sound engineering
• **Instruments**: Guitar, piano, drums, violin, digital audio workstations
• **Music Theory**: Scales, chords, harmony, rhythm, composition
• **Music Streaming**: Spotify, Apple Music, YouTube Music, SoundCloud

**Gaming and Interactive Media:**
• **Game Genres**: RPG, FPS, strategy, puzzle, sports, simulation
• **Game Development**: Programming, design, art, sound, testing
• **Gaming Platforms**: PC, console, mobile, VR, cloud gaming
• **Esports**: Competitive gaming, tournaments, professional players
• **Game Analysis**: Mechanics, narrative, player experience, design

**Books and Literature:**
• **Genres**: Fiction, non-fiction, mystery, fantasy, sci-fi, biography
• **Reading Strategies**: Speed reading, comprehension, note-taking
• **Book Recommendations**: Bestsellers, classics, contemporary works
• **Writing**: Creative writing, technical writing, blogging, journalism
• **Publishing**: Traditional publishing, self-publishing, digital platforms

**Sports and Physical Activities:**
• **Team Sports**: Football, basketball, soccer, baseball, hockey
• **Individual Sports**: Tennis, golf, swimming, running, cycling
• **Fitness Activities**: Gym workouts, yoga, pilates, martial arts
• **Outdoor Activities**: Hiking, camping, rock climbing, water sports
• **Sports Analysis**: Statistics, strategy, player performance, coaching

**Arts and Culture:**
• **Visual Arts**: Painting, sculpture, photography, digital art
• **Performing Arts**: Theater, dance, opera, musical performances
• **Cultural Events**: Festivals, exhibitions, concerts, shows
• **Art History**: Movements, artists, techniques, cultural significance
• **Creative Expression**: Drawing, crafting, DIY projects, hobbies

**Travel and Adventure:**
• **Travel Planning**: Destinations, budgeting, itineraries, bookings
• **Travel Types**: Solo travel, group tours, adventure travel, luxury
• **Cultural Experiences**: Local customs, cuisine, historical sites
• **Travel Technology**: Apps, booking platforms, navigation, translation
• **Sustainable Travel**: Eco-friendly tourism, responsible travel practices

**Digital Entertainment:**
• **Social Media**: Content creation, community building, influencer marketing
• **Podcasts**: Audio content, interviews, educational, entertainment
• **YouTube**: Video content, tutorials, reviews, entertainment
• **TikTok**: Short-form video, trends, creative expression
• **Live Streaming**: Gaming, music, educational content, social interaction

**Hobbies and Interests:**
• **Creative Hobbies**: Drawing, painting, writing, photography, crafting
• **Technical Hobbies**: Programming, electronics, robotics, 3D printing
• **Collecting**: Stamps, coins, cards, memorabilia, antiques
• **Gardening**: Plant care, landscaping, indoor gardening, composting
• **Cooking**: Recipes, techniques, international cuisine, baking

**Entertainment Industry:**
• **Career Opportunities**: Acting, directing, producing, technical roles
• **Industry Trends**: Streaming, virtual reality, AI in entertainment
• **Business Aspects**: Funding, marketing, distribution, revenue models
• **Technology Impact**: Digital effects, streaming platforms, social media
• **Future Developments**: Metaverse, virtual concerts, interactive content

Need recommendations or guidance on any specific entertainment topic or hobby?`;
            console.log('Matched entertainment pattern, response:', response);
            responseGenerated = true;
        } else if (foodKeywords.some(keyword => message.includes(keyword))) {
            response = `🍽️ **Food and Culinary Guide:**

**Cooking Techniques:**
• **Basic Methods**: Boiling, steaming, frying, baking, grilling, sautéing
• **Advanced Techniques**: Sous vide, fermentation, molecular gastronomy
• **Knife Skills**: Chopping, dicing, julienne, chiffonade, proper handling
• **Temperature Control**: Heat management, doneness levels, food safety
• **Flavor Development**: Seasoning, marinating, reducing, layering flavors

**Cuisine Types:**
• **International**: Italian, French, Chinese, Japanese, Indian, Mexican
• **Regional Specialties**: Local ingredients, traditional methods, cultural significance
• **Fusion Cooking**: Combining different culinary traditions and techniques
• **Vegetarian/Vegan**: Plant-based cooking, protein alternatives, nutrition
• **Health-Conscious**: Low-carb, gluten-free, organic, superfoods

**Ingredients and Nutrition:**
• **Essential Ingredients**: Herbs, spices, oils, vinegars, stocks, sauces
• **Protein Sources**: Meat, poultry, fish, legumes, tofu, tempeh
• **Vegetables**: Seasonal produce, preparation methods, storage tips
• **Grains and Starches**: Rice, pasta, quinoa, potatoes, bread making
• **Nutritional Balance**: Macronutrients, vitamins, minerals, dietary needs

**Beverages:**
• **Coffee**: Brewing methods, bean types, roasting, specialty drinks
• **Tea**: Types, brewing techniques, health benefits, cultural traditions
• **Wine**: Varieties, food pairings, tasting, storage, regions
• **Cocktails**: Classic recipes, mixology techniques, garnishes
• **Non-Alcoholic**: Juices, smoothies, kombucha, herbal infusions

**Cooking Equipment:**
• **Essential Tools**: Knives, cutting boards, pots, pans, measuring tools
• **Small Appliances**: Blenders, food processors, stand mixers, slow cookers
• **Specialty Equipment**: Pressure cookers, air fryers, immersion circulators
• **Baking Equipment**: Ovens, scales, molds, piping tools, thermometers
• **Storage Solutions**: Containers, vacuum sealers, preservation methods

**Recipe Development:**
• **Recipe Structure**: Ingredients, measurements, instructions, timing
• **Scaling Recipes**: Adjusting quantities, maintaining proportions
• **Substitutions**: Ingredient alternatives, dietary modifications
• **Testing and Refining**: Taste testing, texture adjustments, balance
• **Documentation**: Recipe writing, photography, sharing methods

**Food Safety and Storage:**
• **Food Safety**: Temperature control, cross-contamination prevention
• **Storage Methods**: Refrigeration, freezing, pantry organization
• **Preservation**: Canning, pickling, drying, fermentation techniques
• **Allergen Management**: Identifying allergens, safe preparation methods
• **Hygiene Practices**: Cleanliness, sanitization, safe handling

**Restaurant and Food Service:**
• **Menu Planning**: Seasonal menus, cost control, dietary accommodations
• **Kitchen Operations**: Workflow, timing, quality control, efficiency
• **Service Standards**: Customer experience, presentation, hospitality
• **Food Cost Management**: Pricing, waste reduction, inventory control
• **Industry Trends**: Farm-to-table, sustainability, technology integration

**Cultural and Social Aspects:**
• **Food Traditions**: Holiday meals, family recipes, cultural celebrations
• **Social Dining**: Dinner parties, potlucks, community meals
• **Food Education**: Cooking classes, culinary schools, mentorship
• **Food Writing**: Blogs, reviews, cookbooks, food journalism
• **Food Photography**: Styling, lighting, composition, social media

**Health and Dietary Considerations:**
• **Special Diets**: Keto, paleo, Mediterranean, DASH, plant-based
• **Food Allergies**: Management, safe cooking, ingredient awareness
• **Nutritional Goals**: Weight management, muscle building, health conditions
• **Meal Planning**: Batch cooking, prep work, balanced meals
• **Mindful Eating**: Portion control, eating habits, food relationships

**Food Science:**
• **Chemical Reactions**: Maillard reaction, caramelization, fermentation
• **Texture and Consistency**: Emulsification, gelatinization, protein denaturation
• **Temperature Effects**: Cooking temperatures, food safety, doneness
• **Ingredient Interactions**: Acid-base reactions, fat emulsification
• **Preservation Science**: Microbial control, chemical preservation, packaging

Need guidance on any specific cooking technique, cuisine, or food-related topic?`;
            console.log('Matched food pattern, response:', response);
            responseGenerated = true;
        } else if (lifestyleKeywords.some(keyword => message.includes(keyword))) {
            response = `🌱 **Lifestyle and Personal Development:**

**Health and Wellness:**
• **Physical Health**: Regular exercise, balanced nutrition, adequate sleep
• **Mental Health**: Stress management, mindfulness, emotional well-being
• **Preventive Care**: Regular checkups, screenings, vaccinations
• **Healthy Habits**: Hydration, movement, stress reduction, self-care
• **Chronic Disease Management**: Lifestyle modifications, medication adherence

**Personal Growth:**
• **Goal Setting**: SMART goals, action plans, progress tracking
• **Skill Development**: Continuous learning, professional development
• **Time Management**: Prioritization, productivity, work-life balance
• **Financial Planning**: Budgeting, saving, investing, debt management
• **Relationship Building**: Communication, empathy, conflict resolution

**Home and Living:**
• **Home Organization**: Decluttering, storage solutions, cleaning routines
• **Interior Design**: Space planning, color schemes, furniture selection
• **Gardening**: Plant care, landscaping, indoor gardening, composting
• **Home Maintenance**: Repairs, improvements, energy efficiency
• **Smart Home**: Technology integration, automation, security systems

**Family and Relationships:**
• **Family Dynamics**: Communication, boundaries, quality time
• **Parenting**: Child development, discipline, education, activities
• **Marriage and Partnerships**: Communication, intimacy, shared goals
• **Friendships**: Maintaining relationships, making new friends, social skills
• **Elder Care**: Aging parents, healthcare, independence, support systems

**Social and Community:**
• **Community Involvement**: Volunteering, local events, civic engagement
• **Social Skills**: Networking, public speaking, active listening
• **Cultural Awareness**: Diversity, inclusion, cultural sensitivity
• **Digital Citizenship**: Online etiquette, privacy, responsible social media use
• **Environmental Stewardship**: Sustainability, conservation, eco-friendly practices

**Hobbies and Interests:**
• **Creative Pursuits**: Art, music, writing, crafting, photography
• **Physical Activities**: Sports, fitness, outdoor adventures, dancing
• **Intellectual Hobbies**: Reading, learning languages, puzzles, games
• **Collecting**: Stamps, coins, art, books, memorabilia
• **Technology**: Programming, electronics, gaming, digital content creation

**Work-Life Balance:**
• **Time Management**: Scheduling, prioritization, delegation
• **Stress Management**: Relaxation techniques, boundaries, self-care
• **Remote Work**: Home office setup, productivity, communication
• **Career Development**: Skill building, networking, advancement
• **Financial Wellness**: Budgeting, investing, retirement planning

**Environmental Consciousness:**
• **Sustainable Living**: Reduce, reuse, recycle, minimalism
• **Energy Efficiency**: Home improvements, renewable energy, conservation
• **Eco-Friendly Products**: Green cleaning, sustainable materials, ethical consumption
• **Climate Action**: Carbon footprint reduction, advocacy, lifestyle changes
• **Nature Connection**: Outdoor activities, environmental education, conservation

**Personal Finance:**
• **Budgeting**: Income tracking, expense management, financial goals
• **Saving**: Emergency funds, short-term goals, long-term investments
• **Investing**: Stocks, bonds, real estate, retirement accounts
• **Debt Management**: Credit cards, loans, consolidation strategies
• **Insurance**: Health, life, home, auto, disability coverage

**Mental and Emotional Well-being:**
• **Stress Management**: Meditation, yoga, breathing exercises, therapy
• **Emotional Intelligence**: Self-awareness, empathy, relationship skills
• **Mindfulness**: Present-moment awareness, gratitude, acceptance
• **Self-Care**: Rest, recreation, pampering, personal time
• **Support Systems**: Friends, family, professionals, support groups

**Technology and Digital Life:**
• **Digital Wellness**: Screen time management, digital detox, online safety
• **Social Media**: Healthy usage, privacy, content creation, networking
• **Online Learning**: Courses, tutorials, skill development, certifications
• **Digital Organization**: File management, cloud storage, productivity apps
• **Cybersecurity**: Password management, privacy protection, safe browsing

**Life Transitions:**
• **Career Changes**: Job searching, skill assessment, networking, preparation
• **Relocation**: Moving planning, community integration, housing search
• **Life Events**: Marriage, children, aging, retirement, loss
• **Health Changes**: Chronic conditions, recovery, lifestyle adjustments
• **Financial Changes**: Income changes, major purchases, investment decisions

Need guidance on any specific lifestyle topic or personal development area?`;
            console.log('Matched lifestyle pattern, response:', response);
            responseGenerated = true;
        }
    }
    
    // Ensure we have a response
    if (!response || response.trim() === '') {
        console.log('No response generated, using emergency fallback');
        response = `I understand you're asking about "${userMessage}". I'm your AI assistant specializing in electrical safety and general assistance. How can I help you today?`;
        responseGenerated = true;
    }
    
    console.log('Final response generated:', responseGenerated, 'Response:', response);
    
    // Show typing indicator
    showTypingIndicator();
    
    // Simulate thinking time and then add the response
    setTimeout(() => {
        console.log('Adding bot response:', response);
        console.log('Response length:', response.length);
        console.log('Response type:', typeof response);
        hideTypingIndicator();
        addMessage(response, 'bot');
    }, 1500); // 1.5 second delay
    
    } catch (error) {
        console.error('Error in generateAIResponse:', error);
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
        
        // Fallback response
        showTypingIndicator();
        setTimeout(() => {
            hideTypingIndicator();
            addMessage("I apologize, but I encountered an error processing your message. Please try again or rephrase your question.", 'bot');
        }, 1000);
    }
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

// Test chatbot functionality
function testChatbotFunctionality() {
    console.log('=== TESTING CHATBOT FUNCTIONALITY ===');
    
    // Test DOM elements
    const chatbotContainer = document.getElementById('chatbotContainer');
    const chatbotInput = document.getElementById('chatbotInput');
    const chatbotSend = document.getElementById('chatbotSend');
    const chatbotMessages = document.getElementById('chatbotMessages');
    
    console.log('DOM Elements:');
    console.log('- Container:', !!chatbotContainer);
    console.log('- Input:', !!chatbotInput);
    console.log('- Send Button:', !!chatbotSend);
    console.log('- Messages:', !!chatbotMessages);
    
    // Test Watson config
    console.log('Watson Config:', window.WATSON_CONFIG);
    console.log('Watson Session:', watsonSession);
    
    // Test AI response function
    console.log('Testing generateAIResponse function...');
    generateAIResponse('test message');
    
    // Test addMessage function
    console.log('Testing addMessage function...');
    addMessage('Test message from console', 'bot');
    
    console.log('=== CHATBOT TEST COMPLETE ===');
}

// Quick test function for chatbot responses
function quickChatbotTest() {
    console.log('=== QUICK CHATBOT TEST ===');
    
    // Test different message types
    const testMessages = [
        'hello',
        'what time is it',
        'help me',
        'good morning',
        'how are you'
    ];
    
    testMessages.forEach((msg, index) => {
        setTimeout(() => {
            console.log(`Testing message ${index + 1}: "${msg}"`);
            generateAIResponse(msg);
        }, index * 2000);
    });
    
    console.log('=== TEST MESSAGES SENT ===');
}

// Debug function to test chatbot responses
function debugChatbot() {
    console.log('=== CHATBOT DEBUG TEST ===');
    
    // Test basic response generation
    console.log('Testing basic response generation...');
    generateAIResponse('hello');
    
    // Test technology response
    setTimeout(() => {
        console.log('Testing technology response...');
        generateAIResponse('how to learn programming');
    }, 2000);
    
    // Test science response
    setTimeout(() => {
        console.log('Testing science response...');
        generateAIResponse('what is quantum physics');
    }, 4000);
    
    // Test health response
    setTimeout(() => {
        console.log('Testing health response...');
        generateAIResponse('how to improve mental health');
    }, 6000);
    
    console.log('=== DEBUG TEST COMPLETE ===');
}

// Comprehensive chatbot debug function
function debugChatbotIssue() {
    console.log('=== COMPREHENSIVE CHATBOT DEBUG ===');
    
    // 1. Check DOM elements
    console.log('1. DOM Elements Check:');
    console.log('- chatbotContainer:', !!document.getElementById('chatbotContainer'));
    console.log('- chatbotMessages:', !!document.getElementById('chatbotMessages'));
    console.log('- chatbotInput:', !!document.getElementById('chatbotInput'));
    console.log('- chatbotSend:', !!document.getElementById('chatbotSend'));
    console.log('- chatbotWindow:', !!document.getElementById('chatbotWindow'));
    
    // 2. Check Watson configuration
    console.log('2. Watson Configuration:');
    console.log('- WATSON_CONFIG exists:', !!window.WATSON_CONFIG);
    console.log('- Watson SDK loaded:', typeof window.WatsonAssistantV2 !== 'undefined');
    console.log('- Watson session:', watsonSession);
    
    // 3. Test event listeners
    console.log('3. Testing Event Listeners:');
    const chatbotSend = document.getElementById('chatbotSend');
    const chatbotInput = document.getElementById('chatbotInput');
    
    if (chatbotSend) {
        console.log('- Send button found, testing click...');
        chatbotSend.click();
    } else {
        console.log('- Send button NOT found!');
    }
    
    if (chatbotInput) {
        console.log('- Input field found, testing focus...');
        chatbotInput.focus();
        chatbotInput.value = 'test message';
        console.log('- Input value set to:', chatbotInput.value);
    } else {
        console.log('- Input field NOT found!');
    }
    
    // 4. Test addMessage function directly
    console.log('4. Testing addMessage function:');
    try {
        addMessage('Direct test message', 'bot');
        console.log('- addMessage function works');
    } catch (error) {
        console.error('- addMessage function failed:', error);
    }
    
    // 5. Test generateAIResponse function directly
    console.log('5. Testing generateAIResponse function:');
    try {
        generateAIResponse('hello');
        console.log('- generateAIResponse function called');
    } catch (error) {
        console.error('- generateAIResponse function failed:', error);
    }
    
    // 6. Check if chatbot is visible
    console.log('6. Chatbot Visibility:');
    const chatbotContainer = document.getElementById('chatbotContainer');
    if (chatbotContainer) {
        console.log('- Container display:', chatbotContainer.style.display);
        console.log('- Container visibility:', chatbotContainer.style.visibility);
        console.log('- Container opacity:', chatbotContainer.style.opacity);
        console.log('- Container classList:', chatbotContainer.classList.toString());
    }
    
    // 7. Test chatbot expansion
    console.log('7. Testing Chatbot Expansion:');
    if (chatbotContainer) {
        console.log('- Current container classes:', chatbotContainer.classList.toString());
        chatbotContainer.classList.add('expanded');
        console.log('- Added expanded class');
        setTimeout(() => {
            console.log('- After expansion, classes:', chatbotContainer.classList.toString());
        }, 100);
    }
    
    console.log('=== DEBUG COMPLETE ===');
    console.log('Check the console output above to identify the issue.');
}

// Simple test to check if chatbot responds
function testChatbotResponse() {
    console.log('=== TESTING CHATBOT RESPONSE ===');
    
    // Test 1: Direct addMessage
    console.log('Test 1: Direct addMessage');
    addMessage('Test message from console', 'bot');
    
    // Test 2: Direct generateAIResponse
    console.log('Test 2: Direct generateAIResponse');
    generateAIResponse('hello');
    
    // Test 3: Simulate user input
    console.log('Test 3: Simulate user input');
    const chatbotInput = document.getElementById('chatbotInput');
    if (chatbotInput) {
        chatbotInput.value = 'test message from console';
        console.log('Input value set, now try clicking send button or pressing Enter');
    } else {
        console.log('Chatbot input not found!');
    }
    
    console.log('=== RESPONSE TEST COMPLETE ===');
}

// Force chatbot initialization
function forceChatbotInit() {
    console.log('=== FORCING CHATBOT INITIALIZATION ===');
    
    // Ensure chatbot is visible
    const chatbotContainer = document.getElementById('chatbotContainer');
    if (chatbotContainer) {
        chatbotContainer.style.display = 'flex';
        chatbotContainer.style.visibility = 'visible';
        chatbotContainer.style.opacity = '1';
        chatbotContainer.style.transform = 'translateY(0)';
        chatbotContainer.style.zIndex = '9999';
        console.log('Chatbot container made visible');
    }
    
    // Re-initialize chatbot
    console.log('Re-initializing chatbot...');
    initializeChatbot();
    
    // Add welcome message
    setTimeout(() => {
        const messagesContainer = document.getElementById('chatbotMessages');
        if (messagesContainer) {
            messagesContainer.innerHTML = '';
            addMessage('Hello! I\'m your AI Safety Advisor. How can I help you today?', 'bot');
            console.log('Welcome message added');
        }
    }, 500);
    
    // Test basic functionality
    setTimeout(() => {
        console.log('Testing basic functionality...');
        addMessage('Test message after initialization', 'bot');
        generateAIResponse('hello');
    }, 1000);
    
    console.log('=== FORCE INITIALIZATION COMPLETE ===');
}

// Quick fix for chatbot
function quickChatbotFix() {
    console.log('=== QUICK CHATBOT FIX ===');
    
    // 1. Make sure chatbot is visible
    const chatbotContainer = document.getElementById('chatbotContainer');
    if (chatbotContainer) {
        chatbotContainer.style.cssText = `
            display: flex !important;
            visibility: visible !important;
            opacity: 1 !important;
            transform: translateY(0) !important;
            z-index: 9999 !important;
        `;
        console.log('✓ Chatbot container made visible');
    }
    
    // 2. Ensure chatbot is expanded
    chatbotContainer.classList.add('expanded');
    console.log('✓ Chatbot expanded');
    
    // 3. Clear and add welcome message
    const messagesContainer = document.getElementById('chatbotMessages');
    if (messagesContainer) {
        messagesContainer.innerHTML = '';
        addMessage('Hello! I\'m your AI Safety Advisor. How can I help you today?', 'bot');
        console.log('✓ Welcome message added');
    }
    
    // 4. Test input functionality
    const chatbotInput = document.getElementById('chatbotInput');
    if (chatbotInput) {
        chatbotInput.value = '';
        chatbotInput.placeholder = 'Ask about electrical safety...';
        console.log('✓ Input field ready');
    }
    
    // 5. Test send button
    const chatbotSend = document.getElementById('chatbotSend');
    if (chatbotSend) {
        chatbotSend.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Send button clicked');
            const message = chatbotInput.value.trim();
            if (message) {
                addMessage(message, 'user');
                chatbotInput.value = '';
                setTimeout(() => {
                    generateAIResponse(message);
                }, 500);
            }
        });
        console.log('✓ Send button event listener added');
    }
    
    console.log('=== QUICK FIX COMPLETE ===');
    console.log('Chatbot should now be working. Try typing a message and clicking send.');
}

// Make test functions available globally
window.testChatbotFunctionality = testChatbotFunctionality;
window.quickChatbotTest = quickChatbotTest;
window.debugChatbot = debugChatbot;
window.debugChatbotIssue = debugChatbotIssue;
window.testChatbotResponse = testChatbotResponse;
window.forceChatbotInit = forceChatbotInit;
window.quickChatbotFix = quickChatbotFix;
