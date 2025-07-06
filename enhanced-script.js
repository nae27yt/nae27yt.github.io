// Enhanced Discord Bot Dashboard JavaScript

class EnhancedDashboard {
    constructor() {
        this.ws = null;
        this.wsReconnectInterval = null;
        this.wsReconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 5000;
        this.commandChart = null;
        
        this.init();
    }

    init() {
        this.setupWebSocket();
        this.loadInitialData();
        this.setupEventListeners();
        this.initializeChart();
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
        const statusElement = document.getElementById('connection-status');
        statusElement.className = 'badge';
        
        switch (status) {
            case 'connected':
                statusElement.classList.add('bg-success');
                statusElement.innerHTML = '<i class="fas fa-circle live-indicator"></i> Connected';
                break;
            case 'disconnected':
                statusElement.classList.add('bg-danger');
                statusElement.innerHTML = '<i class="fas fa-circle"></i> Disconnected';
                break;
            case 'connecting':
                statusElement.classList.add('bg-warning');
                statusElement.innerHTML = '<i class="fas fa-circle live-indicator"></i> Connecting...';
                break;
            case 'error':
                statusElement.classList.add('bg-danger');
                statusElement.innerHTML = '<i class="fas fa-exclamation-circle"></i> Error';
                break;
            case 'failed':
                statusElement.classList.add('bg-secondary');
                statusElement.innerHTML = '<i class="fas fa-times-circle"></i> Failed';
                break;
            default:
                statusElement.classList.add('bg-secondary');
                statusElement.innerHTML = '<i class="fas fa-circle"></i> Unknown';
        }
    }

    async loadInitialData() {
        try {
            await Promise.all([
                this.loadStats(),
                this.loadServers(),
                this.loadCommands(),
                this.loadDatabaseStatus()
            ]);
        } catch (error) {
            console.error('Error loading initial data:', error);
            this.showNotification('Failed to load dashboard data', 'error');
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
        }
    }

    async loadServers() {
        try {
            const response = await fetch('/api/guilds');
            if (!response.ok) throw new Error('Failed to fetch servers');
            
            const servers = await response.json();
            this.updateServersTable(servers);
        } catch (error) {
            console.error('Error loading servers:', error);
        }
    }

    async loadCommands() {
        try {
            const response = await fetch('/api/commands');
            if (!response.ok) throw new Error('Failed to fetch commands');
            
            const commands = await response.json();
            this.updateCommandsChart(commands);
            this.updateCommandUsageTable(commands);
        } catch (error) {
            console.error('Error loading commands:', error);
        }
    }

    async loadDatabaseStatus() {
        try {
            const response = await fetch('/api/database-status');
            if (!response.ok) throw new Error('Failed to fetch database status');
            
            const dbStatus = await response.json();
            this.updateDatabaseStatus(dbStatus);
        } catch (error) {
            console.error('Error loading database status:', error);
        }
    }

    updateStats(stats) {
        // Update stat cards
        document.getElementById('guild-count').textContent = stats.guild_count?.toLocaleString() || '-';
        document.getElementById('user-count').textContent = stats.user_count?.toLocaleString() || '-';
        document.getElementById('latency').textContent = stats.latency ? `${stats.latency}ms` : '-';
        document.getElementById('uptime').textContent = stats.uptime || '-';
        
        // Update bot info
        document.getElementById('bot-name').textContent = stats.bot_name || '-';
        document.getElementById('command-count').textContent = stats.command_count || '-';
        
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

    updateServersTable(servers) {
        const tbody = document.getElementById('servers-table');
        
        if (!servers || servers.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No servers found</td></tr>';
            return;
        }
        
        tbody.innerHTML = servers.map(server => `
            <tr>
                <td>
                    <div class="d-flex align-items-center">
                        ${server.icon_url ? 
                            `<img src="${server.icon_url}" alt="${server.name}" class="rounded-circle me-2" width="32" height="32">` : 
                            '<div class="bg-secondary rounded-circle me-2 d-flex align-items-center justify-content-center text-white" style="width:32px;height:32px;"><i class="fas fa-server"></i></div>'
                        }
                        <div>
                            <strong>${this.escapeHtml(server.name)}</strong><br>
                            <small class="text-muted">${server.id}</small>
                        </div>
                    </div>
                </td>
                <td><span class="badge bg-primary">${server.member_count?.toLocaleString() || '0'}</span></td>
                <td>${this.escapeHtml(server.owner) || 'Unknown'}</td>
                <td>${this.formatDate(server.created_at)}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="copyToClipboard('${server.id}')">
                        <i class="fas fa-copy"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    updateCommandsChart(commands) {
        if (!this.commandChart) return;
        
        const sortedCommands = commands
            .filter(cmd => cmd.usage_count > 0)
            .sort((a, b) => b.usage_count - a.usage_count)
            .slice(0, 10);
        
        this.commandChart.data.labels = sortedCommands.map(cmd => cmd.name);
        this.commandChart.data.datasets[0].data = sortedCommands.map(cmd => cmd.usage_count);
        this.commandChart.update();
    }

    updateCommandUsageTable(commands) {
        const tbody = document.getElementById('command-usage-table');
        
        if (!commands || commands.length === 0) {
            tbody.innerHTML = '<tr><td colspan="2" class="text-center text-muted">No commands found</td></tr>';
            return;
        }
        
        const sortedCommands = commands.sort((a, b) => (b.usage_count || 0) - (a.usage_count || 0));
        
        tbody.innerHTML = sortedCommands.map(command => `
            <tr>
                <td><code>/${command.name}</code></td>
                <td><span class="badge bg-info">${command.usage_count || 0}</span></td>
            </tr>
        `).join('');
    }

    updateDatabaseStatus(dbStatus) {
        // Update database metrics
        document.getElementById('db-total-commands').textContent = dbStatus.total_commands?.toLocaleString() || '0';
        document.getElementById('db-total-errors').textContent = dbStatus.total_errors?.toLocaleString() || '0';
        document.getElementById('db-pool-size').textContent = dbStatus.pool_size || '0';
        
        // Update database status
        const statusElement = document.getElementById('db-status');
        if (dbStatus.connected) {
            statusElement.textContent = 'Connected';
            statusElement.className = 'text-success';
        } else {
            statusElement.textContent = 'Disconnected';
            statusElement.className = 'text-danger';
        }
    }

    initializeChart() {
        const ctx = document.getElementById('commandChart').getContext('2d');
        this.commandChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Command Usage',
                    data: [],
                    backgroundColor: 'rgba(102, 126, 234, 0.6)',
                    borderColor: 'rgba(102, 126, 234, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    addActivityLog(activity) {
        const activityLog = document.getElementById('activity-log');
        
        if (activityLog.querySelector('.text-muted')) {
            activityLog.innerHTML = '';
        }
        
        const activityItem = document.createElement('div');
        activityItem.className = `alert alert-${activity.type === 'error' ? 'danger' : 'info'} alert-dismissible`;
        activityItem.innerHTML = `
            <div>${this.escapeHtml(activity.message)}</div>
            <small class="text-muted">${this.formatTimestamp(activity.timestamp)}</small>
            <button type="button" class="btn-close" onclick="this.parentElement.remove()"></button>
        `;
        
        activityLog.insertBefore(activityItem, activityLog.firstChild);
        
        // Keep only last 10 items
        while (activityLog.children.length > 10) {
            activityLog.removeChild(activityLog.lastChild);
        }
    }

    setupEventListeners() {
        // Auto-refresh every 30 seconds
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.loadInitialData();
            }
        });
    }

    startPeriodicUpdates() {
        // Update every 30 seconds
        setInterval(() => {
            if (!document.hidden) {
                this.loadStats();
                this.loadDatabaseStatus();
            }
        }, 30000);
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} alert-dismissible fade show`;
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.zIndex = '9999';
        notification.style.minWidth = '300px';
        
        notification.innerHTML = `
            <i class="fas fa-${type === 'error' ? 'exclamation-triangle' : 'info-circle'}"></i> 
            ${this.escapeHtml(message)}
            <button type="button" class="btn-close" onclick="this.parentElement.remove()"></button>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
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
        
        if (this.wsReconnectInterval) {
            clearInterval(this.wsReconnectInterval);
        }
        
        if (this.commandChart) {
            this.commandChart.destroy();
        }
    }
}

// Utility functions
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        window.dashboardApp.showNotification('Copied to clipboard!', 'success');
    }).catch(err => {
        console.error('Failed to copy:', err);
        window.dashboardApp.showNotification('Failed to copy to clipboard', 'error');
    });
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboardApp = new EnhancedDashboard();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.dashboardApp) {
        window.dashboardApp.destroy();
    }
});