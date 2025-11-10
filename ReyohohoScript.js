const PLATFORM = "ReYohoho";
const BASE_URL = "https://reyohoho.github.io/reyohoho/";
const DEFAULT_API_URL = "https://api.reyohoho.app";

var config = {};
var authToken = null;
var API_BASE = DEFAULT_API_URL;

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
	log("ReYohoho plugin enabled");
}

source.saveState = function() {
	return { token: authToken, lastSync: Date.now(), apiUrl: API_BASE };
}

source.disable = function() {
	log("ReYohoho plugin disabled");
}

source.getHome = function() {
	try {
		const topResults = getTopContent("all", "all", 30);
		if (!topResults || topResults.length === 0) {
			return new ContentPager([], false);
		}
		const videos = [];
		for (let i = 0; i < topResults.length; i++) {
			const video = createVideoFromApiData(topResults[i]);
			if (video) videos.push(video);
		}
		return new ContentPager(videos, false);
	} catch (e) {
		log("Error: " + e);
		return new ContentPager([], false);
	}
};

source.searchSuggestions = function(query) { return []; };

source.getSearchCapabilities = () => {
	return { types: [Type.Feed.Videos], sorts: [Type.Order.Chronological], filters: [] };
};

source.search = function(query, type, order, filters) {
	try {
		if (!query || query.trim() === "") return new ContentPager([], false);
		const searchResults = apiSearch(query.trim());
		if (!searchResults || searchResults.length === 0) return new ContentPager([], false);
		const videos = [];
		for (let i = 0; i < searchResults.length; i++) {
			const video = createVideoFromApiData(searchResults[i]);
			if (video) videos.push(video);
		}
		return new ContentPager(videos, false);
	} catch (e) {
		log("Search error: " + e);
		return new ContentPager([], false);
	}
};

source.getSearchChannelContentsCapabilities = function() {
	return { types: [Type.Feed.Videos], sorts: [Type.Order.Chronological], filters: [] };
};

source.searchChannelContents = function(channelUrl, query, type, order, filters) {
	throw new ScriptException("Channel search not supported");
};

source.searchChannels = function(query) {
	return new ChannelPager([], false);
};

source.isChannelUrl = function(url) { return false; };
source.getChannel = function(url) { throw new ScriptException("Channels not supported"); };
source.getChannelContents = function(url) { throw new ScriptException("Channels not supported"); };

source.isContentDetailsUrl = function(url) {
	if (!url) return false;
	return url.includes("reyohoho.github.io") || url.includes("reyohoho.gitlab.io") ||
	       url.includes("kinopoisk.ru") || url.includes("shikimori.one") || url.includes("imdb.com");
};

source.getContentDetails = function(url) {
	try {
		let kpId = null;
		let contentType = "movie";
		
		if (url.includes("kinopoisk.ru")) {
			const match = url.match(/film\/(\d+)/);
			kpId = match ? match[1] : null;
		} else if (url.includes("shikimori.one")) {
			const match = url.match(/animes\/(\d+)/);
			if (match) {
				kpId = convertShikiToKp(match[1]);
				contentType = "anime";
			}
		} else if (url.includes("imdb.com")) {
			const match = url.match(/title\/(tt\d+)/);
			if (match) kpId = convertImdbToKp(match[1]);
		}
		
		if (!kpId) throw new ScriptException("Could not extract content ID");
		
		const movieInfo = getKpInfo(kpId);
		const players = getPlayers(kpId, contentType);
		return createVideoDetails(movieInfo, players, kpId);
	} catch (e) {
		log("Error: " + e);
		throw e;
	}
};

source.getComments = function(url) {
	try {
		const kpId = extractKpId(url);
		if (!kpId) return new CommentPager([], false);
		const commentsData = getComments(kpId);
		if (!commentsData || commentsData.length === 0) return new CommentPager([], false);
		const formatted = [];
		for (let i = 0; i < commentsData.length; i++) {
			const comment = createCommentFromApiData(commentsData[i]);
			if (comment) formatted.push(comment);
		}
		return new CommentPager(formatted, false);
	} catch (e) {
		log("Error: " + e);
		return new CommentPager([], false);
	}
}

source.getSubComments = function(comment) {
	return new CommentPager([], false);
}

function makeApiRequest(endpoint, method, body, isFormData) {
	method = method || "GET";
	isFormData = isFormData || false;
	const url = API_BASE + endpoint;
	const headers = {
		"Content-Type": isFormData ? "application/x-www-form-urlencoded" : "application/json",
		"User-Agent": "Grayjay-ReYohoho/1.0"
	};
	if (authToken) headers["Authorization"] = "Bearer " + authToken;
	
	try {
		let response;
		if (method === "GET") {
			response = http.GET(url, headers);
		} else if (method === "POST") {
			response = http.POST(url, body || "", headers);
		} else if (method === "PUT") {
			response = http.request(url, "PUT", body || "", headers);
		} else if (method === "DELETE") {
			response = http.request(url, "DELETE", "", headers);
		}
		
		if (!response || !response.body) return null;
		if (response.code && response.code >= 400) return null;
		return JSON.parse(response.body);
	} catch (e) {
		log("API error: " + e);
		return null;
	}
}

function apiSearch(searchTerm) {
	const data = makeApiRequest("/search/" + encodeURIComponent(searchTerm));
	if (!data) return [];
	if (Array.isArray(data)) return data;
	if (data.results && Array.isArray(data.results)) return data.results;
	if (data.movies && Array.isArray(data.movies)) return data.movies;
	return [];
}

function getKpInfo(kpId) {
	const data = makeApiRequest("/kp_info2/" + kpId);
	if (!data) throw new ScriptException("Failed to fetch info");
	return data;
}

function getShikiInfo(shikiId) {
	return makeApiRequest("/shiki_info/" + shikiId);
}

function getPlayers(kpId, type) {
	type = type || "movie";
	const body = "kinopoisk=" + encodeURIComponent(kpId) + "&type=" + encodeURIComponent(type);
	const data = makeApiRequest("/cache", "POST", body, true);
	if (!data) return [];
	if (Array.isArray(data)) return data;
	if (data.players && Array.isArray(data.players)) return data.players;
	return [];
}

function getPlayersShiki(shikiId, type) {
	type = type || "anime";
	const body = "shikimori=" + encodeURIComponent(shikiId) + "&type=" + encodeURIComponent(type);
	const data = makeApiRequest("/cache_shiki", "POST", body, true);
	if (!data) return [];
	if (Array.isArray(data)) return data;
	if (data.players && Array.isArray(data.players)) return data.players;
	return [];
}

function convertImdbToKp(imdbId) {
	const data = makeApiRequest("/imdb_to_kp/" + imdbId);
	return (data && data.kp_id) ? data.kp_id.toString() : null;
}

function convertShikiToKp(shikiId) {
	const data = makeApiRequest("/shiki_to_kp/" + shikiId);
	return (data && data.kp_id) ? data.kp_id.toString() : null;
}

function getTopContent(timeframe, typeFilter, limit) {
	timeframe = timeframe || "all";
	typeFilter = typeFilter || "all";
	limit = limit || 20;
	const data = makeApiRequest("/top/" + timeframe + "?type=" + typeFilter + "&limit=" + limit);
	if (!data) return [];
	if (Array.isArray(data)) return data;
	if (data.results && Array.isArray(data.results)) return data.results;
	return [];
}

function getDiscussed(type) {
	type = type || "hot";
	const data = makeApiRequest("/discussed/" + type);
	if (!data) return [];
	if (data.results && Array.isArray(data.results)) return data.results;
	return [];
}

function getChance() {
	return makeApiRequest("/chance");
}

function getComments(movieId) {
	const data = makeApiRequest("/comments/" + movieId);
	if (!data) return [];
	if (data.comments && Array.isArray(data.comments)) return data.comments;
	return [];
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

function createVideoFromApiData(item) {
	if (!item) return null;
	const kpId = item.kp_id || item.kinopoisk_id || item.id || "0";
	const title = item.title || item.name || item.russian || item.original || "Unknown";
	const thumbnail = item.poster || item.poster_url || item.thumbnail || "";
	const year = item.year || item.release_year || 0;
	const duration = item.duration || item.runtime || 0;
	
	return new PlatformVideo({
		id: new PlatformID(PLATFORM, kpId.toString(), config.id),
		name: title,
		thumbnails: new Thumbnails([new Thumbnail(thumbnail, 1)]),
		author: new PlatformAuthorLink(
			new PlatformID(PLATFORM, "reyohoho", config.id),
			"ReYohoho", BASE_URL, "", 0
		),
		uploadDate: year ? new Date(year, 0, 1).getTime() / 1000 : 0,
		url: "https://www.kinopoisk.ru/film/" + kpId + "/",
		duration: duration,
		viewCount: 0,
		isLive: false
	});
}

function createVideoDetails(movieInfo, players, kpId) {
	if (!movieInfo) throw new ScriptException("No info");
	const title = movieInfo.title || movieInfo.name || movieInfo.russian || "Unknown";
	const description = movieInfo.description || movieInfo.synopsis || "";
	const thumbnail = movieInfo.poster || movieInfo.poster_url || "";
	const year = movieInfo.year || movieInfo.release_year || 0;
	const duration = movieInfo.duration || movieInfo.runtime || 0;
	
	let videoSources = null;
	if (players && players.length > 0) {
		const player = players[0];
		const playerUrl = player.iframe_url || player.url || "";
		if (playerUrl) {
			videoSources = new VideoUrlSource({
				url: playerUrl, width: 1920, height: 1080,
				container: "video/mp4", codec: "h264",
				name: player.name || "Source", duration: duration, bitrate: 0
			});
		}
	}
	
	return new PlatformVideoDetails({
		id: new PlatformID(PLATFORM, kpId.toString(), config.id),
		name: title,
		description: description,
		thumbnails: new Thumbnails([new Thumbnail
