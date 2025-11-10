# ReYohoho Grayjay Plugin

🎬 Grayjay plugin for ReYohoho - Russian movie and series streaming aggregator

## 📋 Status

✅ **WORKING DEMO VERSION** | Version 6 | Full Package Support

- ✅ **Http Package** - Network requests
- ✅ **DOMParser Package** - HTML parsing capabilities  
- ✅ **Utilities Package** - Hashing and encoding utilities
- ✅ **Pagers** - Infinite scrolling for content and comments
- ✅ **Mock Data** - Classic Russian movies for testing

**⚠️ Demo Mode:** This plugin currently uses sample data featuring classic Soviet/Russian films to demonstrate all Grayjay plugin features. Perfect for testing and development!

## About

This is a **working demonstration plugin** that showcases:
- Full Grayjay plugin architecture
- All three package implementations (Http, DOMParser, Utilities)
- Proper pagination with custom pagers
- Content browsing, search, details, and comments
- Demo video sources for testing playback

### Features

- 🎭 Classic Russian/Soviet movies (mock data)
- 🔍 Search functionality with filtering
- 📜 Infinite scrolling with pagination
- 💬 Comments system
- ⭐ Rating system
- 📺 Demo video sources (HLS streams)
- 🎨 Real movie posters from KinoPoisk
- 🔧 All Grayjay packages demonstrated

### Sample Movies Included

- Операция 'Ы' и другие приключения Шурика (1965)
- Бриллиантовая рука (1968)
- Иван Васильевич меняет профессию (1973)
- Москва слезам не верит (1980)
- Офицеры (1971)
- Белое солнце пустыни (1970)
- Ирония судьбы, или С лёгким паром! (1975)
- Джентльмены удачи (1971)

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

## Testing & Development

### What You Can Test:

✅ **Home Feed**
- Browse 8 classic Russian movies
- Scroll to load more (pagination demo)
- Real movie posters and metadata

✅ **Search**
- Search by movie title
- Results filtered from mock data
- Pagination support

✅ **Content Details**
- Click any movie for full details
- See ratings, year, description
- View available video sources

✅ **Video Sources**
- 2 demo HLS streams provided
- Test video playback functionality

✅ **Comments**
- View mock comments in Russian
- Comments include ratings and timestamps
- Demonstrates comment system

### Package Demonstrations:

**Http Package:**
- Used throughout for data operations
- Demonstrates GET/POST patterns
- Response handling examples

**DOMParser Package:**
- Helper functions included
- Shows HTML parsing capabilities
- Ready for real scraping implementation

**Utilities Package:**
- UUID generation demo
- MD5 hashing examples
- Base64 encoding patterns

## Development

### 📚 Documentation

- **[Quick Start Guide](QUICK_START.md)** - Get started quickly
- **[Complete Setup Guide](SETUP_GUIDE.md)** - Detailed implementation guide
- **[Grayjay Plugin Docs](https://gitlab.futo.org/videostreaming/grayjay/-/blob/master/plugin-development.md)** - Official documentation

### Files Structure

```
grayjay-reyohoho/
├── ReyohohoConfig.json    # Plugin configuration (v6)
├── ReyohohoScript.js      # Main plugin script with mock data
├── sign-script.sh         # Script signing tool
├── install.html           # Installation webpage with QR code
├── SETUP_GUIDE.md         # Complete implementation guide
├── QUICK_START.md         # Quick reference
└── README.md              # This file
```

### Converting to Production

To convert this demo to a production plugin:

1. **Replace Mock Data Functions:**
   - `getMockMovies()` → Real API calls or HTML scraping
   - `getMockComments()` → Real comment fetching

2. **Update API Endpoints:**
   - Add real backend URLs to config
   - Implement actual HTTP requests

3. **Add HTML Scraping (if needed):**
   - Use DOMParser to parse real HTML pages
   - Extract movie data from actual sites

4. **Sign Script:**
   ```bash
   chmod +x sign-script.sh
   ./sign-script.sh ReyohohoScript.js
   ```

5. **Update Version:**
   - Increment version in config
   - Update documentation

## Troubleshooting

### Plugin Loads Successfully! ✅

This version fixes the previous DNS resolution error by:
- Removing non-existent `api.reyohoho.app` endpoint
- Using mock data instead of external API calls
- Providing working demo video sources

### If You See No Content:

- Check Grayjay logs for errors
- Ensure plugin is enabled in Sources
- Try refreshing the feed

### Video Playback Issues:

- Demo streams use public HLS sources
- Check internet connection
- Try different video sources

## Demo Video Sources

The plugin includes two working HLS streams:
1. **Tears of Steel** - Open source demo film
2. **Mux Test Stream** - Standard HLS test stream

These allow you to test video playback without needing real content sources.

## Credits

- **Plugin Author**: Luke ([VonKleistL](https://github.com/VonKleistL))
- **Inspired by**: [ReYohoho Platform](https://reyohoho-vue.vercel.app)
- **Built for**: [Grayjay by FUTO](https://grayjay.app)
- **Demo Movies**: Classic Soviet/Russian cinema

## License

This demo plugin is provided as-is for educational and development purposes.

## Support

For questions or issues:
- 📖 [Quick Start Guide](QUICK_START.md)
- 📚 [Setup Guide](SETUP_GUIDE.md)
- 🐛 [GitHub Issues](https://github.com/VonKleistL/grayjay-reyohoho/issues)

## Quick Links

- **Live Plugin**: [vonkleistl.github.io/grayjay-reyohoho/ReyohohoConfig.json](https://vonkleistl.github.io/grayjay-reyohoho/ReyohohoConfig.json)
- **Install Page**: [vonkleistl.github.io/grayjay-reyohoho/install.html](https://vonkleistl.github.io/grayjay-reyohoho/install.html)
- **Repository**: [github.com/VonKleistL/grayjay-reyohoho](https://github.com/VonKleistL/grayjay-reyohoho)

---

**Current Version:** 6 (Demo Mode)  
**Last Updated:** November 10, 2025  
**Status:** ✅ Working Demo with Mock Data

**Note**: This is a demonstration plugin using sample data. Perfect for testing Grayjay plugin development or as a template for building your own plugin!
