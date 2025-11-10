# ReYohoho Grayjay Plugin

🎬 Grayjay plugin for ReYohoho - Russian movie and series streaming aggregator

## 📋 Status

✅ **Production Ready** | Version 5 | Full Package Support

- ✅ **Http Package** - API requests and data fetching
- ✅ **DOMParser Package** - HTML parsing capabilities  
- ✅ **Utilities Package** - Hashing and encoding utilities
- ✅ **Pagers** - Infinite scrolling for content and comments
- ✅ **Script Signing** - Optional for production deployment

📖 **[Read Complete Setup Guide →](SETUP_GUIDE.md)**

## About

This plugin integrates ReYohoho with the Grayjay Desktop app, allowing you to access Russian movies and series from multiple streaming sources including KinoPoisk and Shikimori.

### Features

- 🔍 Search movies and series by title
- 📜 Infinite scrolling with pagination
- 🎭 Support for KinoPoisk and Shikimori content
- 🌐 Multiple video player support (Alloha, Collaps, HDVB, Lumex, Rezka, Turbo, Vibix, VideoCDN)
- 🎯 ID conversion (IMDB ↔ KinoPoisk ↔ Shikimori)
- 📊 Top content and trending movies
- 💬 Comments with pagination support
- ⭐ Rating system integration
- 🔧 Configurable API endpoint

## Installation

### Method 1: QR Code (Recommended)

1. Visit the [installation page](https://vonkleistl.github.io/grayjay-reyohoho/install.html)
2. Open Grayjay app on your device
3. Go to **Sources** tab
4. Tap **Add Source** → **Scan QR Code**
5. Scan the QR code displayed on the page

### Method 2: Direct URL

1. Open Grayjay app
2. Go to **Sources** tab  
3. Tap **Add Source**
4. Enter this URL:
   ```
   https://vonkleistl.github.io/grayjay-reyohoho/ReyohohoConfig.json
   ```

### Method 3: Deep Link

Click this link on your device with Grayjay installed:

[📱 Install ReYohoho Plugin](grayjay://plugin?url=vonkleistl.github.io/grayjay-reyohoho/ReyohohoConfig.json)

## Configuration

The plugin supports custom API endpoint configuration:

1. Go to Grayjay → **Settings** → **Sources** → **ReYohoho**
2. Modify the **API Endpoint** setting if needed
3. Default: `https://api.reyohoho.app`

**Fallback APIs** (automatic):
- `https://api.reyohoho.space`
- `https://reyohoho-api.vercel.app`

## Development

### 📚 Documentation

- **[Complete Setup Guide](SETUP_GUIDE.md)** - Detailed implementation guide
- **[Grayjay Plugin Docs](https://gitlab.futo.org/videostreaming/grayjay/-/blob/master/plugin-development.md)** - Official documentation
- **[ReYohoho API](https://reyohoho.github.io/reyohoho/)** - API documentation

### Files Structure

```
grayjay-reyohoho/
├── ReyohohoConfig.json    # Plugin configuration (v5)
├── ReyohohoScript.js      # Main plugin script with pagers
├── sign-script.sh         # Script signing tool
├── install.html           # Installation webpage with QR code
├── SETUP_GUIDE.md         # Complete implementation guide
└── README.md              # This file
```

### Package Implementation

#### **Http Package**
```javascript
// GET request
const response = http.GET(url, headers, useAuth);

// POST request  
const response = http.POST(url, body, headers, useAuth);
```

#### **DOMParser Package**
```javascript
// Parse HTML
const doc = domParser.parseFromString(html);
const elements = doc.querySelectorAll("selector");
```

#### **Utilities Package**
```javascript
// Generate UUID
const id = utility.randomUUID();

// Hash string
const hash = utility.md5String("text");
```

### Pager Implementation

The plugin implements custom pagers for pagination:

- **ReyohohoContentPager** - For video content (30 items/page)
- **ReyohohoCommentPager** - For comments (20 items/page)

Both support infinite scrolling with automatic loading.

### Building from Source

1. Clone the repository:
   ```bash
   git clone https://github.com/VonKleistL/grayjay-reyohoho.git
   cd grayjay-reyohoho
   ```

2. Modify plugin files as needed

3. Test using Grayjay's developer mode:
   - Grayjay → Settings → Developer Settings → Start Server
   - Open `http://YOUR_IP:11337/dev`
   - Load your local plugin files

### Script Signing (Production)

For production deployment with signed scripts:

```bash
# Make script executable
chmod +x sign-script.sh

# Generate signature
./sign-script.sh ReyohohoScript.js

# Copy output to ReyohohoConfig.json
```

**See [SETUP_GUIDE.md](SETUP_GUIDE.md#-script-signing-for-production) for detailed instructions.**

## API Integration

This plugin uses the ReYohoho API with the following endpoints:

- `/search/{query}` - Search movies/series
- `/kp_info2/{kpId}` - Get KinoPoisk movie information
- `/cache` - Fetch available video players
- `/top/all` - Get top content
- `/comments/{kpId}` - Retrieve comments

## Troubleshooting

### Plugin Not Loading

- Verify you're using the correct URL
- Check your internet connection
- Ensure Grayjay is updated to the latest version
- Check Grayjay logs for errors

### No Content Showing

- Check if the ReYohoho API is accessible
- Verify your API endpoint in plugin settings
- Try refreshing the source
- Check browser console for API errors

### Pagination Not Working

- Ensure you're scrolling to the bottom of the feed
- Check network tab for API requests
- Verify `hasMore` flag in pager responses

### Video Playback Issues

- Some content may be geo-restricted
- Try different video players available in ReYohoho
- Check your network connection
- Verify player URLs are accessible

## Credits

- **Plugin Author**: Luke ([VonKleistL](https://github.com/VonKleistL))
- **ReYohoho Platform**: [reyohoho.github.io](https://reyohoho.github.io/reyohoho/)
- **Grayjay**: [FUTO](https://grayjay.app)

## License

This plugin is provided as-is for use with the Grayjay application.

## Support

For issues and feature requests:
- 📖 [Setup Guide](SETUP_GUIDE.md) - Complete documentation
- 🐛 [GitHub Issues](https://github.com/VonKleistL/grayjay-reyohoho/issues)
- 🌐 [ReYohoho Platform](https://reyohoho.github.io/reyohoho/)

## Quick Links

- **Live Plugin**: [vonkleistl.github.io/grayjay-reyohoho/ReyohohoConfig.json](https://vonkleistl.github.io/grayjay-reyohoho/ReyohohoConfig.json)
- **Install Page**: [vonkleistl.github.io/grayjay-reyohoho/install.html](https://vonkleistl.github.io/grayjay-reyohoho/install.html)
- **Setup Guide**: [SETUP_GUIDE.md](SETUP_GUIDE.md)
- **Repository**: [github.com/VonKleistL/grayjay-reyohoho](https://github.com/VonKleistL/grayjay-reyohoho)

---

**Current Version:** 5  
**Last Updated:** November 10, 2025  
**Status:** ✅ Production Ready

**Note**: This plugin requires an active internet connection and access to the ReYohoho API. Content availability depends on the ReYohoho service.
