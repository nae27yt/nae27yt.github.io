// Discord Bot Dashboard - Static Site JavaScript
class StaticDashboard {
    constructor() {
        this.apiUrl = '';
        this.isConnected = false;
        this.updateInterval = null;
        this.websocket = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
    }

    init() {
        this.loadSavedConfig();
        this.setupEventListeners();
        this.updateConnectionStatus('Disconnected', 'danger');
        
        // Auto-connect if URL is saved
        if (this.apiUrl) {
            this.connectToBot();
        }
    }

    loadSavedConfig() {
        const savedUrl = localStorage.getItem('botApiUrl');
        if (savedUrl) {
            this.apiUrl = savedUrl;
            document.getElementById('api-url').value = savedUrl;
        }
    }

    saveConfig() {
        const url = document.getElementById('api-url').value.trim();
        if (url) {
            localStorage.setItem('botApiUrl', url);
            this.apiUrl = url;
            this.showNotification('Configuration saved successfully!', 'success');
        }
    }

    setupEventListeners() {
        document.getElementById('connect-btn').addEventListener('click', () => {
            this.connectToBot();
        });

        document.getElementById('save-config-btn').addEventListener('click', () => {
            this.saveConfig();
        });

        document.getElementById('api-url').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.connectToBot();
            }
        });
    }

    async connectToBot() {
        const url = document.getElementById('api-url').value.trim();
        if (!url) {
            this.showNotification('Please enter a bot API URL', 'warning');
            return;
        }

        this.apiUrl = url;
        this.updateConnectionStatus('Connecting...', 'warning');
        
        try {
            // Test connection with stats endpoint
            const response = await fetch(`${this.apiUrl}/api/stats`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
            });

            if (response.ok) {
                this.isConnected = true;
                this.updateConnectionStatus('Connected', 'success');
                this.showNotification('Successfully connected to bot!', 'success');
                
                // Save the working URL
                localStorage.setItem('botApiUrl', url);
                
                // Start data updates
                this.startDataUpdates();
                this.setupWebSocket();
                
                // Load initial data
                await this.loadAllData();
                
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            this.isConnected = false;
            this.updateConnectionStatus('Connection Failed', 'danger');
            this.showNotification(`Failed to connect: ${error.message}`, 'danger');
            console.error('Connection error:', error);
        }
    }

    setupWebSocket() {
        if (!this.apiUrl) return;

        try {
            const wsUrl = this.apiUrl.replace('http://', 'ws://').replace('https://', 'wss://') + '/ws';
            this.websocket = new WebSocket(wsUrl);

            this.websocket.onopen = () => {
                console.log('WebSocket connected');
                this.reconnectAttempts = 0;
                this.logActivity('WebSocket connection established', 'success');
            };

            this.websocket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleWebSocketMessage(data);
                } catch (error) {
                    console.error('WebSocket message error:', error);
                }
            };

            this.websocket.onclose = () => {
                console.log('WebSocket disconnected');
                this.logActivity('WebSocket connection lost', 'warning');
                this.attemptWebSocketReconnect();
            };

            this.websocket.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.logActivity('WebSocket error occurred', 'danger');
            };
        } catch (error) {
            console.error('WebSocket setup error:', error);
        }
    }

    attemptWebSocketReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts && this.isConnected) {
            this.reconnectAttempts++;
            console.log(`Attempting WebSocket reconnect ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
            
            setTimeout(() => {
                this.setupWebSocket();
            }, 5000 * this.reconnectAttempts); // Exponential backoff
        }
    }

    handleWebSocketMessage(data) {
        if (data.type === 'stats_update') {
            this.updateStats(data.data);
        } else if (data.type === 'activity') {
            this.logActivity(data.message, data.level || 'info');
        } else if (data.type === 'database_update') {
            this.updateDatabaseStatus(data.data);
        }
    }

    async loadAllData() {
        await Promise.all([
            this.loadStats(),
            this.loadServers(),
            this.loadCommands(),
            this.loadDatabaseStatus()
        ]);
    }

    async loadStats() {
        try {
            const response = await fetch(`${this.apiUrl}/api/stats`);
            if (response.ok) {
                const stats = await response.json();
                this.updateStats(stats);
            }
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }

    async loadServers() {
        try {
            const response = await fetch(`${this.apiUrl}/api/guilds`);
            if (response.ok) {
                const servers = await response.json();
                this.updateServersTable(servers);
            }
        } catch (error) {
            console.error('Error loading servers:', error);
        }
    }

    async loadCommands() {
        try {
            const response = await fetch(`${this.apiUrl}/api/commands`);
            if (response.ok) {
                const commands = await response.json();
                this.updateCommandsTable(commands);
            }
        } catch (error) {
            console.error('Error loading commands:', error);
        }
    }

    async loadDatabaseStatus() {
        try {
            const response = await fetch(`${this.apiUrl}/api/database-status`);
            if (response.ok) {
                const dbStatus = await response.json();
                this.updateDatabaseStatus(dbStatus);
            }
        } catch (error) {
            console.error('Error loading database status:', error);
        }
    }

    updateStats(stats) {
        document.getElementById('guild-count').textContent = stats.guild_count || 0;
        document.getElementById('user-count').textContent = stats.user_count?.toLocaleString() || 0;
        document.getElementById('command-count').textContent = stats.command_count || 0;
        document.getElementById('latency').textContent = stats.latency ? `${stats.latency}ms` : '-';
    }

    updateServersTable(servers) {
        const tbody = document.getElementById('servers-table');
        if (!servers || servers.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" class="text-center text-muted">No servers found</td></tr>';
            return;
        }

        tbody.innerHTML = servers.map(server => `
            <tr>
                <td><strong>${this.escapeHtml(server.name)}</strong></td>
                <td><span class="badge bg-primary">${server.member_count}</span></td>
                <td>${this.escapeHtml(server.owner_name || 'Unknown')}</td>
            </tr>
        `).join('');
    }

    updateCommandsTable(commands) {
        const tbody = document.getElementById('commands-table');
        if (!commands || commands.length === 0) {
            tbody.innerHTML = '<tr><td colspan="2" class="text-center text-muted">No commands found</td></tr>';
            return;
        }

        tbody.innerHTML = commands.map(command => `
            <tr>
                <td><code>/${command.name}</code></td>
                <td><span class="badge bg-info">${command.usage_count || 0}</span></td>
            </tr>
        `).join('');
    }

    updateDatabaseStatus(dbStatus) {
        document.getElementById('db-total-commands').textContent = dbStatus.total_commands?.toLocaleString() || '0';
        document.getElementById('db-total-errors').textContent = dbStatus.total_errors?.toLocaleString() || '0';
        document.getElementById('db-pool-size').textContent = dbStatus.pool_size || '0';
        
        const statusElement = document.getElementById('db-status');
        if (dbStatus.connected) {
            statusElement.textContent = 'Connected';
            statusElement.className = 'badge bg-success';
        } else {
            statusElement.textContent = 'Disconnected';
            statusElement.className = 'badge bg-danger';
        }
    }

    updateConnectionStatus(status, type) {
        const statusElement = document.getElementById('connection-status');
        statusElement.textContent = status;
        statusElement.className = `badge bg-${type}`;
        
        if (type === 'warning') {
            statusElement.classList.add('pulse');
        } else {
            statusElement.classList.remove('pulse');
        }
    }

    startDataUpdates() {
        // Clear any existing interval
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }

        // Update data every 30 seconds
        this.updateInterval = setInterval(() => {
            if (this.isConnected && !document.hidden) {
                this.loadAllData();
            }
        }, 30000);
    }

    logActivity(message, level = 'info') {
        const activityLog = document.getElementById('activity-log');
        const timestamp = new Date().toLocaleTimeString();
        
        const levelColors = {
            success: 'text-success',
            warning: 'text-warning',
            danger: 'text-danger',
            info: 'text-info'
        };

        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item fade-in';
        activityItem.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <span class="${levelColors[level] || 'text-muted'}">${this.escapeHtml(message)}</span>
                <small class="activity-time">${timestamp}</small>
            </div>
        `;

        // Clear placeholder if exists
        if (activityLog.textContent.includes('No recent activity')) {
            activityLog.innerHTML = '';
        }

        activityLog.insertBefore(activityItem, activityLog.firstChild);

        // Keep only last 10 activities
        const activities = activityLog.querySelectorAll('.activity-item');
        if (activities.length > 10) {
            activities[activities.length - 1].remove();
        }
    }

    showNotification(message, type = 'info') {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-white bg-${type} border-0`;
        toast.setAttribute('role', 'alert');
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    ${this.escapeHtml(message)}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;

        // Add to page (create container if needed)
        let toastContainer = document.getElementById('toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toast-container';
            toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
            toastContainer.style.zIndex = '1050';
            document.body.appendChild(toastContainer);
        }

        toastContainer.appendChild(toast);

        // Show toast
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();

        // Remove after hidden
        toast.addEventListener('hidden.bs.toast', () => {
            toast.remove();
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        if (this.websocket) {
            this.websocket.close();
        }
    }
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', () => {
    const dashboard = new StaticDashboard();
    dashboard.init();
    
    // Store globally for debugging
    window.dashboard = dashboard;
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && window.dashboard && window.dashboard.isConnected) {
        window.dashboard.loadAllData();
    }
});