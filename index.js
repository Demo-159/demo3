const { addonBuilder, serveHTTP } = require("stremio-addon-sdk");

const manifest = {
    "id": "org.stremio.addon-latino-chile",
    "version": "1.1.0",
    "name": "Reproducir ahora",
    "description": "Contenido en español latino - Películas y series",
    "icon": "https://us.123rf.com/450wm/vladwel/vladwel1702/vladwel170200039/71606485-ilustraci%C3%B3n-de-vector-de-claqueta-aislada-sobre-fondo-de-color-azul-icono-de-claqueta-de-estilo.jpg?ver=6",
    "resources": ["catalog", "stream", "meta"],
    "types": ["movie", "series"],
    "catalogs": [
        {
            type: "movie",
            id: "peliculas-latino-cl",
            name: "Recomendación",
            extra: [{ name: "genre", options: ["Acción", "Comedia", "Drama", "Animación", "Aventura", "Familiar"] }]
        },
        {
            type: "series",
            id: "series-latino-cl",
            name: "Recomendación",
            extra: [{ name: "genre", options: ["Comedia", "Animación", "Familiar", "Drama"] }]
        }
    ],
    "idPrefixes": ["latino_", "tt"],
    "behaviorHints": {
        "adult": true,
        "p2p": true,
        "configurable": false,
        "configurationRequired": false
    }
};

const dataset = {
    "tt0126029": {
        id: "tt0126029",
        type: "movie",
        name: "Shrek",
        genre: ["Comedia", "Animación", "Aventura", "Familiar"],
        year: 2001,
        director: "Andrew Adamson, Vicky Jenson",
        cast: ["Mike Myers", "Eddie Murphy", "Cameron Díaz", "John Lithgow"],
        description: "Un ogro malhumorado vive tranquilo en su pantano hasta que un día su preciada soledad se ve interrumpida por una invasión de personajes de cuentos de hadas que han sido exiliados de su reino por el malvado Lord Farquaad.",
        poster: "https://m.media-amazon.com/images/M/MV5BOWIzMmI4ZDktZTNmZS00YzQ4LWFhYzgtNWQ4YjgwMGJhNDYwXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
        background: "https://m.media-amazon.com/images/M/MV5BMjAwOTY3ODAzNl5BMl5BanBnXkFtZTcwNjYzNDc3Mw@@._V1_.jpg",
        runtime: "90 min",
        imdbRating: "7.9",
        url: "https://archive.org/download/dercro-2040/DERCRO2040.mkv",
        quality: "1080p",
        language: "Latino"
    },
    "tt0298148": {
        id: "tt0298148",
        type: "movie",
        name: "Shrek 2",
        genre: ["Comedia", "Animación", "Aventura", "Familiar"],
        year: 2004,
        director: "Andrew Adamson, Kelly Asbury, Conrad Vernon",
        cast: ["Mike Myers", "Eddie Murphy", "Cameron Díaz", "Julie Andrews"],
        description: "Shrek y Fiona regresan de su luna de miel para recibir una invitación de los padres de Fiona para cenar en el Reino de Muy Muy Lejano.",
        poster: "https://m.media-amazon.com/images/M/MV5BZTdkZmJkNDAtYTAzZS00NDc4LTkzOGMtMDNmMTUzZWRhYjk3XkEyXkFqcGc@._V1_.jpg",
        background: "https://m.media-amazon.com/images/M/MV5BMjIwNzUxMzEzNF5BMl5BanBnXkFtZTcwNjA5MzYyMw@@._V1_.jpg",
        runtime: "93 min",
        imdbRating: "7.3",
        url: "https://archive.org/download/THREN/THREN.mkv",
        quality: "1080p",
        language: "Latino"
    },
    "tt0413267": {
        id: "tt0413267",
        type: "movie",
        name: "Shrek Tercero",
        genre: ["Comedia", "Animación", "Aventura", "Familiar"],
        year: 2007,
        director: "Chris Miller, Raman Hui",
        cast: ["Mike Myers", "Cameron Díaz", "Eddie Murphy", "Antonio Banderas"],
        description: "Cuando el Rey Harold de Muy Muy Lejano se encuentra en su lecho de muerte, Shrek debe encontrar a un heredero para el trono o se convertirá en el nuevo rey.",
        poster: "https://m.media-amazon.com/images/M/MV5BOTgyMjc3ODk2MV5BMl5BanBnXkFtZTcwMjY0MjEzMw@@._V1_FMjpg_UX1000_.jpg",
        background: "https://m.media-amazon.com/images/M/MV5BMTI4MTM0MDg3Ml5BMl5BanBnXkFtZTcwMzQzNDYyMw@@._V1_.jpg",
        runtime: "93 min",
        imdbRating: "6.1",
        url: "https://ia600600.us.archive.org/12/items/shrek3_202506/XDFR.mp4",
        quality: "1080p",
        language: "Latino"
    },
    "tt0892791": {
        id: "tt0892791",
        type: "movie",
        name: "Shrek Para Siempre",
        genre: ["Comedia", "Animación", "Aventura", "Familiar"],
        year: 2010,
        director: "Mike Mitchell",
        cast: ["Mike Myers", "Cameron Díaz", "Eddie Murphy", "Antonio Banderas"],
        description: "Shrek está pasando por una crisis de la mediana edad. Ya no se siente como un verdadero ogro aterrador, sino como un padre de familia domesticado.",
        poster: "https://m.media-amazon.com/images/M/MV5BNzBlODkyNGYtYzBmNC00MGJjLThmOGUtNjUzZDc4YzBjYzVkXkEyXkFqcGc@._V1_.jpg",
        background: "https://m.media-amazon.com/images/M/MV5BMTI4MDQ2NjY4OV5BMl5BanBnXkFtZTcwNjQxMDUzMw@@._V1_.jpg",
        runtime: "93 min",
        imdbRating: "6.3",
        url: "https://archive-video-proxy.davidmonrroy7.workers.dev/shrek-para-siempre-2010",
        quality: "1080p",
        language: "Latino"
    },
    "tt0229889": {
        id: "tt0229889",
        type: "series",
        name: "El Chavo del 8",
        seriesId: "tt0229889",
        seriesName: "El Chavo del 8",
        genre: ["Comedia", "Familiar"],
        year: "1971",
        director: "Roberto Gómez Bolaños",
        cast: ["Roberto Gómez Bolaños", "Ramón Valdés", "Carlos Villagrán", "María Antonieta de las Nieves"],
        description: "Las aventuras de un niño huérfano que vive en una vecindad y sus travesuras con los demás habitantes del lugar.",
        poster: "https://images.sr.roku.com/idType/roku/context/global/id/aac4ecd26e9153c49b232aac064cecca/rokuFeed/assets/842e678ebeda580e8d8c527970f63f95.jpg/magic/800x0/filters:quality(100)",
        background: "https://m.media-amazon.com/images/M/MV5BNjQwNjlkOGUtMzhhMi00N2NjLTk0ZTMtODhkM2IzOTVlNWUzXkEyXkFqcGc@._V1_QL75_UX820_.jpg",
        imdbRating: "8.5",
        language: "Latino"
    },
    "tt0229889:1:1": {
        id: "tt0229889:1:1",
        type: "series",
        name: "El Ropavejero",
        genre: ["Comedia", "Familiar"],
        year: 1971,
        episode: 1,
        season: 1,
        seriesId: "tt0229889",
        seriesName: "El Chavo del 8",
        description: "Don Ramón asusta a la Chilindrina con el ropavejero para que tome su medicina, pero El Chavo lo cree real y la ayuda a esconderse, causando enredos en la vecindad.",
        poster: "https://archive.org/download/El-Chavo-Del-8-1971/El-Chavo-Del-8-1971.thumbs/001%20El%20Ropavejero_000001.jpg",
        runtime: "8 min",
        url: "https://ia802309.us.archive.org/35/items/El-Chavo-Del-8-1971/001%20El%20Ropavejero.mp4",
        quality: "1080p",
        language: "Latino"
    },
    "tt0229889:1:2": {
        id: "tt0229889:1:2",
        type: "series",
        name: "El Peso de Quico",
        genre: ["Comedia", "Familiar"],
        year: 1971,
        episode: 2,
        season: 1,
        seriesId: "tt0229889",
        seriesName: "El Chavo del 8",
        description: "El Chavo encuentra un peso que resulta ser de Quico, pero la Chilindrina se lo quita, causando peleas hasta que Don Ramón lo arregla.",
        poster: "https://archive.org/download/El-Chavo-Del-8-1971/El-Chavo-Del-8-1971.thumbs/002%20El%20Peso_000508.jpg",
        runtime: "8 min",
        url: "https://dn720307.ca.archive.org/0/items/El-Chavo-Del-8-1971/002%20El%20Peso.mp4",
        quality: "720p",
        language: "Latino"
    },
    "tt0229889:1:3": {
        id: "tt0229889:1:3",
        type: "series",
        name: "La Fiesta de la Buena Vecindad",
        genre: ["Comedia", "Familiar"],
        year: 1971,
        episode: 3,
        season: 1,
        seriesId: "tt0229889",
        seriesName: "El Chavo del 8",
        description: "La vecindad organiza una fiesta de la buena vecindad, pero todo termina en caos por las travesuras del Chavo y sus amigos.",
        poster: "https://archive.org/download/El-Chavo-Del-8-1971/El-Chavo-Del-8-1971.thumbs/003%20La%20Fiesta%20De%20La%20Buena%20Vecindad_000001.jpg",
        runtime: "15 min",
        url: "https://dn720307.ca.archive.org/0/items/El-Chavo-Del-8-1971/003%20La%20Fiesta%20De%20La%20Buena%20Vecindad.mp4",
        quality: "720p",
        language: "Latino"
    }
};

// Utilidades
const extractBaseId = (key) => key.split(":")[0];
const isEpisode = (key) => key.includes(":");
const getQuality = (item) => item.quality || (item.url?.includes('1080p') ? '1080p' : item.url?.includes('720p') ? '720p' : 'SD');

// Generadores de metadata
const createMetaPreview = (item, key) => ({
    id: extractBaseId(key),
    type: item.type,
    name: item.seriesName || item.name,
    genre: item.genre,
    year: item.year,
    poster: item.poster,
    posterShape: "poster",
    background: item.background,
    description: item.description,
    imdbRating: item.imdbRating,
    language: item.language
});

const createFullMeta = (item, key) => {
    const meta = createMetaPreview(item, key);
    
    Object.assign(meta, {
        director: item.director,
        cast: item.cast,
        runtime: item.runtime,
        language: "Español Latino"
    });
    
    if (item.type === "series") {
        meta.videos = Object.entries(dataset)
            .filter(([k, v]) => v.seriesId === item.seriesId && isEpisode(k))
            .sort((a, b) => {
                const [aSeason, aEpisode] = [parseInt(a[0].split(":")[1]), parseInt(a[0].split(":")[2])];
                const [bSeason, bEpisode] = [parseInt(b[0].split(":")[1]), parseInt(b[0].split(":")[2])];
                return aSeason !== bSeason ? aSeason - bSeason : aEpisode - bEpisode;
            })
            .map(([k, v]) => ({
                id: k,
                title: `S${v.season}E${v.episode} - ${v.name}`,
                season: v.season,
                episode: v.episode,
                overview: v.description,
                released: new Date(v.year, 0, 1).toISOString(),
                thumbnail: v.poster
            }));
    }
    
    return meta;
};

const createStream = (item) => {
    const stream = {
        title: `${item.name} - ${getQuality(item)} Latino`
    };
    
    // Agregar fuente de video
    if (item.url) stream.url = item.url;
    if (item.infoHash) stream.infoHash = item.infoHash;
    if (item.sources) stream.sources = item.sources;
    
    // Configurar comportamiento
    if (item.url) {
        stream.behaviorHints = {
            notWebReady: false,
            bingeGroup: item.seriesId || item.id,
            countryWhitelist: ['CL', 'AR', 'MX', 'CO', 'PE', 'UY', 'EC', 'BO', 'PY']
        };
        
        stream.httpHeaders = {
            'User-Agent': 'Stremio/4.4.106',
            'Accept': '*/*',
            'Accept-Language': 'es-CL,es;q=0.9',
            'Referer': 'https://app.strem.io/'
        };
    }
    
    if (item.infoHash) {
        stream.behaviorHints = { p2p: true };
    }
    
    return stream;
};

// Builders del addon
const builder = new addonBuilder(manifest);

builder.defineStreamHandler(({ id }) => {
    const item = dataset[id];
    return Promise.resolve({
        streams: item ? [createStream(item)] : []
    });
});

builder.defineCatalogHandler((args) => {
    const skip = parseInt(args.extra?.skip) || 0;
    const limit = 20;
    
    const items = Object.entries(dataset)
        .filter(([key, value]) => {
            if (value.type !== args.type || (value.type === "series" && isEpisode(key))) return false;
            
            if (args.extra?.genre) {
                return value.genre?.some(g => 
                    g.toLowerCase().includes(args.extra.genre.toLowerCase()) ||
                    args.extra.genre.toLowerCase().includes(g.toLowerCase())
                );
            }
            
            return true;
        })
        .slice(skip, skip + limit)
        .map(([key, value]) => createMetaPreview(value, key));
    
    return Promise.resolve({ metas: items });
});

builder.defineMetaHandler(({ id }) => {
    let item = Object.entries(dataset).find(([key]) => key === id);
    
    if (!item) {
        item = Object.entries(dataset).find(([key, value]) => 
            extractBaseId(key) === id || value.seriesId === id
        );
    }
    
    return Promise.resolve({
        meta: item ? createFullMeta(item[1], item[0]) : null
    });
});

// Servidor
const port = process.env.PORT || 3000;

serveHTTP(builder.getInterface(), { port })
    .then(() => {
        console.log(`🚀 Addon Latino Chile iniciado en puerto ${port}`);
        console.log(`📱 Manifest: http://localhost:${port}/manifest.json`);
        console.log(`🎬 Películas: ${Object.values(dataset).filter(v => v.type === 'movie').length}`);
        console.log(`📺 Series: ${Object.values(dataset).filter(v => v.type === 'series' && !v.id.includes(':')).length}`);
    })
    .catch(console.error);

// Manejo de señales
['SIGINT', 'SIGTERM'].forEach(signal => {
    process.on(signal, () => process.exit(0));
});