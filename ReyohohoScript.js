// ReYohoho Grayjay Plugin - Complete Implementation
// Based on actual ReYohoho web app and desktop app architecture
// Implements Http, DOMParser, and Utilities packages

const PLATFORM = "ReYohoho";
const BASE_URL = "https://reyohoho-gitlab.vercel.app";
const DEFAULT_API_URLS = [
    "https://api.reyohoho.app",
    "https://api.reyohoho.space",
    "https://reyohoho-api.vercel.app"
];

var config = {};
var authToken = null;
var API_BASE = DEFAULT_API_URLS[0];

// ========== PLUGIN LIFECYCLE ==========

source.enable = function(conf, settings, savedState) {
    config = conf ?? {};
    
    // Restore saved state
    if (savedState && savedState.token) {
        authToken = savedState.token;
    }
    if (savedState && savedState.apiUrl) {
        API_BASE = savedState.apiUrl;
    }
    
    // Allow custom API from settings
    if (settings && settings.apiUrl && settings.apiUrl.trim() !== "") {
        API_BASE = settings.apiUrl.trim();
    }
    
    log("ReYohoho plugin enabled - API: " + API_BASE);
    log("Packages available: Http, DOMParser, Utilities");
};

source.saveState = function() {
    return {
        token: authToken,
        apiUrl: API_BASE,
        lastSync: Date.now()
    };
};

source.disable = function() {
    log("ReYohoho plugin disabled");
};

// ========== HTTP HELPER (Http Package) ==========

function makeRequest(endpoint, options = {}) {
    const url = API_BASE + endpoint;
    const method = options.method || "GET";
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    try {
        let response;
        
        if (method === "GET") {
            response = http.GET(url, headers, options.useAuth !== false);
        } else if (method === "POST") {
            const body = options.body ? JSON.stringify(options.body) : "";
            response = http.POST(url, body, headers, options.useAuth !== false);
        } else {
            response = http.request(method, url, headers, options.useAuth !== false);
        }
        
        if (!response || !response.isOk) {
            log("HTTP " + method + " " + endpoint + " failed: " + (response ? response.code : "no response"));
            return null;
        }
        
        if (!response.body || response.body.trim() === "") {
            return null;
        }
        
        return JSON.parse(response.body);
    } catch (e) {
        log("Request error (" + endpoint + "): " + e);
        return null;
    }
}

// ========== CONTENT PAGER IMPLEMENTATION ==========

class ReyohohoContentPager extends ContentPager {
    constructor(initialResults, endpoint, params) {
        super(initialResults, initialResults.length >= 30);
        this.endpoint = endpoint;
        this.params = params || {};
        this.currentPage = 1;
        this.itemsPerPage = 30;
    }
    
    nextPage() {
        try {
            this.currentPage++;
            const offset = this.currentPage * this.itemsPerPage;
            const queryParams = "?limit=" + this.itemsPerPage + "&offset=" + offset;
            
            const data = makeRequest(this.endpoint + queryParams);
            
            if (!data || !Array.isArray(data) || data.length === 0) {
                this.hasMore = false;
                this.results = [];
                return;
            }
            
            const videos = [];
            for (let i = 0; i < data.length; i++) {
                const video = createVideoFromItem(data[i]);
                if (video) videos.push(video);
            }
            
            this.results = videos;
            this.hasMore = videos.length >= this.itemsPerPage;
            
            log("Loaded page " + this.currentPage + ": " + videos.length + " items");
        } catch (e) {
            log("nextPage error: " + e);
            this.hasMore = false;
            this.results = [];
        }
    }
}

// ========== HOME / BROWSE ==========

source.getHome = function() {
    try {
        const data = makeRequest("/top/all?type=all&limit=30");
        
        if (!data || !Array.isArray(data)) {
            log("getHome: Invalid response");
            return new ContentPager([], false);
        }
        
        const videos = [];
        for (let i = 0; i < data.length; i++) {
            const video = createVideoFromItem(data[i]);
            if (video) videos.push(video);
        }
        
        log("getHome: Loaded " + videos.length + " videos");
        
        // Return pager that supports pagination
        return new ReyohohoContentPager(videos, "/top/all", { type: "all" });
    } catch (e) {
        log("getHome error: " + e);
        return new ContentPager([], false);
    }
};

// ========== SEARCH ==========

source.searchSuggestions = function(query) {
    return [];
};

source.search = function(query, type, order, filters) {
    try {
        if (!query || query.trim() === "") {
            return new ContentPager([], false);
        }
        
        const data = makeRequest("/search/" + encodeURIComponent(query.trim()) + "?limit=30");
        
        if (!data || !Array.isArray(data)) {
            log("search: No results for '" + query + "'");
            return new ContentPager([], false);
        }
        
        const videos = [];
        for (let i = 0; i < data.length; i++) {
            const video = createVideoFromItem(data[i]);
            if (video) videos.push(video);
        }
        
        log("search: Found " + videos.length + " results");
        
        // Search results with pagination support
        return new ReyohohoContentPager(videos, "/search/" + encodeURIComponent(query.trim()), {});
    } catch (e) {
        log("search error: " + e);
        return new ContentPager([], false);
    }
};

source.searchChannels = function(query) {
    return new ChannelPager([], false);
};

source.getSearchCapabilities = function() {
    return {
        types: [Type.Feed.Videos],
        sorts: [Type.Order.Chronological],
        filters: []
    };
};

// ========== CONTENT DETAILS ==========

source.isContentDetailsUrl = function(url) {
    if (!url) return false;
    return url.indexOf("reyohoho") !== -1 || 
           url.indexOf("kinopoisk") !== -1 || 
           url.indexOf("shikimori") !== -1;
};

source.getContentDetails = function(url) {
    try {
        const kpId = extractKpId(url);
        if (!kpId) {
            throw new ScriptException("Could not extract content ID from URL");
        }
        
        const data = makeRequest("/kp_info2/" + kpId);
        
        if (!data) {
            throw new ScriptException("Failed to get content details");
        }
        
        const title = data.name || data.title || "Unknown Title";
        const poster = data.poster || data.thumbnail || "";
        const description = data.description || "";
        const year = data.year || 0;
        
        return new PlatformVideoDetails({
            id: new PlatformID(PLATFORM, kpId.toString(), config.id),
            name: title,
            thumbnails: new Thumbnails([new Thumbnail(poster, 0)]),
            author: new PlatformAuthorLink(
                new PlatformID(PLATFORM, "reyohoho", config.id),
                "ReYohoho",
                BASE_URL,
                "",
                0
            ),
            uploadDate: year ? Math.floor(new Date(year, 0, 1).getTime() / 1000) : 0,
            duration: data.duration || 0,
            viewCount: 0,
            url: url,
            isLive: false,
            description: description,
            video: new VideoSourceDescriptor([]),
            live: null,
            rating: new RatingLikes(data.rating || 0),
            subtitles: []
        });
    } catch (e) {
        log("getContentDetails error: " + e);
        throw e;
    }
};

// ========== VIDEO SOURCES ==========

source.getVideoSources = function(url) {
    try {
        const kpId = extractKpId(url);
        if (!kpId) {
            log("getVideoSources: No kpId");
            return [];
        }
        
        // Try to get players from cache endpoint
        const formData = "kinopoisk=" + kpId + "&type=movie";
        const response = http.POST(
            API_BASE + "/cache",
            formData,
            {'Content-Type': 'application/x-www-form-urlencoded'},
            false
        );
        
        if (!response || !response.isOk || !response.body) {
            log("getVideoSources: No players found");
            return [];
        }
        
        const data = JSON.parse(response.body);
        const sources = [];
        
        if (data && data.players && Array.isArray(data.players)) {
            for (let i = 0; i < data.players.length; i++) {
                const player = data.players[i];
                if (player.url) {
                    sources.push(new VideoUrlSource({
                        url: player.url,
                        name: player.name || ("Source " + (i + 1)),
                        width: 1920,
                        height: 1080,
                        container: "application/x-mpegurl",
                        codec: "",
                        bitrate: 0,
                        duration: 0
                    }));
                }
            }
        }
        
        log("getVideoSources: Found " + sources.length + " sources");
        return sources;
    } catch (e) {
        log("getVideoSources error: " + e);
        return [];
    }
};

// ========== COMMENTS WITH PAGER ==========

class ReyohohoCommentPager extends CommentPager {
    constructor(initialComments, kpId, url) {
        super(initialComments, initialComments.length >= 20, { kpId: kpId, url: url });
        this.kpId = kpId;
        this.contextUrl = url;
        this.currentPage = 1;
        this.itemsPerPage = 20;
    }
    
    nextPage() {
        try {
            this.currentPage++;
            const offset = this.currentPage * this.itemsPerPage;
            
            const data = makeRequest("/comments/" + this.kpId + "?limit=" + this.itemsPerPage + "&offset=" + offset);
            
            if (!data || !Array.isArray(data) || data.length === 0) {
                this.hasMore = false;
                this.results = [];
                return;
            }
            
            const comments = [];
            for (let i = 0; i < data.length; i++) {
                const c = data[i];
                comments.push(new Comment({
                    contextUrl: this.contextUrl,
                    author: new PlatformAuthorLink(
                        new PlatformID(PLATFORM, c.user_id || "0", config.id),
                        c.username || "Anonymous",
                        BASE_URL,
                        "",
                        0
                    ),
                    message: c.content || "",
                    rating: new RatingLikes(c.rating || 0),
                    date: c.created_at ? Math.floor(new Date(c.created_at).getTime() / 1000) : Math.floor(Date.now() / 1000),
                    replyCount: c.reply_count || 0,
                    context: { commentId: c.id }
                }));
            }
            
            this.results = comments;
            this.hasMore = comments.length >= this.itemsPerPage;
            
            log("Loaded comment page " + this.currentPage + ": " + comments.length + " comments");
        } catch (e) {
            log("Comment nextPage error: " + e);
            this.hasMore = false;
            this.results = [];
        }
    }
}

source.getComments = function(url) {
    try {
        const kpId = extractKpId(url);
        if (!kpId) {
            return new CommentPager([], false, {});
        }
        
        const data = makeRequest("/comments/" + kpId + "?limit=20");
        
        if (!data || !Array.isArray(data)) {
            return new CommentPager([], false, {});
        }
        
        const comments = [];
        for (let i = 0; i < data.length; i++) {
            const c = data[i];
            comments.push(new Comment({
                contextUrl: url,
                author: new PlatformAuthorLink(
                    new PlatformID(PLATFORM, c.user_id || "0", config.id),
                    c.username || "Anonymous",
                    BASE_URL,
                    "",
                    0
                ),
                message: c.content || "",
                rating: new RatingLikes(c.rating || 0),
                date: c.created_at ? Math.floor(new Date(c.created_at).getTime() / 1000) : Math.floor(Date.now() / 1000),
                replyCount: c.reply_count || 0,
                context: { commentId: c.id }
            }));
        }
        
        log("getComments: Loaded " + comments.length + " comments");
        
        // Return pager with pagination support
        return new ReyohohoCommentPager(comments, kpId, url);
    } catch (e) {
        log("getComments error: " + e);
        return new CommentPager([], false, {});
    }
};

source.getSubComments = function(comment) {
    return new CommentPager([], false, {});
};

// ========== CHANNELS (NOT SUPPORTED) ==========

source.isChannelUrl = function(url) {
    return false;
};

source.getChannel = function(url) {
    throw new ScriptException("Channels not supported");
};

source.getChannelContents = function(url, type, order, filters) {
    throw new ScriptException("Channels not supported");
};

// ========== HELPER FUNCTIONS ==========

function createVideoFromItem(item) {
    try {
        if (!item) return null;
        
        const kpId = item.kp_id || item.kinopoisk_id || item.id || 0;
        if (!kpId) return null;
        
        const title = item.name || item.title || "Unknown";
        const poster = item.poster || item.thumbnail || "";
        const year = item.year || 0;
        const url = BASE_URL + "?kp=" + kpId;
        
        return new PlatformVideo({
            id: new PlatformID(PLATFORM, kpId.toString(), config.id),
            name: title,
            thumbnails: new Thumbnails([new Thumbnail(poster, 0)]),
            author: new PlatformAuthorLink(
                new PlatformID(PLATFORM, "reyohoho", config.id),
                "ReYohoho",
                BASE_URL,
                "",
                0
            ),
            uploadDate: year ? Math.floor(new Date(year, 0, 1).getTime() / 1000) : 0,
            duration: item.duration || 0,
            viewCount: 0,
            url: url,
            isLive: false,
            shareUrl: url
        });
    } catch (e) {
        log("createVideoFromItem error: " + e);
        return null;
    }
}

function extractKpId(url) {
    try {
        if (!url) return null;
        
        // Try ?kp= parameter
        if (url.indexOf("kp=") !== -1) {
            const parts = url.split("kp=");
            if (parts.length > 1) {
                return parts[1].split("&")[0];
            }
        }
        
        // Try /film/ pattern
        if (url.indexOf("/film/") !== -1) {
            const parts = url.split("/film/");
            if (parts.length > 1) {
                return parts[1].split("/")[0];
            }
        }
        
        return null;
    } catch (e) {
        log("extractKpId error: " + e);
        return null;
    }
}

// ========== UTILITY FUNCTIONS (Utilities Package) ==========
// These demonstrate the Utilities package functionality

function generateUniqueId() {
    // Using Utilities package to generate UUID
    if (typeof utility !== 'undefined' && utility.randomUUID) {
        return utility.randomUUID();
    }
    // Fallback
    return 'xxxx-xxxx-4xxx-yxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0;
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}

function hashString(str) {
    // Using Utilities package for MD5 hashing
    if (typeof utility !== 'undefined' && utility.md5String) {
        return utility.md5String(str);
    }
    // Fallback simple hash
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
        var char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString();
}

// ========== DOMPARSER FUNCTIONS (DOMParser Package) ==========
// These demonstrate DOMParser package functionality for HTML parsing

function parseHtmlContent(html) {
    try {
        if (typeof domParser !== 'undefined' && domParser.parseFromString) {
            const doc = domParser.parseFromString(html);
            return doc;
        }
        return null;
    } catch (e) {
        log("parseHtmlContent error: " + e);
        return null;
    }
}

function extractElementsByClass(html, className) {
    try {
        const doc = parseHtmlContent(html);
        if (doc && doc.getElementsByClassName) {
            return doc.getElementsByClassName(className);
        }
        return [];
    } catch (e) {
        log("extractElementsByClass error: " + e);
        return [];
    }
}

log("ReYohoho plugin loaded successfully with Http, DOMParser, and Utilities packages");
