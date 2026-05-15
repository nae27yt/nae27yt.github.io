var staff_team = [

	{
		"name":"Haley",
		"image":"https://cdn.discordapp.com/avatars/777405095909654578/1e211c59b0003e6240cfd0e29b5c98a1.webp?size=1024",
		"rank":"CO | Commanding Owner/Founder"
	},
	        	{
		"name":"James",
		"image":"https://cdn.discordapp.com/avatars/933782110181945354/a6f395a138a2039da1cfd1f6abc2c6ac.webp?size=1024",
		"rank":"XO | Executive Officer/Founder"
	},
	{
		"name":"Skully",
		"image":"https://cdn.discordapp.com/avatars/420001674950869015/1666c12347057ddf89a8acd0e32bb9b3.webp?size=1024",
		"rank":"EDSS | Executive Director of Server Systems"
	},
    	{
		"name":"Agent",
		"image":"https://cdn.discordapp.com/avatars/1091972434506305586/d7b88f163b5ea77a8eb96941a343c76a.webp?size=1024",
		"rank":"EDA | Executive Director Of Administration"
	},
        	{
		"name":"Caleb",
		"image":"https://cdn.discordapp.com/avatars/168174817088897025/6a87b23441e27c4fcd90b8c225aa6eae.webp?size=1024",
		"rank":"CDO | Chief Development Officer"
	},

    //         	{
	// 	"name":"",
	// 	"image":"Discord Avatar URL",
	// 	"rank":""
	// },

]

const tipsConfig = [
    {
        title: "Tip 1 (short)",
        text: "Always wear your seatbelt when driving in Los Santos.",
        img: "https://placehold.co/314x176/EEE/31343C",
        timeout: 10 // seconds
    },
    {
        title: "Tip 2 (long)",
        text: "Explore different jobs on the server, like taxi driving, delivery missions, or even criminal activities. Each job has its own rewards and risks. Remember to manage your time wisely, avoid unnecessary conflicts, and cooperate with other players to maximize your gains and enjoy the roleplay experience to the fullest. Take advantage of special events and seasonal activities to earn unique rewards. Always keep an eye on the map for dynamic missions and spontaneous opportunities, and make sure your character is properly equipped for any challenge that comes your way. Building relationships with other players can also unlock new roles and adventures, making every session unpredictable and exciting.",
        img: "https://placehold.co/314x176/EEE/31343C",
        timeout: 10 // seconds
    },
    {
        title: "Tip 3 (empty-image)",
        text: "Keep backup gear: weapons, vehicles, and medical kits are essential for surviving unexpected situations.",
        img: "",
        timeout: 10 // seconds
    },
    {
        title: "Tip 4 (no image)",
        text: "Read the server rules carefully and respect roleplay guidelines. Following the rules ensures a better experience for everyone.",
        timeout: 10 // seconds
    },
    {
        title: "Tip 5 (local-image)",
        text: "Keep backup gear: weapons, vehicles, and medical kits are essential for surviving unexpected situations.",
        img: "/tips/tip1.jpg",
        timeout: 10 // seconds
    },
];



// Staff Settings
const showStaffTeam = true
const showTipList = true


// orange
// red
// blue
// green
// pink
// purple
const theme = "purple"

// ==== WINTER UPDATE !! ==== \\
const enableWinterUpdate = true
// ==== WINTER UPDATE !! ==== \\


// Text settings
const name = "<strong>Sovereign</strong>Trace"
const underName = "ROLE<b>PLAY</b>"
const desc = "FiveM Roleplay server featuring an extensive collection of custom scripts, maps, vehicles, unique weapons, and much more."


// Social media
const discord = "https://discord.gg/CHFppWUHym"  // If = "" then icon will not show up on screen
const instagram = ""	// https://example.com
const youtube = "https://www.youtube.com/@SovereignTraceRoleplay" 		// https://example.com
const twitter = "" 		// https://example.com
const tiktok = "https://www.tiktok.com/@sovereigntraceroleplay"  		// https://example.com
const facebook = ""		// https://example.com
const twitch = "" 		// https://example.com
const github = "" 		// https://example.com


// Video Settings
const videoBlur = 0
var videoOpacity = 0.5


// Example link: https://www.youtube.com/watch?v=abcdefgh
const youtubeVideo = "https://www.youtube.com/watch?v=Zc31jb58xvE"
const showYoutubeVideo = true

// Local Video
const enableLocalVideo = false

// Local audio
const localAudio = true



// HELP //

//-- YOUTBE
//-- LOCAL AUDIO
// if localAudio is true, then loading will load "audio.mp3" file and play it except youtube audio.
// if localAudio is false, then loading will load youtube audio.

//-- LOCAL VIDEO
// if enableLocalVideo is true, then loading will load "video.webm" file and play it except youtube video.
// If localVideo is enabled, showYoutubeVideo is automatically disabled.
// You can only import a video from either YouTube or local. Local video taking priority.