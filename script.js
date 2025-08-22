// ATS Resume Checker - Main JavaScript File

class ATSResumeChecker {
    constructor() {
        this.resumeText = '';
        this.jobDescription = '';
        this.analysisResults = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupMobileMenu();
        this.setupFileUpload();
        this.setupSmoothScrolling();
        this.addAnimations();
    }

    setupEventListeners() {
        // Form submission
        const form = document.getElementById('resume-form');
        if (form) {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }

        // Input method toggle
        const inputMethods = document.querySelectorAll('input[name="input-method"]');
        inputMethods.forEach(radio => {
            radio.addEventListener('change', (e) => this.toggleInputMethod(e.target.value));
        });

        // New analysis button
        const newAnalysisBtn = document.getElementById('new-analysis');
        if (newAnalysisBtn) {
            newAnalysisBtn.addEventListener('click', () => this.resetForm());
        }

        // Download report button
        const downloadBtn = document.getElementById('download-report');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => this.downloadReport());
        }

        // Contact form submission
        const contactForm = document.querySelector('#contact form');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => this.handleContactSubmit(e));
        }
    }

    setupMobileMenu() {
        const mobileMenuButton = document.getElementById('mobile-menu-button');
        const mobileMenu = document.getElementById('mobile-menu');

        if (mobileMenuButton && mobileMenu) {
            mobileMenuButton.addEventListener('click', () => {
                mobileMenu.classList.toggle('hidden');
                // Add animation class
                if (!mobileMenu.classList.contains('hidden')) {
                    mobileMenu.classList.add('mobile-menu-enter-active');
                }
            });

            // Close mobile menu when clicking on links
            const mobileLinks = document.querySelectorAll('.mobile-nav-link');
            mobileLinks.forEach(link => {
                link.addEventListener('click', () => {
                    mobileMenu.classList.add('hidden');
                    mobileMenu.classList.remove('mobile-menu-enter-active');
                });
            });

            // Close mobile menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!mobileMenuButton.contains(e.target) && !mobileMenu.contains(e.target)) {
                    mobileMenu.classList.add('hidden');
                    mobileMenu.classList.remove('mobile-menu-enter-active');
                }
            });
        }
    }

    setupFileUpload() {
        const fileInput = document.getElementById('resume-file');
        const uploadArea = document.getElementById('file-upload-area');
        const fileInfo = document.getElementById('file-info');

        if (fileInput && uploadArea) {
            // Click to upload
            uploadArea.addEventListener('click', () => fileInput.click());

            // File selection
            fileInput.addEventListener('change', (e) => this.handleFileSelect(e));

            // Drag and drop
            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.classList.add('dragover');
            });

            uploadArea.addEventListener('dragleave', (e) => {
                e.preventDefault();
                if (!uploadArea.contains(e.relatedTarget)) {
                    uploadArea.classList.remove('dragover');
                }
            });

            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.classList.remove('dragover');
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    fileInput.files = files;
                    this.handleFileSelect({ target: fileInput });
                }
            });
        }
    }

    setupSmoothScrolling() {
        const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const targetSection = document.getElementById(targetId);
                if (targetSection) {
                    targetSection.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    }

    addAnimations() {
        // Add fade-in animation to sections when they come into view
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                }
            });
        }, observerOptions);

        // Observe all sections
        const sections = document.querySelectorAll('section');
        sections.forEach(section => {
            observer.observe(section);
        });
    }

    toggleInputMethod(method) {
        const fileSection = document.getElementById('file-upload-section');
        const textSection = document.getElementById('text-paste-section');

        if (method === 'upload') {
            fileSection.classList.remove('hidden');
            textSection.classList.add('hidden');
            // Clear text area
            document.getElementById('resume-text').value = '';
        } else {
            fileSection.classList.add('hidden');
            textSection.classList.remove('hidden');
            // Clear file input
            document.getElementById('resume-file').value = '';
            document.getElementById('file-info').classList.add('hidden');
        }
    }

    handleFileSelect(event) {
        const file = event.target.files[0];
        const fileInfo = document.getElementById('file-info');
        
        if (file) {
            // Validate file type
            const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
            if (!allowedTypes.includes(file.type)) {
                this.showMessage('Please select a PDF, DOCX, or TXT file.', 'error');
                event.target.value = '';
                return;
            }

            // Validate file size (5MB limit)
            if (file.size > 5 * 1024 * 1024) {
                this.showMessage('File size must be less than 5MB.', 'error');
                event.target.value = '';
                return;
            }

            // Display file info
            fileInfo.innerHTML = `
                <div class="flex items-center space-x-2">
                    <i class="fas fa-file-alt text-blue-600"></i>
                    <span>${file.name} (${this.formatFileSize(file.size)})</span>
                </div>
            `;
            fileInfo.classList.remove('hidden');

            // Read file content
            this.readFileContent(file);
        }
    }

    readFileContent(file) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            this.resumeText = e.target.result;
            this.showMessage('File uploaded successfully!', 'success');
        };

        reader.onerror = () => {
            this.showMessage('Error reading file. Please try again.', 'error');
        };

        if (file.type === 'text/plain') {
            reader.readAsText(file);
        } else {
            // For PDF and DOCX, we'll use a simple text extraction
            // In a real implementation, you'd use proper libraries
            reader.readAsText(file);
        }
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    async handleFormSubmit(event) {
        event.preventDefault();
        
        // Get form data
        const inputMethod = document.querySelector('input[name="input-method"]:checked').value;
        
        if (inputMethod === 'paste') {
            this.resumeText = document.getElementById('resume-text').value.trim();
        }
        
        this.jobDescription = document.getElementById('job-description').value.trim();

        // Validate input
        if (!this.resumeText) {
            this.showMessage('Please provide your resume content.', 'error');
            return;
        }

        // Show loading
        this.showLoading(true);

        try {
            // Analyze resume
            this.analysisResults = await this.analyzeResume(this.resumeText, this.jobDescription);
            
            // Display results
            this.displayResults(this.analysisResults);
            
            // Hide loading
            this.showLoading(false);
            
            // Scroll to results
            document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
            
        } catch (error) {
            this.showLoading(false);
            this.showMessage('Error analyzing resume. Please try again.', 'error');
            console.error('Analysis error:', error);
        }
    }

    async analyzeResume(resumeText, jobDescription) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        const analysis = {
            score: 0,
            strengths: [],
            improvements: [],
            suggestions: [],
            keywords: {
                found: [],
                missing: []
            },
            formatting: {
                hasSummary: false,
                hasMeasurableResults: false,
                hasKeywords: false,
                isWellFormatted: false
            }
        };

        // Extract keywords from job description
        const jobKeywords = jobDescription ? this.extractKeywords(jobDescription) : [];
        
        // Extract keywords from resume
        const resumeKeywords = this.extractKeywords(resumeText);
        
        // Check keyword matching
        if (jobKeywords.length > 0) {
            analysis.keywords.found = jobKeywords.filter(keyword => 
                resumeKeywords.some(resumeKeyword => 
                    resumeKeyword.toLowerCase().includes(keyword.toLowerCase())
                )
            );
            analysis.keywords.missing = jobKeywords.filter(keyword => 
                !analysis.keywords.found.includes(keyword)
            );
        }

        // Analyze formatting
        analysis.formatting.hasSummary = this.hasSummary(resumeText);
        analysis.formatting.hasMeasurableResults = this.hasMeasurableResults(resumeText);
        analysis.formatting.hasKeywords = resumeKeywords.length > 0;
        analysis.formatting.isWellFormatted = this.isWellFormatted(resumeText);

        // Calculate score
        analysis.score = this.calculateScore(analysis);

        // Generate strengths and improvements
        analysis.strengths = this.generateStrengths(analysis);
        analysis.improvements = this.generateImprovements(analysis);
        analysis.suggestions = this.generateSuggestions(analysis);

        return analysis;
    }

    extractKeywords(text) {
        const commonKeywords = [
            'management', 'leadership', 'project', 'development', 'analysis', 'design',
            'implementation', 'strategy', 'planning', 'coordination', 'communication',
            'teamwork', 'problem solving', 'research', 'data', 'technology', 'software',
            'programming', 'database', 'web', 'mobile', 'cloud', 'security', 'testing',
            'quality assurance', 'customer service', 'sales', 'marketing', 'finance',
            'accounting', 'human resources', 'operations', 'logistics', 'supply chain',
            'javascript', 'python', 'java', 'react', 'node.js', 'sql', 'aws', 'azure',
            'agile', 'scrum', 'kanban', 'ci/cd', 'devops', 'api', 'rest', 'graphql'
        ];

        const words = text.toLowerCase().match(/\b\w+\b/g) || [];
        const keywordCounts = {};
        
        words.forEach(word => {
            if (commonKeywords.some(keyword => keyword.includes(word) || word.includes(keyword))) {
                keywordCounts[word] = (keywordCounts[word] || 0) + 1;
            }
        });

        return Object.keys(keywordCounts).slice(0, 15);
    }

    hasSummary(text) {
        const summaryPatterns = [
            /summary/i,
            /profile/i,
            /objective/i,
            /overview/i,
            /professional summary/i,
            /career objective/i
        ];
        return summaryPatterns.some(pattern => pattern.test(text));
    }

    hasMeasurableResults(text) {
        const resultPatterns = [
            /\d+%/,
            /\d+\s*(increase|decrease|improvement|growth|reduction)/i,
            /increased|decreased|improved|reduced|grew|achieved|delivered/i,
            /\$\d+/, // Dollar amounts
            /\d+\s*(users|customers|clients|projects|team members)/i
        ];
        return resultPatterns.some(pattern => pattern.test(text));
    }

    isWellFormatted(text) {
        const lines = text.split('\n');
        const hasBulletPoints = lines.some(line => /^[\s]*[•\-\*]/.test(line));
        const hasSections = /(experience|education|skills|work|employment|projects)/i.test(text);
        const hasContactInfo = /(email|phone|address|linkedin)/i.test(text);
        return hasBulletPoints && hasSections && hasContactInfo;
    }

    calculateScore(analysis) {
        let score = 0;

        // Keyword matching (40 points)
        if (analysis.keywords.found.length > 0) {
            const keywordScore = (analysis.keywords.found.length / Math.max(analysis.keywords.found.length + analysis.keywords.missing.length, 1)) * 40;
            score += keywordScore;
        } else if (analysis.keywords.found.length === 0 && analysis.keywords.missing.length === 0) {
            // No job description provided, give points for having keywords in general
            score += 20;
        }

        // Formatting (30 points)
        if (analysis.formatting.hasSummary) score += 10;
        if (analysis.formatting.hasMeasurableResults) score += 10;
        if (analysis.formatting.isWellFormatted) score += 10;

        // Content quality (30 points)
        if (analysis.formatting.hasKeywords) score += 15;
        if (analysis.formatting.hasMeasurableResults) score += 15;

        return Math.round(score);
    }

    generateStrengths(analysis) {
        const strengths = [];

        if (analysis.keywords.found.length > 0) {
            strengths.push(`Strong keyword matching with ${analysis.keywords.found.length} relevant keywords found`);
        }

        if (analysis.formatting.hasSummary) {
            strengths.push('Professional summary/profile section present');
        }

        if (analysis.formatting.hasMeasurableResults) {
            strengths.push('Contains measurable results and achievements');
        }

        if (analysis.formatting.isWellFormatted) {
            strengths.push('Well-structured format with clear sections');
        }

        if (strengths.length === 0) {
            strengths.push('Resume submitted successfully for analysis');
        }

        return strengths;
    }

    generateImprovements(analysis) {
        const improvements = [];

        if (analysis.keywords.missing.length > 0) {
            improvements.push(`Missing ${analysis.keywords.missing.length} important keywords from job description`);
        }

        if (!analysis.formatting.hasSummary) {
            improvements.push('Add a professional summary or profile section');
        }

        if (!analysis.formatting.hasMeasurableResults) {
            improvements.push('Include measurable results and achievements');
        }

        if (!analysis.formatting.isWellFormatted) {
            improvements.push('Improve formatting with clear sections and bullet points');
        }

        if (analysis.score < 50) {
            improvements.push('Overall resume needs significant improvement for ATS compatibility');
        }

        return improvements;
    }

    generateSuggestions(analysis) {
        const suggestions = [];

        // Keyword suggestions
        if (analysis.keywords.missing.length > 0) {
            suggestions.push({
                type: 'keyword',
                title: 'Add Missing Keywords',
                description: `Consider incorporating these keywords: ${analysis.keywords.missing.slice(0, 5).join(', ')}`,
                priority: 'high'
            });
        }

        // Formatting suggestions
        if (!analysis.formatting.hasSummary) {
            suggestions.push({
                type: 'formatting',
                title: 'Add Professional Summary',
                description: 'Include a 2-3 sentence summary highlighting your key qualifications and career objectives',
                priority: 'medium'
            });
        }

        if (!analysis.formatting.hasMeasurableResults) {
            suggestions.push({
                type: 'content',
                title: 'Quantify Achievements',
                description: 'Add specific numbers, percentages, and measurable results to your experience',
                priority: 'high'
            });
        }

        // General suggestions
        suggestions.push({
            type: 'general',
            title: 'Use ATS-Friendly Formatting',
            description: 'Use standard fonts (Arial, Calibri), clear headings, and avoid graphics or tables',
            priority: 'medium'
        });

        return suggestions;
    }

    displayResults(results) {
        // Show results section
        const resultsSection = document.getElementById('results');
        resultsSection.classList.remove('hidden');

        // Update score
        this.updateScore(results.score);

        // Update strengths
        this.updateList('strengths-list', results.strengths, 'check-circle', 'text-green-600');

        // Update improvements
        this.updateList('improvements-list', results.improvements, 'exclamation-triangle', 'text-orange-600');

        // Update detailed suggestions
        this.updateSuggestions(results.suggestions);
    }

    updateScore(score) {
        const scoreNumber = document.getElementById('score-number');
        const scoreCircle = document.getElementById('score-circle');
        const scoreMessage = document.getElementById('score-message');

        // Animate score number
        let currentScore = 0;
        const targetScore = score;
        const increment = targetScore / 50;
        
        const scoreInterval = setInterval(() => {
            currentScore += increment;
            if (currentScore >= targetScore) {
                currentScore = targetScore;
                clearInterval(scoreInterval);
            }
            scoreNumber.textContent = Math.round(currentScore);
        }, 20);

        // Animate score circle
        const circumference = 2 * Math.PI * 70;
        const offset = circumference - (score / 100) * circumference;
        scoreCircle.style.strokeDashoffset = offset;

        // Update score message
        let message = '';
        let messageClass = '';
        
        if (score >= 80) {
            message = 'Excellent! Your resume is highly ATS-compatible.';
            messageClass = 'score-excellent';
        } else if (score >= 60) {
            message = 'Good! Your resume has good ATS compatibility with room for improvement.';
            messageClass = 'score-good';
        } else if (score >= 40) {
            message = 'Fair. Your resume needs improvements for better ATS compatibility.';
            messageClass = 'score-fair';
        } else {
            message = 'Poor. Your resume needs significant improvements for ATS compatibility.';
            messageClass = 'score-poor';
        }

        scoreMessage.textContent = message;
        scoreMessage.className = `mt-6 text-xl font-semibold ${messageClass}`;
    }

    updateList(listId, items, icon, iconClass) {
        const list = document.getElementById(listId);
        list.innerHTML = '';

        items.forEach((item, index) => {
            const li = document.createElement('li');
            li.className = 'flex items-start space-x-3 animate-fade-in';
            li.style.animationDelay = `${index * 0.1}s`;
            li.innerHTML = `
                <i class="fas fa-${icon} ${iconClass} mt-1 flex-shrink-0"></i>
                <span>${item}</span>
            `;
            list.appendChild(li);
        });
    }

    updateSuggestions(suggestions) {
        const container = document.getElementById('detailed-suggestions');
        container.innerHTML = '';

        suggestions.forEach((suggestion, index) => {
            const card = document.createElement('div');
            card.className = 'suggestion-card animate-fade-in';
            card.style.animationDelay = `${index * 0.2}s`;
            card.innerHTML = `
                <div class="flex items-start justify-between">
                    <div>
                        <h4 class="font-semibold mb-2">${suggestion.title}</h4>
                        <p class="text-sm opacity-90">${suggestion.description}</p>
                    </div>
                    <span class="bg-white bg-opacity-20 px-3 py-1 rounded-full text-xs font-semibold">
                        ${suggestion.priority.toUpperCase()}
                    </span>
                </div>
            `;
            container.appendChild(card);
        });
    }

    showLoading(show) {
        const modal = document.getElementById('loading-modal');
        if (show) {
            modal.classList.remove('hidden');
        } else {
            modal.classList.add('hidden');
        }
    }

    showMessage(message, type) {
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.message');
        existingMessages.forEach(msg => msg.remove());

        // Create new message
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.innerHTML = `
            <div class="flex items-center space-x-2">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
                <span>${message}</span>
            </div>
        `;

        // Insert after form
        const form = document.getElementById('resume-form');
        form.parentNode.insertBefore(messageDiv, form.nextSibling);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }

    handleContactSubmit(event) {
        event.preventDefault();
        this.showMessage('Thank you for your message! We\'ll get back to you soon.', 'success');
        event.target.reset();
    }

    resetForm() {
        // Reset form fields
        document.getElementById('resume-form').reset();
        document.getElementById('file-info').classList.add('hidden');
        document.getElementById('text-paste-section').classList.add('hidden');
        document.getElementById('file-upload-section').classList.remove('hidden');

        // Hide results
        document.getElementById('results').classList.add('hidden');

        // Reset data
        this.resumeText = '';
        this.jobDescription = '';
        this.analysisResults = null;

        // Scroll to upload section
        document.getElementById('upload').scrollIntoView({ behavior: 'smooth' });
    }

    downloadReport() {
        if (!this.analysisResults) return;

        const report = this.generateReport();
        const blob = new Blob([report], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ats-resume-report.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showMessage('Report downloaded successfully!', 'success');
    }

    generateReport() {
        const results = this.analysisResults;
        let report = 'ATS RESUME ANALYSIS REPORT\n';
        report += '='.repeat(50) + '\n\n';
        
        report += `Overall ATS Score: ${results.score}/100\n\n`;
        
        report += 'STRENGTHS:\n';
        results.strengths.forEach(strength => {
            report += `• ${strength}\n`;
        });
        
        report += '\nAREAS FOR IMPROVEMENT:\n';
        results.improvements.forEach(improvement => {
            report += `• ${improvement}\n`;
        });
        
        report += '\nDETAILED SUGGESTIONS:\n';
        results.suggestions.forEach(suggestion => {
            report += `• ${suggestion.title}: ${suggestion.description}\n`;
        });
        
        report += '\nGenerated on: ' + new Date().toLocaleString();
        
        return report;
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ATSResumeChecker();
}); 