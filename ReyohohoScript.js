// ReYohoho Grayjay Plugin - Complete Implementation
// Based on actual ReYohoho web app and desktop app architecture

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

// ========== HTTP HELPER ==========

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
            response = http.request(url, method, options.body || "", headers, options.useAuth !== false);
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
        return new ContentPager(videos, false);
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
        
        const data = makeRequest("/search/" + encodeURIComponent(query.trim()));
        
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
        return new ContentPager(videos, false);
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

// ========== COMMENTS ==========

source.getComments = function(url) {
    try {
        const kpId = extractKpId(url);
        if (!kpId) {
            return new CommentPager([], false, {});
        }
        
        const data = makeRequest("/comments/" + kpId);
        
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
        return new CommentPager(comments, false, {});
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

log("ReYohoho plugin loaded successfully");
