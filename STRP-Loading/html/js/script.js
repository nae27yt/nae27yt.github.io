// NCHub Loading Screen by NaorNC - Version 1.0.0
// © NaorNC - Unauthorized reproduction or distribution is prohibited

const DEBUG = false;

function debugLog(...args) {
    if (DEBUG) {
        console.log('[LoadingScreen]', ...args);
    }
}

let dataLoaded = false;
let audioInitialized = false;
let backgroundMusic = null;
let audioContext = null;
let audioSource = null;
let audioToggle = null;
let isMusicPlaying = false;
let audioAttempts = 0;
let maxAudioAttempts = 10;
let maxSlots = 64;
let youtubePlayer = null;
let currentYoutubeId = null;
let cursorInitialized = false;
let audioResetInterval = null;
let lastAudioCheckTime = 0;

document.addEventListener('DOMContentLoaded', () => {
    debugLog('Loading screen UI initialized!');
    
    initAudioSystem();
    initBackground();
    initCursor();
    simulateLoading();
    initTips();
    initSocialLinks();
    initTabSystem();
    applyConfig();
    displayInitialData();
    
    setTimeout(() => {
        debugLog('UI is ready, sending ready signal to server');
        sendUIReadySignal();
        fetchServerData();
    }, 500);
});

window.addEventListener('load', () => {
    debugLog('Window fully loaded');
    
    document.addEventListener('click', initAudioSystem, { once: true });
    document.addEventListener('keydown', initAudioSystem, { once: true });
    
    audioResetInterval = setInterval(checkAudioStatus, 2000);
    
    window.addEventListener('focus', () => {
        debugLog('Window got focus, checking audio');
        checkAudioStatus();
    });
    
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            debugLog('Tab became visible, checking audio');
            checkAudioStatus();
        }
    });
});

function initTabSystem() {
    debugLog('Initializing tab system');
    
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    if (tabs.length === 0 || tabContents.length === 0) {
        debugLog('Tab elements not found, skipping initialization');
        return;
    }
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            tab.classList.add('active');
            
            const tabId = tab.getAttribute('data-tab');
            const tabContent = document.getElementById(`${tabId}-tab`);
            
            if (tabContent) {
                tabContent.classList.add('active');
            }
            
            localStorage.setItem('selectedTab', tabId);
        });
    });
    
    const savedTab = localStorage.getItem('selectedTab');
    if (savedTab) {
        const savedTabEl = document.querySelector(`.tab[data-tab="${savedTab}"]`);
        if (savedTabEl) {
            savedTabEl.click();
        }
    }
    
    debugLog('Tab system initialized');
}

function initCursor() {
    const cursor = document.querySelector('.custom-cursor');
    if (!cursor || cursorInitialized) return;
    
    debugLog('Initializing enhanced cursor system');
    
    let cursorVisible = true;
    let cursorX = 0;
    let cursorY = 0;
    let requestId = null;
    let lastMoveTime = Date.now();
    
    document.querySelectorAll('button, a, .tab').forEach(el => {
        el.style.cursor = 'pointer';
    });

    document.addEventListener('mousemove', (e) => {
        cursorVisible = true;
        cursor.style.opacity = 1;
        cursorX = e.clientX;
        cursorY = e.clientY;
        lastMoveTime = Date.now();
        
        if (!requestId) {
            requestId = requestAnimationFrame(updateCursor);
        }
    });
    
    document.addEventListener('mousedown', () => {
        cursor.classList.add('active');
    });
    
    document.addEventListener('mouseup', () => {
        cursor.classList.remove('active');
    });
    
    setInterval(() => {
        if (Date.now() - lastMoveTime > 3000 && cursorVisible) {
            cursorVisible = false;
            cursor.style.opacity = 0;
        }
    }, 1000);
    
    document.addEventListener('mouseleave', () => {
        cursor.style.opacity = 0;
    });
    
    document.addEventListener('mouseenter', () => {
        cursor.style.opacity = 1;
    });

    function updateCursor() {
        cursor.style.transform = `translate(${cursorX}px, ${cursorY}px)`;
        requestId = null;
    }
    
    cursorInitialized = true;
}

function initSocialLinks() {
    debugLog('Initializing social links');
    
    const socialLinks = document.querySelectorAll('.social-icon');
    
    socialLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const url = this.getAttribute('href');
            if (url && url !== '#') {
                debugLog('Social link clicked:', url);
                openExternalBrowser(url);
            }
        });
    });
}

function openExternalBrowser(url) {
    try {
        if (typeof window.invokeNative === 'function') {
            debugLog('Using invokeNative to open URL:', url);
            window.invokeNative('openUrl', url);
            return;
        }
        
        if (typeof fetch === 'function') {
            debugLog('Using NUI callback to open URL:', url);
            fetch(`https://${safeGetResourceName()}/openLink`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    url: url
                })
            }).catch(() => {
                debugLog('NUI failed, trying window.open');
                window.open(url, '_blank');
            });
            return;
        }
        
        debugLog('Using window.open for URL:', url);
        window.open(url, '_blank');
    } catch (error) {
        debugLog('Error opening URL:', error);
        try {
            window.open(url, '_blank');
        } catch (e) {
            debugLog('Final attempt to open URL failed');
        }
    }
}

function initBackground() {
    try {
        const bgContainer = document.getElementById('background-container');
        if (!bgContainer) return;
        
        bgContainer.innerHTML = '';
        
        if (typeof config === 'undefined') {
            debugLog('Config not found, using default background image');
            createBackgroundImage('https://getwallpapers.com/wallpaper/full/4/b/f/1266182-vertical-skyrim-pictures-wallpapers-1920x1080-lockscreen.jpg');
            return;
        }
        
        if (config.appearance && config.appearance.youtubeURL && config.appearance.youtubeURL.trim() !== '') {
            debugLog('Using YouTube background');
            createYouTubeEmbed(config.appearance.youtubeURL);
        } 
        else if (config.appearance && config.appearance.backgroundImage) {
            debugLog('Using background image');
            createBackgroundImage(config.appearance.backgroundImage);
        } 
        else {
            debugLog('No background specified, using default');
            createBackgroundImage('https://getwallpapers.com/wallpaper/full/4/b/f/1266182-vertical-skyrim-pictures-wallpapers-1920x1080-lockscreen.jpg');
        }
    } catch (error) {
        debugLog('Error initializing background:', error);
        createBackgroundImage('https://getwallpapers.com/wallpaper/full/4/b/f/1266182-vertical-skyrim-pictures-wallpapers-1920x1080-lockscreen.jpg');
    }
}

function createYouTubeEmbed(youtubeURL) {
    try {
        const bgContainer = document.getElementById('background-container');
        if (!bgContainer) return;
        
        const videoId = extractYouTubeId(youtubeURL);
        if (!videoId) {
            debugLog('Invalid YouTube URL:', youtubeURL);
            createBackgroundImage('https://getwallpapers.com/wallpaper/full/4/b/f/1266182-vertical-skyrim-pictures-wallpapers-1920x1080-lockscreen.jpg');
            return;
        }
        
        if (currentYoutubeId === videoId && document.getElementById('youtube-iframe')) {
            debugLog('YouTube video already playing');
            return;
        }
        
        currentYoutubeId = videoId;
        
        bgContainer.innerHTML = '';
        
        debugLog('Creating direct YouTube iframe embed (always muted)');
        
        const iframe = document.createElement('iframe');
        iframe.id = 'youtube-iframe';
        iframe.className = 'youtube-background';
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        iframe.setAttribute('frameborder', '0');
        iframe.setAttribute('allowfullscreen', '');
        iframe.src = `https://www.youtube.com/embed/${videoId}?enablejsapi=1&controls=0&showinfo=0&rel=0&iv_load_policy=3&fs=0&modestbranding=1&autoplay=1&loop=1&playlist=${videoId}&mute=1&playsinline=1&vq=hd1080`;
        
        bgContainer.appendChild(iframe);
        
        playAudio();
        
    } catch (error) {
        debugLog('Error creating YouTube embed:', error);
        createBackgroundImage('https://getwallpapers.com/wallpaper/full/4/b/f/1266182-vertical-skyrim-pictures-wallpapers-1920x1080-lockscreen.jpg');
    }
}

function extractYouTubeId(url) {
    if (!url) return null;
    
    debugLog('Extracting YouTube ID from:', url);
    
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    const videoId = (match && match[7].length === 11) ? match[7] : null;
    
    debugLog('Extracted YouTube ID:', videoId);
    return videoId;
}

function createBackgroundImage(imagePath) {
    try {
        const bgContainer = document.getElementById('background-container');
        if (!bgContainer) return;
        
        bgContainer.innerHTML = '';
        
        currentYoutubeId = null;
        
        const imageElement = document.createElement('img');
        imageElement.classList.add('background-image');
        imageElement.src = imagePath;
        imageElement.alt = 'Background';
        
        bgContainer.appendChild(imageElement);
        
        if (audioInitialized && backgroundMusic) {
            playAudio();
        }
    } catch (error) {
        debugLog('Error creating background image:', error);
    }
}

function checkAudioStatus() {
    const now = Date.now();
    if (now - lastAudioCheckTime < 1000) {
        return;
    }
    lastAudioCheckTime = now;

    if (!backgroundMusic) return;

    if (isMusicPlaying && backgroundMusic.paused) {
        debugLog('Audio paused unexpectedly, attempting to restart');
        
        try {
            if (backgroundMusic.readyState >= 2) {
                const promise = backgroundMusic.play();
                if (promise !== undefined) {
                    promise.catch(error => {
                        debugLog('Error restarting audio:', error);
                        
                        if (error.name === 'NotAllowedError') {
                            debugLog('Autoplay blocked by browser, will try again on user interaction');
                            isMusicPlaying = false;
                            if (audioToggle) {
                                audioToggle.innerHTML = '<i class="fas fa-volume-mute"></i>';
                            }
                            
                            document.addEventListener('click', () => {
                                playAudio();
                            }, { once: true });
                        } else {
                            setTimeout(() => playAudio(), 2000);
                        }
                    });
                }
            } else {
                backgroundMusic.load();
                setTimeout(() => playAudio(), 1000);
            }
        } catch (e) {
            debugLog('Exception during audio restart:', e);
        }
    }
}

function initAudioSystem() {
    if (audioInitialized) {
        checkAudioStatus();
        return;
    }
    
    try {
        if (!audioContext && window.AudioContext) {
            audioContext = new window.AudioContext();
            debugLog('Audio context created');
        }
        
        backgroundMusic = document.getElementById('background-music');
        audioToggle = document.getElementById('audio-toggle');
        
        if (backgroundMusic && audioToggle) {
            backgroundMusic.load();
            
            backgroundMusic.addEventListener('canplaythrough', function() {
                debugLog('Audio loaded and ready to play');
                if (isMusicPlaying && backgroundMusic.paused) {
                    playAudio();
                }
            });
            
            backgroundMusic.addEventListener('error', handleAudioError);
            backgroundMusic.addEventListener('ended', handleAudioEnded);
            backgroundMusic.addEventListener('pause', handleAudioPause);
            backgroundMusic.addEventListener('play', () => {
                debugLog('Audio play event triggered');
            });
            
            backgroundMusic.addEventListener('stalled', () => {
                debugLog('Audio stalled');
                setTimeout(() => playAudio(), 1000);
            });
            
            backgroundMusic.addEventListener('suspend', () => {
                debugLog('Audio suspended');
                if (isMusicPlaying) {
                    setTimeout(() => playAudio(), 1000);
                }
            });
            
            audioToggle.addEventListener('click', toggleAudio);
            
            setTimeout(playAudio, 1000);
            
            audioInitialized = true;
            debugLog('Audio system initialized');
        }
    } catch (e) {
        debugLog('Error initializing audio system:', e);
    }
}

function handleAudioError(e) {
    debugLog('Audio error occurred:', e);
    
    if (typeof fetch === 'function') {
        fetch(`https://${safeGetResourceName()}/audioError`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: e.type || 'unknown' })
        }).catch(() => {});
    }
    
    if (audioAttempts < maxAudioAttempts) {
        audioAttempts++;
        setTimeout(playAudio, 2000);
    }
}

function handleAudioEnded() {
    debugLog('Audio playback ended');
    
    if (isMusicPlaying) {
        debugLog('Restarting audio');
        backgroundMusic.currentTime = 0;
        playAudio();
    }
}

function handleAudioPause() {
    debugLog('Audio pause event detected');
    
    if (isMusicPlaying && backgroundMusic.paused) {
        debugLog('Audio paused unexpectedly, resuming');
        setTimeout(() => playAudio(), 500);
    }
}

function playAudio() {
    if (!backgroundMusic) return;
    
    try {
        if (backgroundMusic.paused) {
            debugLog('Attempting to play audio');
            
            const volumeConfig = (typeof config !== 'undefined' && config.audio && config.audio.volume !== undefined) 
                                ? config.audio.volume : 0.3;
            
            backgroundMusic.volume = volumeConfig;
            
            if (backgroundMusic.readyState < 2) {
                debugLog('Audio not ready yet, loading...');
                backgroundMusic.load();
                
                backgroundMusic.addEventListener('canplaythrough', function playWhenReady() {
                    debugLog('Audio now ready, attempting playback');
                    const playPromise = backgroundMusic.play();
                    
                    if (playPromise !== undefined) {
                        playPromise
                            .then(() => {
                                debugLog('Audio playback started successfully after loading');
                                isMusicPlaying = true;
                                
                                if (audioToggle) {
                                    audioToggle.innerHTML = '<i class="fas fa-volume-up"></i>';
                                }
                                
                                backgroundMusic.removeEventListener('canplaythrough', playWhenReady);
                            })
                            .catch((error) => {
                                debugLog('Audio play failed after loading:', error);
                                
                                backgroundMusic.removeEventListener('canplaythrough', playWhenReady);
                                
                                if (error.name === 'NotAllowedError') {
                                    debugLog('Autoplay blocked by browser policy');
                                    
                                    document.addEventListener('click', () => {
                                        playAudio();
                                    }, { once: true });
                                } else {
                                    setTimeout(playAudio, 2000);
                                }
                            });
                    }
                }, { once: true });
            } else {
                const playPromise = backgroundMusic.play();
                
                if (playPromise !== undefined) {
                    playPromise
                        .then(() => {
                            debugLog('Audio playback started successfully');
                            isMusicPlaying = true;
                            
                            if (audioToggle) {
                                audioToggle.innerHTML = '<i class="fas fa-volume-up"></i>';
                            }
                            
                            if (typeof fetch === 'function') {
                                fetch(`https://${safeGetResourceName()}/audioSuccess`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({})
                                }).catch(() => {});
                            }
                        })
                        .catch((error) => {
                            debugLog('Audio play failed:', error);
                            
                            if (error.name === 'NotAllowedError') {
                                debugLog('Autoplay blocked by browser policy');
                                
                                document.addEventListener('click', () => {
                                    playAudio();
                                }, { once: true });
                            } else {
                                if (audioAttempts < maxAudioAttempts) {
                                    audioAttempts++;
                                    setTimeout(playAudio, 2000);
                                }
                            }
                        });
                }
            }
        }
    } catch (e) {
        debugLog('Error playing audio:', e);
    }
}

function toggleAudio() {
    if (!backgroundMusic) return;
    
    if (isMusicPlaying) {
        backgroundMusic.pause();
        if (audioToggle) {
            audioToggle.innerHTML = '<i class="fas fa-volume-mute"></i>';
        }
        isMusicPlaying = false;
        debugLog('Audio paused by user');
    } else {
        playAudio();
        debugLog('Audio resume attempt by user');
    }
}

function displayInitialData() {
    const serverIP = (typeof config !== 'undefined' && config.server && config.server.ip) ? config.server.ip : "0.0.0.0";
    const serverPort = (typeof config !== 'undefined' && config.server && config.server.port) ? config.server.port : "0";
    maxSlots = (typeof config !== 'undefined' && config.server && config.server.maxPlayers) ? config.server.maxPlayers : 64;
    
    updateServerData({
        serverUptime: "150 days online",
        totalActivities: "45 activities",
        availableVehicles: "250 vehicles",
        availableJobs: "25 jobs"
    });
    
    debugLog('Initial data displayed');
}

function sendUIReadySignal() {
    try {
        fetch(`https://${safeGetResourceName()}/uiReady`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
        })
        .then(resp => resp.json())
        .then(data => {
            debugLog('Server acknowledged UI ready');
        })
        .catch(error => {
            debugLog('Error sending uiReady:', error);
        });
    } catch (error) {
        debugLog('Exception in sendUIReadySignal:', error);
    }
}

function safeGetResourceName() {
    try {
        if (typeof window.GetParentResourceName === 'function') {
            return window.GetParentResourceName();
        }
    } catch (error) {
        debugLog('Error getting resource name:', error);
    }
    return 'loadingscreen';
}

function applyConfig() {
    try {
        debugLog('Applying configuration from config.js');
        
        if (typeof config === 'undefined') {
            debugLog('Warning: config is not defined - using defaults');
            return;
        }
        
        const logoEl = document.getElementById('server-logo');
        if (logoEl) {
            if (config.appearance && config.appearance.animateLogo === false) {
                logoEl.classList.remove('logo-animated');
                debugLog('Logo animation disabled by config');
            } else {
                logoEl.classList.add('logo-animated');
                debugLog('Logo animation enabled');
            }
        }
        
        if (config.appearance && config.appearance.primaryColor) {
            document.documentElement.style.setProperty('--primary-color-rgb', config.appearance.primaryColor);
        }
        
        if (config.appearance && config.appearance.accentColor) {
            document.documentElement.style.setProperty('--accent-color-rgb', config.appearance.accentColor);
        }
        
        if (config.appearance && config.appearance.overlayOpacity !== undefined) {
            const overlay = document.querySelector('.background-overlay');
            if (overlay) {
                overlay.style.opacity = config.appearance.overlayOpacity;
            }
        }
        
        const featuresContainer = document.getElementById('feature-container');
        if (featuresContainer && config.features) {
            featuresContainer.innerHTML = '';
            
            config.features.forEach(feature => {
                const featureEl = document.createElement('div');
                featureEl.className = 'feature';
                featureEl.innerHTML = `<i class="fas fa-${feature.icon}"></i><span>${feature.label}</span>`;
                featuresContainer.appendChild(featureEl);
            });
        }
        
        const socialContainer = document.getElementById('social-links');
        if (socialContainer && config.socialMedia) {
            socialContainer.innerHTML = '';
            
            for (const [platform, url] of Object.entries(config.socialMedia)) {
                if (url) {
                    const linkEl = document.createElement('a');
                    linkEl.href = url;
                    linkEl.className = 'social-icon';
                    linkEl.innerHTML = `<i class="fab fa-${platform}"></i>`;
                    socialContainer.appendChild(linkEl);
                }
            }
            
            initSocialLinks();
        }
        
        if (config.audio && config.audio.trackName) {
            const trackNameEl = document.getElementById('track-name');
            if (trackNameEl) {
                trackNameEl.textContent = config.audio.trackName;
            }
        }
        
        if (config.server && config.server.maxPlayers) {
            maxSlots = config.server.maxPlayers;
        }
        
        debugLog('Configuration applied successfully');
    } catch (error) {
        debugLog('Error applying configuration:', error);
    }
}

function simulateLoading() {
    debugLog('Starting enhanced loading simulation');
    
    const progressBar = document.getElementById('loading-progress');
    const percentageText = document.getElementById('loading-percentage');
    const statusText = document.getElementById('loading-status');
    
    if (!progressBar || !percentageText || !statusText) {
        debugLog('Loading elements not found in DOM');
        return;
    }
    
    let loadingStages = [];
    
    if (typeof config !== 'undefined' && config.advanced && config.advanced.loadingStages) {
        loadingStages = config.advanced.loadingStages;
    } else {
        loadingStages = [
            { percentage: 10, message: 'Establishing connection...' },
            { percentage: 20, message: 'Loading world...' },
            { percentage: 35, message: 'Loading game assets...' },
            { percentage: 50, message: 'Loading vehicles...' },
            { percentage: 65, message: 'Syncing player data...' },
            { percentage: 80, message: 'Preparing roleplay elements...' },
            { percentage: 90, message: 'Finalizing setup...' },
            { percentage: 100, message: 'Welcome to the server!' }
        ];
    }
    
    let currentPercentage = 0;
    let lastStageIndex = -1;
    let targetPercentage = 0;
    let animationFrameId = null;
    
    function updateLoadingBar() {
        if (currentPercentage < targetPercentage) {
            currentPercentage += Math.min(0.5, targetPercentage - currentPercentage);
        }
        
        progressBar.style.width = `${currentPercentage}%`;
        percentageText.textContent = `${Math.round(currentPercentage)}%`;
        
        for (let i = 0; i < loadingStages.length; i++) {
            if (currentPercentage >= loadingStages[i].percentage && i > lastStageIndex) {
                statusText.textContent = loadingStages[i].message;
                lastStageIndex = i;
                statusText.classList.add('pulse-effect');
                setTimeout(() => {
                    statusText.classList.remove('pulse-effect');
                }, 500);
                debugLog(`Loading stage changed: ${loadingStages[i].message}`);
                break;
            }
        }
        
        if (currentPercentage < 100) {
            animationFrameId = requestAnimationFrame(updateLoadingBar);
        } else {
            debugLog('Loading simulation completed');
        }
    }
    
    function progressToNextStage() {
        if (lastStageIndex + 1 < loadingStages.length) {
            targetPercentage = loadingStages[lastStageIndex + 1].percentage;
            
            if (!animationFrameId) {
                animationFrameId = requestAnimationFrame(updateLoadingBar);
            }
            
            const delay = Math.random() * 2000 + 1000;
            setTimeout(progressToNextStage, delay);
        }
    }
    
    setTimeout(() => {
        progressToNextStage();
    }, 800);
}

function initTips() {
    debugLog('Initializing tips rotation');
    
    const tipText = document.getElementById('tip-text');
    if (!tipText) {
        debugLog('Tip element not found in DOM');
        return;
    }
    
    const defaultTips = [
        'Press F1 to open the help menu when in-game.',
        'Join our Discord server to stay updated with the latest news.',
        'Use /report to report any issues or players breaking rules.',
        'Respect other players and follow server rules for a better experience.',
        'Check out our website for more information about upcoming events.',
        'Try the Speed Clicker mini-game while you wait!',
        'Click on the different tabs to learn more about our server.'
    ];
    
    const tipsToUse = (typeof config !== 'undefined' && config.tips) ? config.tips : defaultTips;
    
    let currentTipIndex = 0;
    
    function showNextTip() {
        tipText.style.opacity = 0;
        
        setTimeout(() => {
            currentTipIndex = (currentTipIndex + 1) % tipsToUse.length;
            tipText.textContent = tipsToUse[currentTipIndex];
            tipText.style.opacity = 1;
        }, 500);
    }
    
    tipText.textContent = tipsToUse[0];
    
    setInterval(showNextTip, 8000);
}

function fetchServerData() {
    debugLog('Requesting server data');
    
    try {
        fetch(`https://${safeGetResourceName()}/getServerData`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
        })
        .then(resp => resp.json())
        .then(response => {
            debugLog('Data received from server:', response);
            
            if (response && typeof response === 'object') {
                let data = response;
                if (response.defaultData) {
                    data = response.defaultData;
                }
                
                if (response.maxSlots && response.maxSlots > 0) {
                    maxSlots = response.maxSlots;
                    debugLog('Updated max slots to: ' + maxSlots);
                }
                
                dataLoaded = true;
                updateServerData(data);
            }
        })
        .catch(error => {
            debugLog('Error fetching server data:', error);
        });
    } catch (error) {
        debugLog('Exception in fetchServerData:', error);
    }
}

function updateServerData(data) {
    debugLog('Updating UI with server data:', data);
    
    try {
        if (typeof data === 'object' && data !== null) {
            const elements = {
                'stat-server-uptime': data.serverUptime,
                'stat-activities': data.totalActivities,
                'stat-vehicles': data.availableVehicles,
                'stat-jobs': data.availableJobs
            };
            
            for (const [id, value] of Object.entries(elements)) {
                const element = document.getElementById(id);
                if (element && value) {
                    element.textContent = value;
                }
            }
            
            debugLog('UI updated successfully');
        } else {
            debugLog('Invalid data received, cannot update UI');
        }
    } catch (error) {
        debugLog('Error updating UI:', error);
    }
}

window.addEventListener('message', (event) => {
    const data = event.data;
    
    if (data && data.type === 'updateServerData') {
        debugLog('Received data update event from script:', data.serverInfo);
        updateServerData(data.serverInfo);
    }
    
    if (data && data.type === 'forcePlayAudio') {
        debugLog('Received force play audio command');
        playAudio();
    }
    
    if (data && data.type === 'updateMaxSlots') {
        debugLog('Received max slots update:', data.maxSlots);
        maxSlots = data.maxSlots;
    }
    
    if (data && data.type === 'updateConfig') {
        debugLog('Received config update event');
        
        if (data.config) {
            config = data.config;
            
            if (data.reloadBackground) {
                initBackground();
            }
            
            applyConfig();
        }
    }

    if (data && data.type === 'navigateToTab') {
        debugLog('Received tab navigation command:', data.tabId);
        if (data.tabId && typeof window.switchTab === 'function') {
            window.switchTab(data.tabId);
        }
    }
});

function formatNumber(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function isFiveMContext() {
    try {
        return typeof window.GetParentResourceName === 'function';
    } catch (error) {
        return false;
    }
}

function preloadImages(sources) {
    debugLog('Preloading images');
    sources.forEach(src => {
        const img = new Image();
        img.src = src;
    });
}

window.debugLog = debugLog;
window.switchTab = function(tabId) {
    const tab = document.querySelector(`.tab[data-tab="${tabId}"]`);
    if (tab) {
        tab.click();
    }
};

debugLog('Script version 1.0.0 initialized!');
debugLog('Running in FiveM context:', isFiveMContext());

setTimeout(() => {
    preloadImages([
        'img/avatars/admin1.png',
        'img/avatars/admin2.png',
        'img/avatars/admin3.png',
        'img/avatars/admin4.png',
        'img/avatars/donor1.png',
        'img/avatars/donor2.png',
        'img/avatars/donor3.png',
        'img/avatars/donor4.png',
        'img/server-hero.png'
    ]);
}, 2000);

window.addEventListener('pageshow', () => {
    if (audioInitialized && isMusicPlaying && backgroundMusic && backgroundMusic.paused) {
        debugLog('Page shown event - checking audio');
        setTimeout(playAudio, 500);
    }
});

window.addEventListener('beforeunload', () => {
    if (audioResetInterval) {
        clearInterval(audioResetInterval);
    }
    
    if (backgroundMusic) {
        backgroundMusic.pause();
        backgroundMusic.src = '';
    }
});

// © NaorNC - NCHub - All rights reserved - Discord.gg/NCHub