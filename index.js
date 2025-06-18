const { addonBuilder } = require("stremio-addon-sdk");
const magnet = require("magnet-uri");

const manifest = {
    id: "org.stremio.exampleaddon",
    version: "1.0.0",
    name: "Ejemplo Addon",
    description: "Addon de ejemplo con una serie y dos películas",
    resources: ["catalog", "stream"],
    types: ["movie", "series"],
    catalogs: [
        { type: "movie", id: "ejemplopeliculas" },
        { type: "series", id: "ejemploseries" }
    ],
    idPrefixes: ["tt"]
};

const dataset = {
    "tt0000001": { name: "Película Directa", type: "movie", url: "https://www.w3schools.com/html/mov_bbb.mp4" },
    "tt0000002": { name: "Película Torrent", type: "movie", infoHash: "24c8802e2624e17d46cd555f364debd949f2c81e", fileIdx: 0 },
    "tt0000003:1:1": { name: "Serie Demo - Episodio 1", type: "series", url: "https://www.w3schools.com/html/movie.mp4" },
    "tt0000003:1:2": { name: "Serie Demo - Episodio 2", type: "series", url: "https://www.w3schools.com/html/mov_bbb.mp4" }
};

const builder = new addonBuilder(manifest);

builder.defineStreamHandler(function(args) {
    if (dataset[args.id]) {
        return Promise.resolve({ streams: [dataset[args.id]] });
    } else {
        return Promise.resolve({ streams: [] });
    }
});

const METAHUB_URL = "https://images.metahub.space";

const generateMetaPreview = function(value, key) {
    const imdbId = key.split(":")[0];
    return {
        id: imdbId,
        type: value.type,
        name: value.name,
        poster: METAHUB_URL + "/poster/medium/" + imdbId + "/img"
    };
};

builder.defineCatalogHandler(function(args) {
    const metas = Object.entries(dataset)
        .filter(([_, value]) => value.type === args.type)
        .map(([key, value]) => generateMetaPreview(value, key));
    return Promise.resolve({ metas: metas });
});

module.exports = builder.getInterface();
