/**
 * LexAI - Document Analysis Functionality
 * Handles document uploads and analysis using the Gemini AI API
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize document analysis functionality when on the documents page
    if (document.getElementById('documentUploadForm')) {
        initializeDocumentAnalysis();
    }
    
    // Initialize text analysis functionality when on the documents page
    if (document.getElementById('textAnalysisForm')) {
        initializeTextAnalysis();
    }
});

/**
 * Initialize document upload and analysis functionality
 */
function initializeDocumentAnalysis() {
    const documentUploadForm = document.getElementById('documentUploadForm');
    if (!documentUploadForm) return;
    
    const analysisLoader = document.getElementById('analysisLoader');
    const analysisResults = document.getElementById('analysisResults');
    const analysisError = document.getElementById('analysisError');
    const documentNameBadge = document.getElementById('documentNameBadge');
    const analysisTypeBadge = document.getElementById('analysisTypeBadge');
    const analysisContent = document.getElementById('analysisContent');
    
    // Handle document upload form submission
    documentUploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const documentFile = document.getElementById('documentFile')?.files?.[0];
        const analysisType = document.getElementById('analysisType')?.value || 'summary';
        
        if (!documentFile) {
            showAlert('Please select a document to analyze.', 'warning');
            return;
        }
        
        // Show loading state
        if (analysisResults) analysisResults.classList.add('d-none');
        if (analysisError) analysisError.classList.add('d-none');
        if (analysisLoader) analysisLoader.classList.remove('d-none');
        
        // Reset and show compliance score loading animation
        const complianceScoreLoading = document.getElementById('complianceScoreLoading');
        const resultComplianceStatus = document.getElementById('resultComplianceStatus');
        if (complianceScoreLoading) complianceScoreLoading.classList.remove('d-none');
        if (resultComplianceStatus) resultComplianceStatus.textContent = 'Calculating...';
        
        try {
            // Create form data for file upload
            const formData = new FormData();
            formData.append('document', documentFile);
            formData.append('analysis_type', analysisType);
            
            // Send request to API
            console.log('Sending document for analysis:', analysisType);
            
            const response = await fetch('/api/analyze-document', {
                method: 'POST',
                body: formData
            });
            
            console.log('Response status:', response.status);
            const result = await response.json();
            console.log('Analysis result:', result);
            
            // Hide loader
            if (analysisLoader) analysisLoader.classList.add('d-none');
            
            if (response.ok && result.status === 'success') {
                console.log("Document analysis successful, displaying results");
                // Display results
                if (documentNameBadge) documentNameBadge.textContent = result.document_name || 'Document';
                if (analysisTypeBadge) analysisTypeBadge.textContent = formatAnalysisType(result.analysis_type);
                
                // Format content with Legal BERT validation if available
                let formattedContent = formatAnalysisResult(result.result);
                
                // Add document length if available
                if (result.document_length || result.document_size) {
                    const docLength = document.getElementById('documentLength');
                    if (docLength) {
                        docLength.textContent = `${result.document_length || result.document_size} characters`;
                    }
                }
                
                // Update compliance status and score in UI
                // Hide the compliance score loading animation
                const complianceScoreLoading = document.getElementById('complianceScoreLoading');
                if (complianceScoreLoading) complianceScoreLoading.classList.add('d-none');
                
                if (result.legal_bert_validation) {
                    const bertValidation = result.legal_bert_validation;
                    const complianceClass = bertValidation.compliance_status === 'valid' 
                        ? 'text-success' 
                        : (bertValidation.compliance_status === 'review_recommended' ? 'text-warning' : 'text-danger');
                        
                    // Update compliance status if element exists
                    const complianceStatus = document.getElementById('complianceStatus');
                    if (complianceStatus) {
                        complianceStatus.textContent = formatComplianceStatus(bertValidation.compliance_status);
                        complianceStatus.className = '';
                        complianceStatus.classList.add(complianceClass);
                    }
                    
                    // Update compliance score progress bar if element exists
                    const complianceScore = document.getElementById('complianceScore');
                    if (complianceScore) {
                        const scorePercentage = bertValidation.compliance_score * 100;
                        complianceScore.style.width = `${scorePercentage}%`;
                        complianceScore.setAttribute('aria-valuenow', scorePercentage);
                        complianceScore.textContent = `${Math.round(scorePercentage)}%`;
                        complianceScore.className = ''; // Clear existing classes
                        complianceScore.classList.add('progress-bar', getScoreColorClass(bertValidation.compliance_score));
                    }
                    
                    formattedContent += `
                        <hr>
                        <div class="legal-bert-section mt-4">
                            <h5 class="mb-3"><i class="fas fa-balance-scale me-2"></i>Legal BERT Validation</h5>
                            <div class="card border-light bg-light">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between align-items-center mb-3">
                                        <div>
                                            <h6 class="mb-1">Compliance Status:</h6>
                                            <span class="badge ${complianceClass} fs-6">${formatComplianceStatus(bertValidation.compliance_status)}</span>
                                        </div>
                                        <div class="text-end">
                                            <h6 class="mb-1">Compliance Score:</h6>
                                            <div class="progress" style="width: 120px; height: 24px;">
                                                <div class="progress-bar ${getScoreColorClass(bertValidation.compliance_score)}" 
                                                     role="progressbar" 
                                                     style="width: ${bertValidation.compliance_score * 100}%" 
                                                     aria-valuenow="${bertValidation.compliance_score * 100}" 
                                                     aria-valuemin="0" 
                                                     aria-valuemax="100">
                                                    ${Math.round(bertValidation.compliance_score * 100)}%
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    ${bertValidation.legal_terms_found && bertValidation.legal_terms_found.length > 0 ? `
                                        <h6 class="mb-2 mt-3">Legal Terms Identified:</h6>
                                        <div class="mb-3">
                                            ${bertValidation.legal_terms_found.map(term => 
                                                `<span class="badge bg-secondary me-2 mb-1">${term}</span>`
                                            ).join('')}
                                        </div>
                                    ` : ''}
                                    
                                    <div class="mt-2">
                                        <p class="text-muted small mb-0">
                                            ${bertValidation.red_flags_count > 0 ? 
                                                `<i class="fas fa-exclamation-triangle text-warning me-1"></i> ${bertValidation.red_flags_count} potential red flags identified` : 
                                                '<i class="fas fa-check-circle text-success me-1"></i> No red flags detected'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                }
                
                if (analysisContent) analysisContent.innerHTML = formattedContent;
                if (analysisResults) analysisResults.classList.remove('d-none');
                
                // Add to history in local storage
                addToHistory(result);
                
                // Initialize copy and download buttons
                initializeResultActions(result);
            } else {
                // Show error
                const errorMessage = document.getElementById('errorMessage');
                if (errorMessage) errorMessage.textContent = result.message || 'An error occurred during analysis';
                if (analysisError) analysisError.classList.remove('d-none');
            }
        } catch (error) {
            console.error('Error analyzing document:', error);
            
            // Hide loader and show error
            if (analysisLoader) analysisLoader.classList.add('d-none');
            
            // Hide compliance score loading animation
            const complianceScoreLoading = document.getElementById('complianceScoreLoading');
            if (complianceScoreLoading) complianceScoreLoading.classList.add('d-none');
            
            const errorMessage = document.getElementById('errorMessage');
            if (errorMessage) errorMessage.textContent = 'Failed to connect to analysis service';
            if (analysisError) analysisError.classList.remove('d-none');
        }
    });
    
    // Try again button handler
    const tryAgainBtn = document.getElementById('tryAgainBtn');
    if (tryAgainBtn) {
        tryAgainBtn.addEventListener('click', () => {
            if (analysisError) analysisError.classList.add('d-none');
            // Reset the form
            if (documentUploadForm) documentUploadForm.reset();
        });
    }
}

/**
 * Initialize text input analysis functionality
 */
function initializeTextAnalysis() {
    const textAnalysisForm = document.getElementById('textAnalysisForm');
    if (!textAnalysisForm) return;
    
    const analysisLoader = document.getElementById('analysisLoader');
    const analysisResults = document.getElementById('analysisResults');
    const analysisError = document.getElementById('analysisError');
    const documentNameBadge = document.getElementById('documentNameBadge');
    const analysisTypeBadge = document.getElementById('analysisTypeBadge');
    const analysisContent = document.getElementById('analysisContent');
    
    textAnalysisForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const legalTextElement = document.getElementById('legalText');
        const analysisTypeElement = document.getElementById('textAnalysisType');
        
        if (!legalTextElement) {
            console.error('Legal text element not found');
            showAlert('Form error: Legal text field not found.', 'danger');
            return;
        }
        
        const legalText = legalTextElement.value.trim();
        const analysisType = analysisTypeElement ? analysisTypeElement.value : 'summary';
        
        if (!legalText) {
            showAlert('Please enter text to analyze.', 'warning');
            return;
        }
        
        // Show loading state
        if (analysisResults) analysisResults.classList.add('d-none');
        if (analysisError) analysisError.classList.add('d-none');
        if (analysisLoader) analysisLoader.classList.remove('d-none');
        
        // Reset and show compliance score loading animation
        const complianceScoreLoading = document.getElementById('complianceScoreLoading');
        const resultComplianceStatus = document.getElementById('resultComplianceStatus');
        if (complianceScoreLoading) complianceScoreLoading.classList.remove('d-none');
        if (resultComplianceStatus) resultComplianceStatus.textContent = 'Calculating...';
        
        try {
            // Send request to API
            const response = await fetch('/api/analyze-text', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    text: legalText,
                    analysis_type: analysisType
                })
            });
            
            const result = await response.json();
            
            // Hide loader
            if (analysisLoader) analysisLoader.classList.add('d-none');
            
            if (response.ok && result.status === 'success') {
                // Display results
                if (documentNameBadge) documentNameBadge.textContent = 'Text Input';
                if (analysisTypeBadge) analysisTypeBadge.textContent = formatAnalysisType(result.analysis_type);
                if (analysisContent) analysisContent.innerHTML = formatAnalysisResult(result.result);
                if (analysisResults) analysisResults.classList.remove('d-none');
                
                // Hide compliance score loading animation
                const complianceScoreLoading = document.getElementById('complianceScoreLoading');
                if (complianceScoreLoading) complianceScoreLoading.classList.add('d-none');
                
                // Add to history in local storage
                result.document_name = 'Text Input';
                addToHistory(result);
                
                // Initialize copy and download buttons
                initializeResultActions(result);
            } else {
                // Show error
                const errorMessage = document.getElementById('errorMessage');
                if (errorMessage) errorMessage.textContent = result.message || 'An error occurred during analysis';
                if (analysisError) analysisError.classList.remove('d-none');
            }
        } catch (error) {
            console.error('Error analyzing text:', error);
            
            // Hide loader and show error
            if (analysisLoader) analysisLoader.classList.add('d-none');
            
            // Hide compliance score loading animation
            const complianceScoreLoading = document.getElementById('complianceScoreLoading');
            if (complianceScoreLoading) complianceScoreLoading.classList.add('d-none');
            
            const errorMessage = document.getElementById('errorMessage');
            if (errorMessage) errorMessage.textContent = 'Failed to connect to analysis service';
            if (analysisError) analysisError.classList.remove('d-none');
        }
    });
}

/**
 * Initialize copy and download buttons for analysis results
 * @param {Object} result - The analysis result
 */
function initializeResultActions(result) {
    // Try to find the buttons with more specific selectors
    const copyResultsBtn = document.querySelector('#copyResultsBtn, .copy-results-btn, [data-action="copy-results"]');
    const downloadResultsBtn = document.querySelector('#downloadResultsBtn, .download-results-btn, [data-action="download-results"]');
    const analysisContent = document.getElementById('analysisContent');
    
    // Check if elements were found
    if (!copyResultsBtn || !analysisContent) {
        console.warn('Copy results button or analysis content not found - buttons may have different IDs than expected');
        return;
    }
    
    // Copy results to clipboard
    copyResultsBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(analysisContent.textContent)
            .then(() => {
                showAlert('Analysis copied to clipboard', 'success', 2000);
            })
            .catch(err => {
                console.error('Failed to copy text: ', err);
                showAlert('Failed to copy to clipboard', 'danger');
            });
    });
    
    // Download results as text file
    if (downloadResultsBtn) {
        downloadResultsBtn.addEventListener('click', () => {
            const analysisType = formatAnalysisType(result.analysis_type);
            const documentName = result.document_name || 'Document';
            const fileName = `${documentName.split('.')[0]}-${analysisType}-Analysis.txt`;
            
            const blob = new Blob([analysisContent.textContent], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            
            // Clean up
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            showAlert('Analysis downloaded', 'success', 2000);
        });
    }
}

/**
 * Format analysis type for display
 * @param {string} type - Analysis type from API
 * @returns {string} Formatted analysis type
 */
function formatAnalysisType(type) {
    const typeMap = {
        'summary': 'Summary',
        'key_points': 'Key Points',
        'risks': 'Risk Analysis',
        'parties': 'Parties',
        'definitions': 'Definitions',
        'comprehensive': 'Comprehensive'
    };
    
    return typeMap[type] || type.charAt(0).toUpperCase() + type.slice(1);
}

/**
 * Format analysis result for display
 * @param {string} result - The analysis result text
 * @returns {string} Formatted HTML for display
 */
function formatAnalysisResult(result) {
    if (!result) return '<p>No analysis results available.</p>';
    
    // Convert line breaks to HTML breaks
    return result
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold text
        .replace(/_(.*?)_/g, '<em>$1</em>'); // Italic text
}

/**
 * Add analysis to history (Firestore for authenticated users, local storage otherwise)
 * @param {Object} result - Analysis result object
 */
async function addToHistory(result) {
    try {
        // Create history item
        const historyItem = {
            id: Date.now().toString(),
            filename: result.document_name || 'Text Analysis',
            analysisType: result.analysis_type || 'general',
            timestamp: new Date(),
            result: result.result || '',
            compliance: result.compliance || null
        };
        
        // Check if user is authenticated with Firebase
        if (typeof firebase !== 'undefined' && firebase.auth().currentUser) {
            try {
                // Add userId to the history item
                historyItem.userId = firebase.auth().currentUser.uid;
                
                // Save to Firestore
                const docRef = await firebase.firestore().collection('analysis_history').add(historyItem);
                
                console.log('Analysis saved to Firestore with ID:', docRef.id);
                return;
            } catch (firestoreError) {
                console.error('Error saving to Firestore:', firestoreError);
                // Continue with local storage as fallback
            }
        }
        
        // If not authenticated or Firestore fails, use localStorage
        
        // Get existing history from localStorage or initialize empty array
        const storageKey = 'analysisHistory';
        let history = JSON.parse(localStorage.getItem(storageKey) || '[]');
        
        // Add new entry
        history.unshift(historyItem);
        
        // Limit history to 50 items
        history = history.slice(0, 50);
        
        // Save to localStorage
        localStorage.setItem(storageKey, JSON.stringify(history));
        
        console.log('Analysis saved to localStorage');
    } catch (error) {
        console.error('Error saving to history:', error);
    }
}

/**
 * Format compliance status for display
 * @param {string} status - Compliance status from Legal BERT
 * @returns {string} Formatted status text 
 */
function formatComplianceStatus(status) {
    const statusMap = {
        'valid': 'Valid',
        'review_recommended': 'Review Recommended',
        'flagged': 'Compliance Issues',
        'unknown': 'Unknown'
    };
    
    return statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');
}

/**
 * Get the appropriate color class for a compliance score
 * @param {number} score - Compliance score (0-1)
 * @returns {string} Bootstrap color class
 */
function getScoreColorClass(score) {
    if (score >= 0.7) return 'bg-success';
    if (score >= 0.4) return 'bg-warning';
    return 'bg-danger';
}

/**
 * Show an alert notification
 * @param {string} message - Message to display
 * @param {string} type - Alert type (success, danger, warning, info)
 * @param {number} duration - Duration in milliseconds
 */
function showAlert(message, type = 'info', duration = 5000) {
    const alertId = 'document-alert-' + Date.now();
    const alertHtml = `
        <div id="${alertId}" class="alert alert-${type} alert-dismissible fade show position-fixed" 
             style="top: 70px; right: 20px; max-width: 400px; z-index: 9999;">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', alertHtml);
    
    if (duration) {
        setTimeout(() => {
            const alertElement = document.getElementById(alertId);
            if (alertElement) {
                alertElement.classList.remove('show');
                setTimeout(() => alertElement.remove(), 300);
            }
        }, duration);
    }
}
