// Configuration file for STRP-Loading loading screen
// Edit this file to customize your loading screen

const config = {
    // Appearance
    appearance: {
        // Colors (using CSS variables - RGB format)
        primaryColor: "35, 136, 229",     // Main color (default: blue)
        accentColor: "204, 0, 255",       // Secondary color (default: light blue)
        
        // Background options - use either image OR YouTube
        backgroundImage: "https://getwallpapers.com/wallpaper/full/4/b/f/1266182-vertical-skyrim-pictures-wallpapers-1920x1080-lockscreen.jpg",
        youtubeURL: "https://www.youtube.com/watch?v=Pzml9q-Y8cg&t=29s",
        
        // Background overlay opacity (0-1)
        overlayOpacity: 0.7,
        
        // Logo animation (true by default, set to false to disable)
        animateLogo: true
    },
    
    // Features displayed on Server Info tab
    features: [
        { icon: "shield-alt", label: "Custom Jobs" },
        { icon: "car", label: "Custom Vehicles" },
        { icon: "home", label: "Property System" },
        { icon: "briefcase", label: "Criminal Activities" }
    ],
    
    // STAFF MEMBERS CONFIGURATION - IMPORTANT FOR AVATAR IMAGES
    staff: [
        { 
            name: "Jenson", 
            role: "Server Owner", 
            roleType: "admin", 
            avatar: "img/avatars/admin1.png", 
            status: "online", 
            badges: ["founder"] 
        },
        { 
            name: "Haley", 
            role: "Server Owner", 
            roleType: "admin", 
            avatar: "img/avatars/admin2.png", 
            status: "offline", 
            badges: ["founder"] 
        },
        { 
            name: "Caleb Wolf", 
            role: "Lead Developer", 
            roleType: "developer", 
            avatar: "img/avatars/admin3.png", 
            status: "away", 
            badges: ["dev"] 
        },
        { 
            name: "Agent", 
            role: "management", 
            roleType: "admin", 
            avatar: "img/avatars/admin4.png", 
            status: "online", 
            badges: ["events", "support"] 
        }
    ],
    
    // TOP DONORS CONFIGURATION - IMPORTANT FOR AVATAR IMAGES (Only the SuperFan working for now)
    donors: {
        diamond: [
            { name: "SuperFan", amount: 500, avatar: "img/avatars/donor1.png", badge: "trophy" },
            { name: "GameLover", amount: 350, avatar: "img/avatars/donor2.png" }
        ],
        gold: [
            { name: "RPFanatic", amount: 200, avatar: "img/avatars/donor3.png" },
            { name: "ServerBooster", amount: 150, avatar: "img/avatars/donor4.png" }
        ],
        donationLink: "https://discord.gg/STRP-Loading" // Link to your donation page
    },
    
    // Social media links (leave empty to hide)
    socialMedia: {
        discord: "https://discord.gg/M8tp5aT9Da",
        tiktok: "https://www.tiktok.com/@theofficialpsa?lang=en",
        youtube: "https://www.youtube.com/@ProjectSanAndreas",
        instagram: ""
    },
    
    // Audio settings
    audio: {
        enabled: true,
        volume: 0.2,                     // Volume level (0-1)
        trackName: "Adam Port, Stryv - Move",  // Display name for the track
        file: "music/background.mp3"     // Path to audio file
    },
    
    // Tips rotation - shown at the bottom of the screen
    tips: [
        'Press F1 to open the help menu when in-game.',
        'Join our Discord server to stay updated with the latest news.',
        'Use /report to report any issues or players breaking rules.',
        'Respect other players and follow server rules for a better experience.',
        'Check out our website for more information about upcoming events.',
        'Press T to open the chat and use / for commands.',
        'You can press I to access your inventory.',
        'Press F3 to open your phone.',
        'Press F2 to access the interaction menu.',
        'Press M to open the map.',
        'Try the Speed Clicker mini-game while waiting!',
        'Click on the Staff tab to meet our team.',
        'Support us to get exclusive perks and help the server grow!'
    ],
    
    // Advanced settings - only change if you know what you're doing
    advanced: {
        debugMode: false,                // Show debug info in console
        loadingStages: [                // Loading progress stages
            { percentage: 10, message: 'Establishing connection...' },
            { percentage: 20, message: 'Loading world...' },
            { percentage: 35, message: 'Loading game assets...' },
            { percentage: 50, message: 'Loading vehicles...' },
            { percentage: 65, message: 'Syncing player data...' },
            { percentage: 80, message: 'Preparing roleplay elements...' },
            { percentage: 90, message: 'Finalizing setup...' },
            { percentage: 100, message: 'Welcome to the server!' }
        ]
    }
};