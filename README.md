# ReYohoho Grayjay Plugin

🎬 Grayjay plugin for ReYohoho - Russian movie and series streaming aggregator

## About

This plugin integrates ReYohoho with the Grayjay app, allowing you to access Russian movies and series from multiple streaming sources including KinoPoisk and Shikimori.

### Features

- 🔍 Search movies and series by title
- 🎭 Support for KinoPoisk and Shikimori content
- 🌐 Multiple video player support (Alloha, Collaps, HDVB, Lumex, Rezka, Turbo, Vibix, VideoCDN)
- 🎯 ID conversion (IMDB ↔ KinoPoisk ↔ Shikimori)
- 📊 Top content and trending movies
- 💬 Comments support
- ⭐ Rating system integration

## Installation

### Method 1: QR Code (Recommended)

1. Visit the [installation page](https://vonkleistl.github.io/grayjay-reyohoho/install.html)
2. Open Grayjay app on your phone
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

Click this link on your mobile device with Grayjay installed:

[📱 Install ReYohoho Plugin](grayjay://plugin?url=vonkleistl.github.io/grayjay-reyohoho/ReyohohoConfig.json)

## Configuration

The plugin supports custom API endpoint configuration:

1. Go to Grayjay → **Settings** → **Sources** → **ReYohoho**
2. Modify the **API Endpoint** setting if needed
3. Default: `https://api.reyohoho.app`

## API Integration

This plugin uses the ReYohoho API with the following endpoints:

- Search movies/series
- Get movie information from KinoPoisk
- Get anime information from Shikimori
- Fetch available video players
- Convert between IMDB/KinoPoisk/Shikimori IDs
- Retrieve top content and trending items
- Access comments and ratings

## Development

### Files Structure

```
grayjay-reyohoho/
├── ReyohohoConfig.json    # Plugin configuration
├── ReyohohoScript.js      # Main plugin script
├── install.html           # Installation webpage with QR code
└── README.md              # This file
```

### Building from Source

1. Clone the repository:
   ```bash
   git clone https://github.com/VonKleistL/grayjay-reyohoho.git
   ```

2. Modify the plugin files as needed

3. Test using Grayjay's developer mode:
   - Grayjay → Settings → Developer Settings → Start Server
   - Load your local plugin files

### API Documentation

For detailed API documentation, see [ReYohoho API Docs](https://reyohoho.github.io/reyohoho/)

## Troubleshooting

### Plugin Not Loading

- Verify you're using the correct URL
- Check your internet connection
- Ensure Grayjay is updated to the latest version

### No Content Showing

- Check if the ReYohoho API is accessible
- Verify your API endpoint in plugin settings
- Try refreshing the source

### Video Playback Issues

- Some content may be geo-restricted
- Try different video players available in ReYohoho
- Check your network connection

## Credits

- **Plugin Author**: Luke
- **ReYohoho Platform**: [reyohoho.github.io](https://reyohoho.github.io/reyohoho/)
- **Grayjay**: [FUTO](https://grayjay.app)

## License

This plugin is provided as-is for use with the Grayjay application.

## Support

For issues and feature requests, please visit:
- [GitHub Issues](https://github.com/VonKleistL/grayjay-reyohoho/issues)
- [ReYohoho Platform](https://reyohoho.github.io/reyohoho/)

---

**Note**: This plugin requires an active internet connection and access to the ReYohoho API. Content availability depends on the ReYohoho service.
