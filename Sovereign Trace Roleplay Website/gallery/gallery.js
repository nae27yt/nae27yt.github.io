// =========================
// FIVEMANAGE GALLERY SCRIPT
// =========================

const API_BASE = 'https://api.fivemanage.com/api/v3/file';
const ITEMS_PER_PAGE = 50;
const API_KEY = 'qvD9O2lylAFyNsvzo8QkVcmlESeya10Q';

let currentPage = 1;
let currentApiKey = API_KEY;
let allImages = [];
let totalPages = 1;

// DOM Elements
const galleryGrid = document.getElementById('galleryGrid');
const loadingSpinner = document.getElementById('loadingSpinner');
const errorMessage = document.getElementById('errorMessage');
const errorText = document.getElementById('errorText');
const prevPageBtn = document.getElementById('prevPageBtn');
const nextPageBtn = document.getElementById('nextPageBtn');
const pageInfo = document.getElementById('pageInfo');
const imageModal = document.getElementById('imageModal');
const closeModal = document.querySelector('.close-modal');
const modalImage = document.getElementById('modalImage');
const modalFilename = document.getElementById('modalFilename');
const modalSize = document.getElementById('modalSize');
const modalDownload = document.getElementById('modalDownload');
const configText = document.querySelector('.config-text');

// Event Listeners
if (prevPageBtn) {
    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            loadGallery();
        }
    });
}

if (nextPageBtn) {
    nextPageBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            loadGallery();
        }
    });
}

if (closeModal) {
    closeModal.addEventListener('click', () => {
        imageModal.classList.remove('show');
    });
}

if (imageModal) {
    imageModal.addEventListener('click', (e) => {
        if (e.target === imageModal) {
            imageModal.classList.remove('show');
        }
    });
}

// =========================
// MAIN FUNCTIONS
// =========================

/**
 * Load gallery from FiveManage API
 */
async function loadGallery() {
    console.log('Starting gallery load with API key:', currentApiKey.substring(0, 5) + '...');
    showLoading(true);
    hideError();

    try {
        const url = `${API_BASE}?limit=${ITEMS_PER_PAGE}&type=image&page=${currentPage}`;
        console.log('Fetching from:', url);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': currentApiKey,
                'Content-Type': 'application/json'
            }
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Invalid API Key. Please check your credentials.');
            } else if (response.status === 500) {
                throw new Error('Server error. Please try again later.');
            } else {
                throw new Error(`API Error: ${response.status}`);
            }
        }

        const data = await response.json();
        console.log('API Response:', data);

        if (!data.data || !Array.isArray(data.data)) {
            throw new Error('Invalid API response format');
        }

        allImages = data.data.filter(item => item.type === 'image');
        
        // Sort images from newest to oldest
        allImages.sort((a, b) => {
            // Check for date fields in metadata
            const aDate = getDateFromMetadata(a.metadata) || getDateFromFilename(a.filename);
            const bDate = getDateFromMetadata(b.metadata) || getDateFromFilename(b.filename);
            
            if (aDate && bDate) {
                return bDate - aDate; // Newest first
            }
            
            // Fallback to ID comparison (assuming higher ID = newer)
            if (a.id && b.id) {
                // Try numeric comparison first
                const aNum = parseInt(a.id.replace(/\D/g, ''));
                const bNum = parseInt(b.id.replace(/\D/g, ''));
                if (!isNaN(aNum) && !isNaN(bNum)) {
                    return bNum - aNum;
                }
                // Fallback to string comparison
                return b.id.localeCompare(a.id);
            }
            
            // Final fallback to filename
            return b.filename.localeCompare(a.filename);
        });
        
        console.log('Filtered and sorted images:', allImages.length);
        
        totalPages = data.pagination.total > 0 ? Math.ceil(data.pagination.total / ITEMS_PER_PAGE) : 1;
        console.log('Total pages:', totalPages);

        if (allImages.length === 0) {
            showError('No images found in your gallery');
            if (configText) {
                configText.textContent = `Total Images: 0`;
            }
        } else {
            if (configText) {
                configText.textContent = `Total Images: ${data.pagination.total} | Page ${currentPage} of ${totalPages}`;
            }
            displayGallery();
        }
    } catch (error) {
        console.error('Gallery load error:', error);
        showError(`Failed to load gallery: ${error.message}`);
    } finally {
        showLoading(false);
    }
}

/**
 * Display images for current page
 */
function displayGallery() {
    if (!galleryGrid) {
        console.error('Gallery grid element not found');
        return;
    }

    console.log(`Displaying ${allImages.length} images on page ${currentPage}`);

    // Clear gallery
    galleryGrid.innerHTML = '';

    // Add images to gallery
    allImages.forEach(image => {
        const galleryItem = createGalleryItem(image);
        galleryGrid.appendChild(galleryItem);
    });

    // Update pagination controls
    updatePaginationControls();

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Create a gallery item element
 */
function createGalleryItem(image) {
    const item = document.createElement('div');
    item.className = 'gallery-item';

    const img = document.createElement('img');
    img.src = image.url;
    img.alt = image.filename;
    img.onerror = () => {
        img.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect fill=%22%23ddd%22 width=%22100%22 height=%22100%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-family=%22Arial%22 font-size=%2214%22 fill=%22%23999%22%3EImage Error%3C/text%3E%3C/svg%3E';
    };

    const overlay = document.createElement('div');
    overlay.className = 'gallery-item-overlay';

    const filename = document.createElement('p');
    filename.className = 'gallery-item-name';
    filename.textContent = truncateFilename(image.filename, 30);
    filename.title = image.filename;

    const size = document.createElement('p');
    size.className = 'gallery-item-size';
    size.textContent = formatFileSize(image.size);

    overlay.appendChild(filename);
    overlay.appendChild(size);

    item.appendChild(img);
    item.appendChild(overlay);

    // Click to open modal
    item.addEventListener('click', () => {
        openModal(image);
    });

    return item;
}

/**
 * Open image modal
 */
function openModal(image) {
    modalImage.src = image.url;
    modalFilename.textContent = image.filename;
    modalSize.textContent = `Size: ${formatFileSize(image.size)}`;
    modalDownload.href = image.url;
    modalDownload.download = image.filename;
    imageModal.classList.add('show');
}

/**
 * Update pagination controls
 */
function updatePaginationControls() {
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;
}

// =========================
// UTILITY FUNCTIONS
// =========================

/**
 * Extract date from metadata object
 */
function getDateFromMetadata(metadata) {
    if (!metadata) return null;
    
    // Check for common date field names
    const dateFields = ['created_at', 'createdAt', 'date', 'timestamp', 'uploaded_at', 'uploadedAt'];
    
    for (const field of dateFields) {
        if (metadata[field]) {
            const date = new Date(metadata[field]);
            if (!isNaN(date.getTime())) {
                return date;
            }
        }
    }
    
    return null;
}

/**
 * Extract date from filename (looks for YYYY-MM-DD or YYYYMMDD patterns)
 */
function getDateFromFilename(filename) {
    if (!filename) return null;
    
    // Look for date patterns in filename
    const datePatterns = [
        /(\d{4})-(\d{2})-(\d{2})/,  // YYYY-MM-DD
        /(\d{4})(\d{2})(\d{2})/,     // YYYYMMDD
        /(\d{2})-(\d{2})-(\d{4})/,  // MM-DD-YYYY
        /(\d{2})(\d{2})(\d{4})/      // MMDDYYYY
    ];
    
    for (const pattern of datePatterns) {
        const match = filename.match(pattern);
        if (match) {
            let year, month, day;
            
            if (match[1].length === 4) {
                // YYYY-MM-DD or YYYYMMDD
                year = parseInt(match[1]);
                month = parseInt(match[2]) - 1; // JS months are 0-based
                day = parseInt(match[3]);
            } else {
                // MM-DD-YYYY or MMDDYYYY
                month = parseInt(match[1]) - 1;
                day = parseInt(match[2]);
                year = parseInt(match[3]);
            }
            
            const date = new Date(year, month, day);
            if (!isNaN(date.getTime())) {
                return date;
            }
        }
    }
    
    return null;
}

/**
 * Format file size to human-readable format
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Truncate filename to specified length
 */
function truncateFilename(filename, maxLength) {
    if (filename.length <= maxLength) {
        return filename;
    }
    return filename.substring(0, maxLength - 3) + '...';
}

/**
 * Show/hide loading spinner
 */
function showLoading(show) {
    if (loadingSpinner) {
        loadingSpinner.style.display = show ? 'flex' : 'none';
    }
}

/**
 * Show error message
 */
function showError(message) {
    console.error('Gallery Error:', message);
    if (errorMessage && errorText) {
        errorText.textContent = message;
        errorMessage.style.display = 'block';
    }
}

/**
 * Hide error message
 */
function hideError() {
    if (errorMessage) {
        errorMessage.style.display = 'none';
    }
}

// =========================
// INITIALIZATION
// =========================

function initGallery() {
    console.log('Initializing gallery...');
    console.log('Document ready state:', document.readyState);
    console.log('Gallery grid element:', galleryGrid ? 'Found' : 'NOT FOUND');
    console.log('Loading spinner element:', loadingSpinner ? 'Found' : 'NOT FOUND');
    
    // Start loading gallery
    loadGallery();
}

// Auto-load gallery when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('DOMContentLoaded fired');
        initGallery();
    });
} else {
    // DOM is already loaded
    console.log('DOM already loaded, initializing immediately');
    initGallery();
}
