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
                    options: ["Action", "Comedy", "Drama", "Sci-Fi"]
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
        name: "Big Buck Bunny",
        genre: ["Comedy", "Animation"],
        year: 2008,
        director: "Sacha Goedegebure",
        cast: ["Frank Vitale", "Maureen McMahon"],
        description: "A large and lovable rabbit deals with three tiny bullies, led by a flying squirrel, who are determined to squelch his happiness.",
        poster: "https://peach.blender.org/wp-content/uploads/bbb-splash.png",
        background: "https://peach.blender.org/wp-content/uploads/bbb-splash.png",
        logo: "https://peach.blender.org/wp-content/uploads/title_anouncement.jpg",
        runtime: "10 min",
        // Stream HLS directo - ACTUALIZADO CON TU SERVIDOR
        url: "https://pixeldrain.com/api/file/uVTP2kza",
        title: "HLS Stream",
        // Configuraciones adicionales para mejorar compatibilidad
        behaviorHints: {
            notWebReady: false,
            bingeGroup: "big-buck-bunny"
        }
    },
    
    "demo_movie_2": {
        id: "demo_movie_2", 
        type: "movie",
        name: "Sintel",
        genre: ["Action", "Adventure", "Fantasy"],
        year: 2010,
        director: "Colin Levy",
        cast: ["Halina Reijn", "Thom Hoffman"],
        description: "A lonely young woman, Sintel, helps and befriends a dragon, whom she calls Scales. But when he is kidnapped by an adult dragon, Sintel decides to embark on a dangerous quest to find her lost friend Scales.",
        poster: "https://durian.blender.org/wp-content/uploads/2010/09/sintel_poster_small.jpg",
        background: "https://durian.blender.org/wp-content/uploads/2010/09/sintel_poster_small.jpg",
        runtime: "14 min",
        // Torrent con magnet link
        infoHash: "08ada5a7a6183aae1e09d831df6748d566095a10",
        sources: ["dht:08ada5a7a6183aae1e09d831df6748d566095a10"],
        title: "1080p"
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
        
        // Para Big Buck Bunny, ofrecer múltiples opciones de stream
        if (args.id === "demo_movie_1") {
            const streams = [
                // Opción 1: Stream HLS original con configuración mejorada
                {
                    title: "🎬 HLS Original (Gumlet)",
                    url: "https://video.gumlet.io/684cd82890b0148cd24b3fab/684cdcc9c4269590ab78ef00/main.m3u8",
                    behaviorHints: {
                        notWebReady: false,
                        bingeGroup: "big-buck-bunny-hls"
                    },
                    httpHeaders: {
                        'User-Agent': 'Stremio/4.4.0',
                        'Accept': '*/*',
                        'Accept-Language': 'en-US,en;q=0.9',
                        'Cache-Control': 'no-cache',
                        'Pragma': 'no-cache'
                    }
                },
                // Opción 2: Fallback MP4 directo (más compatible)
                {
                    title: "📹 MP4 Directo (Fallback)",
                    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
                    behaviorHints: {
                        notWebReady: false,
                        bingeGroup: "big-buck-bunny-mp4"
                    }
                },
                // Opción 3: Stream HLS alternativo público para pruebas
                {
                    title: "🧪 HLS Test Stream",
                    url: "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8",
                    behaviorHints: {
                        notWebReady: false,
                        bingeGroup: "big-buck-bunny-test"
                    }
                }
            ];
            
            console.log("Multiple streams configured for Big Buck Bunny");
            return Promise.resolve({ streams: streams });
        }
        
        // Para otros contenidos, usar la lógica original
        const stream = {
            title: item.title || "Demo Stream",
            url: item.url,
            infoHash: item.infoHash,
            sources: item.sources
        };
        
        // Configuraciones especiales para HLS
        if (item.url && item.url.includes('.m3u8')) {
            stream.behaviorHints = {
                notWebReady: false,
                bingeGroup: item.id
            };
            
            // Headers adicionales para HLS
            stream.httpHeaders = {
                'User-Agent': 'Stremio/4.4.0',
                'Accept': '*/*',
                'Accept-Language': 'en-US,en;q=0.9'
            };
            
            console.log("HLS stream configured with headers and behavior hints");
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
    console.log(`🎬 Big Buck Bunny configurado con servidor HLS: https://video.gumlet.io/684cd82890b0148cd24b3fab/684cdcc9c4269590ab78ef00/main.m3u8`);
    console.log(`🎭 El Chavo del 8 Episodio 1 configurado con magnet link`);
}).catch(err => {
    console.error("❌ Error starting server:", err);
    process.exit(1);
});