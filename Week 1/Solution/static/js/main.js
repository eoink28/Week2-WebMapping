/**
 * Main JavaScript file for the Web Mapping Platform
 * Common functionality shared across all pages
 */

// Global application namespace
window.WebMappingApp = window.WebMappingApp || {};

// Common utility functions
WebMappingApp.utils = {
    
    /**
     * Get CSRF token for Django requests
     */
    getCsrfToken: function() {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'csrftoken') {
                return value;
            }
        }
        // Fallback to meta tag or window variable
        const metaTag = document.querySelector('meta[name="csrf-token"]');
        if (metaTag) {
            return metaTag.getAttribute('content');
        }
        return window.DJANGO_CONTEXT?.csrfToken || '';
    },

    /**
     * Display notification messages
     */
    showNotification: function(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    },

    /**
     * Format numbers with thousand separators
     */
    formatNumber: function(num) {
        return num.toLocaleString();
    },

    /**
     * Validate coordinates
     */
    validateCoordinates: function(lat, lng) {
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lng);
        
        if (isNaN(latitude) || isNaN(longitude)) {
            return { valid: false, message: 'Coordinates must be numbers' };
        }
        
        if (latitude < -90 || latitude > 90) {
            return { valid: false, message: 'Latitude must be between -90 and 90' };
        }
        
        if (longitude < -180 || longitude > 180) {
            return { valid: false, message: 'Longitude must be between -180 and 180' };
        }
        
        return { valid: true, lat: latitude, lng: longitude };
    }
};

// Common event handlers
document.addEventListener('DOMContentLoaded', function() {
    console.log('Web Mapping Platform - Main JS loaded');
    
    // Initialize common functionality
    initializeCommonFeatures();
});

function initializeCommonFeatures() {
    // Add loading states to forms
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn && !submitBtn.disabled) {
                const originalText = submitBtn.textContent;
                submitBtn.textContent = 'Loading...';
                submitBtn.disabled = true;
                
                // Re-enable after 5 seconds as fallback
                setTimeout(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                }, 5000);
            }
        });
    });
    
    // Add smooth scrolling to anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
    
    // Initialize tooltips if Bootstrap is available
    if (typeof bootstrap !== 'undefined') {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function(tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }
}

// Export utilities for use in other scripts
window.WebMappingApp.utils = WebMappingApp.utils;