// Discord Bot Dashboard JavaScript

class DashboardApp {
    constructor() {
        this.ws = null;
        this.wsReconnectInterval = null;
        this.wsReconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 5000;
        
        this.init();
    }

    init() {
        this.setupWebSocket();
        this.loadInitialData();
        this.setupEventListeners();
        this.startPeriodicUpdates();
    }

    setupWebSocket() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws`;
        
        this.ws = new WebSocket(wsUrl);
        
        this.ws.onopen = () => {
            console.log('WebSocket connected');
            this.updateConnectionStatus('connected');
            this.wsReconnectAttempts = 0;
            
            if (this.wsReconnectInterval) {
                clearInterval(this.wsReconnectInterval);
                this.wsReconnectInterval = null;
            }
            
            // Request initial stats
            this.sendMessage({ type: 'get_stats' });
        };
        
        this.ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this.handleWebSocketMessage(data);
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        };
        
        this.ws.onclose = () => {
            console.log('WebSocket disconnected');
            this.updateConnectionStatus('disconnected');
            this.attemptReconnect();
        };
        
        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            this.updateConnectionStatus('error');
        };
    }

    handleWebSocketMessage(data) {
        switch (data.type) {
            case 'stats':
            case 'stats_update':
                this.updateStats(data.data);
                break;
            case 'pong':
                // Handle ping response
                break;
            case 'activity':
                this.addActivityLog(data.data);
                break;
            default:
                console.log('Unknown message type:', data.type);
        }
    }

    sendMessage(message) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
        }
    }

    attemptReconnect() {
        if (this.wsReconnectAttempts >= this.maxReconnectAttempts) {
            console.log('Max reconnection attempts reached');
            this.updateConnectionStatus('failed');
            return;
        }

        this.wsReconnectAttempts++;
        this.updateConnectionStatus('connecting');
        
        this.wsReconnectInterval = setTimeout(() => {
            console.log(`Attempting to reconnect (${this.wsReconnectAttempts}/${this.maxReconnectAttempts})`);
            this.setupWebSocket();
        }, this.reconnectDelay);
    }

    updateConnectionStatus(status) {
        const statusElement = document.getElementById('status-indicator');
        const statusText = statusElement.querySelector('span') || statusElement;
        
        statusElement.className = 'badge';
        
        switch (status) {
            case 'connected':
                statusElement.classList.add('bg-success');
                statusText.innerHTML = '<i class="fas fa-circle"></i> Connected';
                break;
            case 'disconnected':
                statusElement.classList.add('bg-danger');
                statusText.innerHTML = '<i class="fas fa-circle"></i> Disconnected';
                break;
            case 'connecting':
                statusElement.classList.add('bg-warning');
                statusText.innerHTML = '<i class="fas fa-circle"></i> Connecting...';
                break;
            case 'error':
                statusElement.classList.add('bg-danger');
                statusText.innerHTML = '<i class="fas fa-exclamation-circle"></i> Error';
                break;
            case 'failed':
                statusElement.classList.add('bg-secondary');
                statusText.innerHTML = '<i class="fas fa-times-circle"></i> Failed';
                break;
            default:
                statusElement.classList.add('bg-secondary');
                statusText.innerHTML = '<i class="fas fa-circle"></i> Unknown';
        }
    }

    async loadInitialData() {
        try {
            await Promise.all([
                this.loadStats(),
                this.loadGuilds(),
                this.loadCommands()
            ]);
        } catch (error) {
            console.error('Error loading initial data:', error);
            this.showError('Failed to load dashboard data');
        }
    }

    async loadStats() {
        try {
            const response = await fetch('/api/stats');
            if (!response.ok) throw new Error('Failed to fetch stats');
            
            const stats = await response.json();
            this.updateStats(stats);
        } catch (error) {
            console.error('Error loading stats:', error);
            this.showError('Failed to load bot statistics');
        }
    }

    async loadGuilds() {
        try {
            const response = await fetch('/api/guilds');
            if (!response.ok) throw new Error('Failed to fetch guilds');
            
            const guilds = await response.json();
            this.updateGuildsTable(guilds);
        } catch (error) {
            console.error('Error loading guilds:', error);
            this.showError('Failed to load server list');
        }
    }

    async loadCommands() {
        try {
            const response = await fetch('/api/commands');
            if (!response.ok) throw new Error('Failed to fetch commands');
            
            const commands = await response.json();
            this.updateCommandsTable(commands);
        } catch (error) {
            console.error('Error loading commands:', error);
            this.showError('Failed to load command list');
        }
    }

    updateStats(stats) {
        // Update stat cards
        document.getElementById('guild-count').textContent = stats.guild_count?.toLocaleString() || '-';
        document.getElementById('user-count').textContent = stats.user_count?.toLocaleString() || '-';
        document.getElementById('latency').textContent = stats.latency ? `${stats.latency} ms` : '- ms';
        document.getElementById('uptime').textContent = stats.uptime || '-';
        
        // Update bot info
        document.getElementById('bot-name').textContent = stats.bot_name || '-';
        document.getElementById('bot-id').textContent = stats.bot_id || '-';
        document.getElementById('command-count').textContent = stats.command_count || '-';
        document.getElementById('error-count').textContent = stats.error_count || '-';
        
        // Update bot status
        const statusElement = document.getElementById('bot-status');
        statusElement.className = 'badge';
        
        if (stats.status === 'online') {
            statusElement.classList.add('bg-success');
            statusElement.textContent = 'Online';
        } else {
            statusElement.classList.add('bg-danger');
            statusElement.textContent = 'Offline';
        }
        
        // Update latency color
        const latencyElement = document.getElementById('latency');
        if (stats.latency) {
            latencyElement.className = '';
            if (stats.latency < 100) {
                latencyElement.classList.add('text-success');
            } else if (stats.latency < 200) {
                latencyElement.classList.add('text-warning');
            } else {
                latencyElement.classList.add('text-danger');
            }
        }
    }

    updateGuildsTable(guilds) {
        const tbody = document.getElementById('guilds-table');
        
        if (!guilds || guilds.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">No servers found</td></tr>';
            return;
        }
        
        tbody.innerHTML = guilds.map(guild => `
            <tr>
                <td>
                    <div class="guild-info">
                        ${guild.icon_url ? 
                            `<img src="${guild.icon_url}" alt="${guild.name}" class="guild-avatar">` : 
                            '<div class="guild-avatar bg-secondary d-flex align-items-center justify-content-center text-white"><i class="fas fa-server"></i></div>'
                        }
                        <div>
                            <div class="guild-name">${this.escapeHtml(guild.name)}</div>
                            <div class="guild-id">${guild.id}</div>
                        </div>
                    </div>
                </td>
                <td>
                    <span class="badge bg-primary">${guild.member_count?.toLocaleString() || '0'}</span>
                </td>
                <td>${this.escapeHtml(guild.owner) || 'Unknown'}</td>
                <td>${this.formatDate(guild.created_at)}</td>
            </tr>
        `).join('');
    }

    updateCommandsTable(commands) {
        const tbody = document.getElementById('commands-table');
        
        if (!commands || commands.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" class="text-center text-muted">No commands found</td></tr>';
            return;
        }
        
        // Sort commands by usage count
        commands.sort((a, b) => (b.usage_count || 0) - (a.usage_count || 0));
        
        const maxUsage = Math.max(...commands.map(cmd => cmd.usage_count || 0));
        
        tbody.innerHTML = commands.map(command => `
            <tr>
                <td>
                    <code>/${command.name}</code>
                </td>
                <td>${this.escapeHtml(command.description) || 'No description'}</td>
                <td>
                    <div class="d-flex align-items-center">
                        <span class="me-2">${command.usage_count || 0}</span>
                        <div class="usage-bar flex-grow-1">
                            <div class="usage-bar-fill" style="width: ${maxUsage > 0 ? ((command.usage_count || 0) / maxUsage) * 100 : 0}%"></div>
                        </div>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    addActivityLog(activity) {
        const activityLog = document.getElementById('activity-log');
        
        if (activityLog.querySelector('.text-muted')) {
            activityLog.innerHTML = '';
        }
        
        const activityItem = document.createElement('div');
        activityItem.className = `activity-item ${activity.type || ''}`;
        activityItem.innerHTML = `
            <div>${this.escapeHtml(activity.message)}</div>
            <div class="activity-time">${this.formatTimestamp(activity.timestamp)}</div>
        `;
        
        activityLog.insertBefore(activityItem, activityLog.firstChild);
        
        // Keep only last 20 items
        while (activityLog.children.length > 20) {
            activityLog.removeChild(activityLog.lastChild);
        }
    }

    setupEventListeners() {
        // Refresh button (if added)
        document.addEventListener('click', (event) => {
            if (event.target.matches('[data-refresh]')) {
                this.loadInitialData();
            }
        });
        
        // Handle visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // Page is hidden, reduce update frequency
                if (this.updateInterval) {
                    clearInterval(this.updateInterval);
                }
            } else {
                // Page is visible, resume normal updates
                this.startPeriodicUpdates();
                this.loadInitialData();
            }
        });
    }

    startPeriodicUpdates() {
        // Clear existing interval
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        
        // Update every 30 seconds
        this.updateInterval = setInterval(() => {
            if (!document.hidden) {
                this.loadStats();
            }
        }, 30000);
    }

    showError(message) {
        // Create or update error notification
        let errorDiv = document.getElementById('error-notification');
        
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.id = 'error-notification';
            errorDiv.className = 'alert alert-danger alert-dismissible fade show';
            errorDiv.style.position = 'fixed';
            errorDiv.style.top = '20px';
            errorDiv.style.right = '20px';
            errorDiv.style.zIndex = '9999';
            errorDiv.style.minWidth = '300px';
            
            document.body.appendChild(errorDiv);
        }
        
        errorDiv.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i> ${this.escapeHtml(message)}
            <button type="button" class="btn-close" onclick="this.parentElement.remove()"></button>
        `;
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentElement) {
                errorDiv.remove();
            }
        }, 5000);
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatDate(dateString) {
        if (!dateString) return 'Unknown';
        
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (error) {
            return 'Invalid Date';
        }
    }

    formatTimestamp(timestamp) {
        if (!timestamp) return 'Unknown';
        
        try {
            const date = new Date(timestamp);
            return date.toLocaleString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        } catch (error) {
            return 'Invalid Time';
        }
    }

    destroy() {
        if (this.ws) {
            this.ws.close();
        }
        
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        
        if (this.wsReconnectInterval) {
            clearInterval(this.wsReconnectInterval);
        }
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboardApp = new DashboardApp();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.dashboardApp) {
        window.dashboardApp.destroy();
    }
});

// Handle WebSocket connection errors gracefully
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});

// Utility functions for enhanced functionality
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        // Show success notification
        const notification = document.createElement('div');
        notification.className = 'alert alert-success';
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.zIndex = '9999';
        notification.innerHTML = '<i class="fas fa-check"></i> Copied to clipboard!';
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
}

// Add click listeners for copyable elements
document.addEventListener('click', (event) => {
    if (event.target.matches('.guild-id, [data-copy]')) {
        copyToClipboard(event.target.textContent);
    }
});

// Add tooltips to elements
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Bootstrap tooltips if available
    if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
    }
});
