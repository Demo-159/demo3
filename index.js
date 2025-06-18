const { addonBuilder, serveHTTP } = require("stremio-addon-sdk");
const magnet = require("magnet-uri");

// Configuración del addon
const manifest = {
    "id": "org.demo.stremio-addon",
    "version": "1.0.0",
    "name": "Demo Stremio Addon",
    "description": "Addon de demostración con películas y series",
    "icon": "https://via.placeholder.com/256x256/FF6B6B/FFFFFF?text=DEMO",
    "background": "https://via.placeholder.com/1920x1080/4ECDC4/FFFFFF?text=DEMO+ADDON",
    
    // Recursos que proporcionará el addon
    "resources": [
        "catalog",
        "stream",
        "meta"
    ],
    
    // Tipos de contenido soportados
    "types": ["movie", "series"],
    
    // Catálogos disponibles
    "catalogs": [
        {
            type: "movie",
            id: "demo-movies",
            name: "Demo Movies",
            extra: [
                {
                    name: "genre",
                    options: ["Action", "Comedy", "Drama", "Horror", "Sci-Fi"]
                }
            ]
        },
        {
            type: "series",
            id: "demo-series", 
            name: "Demo Series",
            extra: [
                {
                    name: "genre",
                    options: ["Comedia", "Animación", "Aventura", "Familiar", "Terror"]
                }
            ]
        }
    ],
    
    // Prefijos de IDs soportados
    "idPrefixes": ["demo_", "tt"],
    
    // Configuración del comportamiento
    "behaviorHints": {
        "adult": false,
        "p2p": true,
        "configurable": true
    }
};

// Base de datos de contenido
const dataset = {
    // Películas
    "demo_movie_1": {
        id: "demo_movie_1",
        type: "movie",
        name: "Shrek",
        genre: ["Comedia", "Animación", "Aventura", "Familiar"],
        year: 2001,
        director: "Andrew Adamson, Vicky Jenson",
        cast: ["Mike Myers", "Eddie Murphy", "Cameron Diaz", "John Lithgow"],
        description: "A mean lord exiles fairytale creatures to the swamp of a grumpy ogre, who must go on a quest and rescue a princess for the lord in order to get his land back.",
        poster: "https://m.media-amazon.com/images/M/MV5BOGZhM2FhNTItODAzNi00YjA0LWEyN2UtNjJlYWQzYzU1MDg5L2ltYWdlL2ltYWdlXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg",
        background: "https://images.justwatch.com/backdrop/178788925/s1920/shrek.jpg",
        logo: "https://logoeps.com/wp-content/uploads/2013/12/shrek-vector-logo.png",
        runtime: "90 min",
        // Stream directo de Pixeldrain
        url: "https://archive-video-proxy.davidmonrroy7.workers.dev/",
        title: "Shrek (2001)"
    },
    
    "demo_movie_2": {
        id: "demo_movie_2", 
        type: "movie",
        name: "Shrek 2",
        genre: ["Comedia", "Animación", "Aventura", "Familiar"],
        year: 2004,
        director: "Andrew Adamson, Kelly Asbury, Conrad Vernon",
        cast: ["Mike Myers", "Eddie Murphy", "Cameron Diaz", "Julie Andrews"],
        description: "Shrek and Fiona travel to the Kingdom of Far Far Away, where Fiona's parents are King and Queen, to celebrate their marriage. When they arrive, they find they are not as welcome as they thought they would be.",
        poster: "https://m.media-amazon.com/images/M/MV5BMDJhMGRjN2QtNDUxYy00NGM3LWI3MjUtMTMzZDU0OWJiOTQ4XkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg",
        background: "https://images.justwatch.com/backdrop/178788932/s1920/shrek-2.jpg",
        logo: "https://logoeps.com/wp-content/uploads/2013/12/shrek-2-vector-logo.png",
        runtime: "93 min",
        // Stream directo de Pixeldrain
        url: "https://store-na-phx-1.gofile.io/download/web/37817e78-be2e-49b9-b5b4-90339fbde307/Shrek.2001.1080p-dual-lat.mp4",
        title: "Shrek 2 (2004)"
    },

"tt0892791": {
    id: "tt0892791",
    type: "movie",
    name: "Shrek Para Siempre",
    genre: ["Comedia", "Animación", "Aventura", "Familiar"],
    year: 2010,
    director: "Mike Mitchell",
    cast: ["Mike Myers", "Cameron Diaz", "Eddie Murphy", "Antonio Banderas"],
    description: "Rumpelstiltskin engaña a Shrek, quien atraviesa una crisis de la mediana edad, para que desee nunca haber nacido. Así, Shrek queda atrapado en una realidad alterna donde Rumpel gobierna con puño de hierro y nadie lo recuerda.",
    poster: "https://m.media-amazon.com/images/M/MV5BNjA0MjYyOTU3MF5BMl5BanBnXkFtZTcwMTg1MjY0Mw@@._V1_SX300.jpg",
    background: "https://images.justwatch.com/backdrop/10890619/s1920/shrek-forever-after",
    logo: "https://seeklogo.com/images/S/shrek-forever-after-logo-689A537D1C-seeklogo.com.png",
    runtime: "93 min",
    url: "https://archive-video-proxy.davidmonrroy7.workers.dev/",
    title: "Shrek Para Siempre (2010)"
},
    
    // El Chavo del 8 - Episodio 1 con tu magnet link
    "tt0229889:1:1": {
        id: "tt0229889:1:1",
        type: "series",
        name: "El Chavo del 8 - Episodio 1",
        genre: ["Comedy", "Family"],
        year: 1971,
        episode: 1,
        season: 1,
        seriesId: "tt0229889",
        seriesName: "El Chavo del 8",
        description: "Primer episodio de la icónica serie mexicana de comedia protagonizada por Roberto Gómez Bolaños 'Chespirito'.",
        poster: "https://m.media-amazon.com/images/M/MV5BNzA4Zjk3NzktYWU0ZC00YWQyLWFkYTYtOGM4OTJlYWRhYzEyXkEyXkFqcGdeQXVyNzI1NzMxNzM@._V1_SX300.jpg",
        background: "https://m.media-amazon.com/images/M/MV5BNzA4Zjk3NzktYWU0ZC00YWQyLWFkYTYtOGM4OTJlYWRhYzEyXkEyXkFqcGdeQXVyNzI1NzMxNzM@._V1_SX300.jpg",
        runtime: "30 min",
        // Tu magnet link para The Avengers 2012
        infoHash: "1956751B7227B131471EBDD41F9AA2536613A376",
        magnetUri: "magnet:?xt=urn:btih:1956751B7227B131471EBDD41F9AA2536613A376&dn=The.avengers.2012.1080p-dual-lat.mp4&tr=udp%3a%2f%2ftracker.opentrackr.org%3a1337%2fannounce&tr=udp%3a%2f%2fopen.demonii.com%3a1337%2fannounce&tr=udp%3a%2f%2fopen.stealth.si%3a80%2fannounce&tr=udp%3a%2f%2ftracker.torrent.eu.org%3a451%2fannounce&tr=udp%3a%2f%2fexplodie.org%3a6969%2fannounce",
        sources: ["dht:1956751B7227B131471EBDD41F9AA2536613A376"],
        title: "1080p Dual Latino"
    },
    
    "tt0229889:1:2": {
        id: "tt0229889:1:2",
        type: "series", 
        name: "El Chavo del 8 - Episodio 2",
        genre: ["Comedy", "Family"],
        year: 1971,
        episode: 2,
        season: 1,
        seriesId: "tt0229889",
        seriesName: "El Chavo del 8",
        description: "Segundo episodio de la serie donde El Chavo continúa con sus travesuras en la vecindad.",
        poster: "https://m.media-amazon.com/images/M/MV5BNzA4Zjk3NzktYWU0ZC00YWQyLWFkYTYtOGM4OTJlYWRhYzEyXkEyXkFqcGdeQXVyNzI1NzMxNzM@._V1_SX300.jpg",
        background: "https://m.media-amazon.com/images/M/MV5BNzA4Zjk3NzktYWU0ZC00YWQyLWFkYTYtOGM4OTJlYWRhYzEyXkEyXkFqcGdeQXVyNzI1NzMxNzM@._V1_SX300.jpg",
        runtime: "30 min",
        // URL de ejemplo - reemplazar con stream real
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"
    },
    
    "tt0229889:1:3": {
        id: "tt0229889:1:3",
        type: "series", 
        name: "El Chavo del 8 - Episodio 3",
        genre: ["Comedy", "Family"],
        year: 1971,
        episode: 3,
        season: 1,
        seriesId: "tt0229889",
        seriesName: "El Chavo del 8",
        description: "Tercer episodio donde conocemos más sobre los personajes de la vecindad y sus divertidas situaciones.",
        poster: "https://m.media-amazon.com/images/M/MV5BNzA4Zjk3NzktYWU0ZC00YWQyLWFkYTYtOGM4OTJlYWRhYzEyXkEyXkFqcGdeQXVyNzI1NzMxNzM@._V1_SX300.jpg",
        background: "https://m.media-amazon.com/images/M/MV5BNzA4Zjk3NzktYWU0ZC00YWQyLWFkYTYtOGM4OTJlYWRhYzEyXkEyXkFqcGdeQXVyNzI1NzMxNzM@._V1_SX300.jpg",
        runtime: "30 min",
        // URL de ejemplo - reemplazar con stream real
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
    }
};

// Función para generar metadatos del catálogo
const generateMetaPreview = function(value, key) {
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
        logo: value.logo,
        description: value.description
    };
};

// Función para generar metadatos completos
const generateMeta = function(value, key) {
    const meta = generateMetaPreview(value, key);
    
    // Agregar información adicional para meta completa
    meta.director = value.director;
    meta.cast = value.cast;
    meta.runtime = value.runtime;
    meta.country = "Demo Country";
    meta.language = "en";
    meta.awards = "Demo Award";
    meta.website = "https://github.com/tu-usuario/stremio-demo-addon";
    
    // Para series, agregar información de videos
    if (value.type === "series") {
        const seriesEpisodes = Object.entries(dataset)
            .filter(([k, v]) => v.seriesId === value.seriesId)
            .map(([k, v]) => ({
                id: k,
                title: v.name,
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

// Crear el builder del addon
const builder = new addonBuilder(manifest);

// Manejador de streams
builder.defineStreamHandler(function(args) {
    console.log("Stream request for:", args.id);
    
    if (dataset[args.id]) {
        const item = dataset[args.id];
        
        // Configuración base del stream
        const stream = {
            title: item.title || "Demo Stream",
            url: item.url,
            infoHash: item.infoHash,
            sources: item.sources
        };
        
        // Configuraciones especiales para Pixeldrain
        if (item.url && item.url.includes('pixeldrain.com')) {
            stream.behaviorHints = {
                notWebReady: false,
                bingeGroup: item.id
            };
            
            // Headers adicionales para Pixeldrain
            stream.httpHeaders = {
                'User-Agent': 'Stremio/4.4.0',
                'Accept': '*/*',
                'Accept-Language': 'en-US,en;q=0.9',
                'Referer': 'https://pixeldrain.com/',
                'Origin': 'https://pixeldrain.com'
            };
            
            console.log("Pixeldrain stream configured with headers");
        }
        
        // Si hay un magnet URI, agregarlo como información adicional
        if (item.magnetUri) {
            console.log("Magnet URI available:", item.magnetUri);
            // El infoHash y sources ya están configurados para torrents
        }
        
        // Limpiar propiedades undefined
        Object.keys(stream).forEach(key => {
            if (stream[key] === undefined) {
                delete stream[key];
            }
        });
        
        console.log("Stream found:", stream);
        return Promise.resolve({ streams: [stream] });
    } else {
        console.log("No stream found for:", args.id);
        return Promise.resolve({ streams: [] });
    }
});

// Manejador de catálogos
builder.defineCatalogHandler(function(args) {
    console.log("Catalog request:", args);
    
    const metas = Object.entries(dataset)
        .filter(([key, value]) => {
            // Filtrar por tipo
            if (value.type !== args.type) return false;
            
            // Para series, solo mostrar un meta por serie (no por episodio) 
            if (value.type === "series" && key !== value.seriesId + ":1:1") {
                return false;
            }
            
            // Filtrar por género si se especifica
            if (args.extra && args.extra.genre) {
                return value.genre && value.genre.includes(args.extra.genre);
            }
            
            return true;
        })
        .map(([key, value]) => generateMetaPreview(value, key));
    
    console.log("Catalog metas:", metas.length);
    return Promise.resolve({ metas: metas });
});

// Manejador de metadatos
builder.defineMetaHandler(function(args) {
    console.log("Meta request for:", args.id);
    
    // Buscar el item por ID base
    const item = Object.entries(dataset).find(([key, value]) => {
        const baseId = key.split(":")[0];
        return baseId === args.id || value.seriesId === args.id;
    });
    
    if (item) {
        const [key, value] = item;
        const meta = generateMeta(value, key);
        console.log("Meta found:", meta.name);
        return Promise.resolve({ meta: meta }); 
    } else {
        console.log("No meta found for:", args.id);
        return Promise.resolve({ meta: null });
    }
});

// Configurar el servidor
const addonInterface = builder.getInterface();

// Iniciar servidor
const port = process.env.PORT || 3000;
serveHTTP(addonInterface, { port: port }).then(() => {
    console.log(`✅ Stremio addon server running on port ${port}`);
    console.log(`🌐 Addon URL: http://localhost:${port}/manifest.json`);
    console.log(`📱 Install in Stremio: http://localhost:${port}/manifest.json`);
    console.log(`🎬 Shrek (2001) configurado con Pixeldrain: ${dataset.demo_movie_1.url}`);
    console.log(`🎭 Shrek 2 (2004) configurado con Pixeldrain: ${dataset.demo_movie_2.url}`);
    console.log(`📺 El Chavo del 8 - 3 episodios disponibles`);
}).catch(err => {
    console.error("❌ Error starting server:", err);
    process.exit(1);
});