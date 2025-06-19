const { addonBuilder, serveHTTP } = require("stremio-addon-sdk");

const manifest = {
    "id": "org.stremio.addon-latino-chile",
    "version": "1.1.0",
    "name": "Latino Chile Addon",
    "description": "Contenido en español latino optimizado para Chile - Películas y series familiares",
    "icon": "https://via.placeholder.com/256x256/FF6B6B/FFFFFF?text=CHILE",
    "background": "https://via.placeholder.com/1920x1080/4ECDC4/FFFFFF?text=LATINO+CHILE",
    "resources": ["catalog", "stream", "meta"],
    "types": ["movie", "series"],
    "catalogs": [
        {
            type: "movie",
            id: "peliculas-latino-cl",
            name: "Películas Latino",
            extra: [{ name: "genre", options: ["Acción", "Comedia", "Drama", "Animación", "Aventura", "Familiar"] }]
        },
        {
            type: "series",
            id: "series-latino-cl",
            name: "Series Latino",
            extra: [{ name: "genre", options: ["Comedia", "Animación", "Familiar", "Drama"] }]
        }
    ],
    "idPrefixes": ["latino_", "tt"],
    "behaviorHints": {
        "adult": false,
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
        background: "https://images.justwatch.com/backdrop/178788925/s1920/shrek.jpg",
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
        background: "https://images.justwatch.com/backdrop/178788939/s1920/shrek-the-third.jpg",
        runtime: "93 min",
        imdbRating: "6.1",
        url: "https://cdn-0f49rzor22huapc5.orbitcache.com/engine/hls2/01/14644/vfljg1suakn9_,n,.urlset/master.m3u8?t=ZNhCNOufCq_BKoJG1Q91_Nj_ZCCRvdwQsQU9Uti8axI&s=1750296087&e=14400&f=73222427&node=SZHSsRvkCzi+vj394EwIn1FNSsrLyGHN5gEj3UffCak=&i=0.1&sp=2500&asn=27901&q=n&rq=bdWrKTGTzuSGnyAY43XlyDRy9j9BCgHI7PooRiw1",
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
        year: 1971,
        director: "Roberto Gómez Bolaños",
        cast: ["Roberto Gómez Bolaños", "Ramón Valdés", "Carlos Villagrán", "María Antonieta de las Nieves"],
        description: "Las aventuras de un niño huérfano que vive en una vecindad y sus travesuras con los demás habitantes del lugar.",
        poster: "https://m.media-amazon.com/images/M/MV5BNzA4Zjk3NzktYWU0ZC00YWQyLWFkYTYtOGM4OTJlYWRhYzEyXkEyXkFqcGdeQXVyNzI1NzMxNzM@._V1_SX300.jpg",
        background: "https://m.media-amazon.com/images/M/MV5BNzA4Zjk3NzktYWU0ZC00YWQyLWFkYTYtOGM4OTJlYWRhYzEyXkEyXkFqcGdeQXVyNzI1NzMxNzM@._V1_SX300.jpg",
        imdbRating: "8.5",
        language: "Latino"
    },
    "tt0229889:1:1": {
        id: "tt0229889:1:1",
        type: "series",
        name: "Los Dulces Prohibidos",
        genre: ["Comedia", "Familiar"],
        year: 1971,
        episode: 1,
        season: 1,
        seriesId: "tt0229889",
        seriesName: "El Chavo del 8",
        description: "En este primer episodio, el Chavo se mete en problemas cuando encuentra unos dulces y no sabe de quién son.",
        poster: "https://m.media-amazon.com/images/M/MV5BNzA4Zjk3NzktYWU0ZC00YWQyLWFkYTYtOGM4OTJlYWRhYzEyXkEyXkFqcGdeQXVyNzI1NzMxNzM@._V1_SX300.jpg",
        runtime: "30 min",
        infoHash: "1956751B7227B131471EBDD41F9AA2536613A376",
        magnetUri: "magnet:?xt=urn:btih:1956751B7227B131471EBDD41F9AA2536613A376&dn=The.avengers.2012.1080p-dual-lat.mp4&tr=udp%3a%2f%2ftracker.opentrackr.org%3a1337%2fannounce",
        sources: ["dht:1956751B7227B131471EBDD41F9AA2536613A376"],
        quality: "1080p",
        language: "Latino"
    },
    "tt0229889:1:2": {
        id: "tt0229889:1:2",
        type: "series",
        name: "El Cumpleaños de la Chilindrina",
        genre: ["Comedia", "Familiar"],
        year: 1971,
        episode: 2,
        season: 1,
        seriesId: "tt0229889",
        seriesName: "El Chavo del 8",
        description: "Es el cumpleaños de la Chilindrina y todos los niños de la vecindad están invitados a la fiesta, excepto el Chavo.",
        poster: "https://m.media-amazon.com/images/M/MV5BNzA4Zjk3NzktYWU0ZC00YWQyLWFkYTYtOGM4OTJlYWRhYzEyXkEyXkFqcGdeQXVyNzI1NzMxNzM@._V1_SX300.jpg",
        runtime: "30 min",
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        quality: "720p",
        language: "Latino"
    },
    "tt0229889:1:3": {
        id: "tt0229889:1:3",
        type: "series",
        name: "El Juego de Béisbol",
        genre: ["Comedia", "Familiar"],
        year: 1971,
        episode: 3,
        season: 1,
        seriesId: "tt0229889",
        seriesName: "El Chavo del 8",
        description: "Los niños de la vecindad deciden jugar béisbol en el patio. El Chavo, como siempre, quiere participar pero no sabe muy bien las reglas del juego.",
        poster: "https://m.media-amazon.com/images/M/MV5BNzA4Zjk3NzktYWU0ZC00YWQyLWFkYTYtOGM4OTJlYWRhYzEyXkEyXkFqcGdeQXVyNzI1NzMxNzM@._V1_SX300.jpg",
        runtime: "30 min",
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        quality: "720p",
        language: "Latino"
    }
};

const generateMetaPreview = (value, key) => {
    const baseId = key.split(":")[0];
    return {
        id: baseId,
        type: value.type,
        name: value.seriesName || value.name,
        genre: value.genre,
        year: value.year,
        poster: value.poster,
        posterShape: "poster",
        background: value.background,
        description: value.description,
        imdbRating: value.imdbRating,
        language: value.language
    };
};

const generateMeta = (value, key) => {
    const meta = generateMetaPreview(value, key);
    meta.director = value.director;
    meta.cast = value.cast;
    meta.runtime = value.runtime;
    meta.country = "Estados Unidos";
    meta.language = "Español Latino";
    
    if (value.type === "series") {
        const seriesEpisodes = Object.entries(dataset)
            .filter(([k, v]) => v.seriesId === value.seriesId && k.includes(":"))
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
        
        meta.videos = seriesEpisodes;
    }
    
    return meta;
};

const getStreamQuality = (item) => {
    if (item.quality) return item.quality;
    if (item.url && item.url.includes('1080p')) return '1080p';
    if (item.url && item.url.includes('720p')) return '720p';
    return 'SD';
};

const builder = new addonBuilder(manifest);

builder.defineStreamHandler((args) => {
    if (dataset[args.id]) {
        const item = dataset[args.id];
        const quality = getStreamQuality(item);
        
        const stream = {
            title: `${item.name} - ${quality} Latino`,
            url: item.url,
            infoHash: item.infoHash,
            sources: item.sources
        };
        
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
        
        Object.keys(stream).forEach(key => {
            if (stream[key] === undefined) delete stream[key];
        });
        
        return Promise.resolve({ streams: [stream] });
    }
    
    return Promise.resolve({ streams: [] });
});

builder.defineCatalogHandler((args) => {
    const skip = parseInt(args.extra?.skip) || 0;
    const limit = 20;
    
    let filteredItems = Object.entries(dataset)
        .filter(([key, value]) => {
            if (value.type !== args.type) return false;
            if (value.type === "series" && key.includes(":")) return false;
            
            if (args.extra && args.extra.genre) {
                return value.genre && value.genre.some(g => 
                    g.toLowerCase().includes(args.extra.genre.toLowerCase()) ||
                    args.extra.genre.toLowerCase().includes(g.toLowerCase())
                );
            }
            
            return true;
        });
    
    const paginatedItems = filteredItems
        .slice(skip, skip + limit)
        .map(([key, value]) => generateMetaPreview(value, key));
    
    return Promise.resolve({ metas: paginatedItems });
});

builder.defineMetaHandler((args) => {
    let item = Object.entries(dataset).find(([key, value]) => key === args.id);
    
    if (!item) {
        item = Object.entries(dataset).find(([key, value]) => {
            const baseId = key.split(":")[0];
            return baseId === args.id || value.seriesId === args.id;
        });
    }
    
    if (item) {
        const [key, value] = item;
        const meta = generateMeta(value, key);
        return Promise.resolve({ meta: meta });
    }
    
    return Promise.resolve({ meta: null });
});

const addonInterface = builder.getInterface();
const port = process.env.PORT || 3000;

serveHTTP(addonInterface, { port }).then(() => {
    console.log(`🚀 Addon Latino Chile iniciado en puerto ${port}`);
    console.log(`📱 Manifest: http://localhost:${port}/manifest.json`);
    console.log(`🎬 Películas: ${Object.values(dataset).filter(v => v.type === 'movie').length}`);
    console.log(`📺 Series: ${Object.values(dataset).filter(v => v.type === 'series' && !v.id.includes(':')).length}`);
}).catch(console.error);

process.on('SIGINT', () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));