// ============================================
// ElectroMove Admin Dashboard - Main Script
// ============================================

// API Configuration
const API_BASE_URL = 'https://swp391.up.railway.app/api';
const API_ENDPOINTS = {
    priceTable: `${API_BASE_URL}/pricetable`,
    customers: `${API_BASE_URL}/customer`,
    stations: `${API_BASE_URL}/chargingstation`,
    reports: `${API_BASE_URL}/reports`
};

// Global State Management
const appState = {
    currentSection: 'dashboard',
    currentUser: null,
    isLoggedIn: false,
    priceTableData: [],
    customersData: [],
    stationsData: []
};

// ============================================
// Initialize Application
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    console.log('Initializing ElectroMove Admin Dashboard...');
    
    // Check authentication
    checkAuthentication();
    
    // Setup event listeners
    setupEventListeners();
    
    // Initialize UI components
    initializeUI();
    
    // Update time display
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);
    
    console.log('Dashboard initialized successfully');
}

// ============================================
// Authentication Management
// ============================================
function checkAuthentication() {
    const token = localStorage.getItem('adminToken');
    const userEmail = localStorage.getItem('userEmail');
    
    // Check if we're on admin page
    const isAdminPage = window.location.pathname.includes('admin.html');
    
    if (!token || !userEmail) {
        console.warn('❌ No authentication found');
        
        // Only redirect if we're on admin page without auth
        if (isAdminPage) {
            console.warn('🔄 Redirecting to login page...');
            // Add a small delay to prevent rapid redirects
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 100);
        }
        
        appState.isLoggedIn = false;
        appState.currentUser = null;
        return false;
    }
    
    console.log('✅ Authentication verified for:', userEmail);
    appState.isLoggedIn = true;
    appState.currentUser = { email: userEmail };
    
    // Update profile display
    updateProfileDisplay();
    return true;
}

function updateProfileDisplay() {
    const profileName = document.querySelector('.profile-name');
    const profileRole = document.querySelector('.profile-role');
    
    if (profileName && appState.currentUser) {
        const email = appState.currentUser.email;
        const name = email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1);
        profileName.textContent = name;
    }
}

function handleLogout() {
    const logoutModal = document.getElementById('logoutModal');
    logoutModal.style.display = 'flex';
}

function confirmLogout() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('userEmail');
    window.location.href = 'index.html';
}

function cancelLogout() {
    const logoutModal = document.getElementById('logoutModal');
    logoutModal.style.display = 'none';
}

// ============================================
// Event Listeners Setup
// ============================================
function setupEventListeners() {
    // Navigation
    setupNavigationListeners();
    
    // Logout functionality
    setupLogoutListeners();
    
    // Sidebar toggle
    setupSidebarToggle();
    
    // Station management
    setupStationManagement();
    
    // Customer management
    setupCustomerManagement();
    
    // Price management
    setupPriceManagement();
    
    // Reports
    setupReportsListeners();
    
    // Modal listeners
    setupModalListeners();
}

// ============================================
// Navigation Management
// ============================================
function setupNavigationListeners() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            const section = this.getAttribute('data-section');
            navigateToSection(section);
        });
    });
}

function navigateToSection(sectionName) {
    // Update active nav item
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-section') === sectionName) {
            item.classList.add('active');
        }
    });
    
    // Update active content section
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    const activeSection = document.getElementById(`${sectionName}-section`);
    if (activeSection) {
        activeSection.classList.add('active');
    }
    
    // Update page title
    const pageTitle = document.querySelector('.page-title');
    if (pageTitle) {
        pageTitle.textContent = formatSectionTitle(sectionName);
    }
    
    // Update state
    appState.currentSection = sectionName;
    
    // Load section data if needed
    loadSectionData(sectionName);
}

function formatSectionTitle(sectionName) {
    const titles = {
        'dashboard': 'Dashboard',
        'stations': 'Station Management',
        'users': 'Customer Management',
        'reports': 'Reports & Statistics',
        'pricing': 'Price Management'
    };
    
    return titles[sectionName] || sectionName.charAt(0).toUpperCase() + sectionName.slice(1);
}

function loadSectionData(sectionName) {
    switch(sectionName) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'stations':
            // Display existing data if available, otherwise load from API
            if (appState.stationsData && appState.stationsData.length > 0) {
                displayStationsGrid(appState.stationsData);
            } else {
                loadStationsData();
            }
            break;
        case 'users':
            // Display existing data if available, otherwise load from API
            if (appState.customersData && appState.customersData.length > 0) {
                displayCustomerTable(appState.customersData);
            } else {
                loadCustomersData();
            }
            break;
        case 'reports':
            loadReportsData();
            break;
        case 'pricing':
            // Display existing data if available, otherwise load from API
            if (appState.priceTableData && appState.priceTableData.length > 0) {
                displayPriceTable(appState.priceTableData);
            } else {
                loadPricingData();
            }
            break;
    }
}

// ============================================
// Sidebar Toggle
// ============================================
function setupSidebarToggle() {
    const toggleBtn = document.querySelector('.sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (toggleBtn) {
        toggleBtn.addEventListener('click', function() {
            sidebar.classList.toggle('collapsed');
        });
    }
}

// ============================================
// Logout Management
// ============================================
function setupLogoutListeners() {
    const logoutBtn = document.querySelector('.logout-btn');
    const confirmLogoutBtn = document.getElementById('confirmLogout');
    const cancelLogoutBtn = document.getElementById('cancelLogout');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    if (confirmLogoutBtn) {
        confirmLogoutBtn.addEventListener('click', confirmLogout);
    }
    
    if (cancelLogoutBtn) {
        cancelLogoutBtn.addEventListener('click', cancelLogout);
    }
}

// ============================================
// Dashboard Data Management
// ============================================
function loadDashboardData() {
    console.log('📊 Loading all dashboard data from APIs...');
    
    // Load all API data in parallel when dashboard loads
    Promise.all([
        loadStationsData(),
        loadCustomersData(),
        loadPricingData()
    ]).then(() => {
        console.log('✅ All dashboard data loaded successfully');
        updateDashboardStats();
    }).catch(error => {
        console.error('❌ Error loading dashboard data:', error);
    });
}

function updateDashboardStats() {
    console.log('🔄 Updating dashboard statistics...');
    
    // Update stations count from loaded data
    const totalStationsEl = document.getElementById('totalStationsCount');
    const activeUsersEl = document.getElementById('activeUsersCount');
    
    if (totalStationsEl) {
        const stationsCount = appState.stationsData?.length || 0;
        totalStationsEl.textContent = stationsCount;
        console.log('📍 Total Stations:', stationsCount);
    }
    
    if (activeUsersEl) {
        const customersCount = appState.customersData?.length || 0;
        activeUsersEl.textContent = customersCount;
        console.log('👥 Total Customers:', customersCount);
    }
}

// ============================================
// Station Management
// ============================================
function setupStationManagement() {
    const addStationBtn = document.getElementById('addStationBtn');
    const searchStation = document.getElementById('searchStation');
    
    if (addStationBtn) {
        addStationBtn.addEventListener('click', openAddStationModal);
    }
    
    if (searchStation) {
        searchStation.addEventListener('input', handleStationSearch);
    }
}

async function loadStationsData() {
    console.log('🔄 Loading stations data from API...');
    console.log('📡 API URL:', API_ENDPOINTS.stations);
    
    const stationsGrid = document.querySelector('.stations-grid');
    
    // Only show loading state if we're on the stations section
    if (stationsGrid && appState.currentSection === 'stations') {
        // Show loading state
        stationsGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
                <i class="fas fa-spinner fa-spin" style="font-size: 48px; color: #00d4ff; margin-bottom: 16px; display: block;"></i>
                <p style="color: #9ca3af; font-size: 16px;">Loading stations data...</p>
            </div>
        `;
    }
    
    try {
        console.log('🌐 Fetching stations data...');
        
        const response = await fetch(API_ENDPOINTS.stations, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            mode: 'cors'
        });
        
        console.log('📨 Response status:', response.status);
        console.log('📨 Response ok:', response.ok);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const stationsData = await response.json();
        console.log('✅ Stations data loaded successfully:', stationsData);
        console.log('📊 Number of stations:', stationsData.length);
        
        // Store in state
        appState.stationsData = stationsData;
        
        // Only display if we're on the stations section
        if (appState.currentSection === 'stations' && stationsGrid) {
            displayStationsGrid(stationsData);
        }
        
        // Update dashboard stats
        updateDashboardStats();
        
    } catch (error) {
        console.error('❌ Error loading stations data:', error);
        console.error('❌ Error name:', error.name);
        console.error('❌ Error message:', error.message);
        
        // Only show error if we're on the stations section
        if (stationsGrid && appState.currentSection === 'stations') {
            stationsGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: #ef4444; margin-bottom: 16px; display: block;"></i>
                    <p style="color: #ef4444; font-size: 16px; font-weight: 600;">Error loading stations data</p>
                    <p style="color: #9ca3af; font-size: 14px; margin-top: 8px;">${error.message}</p>
                    <button onclick="loadStationsData()" style="margin-top: 16px; padding: 10px 20px; background: var(--electric-blue); color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px;">
                        <i class="fas fa-redo"></i> Try Again
                    </button>
                </div>
            `;
        }
        
        // Still show notification even if not on stations section
        if (appState.currentSection === 'stations') {
            showNotification('Failed to load stations data: ' + error.message, 'error');
        }
    }
}

function displayStationsGrid(stationsData) {
    const stationsGrid = document.querySelector('.stations-grid');
    
    if (!stationsGrid) return;
    
    if (!stationsData || stationsData.length === 0) {
        stationsGrid.innerHTML = `
            <div class="no-data-message" style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
                <i class="fas fa-charging-station" style="font-size: 48px; color: #e5e7eb; margin-bottom: 16px; display: block;"></i>
                <p style="color: #9ca3af; font-size: 16px;">No stations available. Click "Add New Station" to get started.</p>
            </div>
        `;
        return;
    }
    
    // Sort by ID
    stationsData.sort((a, b) => {
        const idA = a.chargingStationId || a.id || 0;
        const idB = b.chargingStationId || b.id || 0;
        return idA - idB;
    });
    
    const cards = stationsData.map((station, index) => {
        const stationId = station.chargingStationId || station.id || index + 1;
        const stationName = station.chargingStationName || station.name || 'Unknown Station';
        const location = station.location || station.address || station.fullAddress || 'Unknown Location';
        const latitude = station.latitude || station.lat || 0;
        const longitude = station.longitude || station.lng || station.long || 0;
        const status = station.status || 'Unknown';
        
        // Determine status badge
        const statusClass = status.toLowerCase() === 'active' || status.toLowerCase() === 'online' 
            ? 'status-active' 
            : 'status-inactive';
        const statusText = status;
        
        return `
            <div class="station-card" data-station-id="${stationId}">
                <div class="station-header">
                    <h3 class="station-name">${escapeHtml(stationName)}</h3>
                    <span class="status-badge ${statusClass}">${statusText}</span>
                </div>
                <div class="station-info">
                    <div class="info-row">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${escapeHtml(location)}</span>
                    </div>
                    <div class="info-row">
                        <i class="fas fa-globe"></i>
                        <span>Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}</span>
                    </div>
                    <div class="info-row">
                        <i class="fas fa-hashtag"></i>
                        <span>Station ID: #${stationId}</span>
                    </div>
                </div>
                <div class="station-actions">
                    <button class="btn-station btn-view" onclick="viewStationDetails(${stationId})">
                        <i class="fas fa-eye"></i> View Details
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    stationsGrid.innerHTML = cards;
}

function viewStationDetails(stationId) {
    console.log('Viewing station details:', stationId);
    
    // Find station data from state
    const station = appState.stationsData?.find(s => 
        (s.chargingStationId || s.id) == stationId
    );
    
    if (!station) {
        showNotification('Station not found', 'error');
        return;
    }
    
    // Prepare station details
    const stationName = station.chargingStationName || station.name || 'Unknown Station';
    const location = station.location || station.address || station.fullAddress || 'Unknown Location';
    const latitude = station.latitude || station.lat || 'N/A';
    const longitude = station.longitude || station.lng || station.long || 'N/A';
    const status = station.status || 'Unknown';
    const id = station.chargingStationId || station.id || 'N/A';
    
    // Create detailed popup content
    const detailsHTML = `
        <div class="station-details-content">
            <div class="station-detail-header">
                <div class="station-detail-icon">
                    <i class="fas fa-charging-station"></i>
                </div>
                <div class="station-detail-title">
                    <h3>${escapeHtml(stationName)}</h3>
                    <span class="status-badge ${status.toLowerCase() === 'active' || status.toLowerCase() === 'online' ? 'status-active' : 'status-inactive'}">
                        ${status}
                    </span>
                </div>
            </div>
            
            <div class="station-detail-body">
                <div class="detail-row">
                    <div class="detail-label">
                        <i class="fas fa-hashtag"></i>
                        Station ID
                    </div>
                    <div class="detail-value">#${id}</div>
                </div>
                
                <div class="detail-row">
                    <div class="detail-label">
                        <i class="fas fa-map-marker-alt"></i>
                        Location
                    </div>
                    <div class="detail-value">${escapeHtml(location)}</div>
                </div>
                
                <div class="detail-row">
                    <div class="detail-label">
                        <i class="fas fa-globe"></i>
                        Coordinates
                    </div>
                    <div class="detail-value">
                        <div>Latitude: ${latitude}</div>
                        <div>Longitude: ${longitude}</div>
                    </div>
                </div>
                
                ${station.description ? `
                <div class="detail-row">
                    <div class="detail-label">
                        <i class="fas fa-info-circle"></i>
                        Description
                    </div>
                    <div class="detail-value">${escapeHtml(station.description)}</div>
                </div>
                ` : ''}
            </div>
            
            <div class="station-detail-footer">
                <button class="btn btn-primary" onclick="closeStationDetailsModal()">
                    <i class="fas fa-times"></i> Close
                </button>
            </div>
        </div>
    `;
    
    // Get or create modal
    let modal = document.getElementById('stationDetailsModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'stationDetailsModal';
        modal.className = 'modal';
        document.body.appendChild(modal);
    }
    
    // Set modal content
    modal.innerHTML = `
        <div class="modal-content station-details-modal">
            ${detailsHTML}
        </div>
    `;
    
    // Show modal
    modal.style.display = 'flex';
    
    // Close on outside click
    modal.onclick = function(e) {
        if (e.target === modal) {
            closeStationDetailsModal();
        }
    };
}

function closeStationDetailsModal() {
    const modal = document.getElementById('stationDetailsModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function handleStationSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    console.log('Searching stations:', searchTerm);
    
    if (!appState.stationsData) {
        return;
    }
    
    // Filter stations based on search term
    const filteredStations = appState.stationsData.filter(station => {
        const stationName = (station.chargingStationName || station.name || '').toLowerCase();
        const location = (station.location || station.address || '').toLowerCase();
        const stationId = String(station.chargingStationId || station.id || '').toLowerCase();
        
        return stationName.includes(searchTerm) ||
               location.includes(searchTerm) ||
               stationId.includes(searchTerm);
    });
    
    displayStationsGrid(filteredStations);
}

function openAddStationModal() {
    const modal = document.getElementById('addStationModal');
    if (modal) {
        modal.style.display = 'flex';
        
        // Clear form fields
        document.getElementById('newStationName').value = '';
        document.getElementById('newStationLocation').value = '';
        document.getElementById('newStationLat').value = '';
        document.getElementById('newStationLng').value = '';
    }
}

function closeAddStationModal() {
    const modal = document.getElementById('addStationModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function submitNewStation() {
    const name = document.getElementById('newStationName').value.trim();
    const location = document.getElementById('newStationLocation').value.trim();
    const lat = document.getElementById('newStationLat').value;
    const lng = document.getElementById('newStationLng').value;
    
    // Validation
    if (!name || !location || !lat || !lng) {
        alert('Please fill in all required fields');
        return;
    }
    
    // In production, this would make an API call
    console.log('New Station Data:', { name, location, lat, lng });
    
    alert('Station will be added when connected to API');
    closeAddStationModal();
}

// ============================================
// Customer Management
// ============================================
function setupCustomerManagement() {
    const searchCustomer = document.getElementById('searchCustomer');
    
    if (searchCustomer) {
        searchCustomer.addEventListener('input', handleCustomerSearch);
    }
}

async function loadCustomersData() {
    console.log('🔄 Loading customers data from API...');
    console.log('📡 API URL:', API_ENDPOINTS.customers);
    
    const tableBody = document.getElementById('userTableBody');
    
    // Only show loading state if we're on the users section
    if (tableBody && appState.currentSection === 'users') {
        // Show loading state
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 40px;">
                    <i class="fas fa-spinner fa-spin" style="font-size: 48px; color: #00d4ff; margin-bottom: 16px;"></i>
                    <p style="color: #9ca3af; font-size: 16px;">Loading customer data...</p>
                </td>
            </tr>
        `;
    }
    
    try {
        console.log('🌐 Fetching customer data...');
        
        const response = await fetch(API_ENDPOINTS.customers, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            mode: 'cors'
        });
        
        console.log('📨 Response status:', response.status);
        console.log('📨 Response ok:', response.ok);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const customerData = await response.json();
        console.log('✅ Customer data loaded successfully:', customerData);
        console.log('📊 Number of customers:', customerData.length);
        
        // Store in state
        appState.customersData = customerData;
        
        // Only display if we're on the users section
        if (appState.currentSection === 'users' && tableBody) {
            displayCustomerTable(customerData);
        }
        
        // Update dashboard stats
        updateDashboardStats();
        
    } catch (error) {
        console.error('❌ Error loading customer data:', error);
        console.error('❌ Error name:', error.name);
        console.error('❌ Error message:', error.message);
        
        // Only show error if we're on the users section
        if (tableBody && appState.currentSection === 'users') {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 40px;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: #ef4444; margin-bottom: 16px;"></i>
                        <p style="color: #ef4444; font-size: 16px; font-weight: 600;">Error loading customer data</p>
                        <p style="color: #9ca3af; font-size: 14px; margin-top: 8px;">${error.message}</p>
                        <button onclick="loadCustomersData()" style="margin-top: 16px; padding: 8px 16px; background: var(--electric-blue); color: white; border: none; border-radius: 8px; cursor: pointer;">
                            <i class="fas fa-redo"></i> Try Again
                        </button>
                    </td>
                </tr>
            `;
        }
        
        // Still show notification if on users section
        if (appState.currentSection === 'users') {
            showNotification('Failed to load customer data: ' + error.message, 'error');
        }
    }
}

function displayCustomerTable(customerData) {
    const tableBody = document.getElementById('userTableBody');
    
    if (!tableBody) return;
    
    if (!customerData || customerData.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 40px;">
                    <i class="fas fa-users" style="font-size: 48px; color: #e5e7eb; margin-bottom: 16px;"></i>
                    <p style="color: #9ca3af; font-size: 16px;">No customer data available</p>
                </td>
            </tr>
        `;
        return;
    }
    
    // Update customer count in section
    const totalCustomersEl = document.getElementById('totalCustomersCount');
    if (totalCustomersEl) {
        totalCustomersEl.textContent = customerData.length;
    }
    
    // Sort by ID or name
    customerData.sort((a, b) => {
        const idA = a.customerId || a.id || 0;
        const idB = b.customerId || b.id || 0;
        return idA - idB;
    });
    
    const rows = customerData.map((customer, index) => {
        const customerId = customer.customerId || customer.id || index + 1;
        const customerName = customer.customerName || customer.name || customer.fullName || 'N/A';
        const email = customer.email || customer.emailAddress || 'N/A';
        const phone = customer.phoneNumber || customer.phone || customer.mobile || 'N/A';
        const address = customer.address || customer.fullAddress || 'N/A';
        const status = customer.status || customer.accountStatus || 'Active';
        
        const statusClass = status.toLowerCase() === 'active' ? 'status-active' : 'status-inactive';
        
        return `
            <tr data-customer-id="${customerId}">
                <td>#${customerId}</td>
                <td>${escapeHtml(customerName)}</td>
                <td>${escapeHtml(email)}</td>
                <td>${escapeHtml(phone)}</td>
                <td>${escapeHtml(address)}</td>
                <td>
                    <span class="status-badge ${statusClass}">${status}</span>
                </td>
            </tr>
        `;
    }).join('');
    
    tableBody.innerHTML = rows;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function handleCustomerSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    console.log('Searching customers:', searchTerm);
    
    if (!appState.customersData) {
        return;
    }
    
    // Filter customers based on search term
    const filteredCustomers = appState.customersData.filter(customer => {
        const customerName = (customer.customerName || customer.name || '').toLowerCase();
        const email = (customer.email || '').toLowerCase();
        const phone = (customer.phoneNumber || customer.phone || '').toLowerCase();
        const address = (customer.address || '').toLowerCase();
        
        return customerName.includes(searchTerm) ||
               email.includes(searchTerm) ||
               phone.includes(searchTerm) ||
               address.includes(searchTerm);
    });
    
    displayCustomerTable(filteredCustomers);
}

// ============================================
// Price Management
// ============================================
function setupPriceManagement() {
    const addPriceBtn = document.getElementById('addPriceBtn');
    const refreshPricesBtn = document.getElementById('refreshPricesBtn');
    const closePriceModal = document.getElementById('closePriceModal');
    const cancelPriceForm = document.getElementById('cancelPriceForm');
    const priceForm = document.getElementById('priceForm');
    
    if (addPriceBtn) {
        addPriceBtn.addEventListener('click', openAddPriceModal);
    }
    
    if (refreshPricesBtn) {
        refreshPricesBtn.addEventListener('click', function() {
            loadPricingData();
            showNotification('Price data refreshed!', 'success');
        });
    }
    
    if (closePriceModal) {
        closePriceModal.addEventListener('click', closePriceModalHandler);
    }
    
    if (cancelPriceForm) {
        cancelPriceForm.addEventListener('click', closePriceModalHandler);
    }
    
    if (priceForm) {
        priceForm.addEventListener('submit', handlePriceFormSubmit);
    }
}

async function loadPricingData() {
    console.log('🔄 Loading pricing data from API...');
    console.log('📡 API URL:', API_ENDPOINTS.priceTable);
    
    const priceTableBody = document.getElementById('priceTableBody');
    
    if (!priceTableBody) {
        console.error('❌ Price table body element not found');
        return;
    }
    
    // Show loading state
    priceTableBody.innerHTML = `
        <tr>
            <td colspan="7" style="text-align: center; padding: 40px;">
                <i class="fas fa-spinner fa-spin" style="font-size: 48px; color: #00d4ff; margin-bottom: 16px;"></i>
                <p style="color: #9ca3af; font-size: 16px;">Loading price data...</p>
            </td>
        </tr>
    `;
    
    try {
        console.log('🌐 Fetching data...');
        
        const response = await fetch(API_ENDPOINTS.priceTable, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            mode: 'cors'
        });
        
        console.log('📨 Response status:', response.status);
        console.log('📨 Response ok:', response.ok);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const priceData = await response.json();
        console.log('✅ Price data loaded successfully:', priceData);
        console.log('📊 Number of records:', priceData.length);
        
        // Store in state
        appState.priceTableData = priceData;
        
        // Display data
        displayPriceTable(priceData);
        
    } catch (error) {
        console.error('❌ Error loading price data:', error);
        console.error('❌ Error name:', error.name);
        console.error('❌ Error message:', error.message);
        console.error('❌ Error stack:', error.stack);
        
        priceTableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: #ef4444; margin-bottom: 16px;"></i>
                    <p style="color: #ef4444; font-size: 16px; font-weight: 600;">Error loading price data</p>
                    <p style="color: #9ca3af; font-size: 14px; margin-top: 8px;">${error.message}</p>
                    <button onclick="loadPricingData()" style="margin-top: 16px; padding: 8px 16px; background: var(--electric-blue); color: white; border: none; border-radius: 8px; cursor: pointer;">
                        <i class="fas fa-redo"></i> Try Again
                    </button>
                </td>
            </tr>
        `;
        
        showNotification('Failed to load price data: ' + error.message, 'error');
    }
}

function displayPriceTable(priceData) {
    const priceTableBody = document.getElementById('priceTableBody');
    
    if (!priceTableBody) return;
    
    if (!priceData || priceData.length === 0) {
        priceTableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px;">
                    <i class="fas fa-dollar-sign" style="font-size: 48px; color: #e5e7eb; margin-bottom: 16px;"></i>
                    <p style="color: #9ca3af; font-size: 16px;">No price data available. Click "Add New Price" to create pricing rules.</p>
                </td>
            </tr>
        `;
        return;
    }
    
    // Sort by validFrom date (newest first)
    priceData.sort((a, b) => new Date(b.validFrom) - new Date(a.validFrom));
    
    const rows = priceData.map(price => {
        const statusClass = price.status === 1 ? 'status-active' : 'status-inactive';
        const statusText = price.status === 1 ? 'Active' : 'Inactive';
        
        return `
            <tr data-price-id="${price.id}">
                <td>#${price.id}</td>
                <td>${formatCurrency(price.pricePerKWh / 100)}/kWh</td>
                <td>${formatCurrency(price.penaltyFeePerMinute / 100)}/min</td>
                <td>${formatDate(price.validFrom)}</td>
                <td>${formatDate(price.validTo)}</td>
                <td>
                    <span class="status-badge ${statusClass}">${statusText}</span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon btn-edit" onclick="editPrice(${price.id})" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-toggle" onclick="togglePriceStatus(${price.id}, ${price.status})" title="${price.status === 1 ? 'Deactivate' : 'Activate'}">
                            <i class="fas fa-${price.status === 1 ? 'toggle-on' : 'toggle-off'}"></i>
                        </button>
                        <button class="btn-icon btn-delete" onclick="deletePrice(${price.id})" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    
    priceTableBody.innerHTML = rows;
}

function openAddPriceModal() {
    const modal = document.getElementById('priceModal');
    const modalTitle = document.getElementById('priceModalTitle');
    
    if (modal) {
        modal.style.display = 'flex';
        
        if (modalTitle) {
            modalTitle.textContent = 'Add New Price';
        }
        
        // Clear form
        document.getElementById('priceForm').reset();
        document.getElementById('priceId').value = '';
        document.getElementById('priceStatus').value = '1';
        
        // Set default dates
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('validFrom').value = today;
    }
}

function closePriceModalHandler() {
    const modal = document.getElementById('priceModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

async function handlePriceFormSubmit(e) {
    e.preventDefault();
    
    const priceId = document.getElementById('priceId').value;
    const priceData = {
        pricePerKWh: parseFloat(document.getElementById('pricePerKwh').value) * 100, // Convert to cents
        penaltyFeePerMinute: parseFloat(document.getElementById('penaltyFee').value) * 100, // Convert to cents
        validFrom: document.getElementById('validFrom').value + 'T00:00:00',
        validTo: document.getElementById('validTo').value + 'T00:00:00',
        status: parseInt(document.getElementById('priceStatus').value) || 1
    };
    
    console.log('Submitting price data:', priceData);
    
    try {
        let response;
        
        if (priceId) {
            // Update existing price (PATCH request)
            console.log('Updating price with ID:', priceId);
            console.log('Payload:', { ...priceData, id: parseInt(priceId) });
            
            response = await fetch(`${API_ENDPOINTS.priceTable}/${priceId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ...priceData, id: parseInt(priceId) })
            });
        } else {
            // Create new price (POST request)
            response = await fetch(API_ENDPOINTS.priceTable, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(priceData)
            });
        }
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Price saved successfully:', result);
        
        showNotification(priceId ? 'Price updated successfully!' : 'Price created successfully!', 'success');
        closePriceModalHandler();
        
        // Reload price data
        await loadPricingData();
        
    } catch (error) {
        console.error('Error saving price:', error);
        showNotification('Error saving price: ' + error.message, 'error');
    }
}

async function editPrice(priceId) {
    console.log('Editing price:', priceId);
    
    // Find price data from state
    const priceData = appState.priceTableData.find(p => p.id === priceId);
    
    if (!priceData) {
        showNotification('Price data not found', 'error');
        return;
    }
    
    // Open modal
    const modal = document.getElementById('priceModal');
    const modalTitle = document.getElementById('priceModalTitle');
    
    if (modal) {
        modal.style.display = 'flex';
        
        if (modalTitle) {
            modalTitle.textContent = 'Edit Price';
        }
        
        // Fill form with existing data
        document.getElementById('priceId').value = priceData.id;
        document.getElementById('pricePerKwh').value = (priceData.pricePerKWh / 100).toFixed(2);
        document.getElementById('penaltyFee').value = (priceData.penaltyFeePerMinute / 100).toFixed(2);
        document.getElementById('validFrom').value = priceData.validFrom.split('T')[0];
        document.getElementById('validTo').value = priceData.validTo.split('T')[0];
        document.getElementById('priceStatus').value = priceData.status;
    }
}

async function togglePriceStatus(priceId, currentStatus) {
    const newStatus = currentStatus === 1 ? 0 : 1;
    const action = newStatus === 1 ? 'activate' : 'deactivate';
    
    if (!confirm(`Are you sure you want to ${action} this price?`)) {
        return;
    }
    
    try {
        // Find the price data
        const priceData = appState.priceTableData.find(p => p.id === priceId);
        
        if (!priceData) {
            throw new Error('Price data not found');
        }
        
        console.log('Toggling price status:', priceId, 'from', currentStatus, 'to', newStatus);
        console.log('Payload:', { ...priceData, status: newStatus });
        
        // Update status
        const response = await fetch(`${API_ENDPOINTS.priceTable}/${priceId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ...priceData, status: newStatus })
        });
        
        console.log('Toggle response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Toggle error response:', errorText);
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        showNotification(`Price ${action}d successfully!`, 'success');
        
        // Reload price data
        await loadPricingData();
        
    } catch (error) {
        console.error('Error toggling price status:', error);
        showNotification('Error updating price status: ' + error.message, 'error');
    }
}

async function deletePrice(priceId) {
    if (!confirm('Are you sure you want to delete this price? This action cannot be undone.')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_ENDPOINTS.priceTable}/${priceId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        showNotification('Price deleted successfully!', 'success');
        
        // Reload price data
        await loadPricingData();
        
    } catch (error) {
        console.error('Error deleting price:', error);
        showNotification('Error deleting price: ' + error.message, 'error');
    }
}

// ============================================
// Reports Management
// ============================================
function setupReportsListeners() {
    const reportPeriod = document.getElementById('reportPeriod');
    const exportReportBtn = document.getElementById('exportReportBtn');
    
    if (reportPeriod) {
        reportPeriod.addEventListener('change', function() {
            console.log('Report period changed:', this.value);
            loadReportsData();
        });
    }
    
    if (exportReportBtn) {
        exportReportBtn.addEventListener('click', exportReport);
    }
}

//THIS FUNCTION DIDN'T HAD API YET
function loadReportsData() {
    console.log('Loading reports data...');
    
    // Update report statistics
    updateReportStats();
    
    // Update report tables
    updateReportTables();
}

function updateReportStats() {
    const stats = {
        totalSessions: 0,
        totalRevenue: 0,
        totalEnergy: 0,
        avgSessionTime: 0
    };
    
    document.getElementById('totalSessions').textContent = stats.totalSessions;
    document.getElementById('totalRevenue').textContent = `$${stats.totalRevenue}`;
    document.getElementById('totalEnergy').textContent = `${stats.totalEnergy} kWh`;
    document.getElementById('avgSessionTime').textContent = `${stats.avgSessionTime} min`;
}

function updateReportTables() {
    const topStationsBody = document.getElementById('topStationsTableBody');
    const topVehiclesBody = document.getElementById('topVehiclesTableBody');
    const topCustomersBody = document.getElementById('topCustomersTableBody');
    
    const noDataMessage = '<tr><td colspan="5" style="text-align: center; color: #9ca3af;">No data available for selected period</td></tr>';
    
    if (topStationsBody) {
        topStationsBody.innerHTML = noDataMessage;
    }
    
    if (topVehiclesBody) {
        topVehiclesBody.innerHTML = noDataMessage;
    }
    
    if (topCustomersBody) {
        topCustomersBody.innerHTML = noDataMessage;
    }
}

function exportReport() {
    console.log('Exporting report...');
    alert('Report export functionality will be available when connected to API');
}

// ============================================
// Modal Management
// ============================================
function setupModalListeners() {
    // Close modals when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
    
    // Close buttons
    const closeButtons = document.querySelectorAll('.close, .close-modal');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    });
}

// ============================================
// UI Utilities
// ============================================
function initializeUI() {
    // Load initial section (dashboard)
    loadDashboardData();
}

function updateCurrentTime() {
    const timeElement = document.getElementById('currentTime');
    if (timeElement) {
        const now = new Date();
        const options = {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        timeElement.textContent = now.toLocaleDateString('en-US', options);
    }
}

// ============================================
// Utility Functions
// ============================================
function showNotification(message, type = 'info') {
    console.log(`[${type.toUpperCase()}] ${message}`);
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    const iconMap = {
        'success': 'fa-check-circle',
        'error': 'fa-exclamation-circle',
        'warning': 'fa-exclamation-triangle',
        'info': 'fa-info-circle'
    };
    
    const colorMap = {
        'success': '#10b981',
        'error': '#ef4444',
        'warning': '#f59e0b',
        'info': '#00d4ff'
    };
    
    notification.innerHTML = `
        <i class="fas ${iconMap[type] || iconMap.info}"></i>
        <span>${message}</span>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colorMap[type] || colorMap.info};
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        display: flex;
        align-items: center;
        gap: 12px;
        font-weight: 500;
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        min-width: 300px;
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// ============================================
// Global Functions (for HTML onclick events)
// ============================================
window.openAddStationModal = openAddStationModal;
window.closeAddStationModal = closeAddStationModal;
window.submitNewStation = submitNewStation;
window.viewStationDetails = viewStationDetails;
window.closeStationDetailsModal = closeStationDetailsModal;
window.loadStationsData = loadStationsData;
window.editPrice = editPrice;
window.togglePriceStatus = togglePriceStatus;
window.deletePrice = deletePrice;
window.loadPricingData = loadPricingData;
window.loadCustomersData = loadCustomersData;
window.openApiStatusPopup = openApiStatusPopup;
window.closeApiStatusPopup = closeApiStatusPopup;
window.recheckApiStatus = recheckApiStatus;

// ============================================
// API Status Monitor
// ============================================

const API_STATUS_CONFIG = {
    stations: {
        name: 'Stations Management',
        endpoint: API_ENDPOINTS.stations,
        elementId: 'apiStatusStations'
    },
    customers: {
        name: 'Customer Management',
        endpoint: API_ENDPOINTS.customers,
        elementId: 'apiStatusCustomers'
    },
    reports: {
        name: 'Reports & Statistics',
        endpoint: API_ENDPOINTS.reports,
        elementId: 'apiStatusReports'
    },
    pricing: {
        name: 'Price Management',
        endpoint: API_ENDPOINTS.priceTable,
        elementId: 'apiStatusPricing'
    }
};

let apiStatusResults = {
    stations: null,
    customers: null,
    reports: null,
    pricing: null
};

function openApiStatusPopup() {
    const popup = document.getElementById('apiStatusPopup');
    if (popup) {
        popup.classList.add('active');
        // Check API status when popup opens
        checkAllApiStatus();
    }
}

function closeApiStatusPopup() {
    const popup = document.getElementById('apiStatusPopup');
    if (popup) {
        popup.classList.remove('active');
    }
}

function recheckApiStatus() {
    console.log('🔄 Rechecking all APIs...');
    checkAllApiStatus();
}

async function checkAllApiStatus() {
    console.log('🔍 Checking all API endpoints...');
    
    // Reset all to checking state
    Object.keys(API_STATUS_CONFIG).forEach(key => {
        updateApiStatusUI(key, 'checking');
    });
    
    // Check all APIs in parallel
    const checks = Object.keys(API_STATUS_CONFIG).map(key => 
        checkSingleApi(key)
    );
    
    await Promise.all(checks);
    
    // Update last check time
    updateLastCheckTime();
    
    // Update floating button indicator
    updateFloatingButtonStatus();
}

async function checkSingleApi(apiKey) {
    const config = API_STATUS_CONFIG[apiKey];
    
    try {
        console.log(`🔍 Checking ${config.name} at ${config.endpoint}`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        
        const response = await fetch(config.endpoint, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            mode: 'cors',
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
            console.log(`✅ ${config.name} is ONLINE (${response.status})`);
            apiStatusResults[apiKey] = {
                status: 'online',
                statusCode: response.status,
                message: 'API is operational'
            };
            updateApiStatusUI(apiKey, 'online', response.status);
        } else {
            console.warn(`⚠️ ${config.name} returned error ${response.status}`);
            apiStatusResults[apiKey] = {
                status: 'offline',
                statusCode: response.status,
                message: `HTTP ${response.status}`
            };
            updateApiStatusUI(apiKey, 'offline', response.status);
        }
        
    } catch (error) {
        console.error(`❌ ${config.name} is OFFLINE:`, error.message);
        
        let errorMessage = 'Connection failed';
        if (error.name === 'AbortError') {
            errorMessage = 'Request timeout';
        } else if (error.message.includes('Failed to fetch')) {
            errorMessage = 'Network error / CORS';
        }
        
        apiStatusResults[apiKey] = {
            status: 'offline',
            statusCode: null,
            message: errorMessage
        };
        updateApiStatusUI(apiKey, 'offline', null, errorMessage);
    }
}

function updateApiStatusUI(apiKey, status, statusCode = null, errorMessage = null) {
    const config = API_STATUS_CONFIG[apiKey];
    const element = document.getElementById(config.elementId);
    
    if (!element) return;
    
    const indicator = element.querySelector('.api-status-indicator');
    if (!indicator) return;
    
    let badgeHTML = '';
    
    switch (status) {
        case 'checking':
            badgeHTML = `
                <div class="status-badge status-checking">
                    <i class="fas fa-spinner fa-spin"></i> Checking...
                </div>
            `;
            break;
            
        case 'online':
            badgeHTML = `
                <div class="status-badge status-online">
                    <i class="fas fa-check-circle"></i> Online ${statusCode ? `(${statusCode})` : ''}
                </div>
            `;
            break;
            
        case 'offline':
            const displayMessage = errorMessage || (statusCode ? `HTTP ${statusCode}` : 'Offline');
            badgeHTML = `
                <div class="status-badge status-offline">
                    <i class="fas fa-times-circle"></i> ${displayMessage}
                </div>
            `;
            break;
    }
    
    indicator.innerHTML = badgeHTML;
}

function updateLastCheckTime() {
    const lastCheckElement = document.getElementById('lastCheckTime');
    if (lastCheckElement) {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        lastCheckElement.textContent = timeString;
    }
}

function updateFloatingButtonStatus() {
    const statusDot = document.getElementById('apiStatusDot');
    if (!statusDot) return;
    
    const results = Object.values(apiStatusResults);
    const allOnline = results.every(r => r && r.status === 'online');
    const anyOffline = results.some(r => r && r.status === 'offline');
    const anyNull = results.some(r => r === null);
    
    // Remove all status classes
    statusDot.classList.remove('status-error', 'status-warning');
    
    if (allOnline && !anyNull) {
        // All online - green (default)
        console.log('🟢 All APIs are online');
    } else if (anyOffline) {
        // Some offline - red
        statusDot.classList.add('status-error');
        console.log('🔴 Some APIs are offline');
    } else {
        // Mixed or unknown - yellow
        statusDot.classList.add('status-warning');
        console.log('🟡 API status unknown or mixed');
    }
}

// Initialize API status check on page load
function initializeApiStatusMonitor() {
    console.log('🚀 Initializing API Status Monitor...');
    
    // Auto-check APIs after 2 seconds of page load
    setTimeout(() => {
        checkAllApiStatus();
    }, 2000);
    
    // Auto-check every 5 minutes
    setInterval(() => {
        if (!document.getElementById('apiStatusPopup')?.classList.contains('active')) {
            checkAllApiStatus();
        }
    }, 300000); // 5 minutes
}

// Call initialization when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // ... existing initialization code ...
    initializeApiStatusMonitor();
});

// ============================================
// Error Handling
// ============================================
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
});

console.log('Admin.js loaded successfully');
