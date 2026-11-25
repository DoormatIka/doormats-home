package models

type YtdlpThumbnailModel struct {
	Id string `json:"id"`
	Resolution string `json:"resolution"`

	YtdlpThumbnailEntryModel
}

type YtdlpPlaylistEntriesModel struct {
	Id string `json:"id"`
	Type string `json:"_type"`
	Url string `json:"url"`
	Title string `json:"title"`
	Thumbnails []YtdlpThumbnailEntryModel `json:"thumbnails"`
	Duration uint `json:"duration"`
	ViewCount uint `json:"view_count"`
	Timestamp *int64 `json:"timestamp"` // i have no idea, this is always null with the command i'm using.
	LiveStatus *string `json:"live_status"` // same here
	Availability *string `json:"availability"` // same here
	ChannelUrl string `json:"channel_url"`
	UploaderUrl string `json:"uploader_url"`
	Creators []any `json:"creators"` // need to model soon enough.
	Channel string `json:"channel"`
	ChannelId string `json:"channel_id"`
	Uploader string `json:"uploader"`
	UploaderId string `json:"uploader_id"`
	IeKey string `json:"ie_key"`
}

type YtdlpThumbnailEntryModel struct {
	Url string `json:"url"`
	Height uint `json:"height"`
	Width uint `json:"width"`
}

type YtdlpPlaylistModel struct {
	Id string `json:"id"`
	Title string `json:"title"`
	Availability string `json:"availability"`
	ChannelFollowerCount uint `json:"channel_follower_count"`
	Description string `json:"description"`
	Thumbnails []YtdlpThumbnailModel `json:"thumbnails"`

	ModifiedDate string `json:"modified_date"`
	ViewCount uint `json:"view_count"`
	PlaylistCount uint `json:"playlist_count"`
	Channel string `json:"channel"`
	ChannelId string `json:"channel_id"`
	UploaderId string `json:"uploader_id"`
	Uploader string `json:"uploader"`
	ChannelUrl string `json:"channel_url"`
	UploaderUrl string `json:"uploader_url"`

	Type string `json:"_type"`
	Entries []YtdlpPlaylistEntriesModel `json:"entries"`
}

/** the schema i got from yt-dlp:

cmd: yt-dlp --flat-playlist -J --playlist-items 1 "https://www.youtube.com/playlist?list=PLLIRzpLTcEbn8IMkUnI9zN3szGQYNJWVt"

{
    "id": "PLLIRzpLTcEbn8IMkUnI9zN3szGQYNJWVt",
    "title": "ASMR",
    "availability": "unlisted",
    "channel_follower_count": null,
    "description": "",
    "tags": [],
    "thumbnails": [
        {
            "url": "https://i.ytimg.com/vi/mPZkdNFkNps/hqdefault.jpg?sqp=-oaymwEWCKgBEF5IWvKriqkDCQgBFQAAiEIYAQ==&rs=AOn4CLDjdvzCPe3tVAQjqN5Q-Jty95XHzQ",
            "height": 94,
            "width": 168,
            "id": "0",
            "resolution": "168x94"
        },
        {
            "url": "https://i.ytimg.com/vi/mPZkdNFkNps/hqdefault.jpg?sqp=-oaymwEWCMQBEG5IWvKriqkDCQgBFQAAiEIYAQ==&rs=AOn4CLCIbJoN0WdAXuzNfWEQKIEttGEfBA",
            "height": 110,
            "width": 196,
            "id": "1",
            "resolution": "196x110"
        },
        {
            "url": "https://i.ytimg.com/vi/mPZkdNFkNps/hqdefault.jpg?sqp=-oaymwEXCPYBEIoBSFryq4qpAwkIARUAAIhCGAE=&rs=AOn4CLCkkuQbo9OvHqI5V5S4PaUo9yoMmA",
            "height": 138,
            "width": 246,
            "id": "2",
            "resolution": "246x138"
        },
        {
            "url": "https://i.ytimg.com/vi/mPZkdNFkNps/hqdefault.jpg?sqp=-oaymwEXCNACELwBSFryq4qpAwkIARUAAIhCGAE=&rs=AOn4CLDFu8GrikTD-0x6niDEICw0ebj8Zg",
            "height": 188,
            "width": 336,
            "id": "3",
            "resolution": "336x188"
        }
    ],
    "modified_date": "20261124",
    "view_count": 2312,
    "playlist_count": 879,
    "channel": "yuyu",
    "channel_id": "UCtAtFodHMODWTBfbquris5Q",
    "uploader_id": "@yuyuqk",
    "uploader": "yuyu",
    "channel_url": "https://www.youtube.com/channel/UCtAtFodHMODWTBfbquris5Q",
    "uploader_url": "https://www.youtube.com/@yuyuqk",
    "_type": "playlist",
    "entries": [
        {
            "title": "Rain Sound On Window with Thunder SoundsㅣHeavy Rain for Sleep, Study and Relaxation, Meditation",
            "thumbnails": [
                {
                    "url": "https://i.ytimg.com/vi/mPZkdNFkNps/hqdefault.jpg?sqp=-oaymwEbCKgBEF5IVfKriqkDDggBFQAAiEIYAXABwAEG&rs=AOn4CLA58wtneVIekvHAeWDW3zoipN65MQ",
                    "height": 94,
                    "width": 168
                },
                {
                    "url": "https://i.ytimg.com/vi/mPZkdNFkNps/hqdefault.jpg?sqp=-oaymwEbCMQBEG5IVfKriqkDDggBFQAAiEIYAXABwAEG&rs=AOn4CLBae8KhgweMuzdEbpkGDPxAS8VcCA",
                    "height": 110,
                    "width": 196
                },
                {
                    "url": "https://i.ytimg.com/vi/mPZkdNFkNps/hqdefault.jpg?sqp=-oaymwEcCPYBEIoBSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLAOJlewiuJG4s4y8ZZepBlTj0Gp7g",
                    "height": 138,
                    "width": 246
                },
                {
                    "url": "https://i.ytimg.com/vi/mPZkdNFkNps/hqdefault.jpg?sqp=-oaymwEcCNACELwBSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLAFLNecf8KSWbX0YACd6ivujcMEKQ",
                    "height": 188,
                    "width": 336
                }
            ],
            "duration": 28814,
            "view_count": 143000000,
            "timestamp": null,
            "live_status": null,
            "availability": null,
            "channel_url": "https://www.youtube.com/channel/UChyRMEp8zRio9nFnAjvzSnA",
            "uploader_url": "https://www.youtube.com/@RelaxingAmbienceASMR",
            "creators": null,
            "channel": "Relaxing Ambience ASMR",
            "channel_id": "UChyRMEp8zRio9nFnAjvzSnA",
            "uploader": "Relaxing Ambience ASMR",
            "uploader_id": "@RelaxingAmbienceASMR",
            "ie_key": "Youtube",
            "id": "mPZkdNFkNps",
            "_type": "url",
            "url": "https://www.youtube.com/watch?v=mPZkdNFkNps",
            "__x_forwarded_for_ip": null
        }
    ],
    "extractor_key": "YoutubeTab",
    "extractor": "youtube:tab",
    "webpage_url": "https://www.youtube.com/playlist?list=PLLIRzpLTcEbn8IMkUnI9zN3szGQYNJWVt",
    "original_url": "https://www.youtube.com/playlist?list=PLLIRzpLTcEbn8IMkUnI9zN3szGQYNJWVt",
    "webpage_url_basename": "playlist",
    "webpage_url_domain": "youtube.com",
    "release_year": null,
    "requested_entries": [
        1
    ],
    "epoch": 1795535892,
    "__files_to_move": {},
    "_version": {
        "version": "2026.10.26",
        "current_git_head": null,
        "release_git_head": "c91f8de0bfb3577894abad716eaaa01659e6bd14",
        "repository": "yt-dlp/yt-dlp"
    }
}
*/
