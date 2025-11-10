# ReYohoho Grayjay Plugin - Complete Setup Guide

## 📋 Overview

This plugin integrates ReYohoho (Russian movie and series streaming aggregator) with Grayjay Desktop app on macOS.

**Current Status:** ✅ **PRODUCTION READY**

## ✅ What's Implemented

### **1. Configuration File** (`ReyohohoConfig.json`)
- ✅ All required fields configured
- ✅ Three packages enabled: `Http`, `DOMParser`, `Utilities`
- ✅ Proper URL allowlist
- ✅ Custom settings for API endpoint
- ✅ Version management (current: v5)

### **2. Plugin Script** (`ReyohohoScript.js`)
- ✅ **Http Package**: Full HTTP client implementation
- ✅ **DOMParser Package**: HTML parsing functions
- ✅ **Utilities Package**: UUID generation, MD5 hashing
- ✅ **Pagers**: Proper pagination for content and comments
- ✅ All core plugin functions implemented

### **3. Features**
- ✅ Browse/Home feed with pagination
- ✅ Search with pagination support
- ✅ Content details retrieval
- ✅ Video source extraction (multiple players)
- ✅ Comments with pagination
- ✅ KinoPoisk ID extraction
- ✅ State persistence

---

## 🔧 Package Implementation Details

### **1. Http Package** ✅

**What it does:** Makes HTTP requests to the ReYohoho API

**Implementation in script:**
```javascript
// GET request
response = http.GET(url, headers, useAuth);

// POST request  
response = http.POST(url, body, headers, useAuth);

// Generic request
response = http.request(method, url, headers, useAuth);
```

**Features Used:**
- ✅ GET requests for content fetching
- ✅ POST requests for video source retrieval
- ✅ Header management
- ✅ Response handling (code, body, isOk)

### **2. DOMParser Package** ✅

**What it does:** Parses HTML content and extracts elements

**Implementation in script:**
```javascript
// Parse HTML string
const doc = domParser.parseFromString(html);

// Extract elements by class
const elements = doc.getElementsByClassName(className);

// Query selectors
const element = doc.querySelector(selector);
const elements = doc.querySelectorAll(selector);
```

**Available Methods:**
- `parseFromString(html)` - Parse HTML
- `getElementById(id)` - Get element by ID
- `getElementsByClassName(className)` - Get elements by class
- `getElementsByTagName(tagName)` - Get elements by tag
- `querySelector(selector)` - CSS selector (single)
- `querySelectorAll(selector)` - CSS selector (multiple)
- `getAttribute(key)` - Get attribute value
- `innerHTML()` - Get inner HTML
- `textContent()` - Get text content

### **3. Utilities Package** ✅

**What it does:** Provides utility functions for encoding and hashing

**Implementation in script:**
```javascript
// Generate UUID
const id = utility.randomUUID();

// MD5 hash string
const hash = utility.md5String("some text");

// Base64 encode/decode
const encoded = utility.toBase64(byteArray);
const decoded = utility.fromBase64(base64String);
```

**Available Methods:**
- `randomUUID()` - Generate random UUID
- `md5(byteArray)` - MD5 hash of bytes
- `md5String(string)` - MD5 hash of string (hex)
- `sha256(byteArray)` - SHA256 hash of bytes
- `sha256String(string)` - SHA256 hash of string (hex)
- `toBase64(byteArray)` - Encode to Base64
- `fromBase64(string)` - Decode from Base64

---

## 📄 Pagers Implementation

### **What are Pagers?**
Pagers are objects that handle paginated content in Grayjay. They allow infinite scrolling by loading more content when the user reaches the end.

### **Types Implemented:**

#### **1. ReyohohoContentPager** (for videos)
```javascript
class ReyohohoContentPager extends ContentPager {
    constructor(initialResults, endpoint, params) {
        super(initialResults, initialResults.length >= 30);
        this.endpoint = endpoint;
        this.currentPage = 1;
        this.itemsPerPage = 30;
    }
    
    nextPage() {
        // Load next page of content
        // Set this.results with new items
        // Set this.hasMore = true/false
    }
}
```

#### **2. ReyohohoCommentPager** (for comments)
```javascript
class ReyohohoCommentPager extends CommentPager {
    constructor(initialComments, kpId, url) {
        super(initialComments, initialComments.length >= 20, {});
        this.itemsPerPage = 20;
    }
    
    nextPage() {
        // Load next page of comments
    }
}
```

**Key Points:**
- Initial results passed to constructor
- `hasMore` indicates if more pages exist
- `nextPage()` method loads additional content
- Results automatically appended to feed

---

## 🔐 Script Signing (For Production)

### **What is Script Signing?**
Script signing ensures that plugin updates come from the original developer. It prevents plugin hijacking.

### **When to Use:**
- ⚠️ **Development**: Not required (leave `scriptSignature` and `scriptPublicKey` empty)
- ✅ **Production**: Required for public distribution

### **Step-by-Step Instructions:**

#### **Step 1: Generate SSH Keys** (if you don't have them)
```bash
cd ~
ssh-keygen -t rsa -b 4096
# Press Enter to use default location (~/.ssh/id_rsa)
# Set a passphrase (optional but recommended)
```

#### **Step 2: Make Signing Script Executable**
```bash
cd /path/to/grayjay-reyohoho
chmod +x sign-script.sh
```

#### **Step 3: Sign Your Script**
```bash
./sign-script.sh ReyohohoScript.js
```

This will output:
```
PUBLIC KEY (scriptPublicKey):
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...

SIGNATURE (scriptSignature):
ABCDEF123456789...
```

#### **Step 4: Update Configuration**

Edit `ReyohohoConfig.json`:
```json
{
    "scriptSignature": "PASTE_SIGNATURE_HERE",
    "scriptPublicKey": "PASTE_PUBLIC_KEY_HERE"
}
```

#### **Step 5: Commit and Push**
```bash
git add ReyohohoConfig.json
git commit -m "Add script signature for production"
git push origin main
```

#### **Important Notes:**
- ⚠️ **Keep your private key (`~/.ssh/id_rsa`) secure!**
- ⚠️ **Never commit your private key to GitHub**
- ✅ You must re-sign the script **every time you modify `ReyohohoScript.js`**
- ✅ The public key stays the same, only the signature changes

---

## 🚀 Testing Your Plugin

### **Local Development Testing:**

1. **Open Grayjay Desktop app**
2. **Enable Developer Mode:**
   - Go to Settings
   - Tap the version number multiple times
   - Developer options will appear

3. **Start Dev Server:**
   - In Developer Settings, start the dev server
   - Note the IP address (e.g., `192.168.1.100:11337`)

4. **Open Dev Interface:**
   - Browser: `http://YOUR_IP:11337/dev`
   - Load your plugin using the config URL

5. **Test Functions:**
   - Use the Testing tab to call plugin functions
   - Check the Integration tab for errors

### **Production Testing:**

1. **Install via QR Code:**
   - Open: [https://vonkleistl.github.io/grayjay-reyohoho/install.html](https://vonkleistl.github.io/grayjay-reyohoho/install.html)
   - Scan QR code with Grayjay app

2. **Or Manual Install:**
   - Open Grayjay → Sources → Add Source
   - Enter URL: `vonkleistl.github.io/grayjay-reyohoho/ReyohohoConfig.json`

---

## 📊 API Endpoint Configuration

Users can customize the API endpoint through plugin settings:

**Default API URLs** (with automatic fallback):
1. `https://api.reyohoho.app` (primary)
2. `https://api.reyohoho.space` (fallback)
3. `https://reyohoho-api.vercel.app` (fallback)

**Changing API Endpoint:**
1. Open Grayjay → Sources → ReYohoho
2. Click Settings (gear icon)
3. Modify "API Endpoint" field
4. Save and restart plugin

---

## 🐛 Debugging

### **Enable Logging:**
The plugin includes extensive logging:
```javascript
log("Debug message here");
```

### **Common Issues:**

**1. "No results found"**
- Check API endpoint is accessible
- Verify API is returning valid JSON
- Check browser console for errors

**2. "Could not extract content ID"**
- Verify URL format matches expected patterns
- Check `extractKpId()` function logic

**3. "Pagination not working"**
- Ensure `hasMore` is set correctly in pager
- Verify `nextPage()` updates `this.results`
- Check API supports offset/limit parameters

---

## 📝 File Structure

```
grayjay-reyohoho/
├── ReyohohoConfig.json      # Plugin configuration
├── ReyohohoScript.js        # Plugin implementation
├── sign-script.sh           # Script signing tool
├── install.html             # User installation page
├── README.md               # Project documentation
├── SETUP_GUIDE.md          # This file
└── .github/
    └── workflows/          # GitHub Actions (optional)
```

---

## ✅ Checklist

### **Before Publishing:**
- [x] All packages declared in config
- [x] Pagers properly implemented
- [x] HTTP requests working
- [x] Error handling in place
- [ ] Script signed (production only)
- [x] Testing completed
- [x] Documentation updated

### **For Each Update:**
1. [ ] Increment version in `ReyohohoConfig.json`
2. [ ] Update script if needed
3. [ ] Re-sign script (if using signatures)
4. [ ] Test locally
5. [ ] Commit and push
6. [ ] Verify GitHub Pages updated
7. [ ] Test installation from live URL

---

## 🔗 Useful Links

- **Live Plugin Config:** [https://vonkleistl.github.io/grayjay-reyohoho/ReyohohoConfig.json](https://vonkleistl.github.io/grayjay-reyohoho/ReyohohoConfig.json)
- **Installation Page:** [https://vonkleistl.github.io/grayjay-reyohoho/install.html](https://vonkleistl.github.io/grayjay-reyohoho/install.html)
- **Repository:** [https://github.com/VonKleistL/grayjay-reyohoho](https://github.com/VonKleistL/grayjay-reyohoho)
- **Grayjay Docs:** [https://gitlab.futo.org/videostreaming/grayjay/-/blob/master/plugin-development.md](https://gitlab.futo.org/videostreaming/grayjay/-/blob/master/plugin-development.md)

---

## 📞 Support

For issues or questions:
1. Check this guide first
2. Review Grayjay plugin documentation
3. Open an issue on GitHub
4. Contact plugin author: [https://github.com/VonKleistL](https://github.com/VonKleistL)

---

## 📜 License

This plugin is open source. See repository for license details.

---

**Last Updated:** November 10, 2025  
**Plugin Version:** 5  
**Status:** Production Ready ✅
