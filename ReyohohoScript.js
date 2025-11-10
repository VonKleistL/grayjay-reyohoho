const PLATFORM = "ReYohoho";
const BASE_URL = "https://reyohoho.github.io/reyohoho/";
const DEFAULT_API_URL = "https://api.reyohoho.app";

var config = {};
var authToken = null;
var API_BASE = DEFAULT_API_URL;

// Helper function to make API requests
function makeRequest(url, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    return http.request({
        url: url,
        method: options.method || 'GET',
        headers: headers,
        body: options.body
    });
}

source.enable = function(conf, settings, savedState) {
    config = conf ?? {};
    if (savedState && savedState.token) {
        authToken = savedState.token;
    }
    if (settings && settings.apiUrl && settings.apiUrl.trim() !== "") {
        API_BASE = settings.apiUrl.trim();
    } else {
        API_BASE = DEFAULT_API_URL;
    }
    log("ReYohoho plugin enabled with API: " + API_BASE);
};

source.saveState = function() {
    return { token: authToken, lastSync: Date.now(), apiUrl: API_BASE };
};

source.disable = function() {
    log("ReYohoho plugin disabled");
};

// Get home/browse content
source.getHome = function() {
    try {
        const response = makeRequest(`${API_BASE}/top/all?type=all&limit=30`);
        
        if (!response.isOk) {
            return new ContentPager([], false);
        }
        
        const data = JSON.parse(response.body);
        const videos = [];
        
        if (data && Array.isArray(data)) {
            for (let i = 0; i < data.length; i++) {
                const item = data[i];
                const video = createVideoFromApiData(item);
                if (video) videos.push(video);
            }
        }
        
        return new ContentPager(videos, false);
    } catch (e) {
        log("Error in getHome: " + e);
        return new ContentPager([], false);
    }
};

// Search functionality
source.searchSuggestions = function(query) {
    return [];
};

source.search = function(query, type, order, filters) {
    return searchContent(query, 0);
};

source.searchChannels = function(query) {
    return new ChannelPager([], false);
};

function searchContent(query, page) {
    try {
        const response = makeRequest(`${API_BASE}/search/${encodeURIComponent(query)}`);
        
        if (!response.isOk) {
            return new ContentPager([], false);
        }
        
        const data = JSON.parse(response.body);
        const videos = [];
        
        if (data && Array.isArray(data)) {
            for (let i = 0; i < data.length; i++) {
                const item = data[i];
                const video = createVideoFromApiData(item);
                if (video) videos.push(video);
            }
        }
        
        return new ContentPager(videos, false);
    } catch (e) {
        log("Error in search: " + e);
        return new ContentPager([], false);
    }
}

// Get video details
source.getContentDetails = function(url) {
    try {
        // Extract kpId from URL
        const kpId = extractKpIdFromUrl(url);
        if (!kpId) {
            throw new Error("Could not extract kpId from URL");
        }
        
        const response = makeRequest(`${API_BASE}/kp_info2/${kpId}`);
        
        if (!response.isOk) {
            throw new Error("Failed to get content details");
        }
        
        const data = JSON.parse(response.body);
        
        return new PlatformVideoDetails({
            id: new PlatformID(PLATFORM, kpId, config.id),
            name: data.name || data.title || "Unknown Title",
            thumbnails: new Thumbnails([new Thumbnail(data.poster || "", 0)]),
            author: new PlatformAuthorLink(
                new PlatformID(PLATFORM, "", config.id),
                "ReYohoho",
                BASE_URL,
                null
            ),
            uploadDate: Math.floor(Date.now() / 1000),
            duration: 0,
            viewCount: 0,
            url: url,
            isLive: false,
            description: data.description || "",
            video: new VideoSourceDescriptor([]),
            live: null,
            rating: new RatingLikes(data.rating || 0),
            subtitles: []
        });
    } catch (e) {
        log("Error in getContentDetails: " + e);
        throw e;
    }
};

// Get video sources/streams
source.getVideoSources = function(url) {
    try {
        const kpId = extractKpIdFromUrl(url);
        if (!kpId) {
            return [];
        }
        
        // Get players for the content
        const response = http.POST(
            `${API_BASE}/cache`,
            "kinopoisk=" + kpId + "&type=movie",
            {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            false
        );
        
        if (!response.isOk) {
            return [];
        }
        
        const data = JSON.parse(response.body);
        const sources = [];
        
        // Process player data and extract video sources
        if (data && data.players && Array.isArray(data.players)) {
            for (let i = 0; i < data.players.length; i++) {
                const player = data.players[i];
                if (player.url) {
                    sources.push(new VideoUrlSource({
                        url: player.url,
                        name: player.name || "Source " + (i + 1),
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
        
        return sources;
    } catch (e) {
        log("Error in getVideoSources: " + e);
        return [];
    }
};

// Get comments
source.getComments = function(url) {
    try {
        const kpId = extractKpIdFromUrl(url);
        if (!kpId) {
            return new CommentPager([], false, {});
        }
        
        const response = makeRequest(`${API_BASE}/comments/${kpId}`);
        
        if (!response.isOk) {
            return new CommentPager([], false, {});
        }
        
        const data = JSON.parse(response.body);
        const comments = [];
        
        if (data && Array.isArray(data)) {
            for (let i = 0; i < data.length; i++) {
                const comment = data[i];
                comments.push(new Comment({
                    contextUrl: url,
                    author: new PlatformAuthorLink(
                        new PlatformID(PLATFORM, comment.user_id || "", config.id),
                        comment.username || "Anonymous",
                        BASE_URL,
                        null
                    ),
                    message: comment.content || "",
                    rating: new RatingLikes(comment.rating || 0),
                    date: comment.created_at ? new Date(comment.created_at).getTime() / 1000 : Date.now() / 1000,
                    replyCount: comment.reply_count || 0,
                    context: { commentId: comment.id }
                }));
            }
        }
        
        return new CommentPager(comments, false, {});
    } catch (e) {
        log("Error in getComments: " + e);
        return new CommentPager([], false, {});
    }
};

source.getSubComments = function(comment) {
    return new CommentPager([], false, {});
};

// Helper functions
function createVideoFromApiData(item) {
    try {
        const kpId = item.kp_id || item.kinopoisk_id || item.id;
        if (!kpId) return null;
        
        const url = `${BASE_URL}?kp=${kpId}`;
        
        return new PlatformVideo({
            id: new PlatformID(PLATFORM, kpId.toString(), config.id),
            name: item.name || item.title || "Unknown Title",
            thumbnails: new Thumbnails([new Thumbnail(item.poster || item.thumbnail || "", 0)]),
            author: new PlatformAuthorLink(
                new PlatformID(PLATFORM, "", config.id),
                "ReYohoho",
                BASE_URL,
                null
            ),
            uploadDate: Math.floor(Date.now() / 1000),
            duration: 0,
            viewCount: 0,
            url: url,
            isLive: false,
            shareUrl: url
        });
    } catch (e) {
        log("Error creating video from data: " + e);
        return null;
    }
}

function extractKpIdFromUrl(url) {
    try {
        if (url.indexOf("kp=") !== -1) {
            const parts = url.split("kp=");
            if (parts.length > 1) {
                const idPart = parts[1].split("&")[0];
                return idPart;
            }
        }
        return null;
    } catch (e) {
        log("Error extracting kpId: " + e);
        return null;
    }
}

log("ReYohoho Source Loaded");
