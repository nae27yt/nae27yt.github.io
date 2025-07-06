# Discord Bot Dashboard - Static Website

This is a standalone static website version of your Discord bot dashboard that can be hosted anywhere (GitHub Pages, Netlify, Vercel, etc.) and connects to your Discord bot's API endpoints.

## Features

- **Real-time Dashboard**: Live statistics, server info, and command usage
- **WebSocket Support**: Real-time updates when connected
- **Mobile Responsive**: Works perfectly on desktop and mobile devices
- **Easy Configuration**: Simply enter your bot's URL to connect
- **Local Storage**: Saves your bot URL for future visits
- **Modern UI**: Clean, Discord-themed interface with animations

## Files

- `index.html` - Main dashboard page
- `style.css` - Custom styling and animations
- `dashboard.js` - JavaScript functionality and API connections
- `README.md` - This documentation

## Setup Instructions

### Method 1: GitHub Pages (Free)

1. Create a new GitHub repository
2. Upload all files from the `static_site` folder
3. Go to repository Settings → Pages
4. Set source to "Deploy from a branch" → main
5. Your dashboard will be available at `https://yourusername.github.io/repository-name`

### Method 2: Netlify (Free)

1. Sign up at https://netlify.com
2. Drag and drop the `static_site` folder to Netlify
3. Your dashboard will be deployed instantly

### Method 3: Vercel (Free)

1. Sign up at https://vercel.com
2. Connect your GitHub repository or upload the folder
3. Deploy with one click

### Method 4: Local Hosting

Open `index.html` in any modern web browser - it will work offline except for the bot connection features.

## How to Use

1. **Open the Dashboard**: Navigate to your hosted website
2. **Enter Bot URL**: Input your Discord bot's web dashboard URL
   - Example: `https://your-replit-url.replit.dev`
   - This is the same URL where your bot's web dashboard is running
3. **Click Connect**: The dashboard will connect to your bot
4. **Save Configuration**: Click "Save Config" to remember the URL

## Bot URL Examples

- Replit: `https://your-repl-name.your-username.replit.dev`
- Railway: `https://your-app.up.railway.app`
- Heroku: `https://your-app.herokuapp.com`
- Custom Domain: `https://bot.yourdomain.com`

## Features Overview

### Dashboard Sections

- **Statistics Cards**: Server count, users, commands, latency
- **Server List**: Connected Discord servers with member counts
- **Command Usage**: Available commands and usage statistics
- **Database Status**: PostgreSQL connection and metrics
- **Activity Log**: Real-time activity and events

### Real-time Updates

- Statistics refresh every 30 seconds
- WebSocket connection for instant updates
- Automatic reconnection on connection loss
- Visual indicators for connection status

### Mobile Support

- Fully responsive design
- Touch-friendly interface
- Optimized for small screens
- Bootstrap-based layout

## Customization

### Changing Colors

Edit the CSS variables in `style.css`:

```css
:root {
    --discord-purple: #5865f2;
    --discord-dark: #2c2f33;
    --success-green: #57f287;
    --warning-yellow: #fee75c;
    --error-red: #ed4245;
}
```

### Adding New Features

The JavaScript is modular - you can easily add new API endpoints by:

1. Adding a new `load` function in `dashboard.js`
2. Creating the corresponding HTML section in `index.html`
3. Adding styles in `style.css`

### CORS Configuration

Your Discord bot already includes CORS headers, so the static site can connect from any domain. If you encounter CORS issues:

1. Check that your bot's CORS settings allow your domain
2. Ensure your bot is accessible from the internet
3. Verify the bot URL is correct and includes `http://` or `https://`

## Security

- No sensitive data is stored in the static site
- All authentication happens through your bot's API
- Bot credentials remain secure on your server
- Local storage only saves the bot URL (no tokens)

## Troubleshooting

### Connection Issues

- **"Failed to connect"**: Check if your bot URL is correct and accessible
- **"CORS error"**: Ensure your bot allows cross-origin requests
- **"WebSocket failed"**: Some hosting providers don't support WebSockets

### Data Not Loading

- Check browser console for error messages
- Verify your bot's API endpoints are working
- Test the bot URL directly in browser

### Mobile Issues

- Clear browser cache
- Check if JavaScript is enabled
- Try refreshing the page

## Development

To modify this dashboard:

1. Edit the HTML structure in `index.html`
2. Update styles in `style.css`
3. Modify functionality in `dashboard.js`
4. Test locally by opening `index.html` in a browser

The dashboard uses vanilla JavaScript and Bootstrap 5 - no build process required.

## API Endpoints Used

The dashboard connects to these bot endpoints:

- `GET /api/stats` - Bot statistics
- `GET /api/guilds` - Server information
- `GET /api/commands` - Command usage data
- `GET /api/database-status` - Database metrics
- `WebSocket /ws` - Real-time updates

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

This dashboard is part of your Discord bot project and follows the same license terms.