const PLATFORM = "ReYohoho";
const BASE_URL = "https://reyohoho.github.io/reyohoho/";
let API_BASE = "https://api.reyohoho.app";

var config = {};
var authToken = null;

// ===== Source Lifecycle Methods =====

source.enable = function(conf, settings, savedState) {
	config = conf ?? {};
	
	// Restore auth token from previous session
	if (savedState && savedState.token) {
		authToken = savedState.token;
		log("ReYohoho: Auth token restored");
	}
	
	// Allow custom API endpoint from settings
	if (settings && settings.apiUrl) {
		API_BASE = settings.apiUrl;
	}
	
	log("ReYohoho plugin enabled - API: " + API_BASE);
}

source.saveState = function() {
	return {
		token: authToken,
		lastSync: Date.now()
	};
}

// ===== Home Feed =====

source.getHome = function() {
	try {
		const topResults = getTopContent("all", "all", 20);
		if (!topResults || topResults.length === 0) {
			log("No top content found");
			return new ContentPager([], false);
		}
		
		const videos = topResults.map(item => createVideoFromApiData(item));
		return new ContentPager(videos, false);
	} catch (e) {
		log("Error getting home: " + e);
		return new ContentPager([], false);
	}
};

// ===== Search =====

source.searchSuggestions = function(query) {
	return [];
};

source.getSearchCapabilities = () => {
	return {
		types: [Type.Feed.Videos],
		sorts: [Type.Order.Chronological],
		filters: []
	};
};

source.search = function(query, type, order, filters) {
	try {
		if (!query || query.trim() === "") {
			return new ContentPager([], false);
		}
		
		const searchResults = apiSearch(query);
		if (!searchResults || searchResults.length === 0) {
			log("No search results for: " + query);
			return new ContentPager([], false);
		}
		
		const videos = searchResults.map(item => createVideoFromApiData(item));
		return new ContentPager(videos, false);
	} catch (e) {
		log("Search error: " + e);
		return new ContentPager([], false);
	}
};

source.getSearchChannelContentsCapabilities = function() {
	return {
		types: [Type.Feed.Videos],
		sorts: [Type.Order.Chronological],
		filters: []
	};
};

source.searchChannelContents = function(channelUrl, query, type, order, filters) {
	throw new ScriptException("Channel search not supported");
};

source.searchChannels = function(query) {
	return new ChannelPager([], false);
};

// ===== Channel Methods =====

source.isChannelUrl = function(url) {
	return false;
};

source.getChannel = function(url) {
	throw new ScriptException("Channels not supported");
};

source.getChannelContents = function(url) {
	throw new ScriptException("Channels not supported");
};

// ===== Video Details =====

source.isContentDetailsUrl = function(url) {
	if (!url) return false;
	
	return url.includes("reyohoho.github.io") ||
	       url.includes("kinopoisk.ru") ||
	       url.includes("shikimori.one") ||
	       url.includes("imdb.com");
};

source.getContentDetails = function(url) {
	try {
		let kpId = null;
		let contentType = "movie";
		
		// Extract KinoPoisk ID from URL
		if (url.includes("kinopoisk.ru")) {
			const match = url.match(/film\/(\d+)/);
			kpId = match ? match[1] : null;
		} else if (url.includes("shikimori.one")) {
			const shikiMatch = url.match(/animes\/(\d+)/);
			if (shikiMatch) {
				const shikiId = shikiMatch[1];
				kpId = convertShikiToKp(shikiId);
				contentType = "anime";
			}
		} else if (url.includes("imdb.com")) {
			const imdbMatch = url.match(/title\/(tt\d+)/);
			if (imdbMatch) {
				const imdbId = imdbMatch[1];
				kpId = convertImdbToKp(imdbId);
			}
		}
		
		if (!kpId) {
			throw new ScriptException("Could not extract content ID from URL");
		}
		
		// Fetch content details
		const movieInfo = getKpInfo(kpId);
		const players = getPlayers(kpId, contentType);
		
		return createVideoDetails(movieInfo, players, kpId);
	} catch (e) {
		log("Error getting content details: " + e);
		throw e;
	}
};

// ===== Comments =====

source.getComments = function(url) {
	try {
		const kpId = extractKpId(url);
		if (!kpId) {
			log("No KP ID found in URL");
			return new CommentPager([], false);
		}
		
		const commentsData = getComments(kpId);
		if (!commentsData || commentsData.length === 0) {
			return new CommentPager([], false);
		}
		
		const formattedComments = commentsData.map(c => createCommentFromApiData(c));
		return new CommentPager(formattedComments, false);
	} catch (e) {
		log("Error getting comments: " + e);
		return new CommentPager([], false);
	}
}

source.getSubComments = function(comment) {
	return new CommentPager([], false);
}

// ===== API Functions =====

function makeApiRequest(endpoint, method, body, isFormData) {
	method = method || "GET";
	isFormData = isFormData || false;
	
	const url = API_BASE + endpoint;
	const headers = {
		"Content-Type": isFormData ? "application/x-www-form-urlencoded" : "application/json"
	};
	
	if (authToken) {
		headers["Authorization"] = "Bearer " + authToken;
	}
	
	try {
		let response;
		
		if (method === "GET") {
			response = http.GET(url, headers);
		} else if (method === "POST") {
			const bodyStr = body || "";
			response = http.POST(url, bodyStr, headers);
		} else if (method === "PUT") {
			const bodyStr = body || "";
			response = http.request(url, "PUT", bodyStr, headers);
		} else if (method === "DELETE") {
			response = http.request(url, "DELETE", "", headers);
		}
		
		if (!response || !response.body) {
			log("Empty response from: " + endpoint);
			return null;
		}
		
		return JSON.parse(response.body);
	} catch (e) {
		log("API request failed for " + endpoint + ": " + e);
		throw e;
	}
}

function apiSearch(searchTerm) {
	const data = makeApiRequest("/search/" + encodeURIComponent(searchTerm));
	return data || [];
}

function getKpInfo(kpId) {
	return makeApiRequest("/kp_info2/" + kpId);
}

function getShikiInfo(shikiId) {
	return makeApiRequest("/shiki_info/" + shikiId);
}

function getPlayers(kpId, type) {
	type = type || "movie";
	const body = "kinopoisk=" + encodeURIComponent(kpId) + "&type=" + encodeURIComponent(type);
	return makeApiRequest("/cache", "POST", body, true);
}

function getPlayersShiki(shikiId, type) {
	type = type || "anime";
	const body = "shikimori=" + encodeURIComponent(shikiId) + "&type=" + encodeURIComponent(type);
	return makeApiRequest("/cache_shiki", "POST", body, true);
}

function convertImdbToKp(imdbId) {
	const data = makeApiRequest("/imdb_to_kp/" + imdbId);
	return data && data.kp_id ? data.kp_id : null;
}

function convertShikiToKp(shikiId) {
	const data = makeApiRequest("/shiki_to_kp/" + shikiId);
	return data && data.kp_id ? data.kp_id : null;
}

function getTopContent(timeframe, typeFilter, limit) {
	timeframe = timeframe || "all";
	typeFilter = typeFilter || "all";
	limit = limit || 20;
	
	const data = makeApiRequest("/top/" + timeframe + "?type=" + typeFilter + "&limit=" + limit);
	return data && data.results ? data.results : [];
}

function getDiscussed(type) {
	type = type || "hot";
	const data = makeApiRequest("/discussed/" + type);
	return data && data.results ? data.results : [];
}

function getChance() {
	return makeApiRequest("/chance");
}

function getComments(movieId) {
	const data = makeApiRequest("/comments/" + movieId);
	return data && data.comments ? data.comments : [];
}

function getTwitchStream(username) {
	return makeApiRequest("/twitch/" + username);
}

function extractKpId(url) {
	if (!url) return null;
	
	if (url.includes("kinopoisk.ru")) {
		const match = url.match(/film\/(\d+)/);
		return match ? match[1] : null;
	}
	return null;
}

// ===== Helper Functions =====

function createVideoFromApiData(item) {
	if (!item) return null;
	
	const kpId = item.kp_id || item.id || "0";
	const title = item.title || item.name || "Unknown Title";
	const thumbnail = item.poster || item.thumbnail || "";
	const year = item.year || 0;
	const duration = item.duration || 0;
	
	return new PlatformVideo({
		id: new PlatformID(PLATFORM, kpId.toString(), config.id),
		name: title,
		thumbnails: new Thumbnails([new Thumbnail(thumbnail, 1)]),
		author: new PlatformAuthorLink(
			new PlatformID(PLATFORM, "reyohoho", config.id),
			"ReYohoho",
			BASE_URL,
			"",
			0
		),
		uploadDate: year ? new Date(year, 0, 1).getTime() / 1000 : 0,
		url: "https://www.kinopoisk.ru/film/" + kpId + "/",
		duration: duration,
		viewCount: 0,
		isLive: false
	});
}

function createVideoDetails(movieInfo, players, kpId) {
	if (!movieInfo) {
		throw new ScriptException("No movie info available");
	}
	
	const title = movieInfo.title || movieInfo.name || "Unknown Title";
	const description = movieInfo.description || "";
	const thumbnail = movieInfo.poster || "";
	const year = movieInfo.year || 0;
	const duration = movieInfo.duration || 0;
	
	// Extract video sources from players
	let videoSources = null;
	if (players && players.length > 0) {
		const player = players[0];
		const playerUrl = player.iframe_url || player.url || "";
		
		if (playerUrl) {
			videoSources = new VideoUrlSource({
				url: playerUrl,
				width: 1920,
				height: 1080,
				container: "video/mp4",
				codec: "h264",
				name: player.name || "Source",
				duration: duration,
				bitrate: 0
			});
		}
	}
	
	return new PlatformVideoDetails({
		id: new PlatformID(PLATFORM, kpId.toString(), config.id),
		name: title,
		description: description,
		thumbnails: new Thumbnails([new Thumbnail(thumbnail, 1)]),
		author: new PlatformAuthorLink(
			new PlatformID(PLATFORM, "reyohoho", config.id),
			"ReYohoho",
			BASE_URL,
			"",
			0
		),
		uploadDate: year ? new Date(year, 0, 1).getTime() / 1000 : 0,
		url: "https://www.kinopoisk.ru/film/" + kpId + "/",
		duration: duration,
		viewCount: 0,
		isLive: false,
		video: videoSources,
		live: null,
		dash: null,
		hls: null
	});
}

function createCommentFromApiData(comment) {
	if (!comment) return null;
	
	return new Comment({
		contextUrl: "https://www.kinopoisk.ru/film/" + (comment.movie_id || "0") + "/",
		author: new PlatformAuthorLink(
			new PlatformID(PLATFORM, (comment.user_id || "0").toString(), config.id),
			comment.username || "Anonymous",
			"",
			"",
			0
		),
		message: comment.content || "",
		rating: new RatingLikes(comment.likes || 0),
		date: comment.created_at ? new Date(comment.created_at).getTime() / 1000 : 0,
		replyCount: comment.replies_count || 0,
		context: {}
	});
}

log("ReYohoho plugin LOADED");
