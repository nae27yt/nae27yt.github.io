/**
 * Speed Clicker Minigame - NCHub Loading Screen
 * Version 1.0.0
 * Created by NaorNC - All rights reserved - Discord.gg/NCHub
 */

const GAME_DURATION = 10;
let gameActive = false;
let gameTimer = null;
let startTime = 0;
let timeLeft = GAME_DURATION;
let clickCount = 0;
let currentCPS = 0;
let bestCPS = localStorage.getItem('clickGameBestScore') ? parseFloat(localStorage.getItem('clickGameBestScore')) : 0;

const gameTarget = document.getElementById('click-game-target');
const gameIcon = document.getElementById('click-game-icon');
const timeDisplay = document.getElementById('click-game-time');
const clicksDisplay = document.getElementById('click-game-count');
const cpsDisplay = document.getElementById('click-game-cps');

function initClickGame() {
    if (typeof debugLog === 'function') {
        debugLog('Click Speed Game initialized');
    } else {
        console.log('[Click Speed Game] Initialized');
    }
    
    updateDisplay();
    
    if (gameTarget) {
        gameTarget.addEventListener('click', handleGameClick);
    }
}

function updateDisplay() {
    timeDisplay.textContent = GAME_DURATION.toFixed(1);
    clicksDisplay.textContent = "0";
    cpsDisplay.textContent = "0.0";
}

function startGame() {
    resetGameState();
    
    gameActive = true;
    
    startTime = Date.now();
    
    gameTimer = setInterval(updateGameTimer, 100);
}

function handleGameClick() {
    if (!gameActive) {
        startGame();
        return;
    }
    
    clickCount++;
    
    clicksDisplay.textContent = clickCount;
    
    const elapsedSeconds = (GAME_DURATION - timeLeft) || 0.1;
    currentCPS = (clickCount / elapsedSeconds).toFixed(1);
    cpsDisplay.textContent = currentCPS;
    
    addClickEffect();
}

function updateGameTimer() {
    const elapsed = (Date.now() - startTime) / 1000;
    timeLeft = Math.max(0, GAME_DURATION - elapsed);
    
    timeDisplay.textContent = timeLeft.toFixed(1);
    
    if (clickCount > 0) {
        const elapsedSeconds = (GAME_DURATION - timeLeft) || 0.1;
        currentCPS = (clickCount / elapsedSeconds).toFixed(1);
        cpsDisplay.textContent = currentCPS;
    }
    
    if (timeLeft <= 0) {
        endGame();
    }
}

function endGame() {
    clearInterval(gameTimer);
    
    gameActive = false;
    
    const finalCPS = (clickCount / GAME_DURATION).toFixed(1);
    
    if (parseFloat(finalCPS) > bestCPS) {
        bestCPS = parseFloat(finalCPS);
        localStorage.setItem('clickGameBestScore', bestCPS);
    }
    
    setTimeout(resetGameState, 2000);
}

function resetGameState() {
    gameActive = false;
    timeLeft = GAME_DURATION;
    clickCount = 0;
    currentCPS = 0;
    startTime = 0;
    
    if (gameTimer) {
        clearInterval(gameTimer);
        gameTimer = null;
    }
    
    updateDisplay();
}

function addClickEffect() {
    const ripple = document.createElement('div');
    ripple.className = 'click-ripple';
    ripple.style.position = 'absolute';
    ripple.style.width = '10px';
    ripple.style.height = '10px';
    ripple.style.backgroundColor = 'rgba(255, 255, 255, 0.6)';
    ripple.style.borderRadius = '50%';
    
    const targetRect = gameTarget.getBoundingClientRect();
    const size = Math.floor(Math.random() * 15) + 10;
    
    const x = Math.floor(Math.random() * (targetRect.width - size));
    const y = Math.floor(Math.random() * (targetRect.height - size));
    
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.style.width = `${size}px`;
    ripple.style.height = `${size}px`;
    
    ripple.style.animation = 'ripple-effect 0.6s ease-out forwards';
    
    gameTarget.appendChild(ripple);
    setTimeout(() => {
        if (gameTarget.contains(ripple)) {
            gameTarget.removeChild(ripple);
        }
    }, 600);
}

function addRippleStyle() {
    if (!document.getElementById('ripple-style')) {
        const style = document.createElement('style');
        style.id = 'ripple-style';
        style.textContent = `
            @keyframes ripple-effect {
                0% { transform: scale(0); opacity: 1; }
                100% { transform: scale(2); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
}

function initTabSystem() {
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            tab.classList.add('active');
            
            const tabId = tab.getAttribute('data-tab');
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });
    
    window.switchTab = function(tabId) {
        const tab = document.querySelector(`.tab[data-tab="${tabId}"]`);
        if (tab) {
            tab.click();
        }
    };
}

document.addEventListener('DOMContentLoaded', () => {
    initTabSystem();
    initClickGame();
    addRippleStyle();
});

if (typeof window.debugLog === 'function') {
    window.debugLog('Click Speed Game script loaded');
}

// © NaorNC - NCHub - All rights reserved - Discord.gg/NCHub