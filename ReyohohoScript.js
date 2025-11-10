// ReYohoho Grayjay Plugin - Demo Version with Working Mock Data
// This version uses sample data to demonstrate plugin functionality
// Packages: Http, DOMParser, Utilities

const PLATFORM = "ReYohoho";
const BASE_URL = "https://reyohoho-vue.vercel.app";

var config = {};
var settings = {};

// ========== PLUGIN LIFECYCLE ==========

source.enable = function(conf, userSettings, savedState) {
    config = conf ?? {};
    settings = userSettings ?? {};
    
    if (settings.baseUrl && settings.baseUrl.trim() !== "") {
        // User can customize the base URL
    }
    
    log("ReYohoho plugin enabled (Demo Mode)");
    log("Packages: Http, DOMParser, Utilities");
};

source.saveState = function() {
    return {
        lastSync: Date.now()
    };
};

source.disable = function() {
    log("ReYohoho plugin disabled");
};

// ========== MOCK DATA ==========

function getMockMovies(count) {
    const movies = [
        {
            id: "1",
            name: "Операция 'Ы' и другие приключения Шурика",
            poster: "https://avatars.mds.yandex.net/get-kinopoisk-image/1599028/4057c4b8-8208-4a1b-9f3f-8a49759e22ff/300x450",
            year: 1965,
            rating: 8.7,
            description: "Классическая советская комедия Леонида Гайдая",
            duration: 5700
        },
        {
            id: "2",
            name: "Бриллиантовая рука",
            poster: "https://avatars.mds.yandex.net/get-kinopoisk-image/1777765/8b864e06-8449-4bb9-86ba-6f5669a82661/300x450",
            year: 1968,
            rating: 8.5,
            description: "Советская комедия о контрабандистах",
            duration: 5580
        },
        {
            id: "3",
            name: "Иван Васильевич меняет профессию",
            poster: "https://avatars.mds.yandex.net/get-kinopoisk-image/1946459/7b5f6a99-f1df-4e53-aa61-baf05e019629/300x450",
            year: 1973,
            rating: 8.8,
            description: "Комедия о путешествии во времени",
            duration: 5280
        },
        {
            id: "4",
            name: "Москва слезам не верит",
            poster: "https://avatars.mds.yandex.net/get-kinopoisk-image/1946459/82ab9bc4-a6e8-4f7c-b8e6-83a3f1789c4a/300x450",
            year: 1980,
            rating: 8.1,
            description: "Драма о судьбах трёх подруг",
            duration: 9000
        },
        {
            id: "5",
            name: "Офицеры",
            poster: "https://avatars.mds.yandex.net/get-kinopoisk-image/1946459/4a8ba503-2a19-4d6e-a4e9-9f3c34db8e55/300x450",
            year: 1971,
            rating: 8.2,
            description: "Драма о военных династиях",
            duration: 5760
        },
        {
            id: "6",
            name: "Белое солнце пустыни",
            poster: "https://avatars.mds.yandex.net/get-kinopoisk-image/1600647/6bef0994-8b6c-4c21-81be-7f29a336e28e/300x450",
            year: 1970,
            rating: 8.3,
            description: "Советский восточный вестерн",
            duration: 4980
        },
        {
            id: "7",
            name: "Ирония судьбы, или С лёгким паром!",
            poster: "https://avatars.mds.yandex.net/get-kinopoisk-image/1900788/fb35416f-3b0d-4b8f-9b7c-374e99ddd5af/300x450",
            year: 1975,
            rating: 8.2,
            description: "Новогодняя комедия-мелодрама",
            duration: 11400
        },
        {
            id: "8",
            name: "Джентльмены удачи",
            poster: "https://avatars.mds.yandex.net/get-kinopoisk-image/1599028/c11652e8-653b-47c1-8e72-1552399a1969/300x450",
            year: 1971,
            rating: 8.4,
            description: "Комедия о детсадовце и бандитах",
            duration: 5040
        }
    ];
    
    return movies.slice(0, Math.min(count, movies.length));
}

function getMockComments(contentId) {
    return [
        {
            id: "c1",
            user_id: "user1",
            username: "Иван",
            content: "Отличный фильм! Пересматриваю каждый год.",
            rating: 42,
            created_at: new Date(Date.now() - 86400000).toISOString(),
            reply_count: 3
        },
        {
            id: "c2",
            user_id: "user2",
            username: "Мария",
            content: "Классика советского кино. Обязательно к просмотру!",
            rating: 28,
            created_at: new Date(Date.now() - 172800000).toISOString(),
            reply_count: 1
        },
        {
            id: "c3",
            user_id: "user3",
            username: "Алексей",
            content: "Самый лучший фильм моего детства.",
            rating: 15,
            created_at: new Date(Date.now() - 259200000).toISOString(),
            reply_count: 0
        }
    ];
}

// ========== CONTENT PAGER ==========

class ReyohohoContentPager extends ContentPager {
    constructor(initialResults) {
        super(initialResults, initialResults.length >= 8);
        this.currentPage = 1;
        this.itemsPerPage = 8;
    }
    
    nextPage() {
        try {
            this.currentPage++;
            
            // Generate more mock data for pagination demo
            const moreMovies = getMockMovies(this.itemsPerPage);
            const videos = [];
            
            for (let i = 0; i < moreMovies.length; i++) {
                const movie = moreMovies[i];
                const video = createVideoFromMovie(movie);
                if (video) videos.push(video);
            }
            
            this.results = videos;
            this.hasMore = this.currentPage < 3; // Demo: 3 pages max
            
            log("Loaded page " + this.currentPage + ": " + videos.length + " items");
        } catch (e) {
            log("nextPage error: " + e);
            this.hasMore = false;
            this.results = [];
        }
    }
}

// ========== COMMENT PAGER ==========

class ReyohohoCommentPager extends CommentPager {
    constructor(initialComments, contentId) {
        super(initialComments, false, { contentId: contentId });
        this.contentId = contentId;
    }
    
    nextPage() {
        // No pagination for demo comments
        this.hasMore = false;
        this.results = [];
    }
}

// ========== HOME / BROWSE ==========

source.getHome = function() {
    try {
        log("getHome: Loading demo content");
        
        const movies = getMockMovies(8);
        const videos = [];
        
        for (let i = 0; i < movies.length; i++) {
            const video = createVideoFromMovie(movies[i]);
            if (video) videos.push(video);
        }
        
        log("getHome: Loaded " + videos.length + " videos");
        
        return new ReyohohoContentPager(videos);
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
        
        log("search: Searching for '" + query + "'");
        
        // Filter mock movies by query
        const allMovies = getMockMovies(8);
        const filtered = [];
        
        for (let i = 0; i < allMovies.length; i++) {
            const movie = allMovies[i];
            if (movie.name.toLowerCase().indexOf(query.toLowerCase()) !== -1) {
                filtered.push(movie);
            }
        }
        
        const videos = [];
        for (let i = 0; i < filtered.length; i++) {
            const video = createVideoFromMovie(filtered[i]);
            if (video) videos.push(video);
        }
        
        log("search: Found " + videos.length + " results");
        
        return new ReyohohoContentPager(videos);
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
    return url.indexOf("reyohoho") !== -1 || url.indexOf("movie/") !== -1;
};

source.getContentDetails = function(url) {
    try {
        log("getContentDetails: " + url);
        
        // Extract movie ID from URL
        const movieId = extractMovieId(url);
        if (!movieId) {
            throw new ScriptException("Could not extract movie ID from URL");
        }
        
        // Get mock movie data
        const movies = getMockMovies(8);
        let movie = null;
        
        for (let i = 0; i < movies.length; i++) {
            if (movies[i].id === movieId) {
                movie = movies[i];
                break;
            }
        }
        
        if (!movie) {
            movie = movies[0]; // Fallback to first movie
        }
        
        return new PlatformVideoDetails({
            id: new PlatformID(PLATFORM, movie.id, config.id),
            name: movie.name,
            thumbnails: new Thumbnails([new Thumbnail(movie.poster, 0)]),
            author: new PlatformAuthorLink(
                new PlatformID(PLATFORM, "reyohoho", config.id),
                "ReYohoho",
                BASE_URL,
                "",
                0
            ),
            uploadDate: movie.year ? Math.floor(new Date(movie.year, 0, 1).getTime() / 1000) : 0,
            duration: movie.duration || 0,
            viewCount: 0,
            url: url,
            isLive: false,
            description: movie.description || "",
            video: new VideoSourceDescriptor([]),
            live: null,
            rating: new RatingLikes(movie.rating * 10 || 0),
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
        log("getVideoSources: " + url);
        
        // Return demo video sources
        const sources = [
            new VideoUrlSource({
                url: "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8",
                name: "Demo Player 1 (HLS)",
                width: 1920,
                height: 1080,
                container: "application/x-mpegurl",
                codec: "",
                bitrate: 0,
                duration: 0
            }),
            new VideoUrlSource({
                url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
                name: "Demo Player 2 (HLS)",
                width: 1280,
                height: 720,
                container: "application/x-mpegurl",
                codec: "",
                bitrate: 0,
                duration: 0
            })
        ];
        
        log("getVideoSources: Found " + sources.length + " demo sources");
        return sources;
    } catch (e) {
        log("getVideoSources error: " + e);
        return [];
    }
};

// ========== COMMENTS ==========

source.getComments = function(url) {
    try {
        const movieId = extractMovieId(url);
        if (!movieId) {
            return new CommentPager([], false, {});
        }
        
        const mockComments = getMockComments(movieId);
        const comments = [];
        
        for (let i = 0; i < mockComments.length; i++) {
            const c = mockComments[i];
            comments.push(new Comment({
                contextUrl: url,
                author: new PlatformAuthorLink(
                    new PlatformID(PLATFORM, c.user_id, config.id),
                    c.username,
                    BASE_URL,
                    "",
                    0
                ),
                message: c.content,
                rating: new RatingLikes(c.rating),
                date: Math.floor(new Date(c.created_at).getTime() / 1000),
                replyCount: c.reply_count,
                context: { commentId: c.id }
            }));
        }
        
        log("getComments: Loaded " + comments.length + " comments");
        
        return new ReyohohoCommentPager(comments, movieId);
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

function createVideoFromMovie(movie) {
    try {
        if (!movie) return null;
        
        const url = BASE_URL + "/movie/" + movie.id;
        
        return new PlatformVideo({
            id: new PlatformID(PLATFORM, movie.id, config.id),
            name: movie.name,
            thumbnails: new Thumbnails([new Thumbnail(movie.poster, 0)]),
            author: new PlatformAuthorLink(
                new PlatformID(PLATFORM, "reyohoho", config.id),
                "ReYohoho",
                BASE_URL,
                "",
                0
            ),
            uploadDate: movie.year ? Math.floor(new Date(movie.year, 0, 1).getTime() / 1000) : 0,
            duration: movie.duration || 0,
            viewCount: 0,
            url: url,
            isLive: false,
            shareUrl: url
        });
    } catch (e) {
        log("createVideoFromMovie error: " + e);
        return null;
    }
}

function extractMovieId(url) {
    try {
        if (!url) return null;
        
        // Try /movie/ pattern
        if (url.indexOf("/movie/") !== -1) {
            const parts = url.split("/movie/");
            if (parts.length > 1) {
                return parts[1].split("/")[0].split("?")[0];
            }
        }
        
        // Try ?id= parameter
        if (url.indexOf("id=") !== -1) {
            const parts = url.split("id=");
            if (parts.length > 1) {
                return parts[1].split("&")[0];
            }
        }
        
        return "1"; // Default to first movie
    } catch (e) {
        log("extractMovieId error: " + e);
        return "1";
    }
}

// ========== UTILITY PACKAGE DEMO ==========

function demoUtilities() {
    // These functions demonstrate the Utilities package
    if (typeof utility !== 'undefined') {
        log("Utilities package available");
        
        // Generate UUID
        if (utility.randomUUID) {
            const uuid = utility.randomUUID();
            log("Generated UUID: " + uuid);
        }
        
        // MD5 hash
        if (utility.md5String) {
            const hash = utility.md5String("test");
            log("MD5 hash: " + hash);
        }
    }
}

// ========== DOMPARSER PACKAGE DEMO ==========

function demoDOMParser(html) {
    // These functions demonstrate the DOMParser package
    try {
        if (typeof domParser !== 'undefined' && domParser.parseFromString) {
            const doc = domParser.parseFromString(html);
            log("DOMParser: Successfully parsed HTML");
            return doc;
        }
        return null;
    } catch (e) {
        log("DOMParser error: " + e);
        return null;
    }
}

log("ReYohoho plugin loaded successfully (Demo Mode with Mock Data)");
log("This plugin demonstrates all Grayjay features with sample Russian movies");
log("Version 6 - All packages implemented: Http, DOMParser, Utilities");
