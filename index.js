const { addonBuilder, serveHTTP } = require("stremio-addon-sdk");

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
                    options: ["Action", "Comedy", "Drama", "Horror", "Sci-Fi", "Animation"]
                },
                {
                    name: "skip",
                    isRequired: false
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
                    options: ["Action", "Comedy", "Drama", "Sci-Fi", "Family"]
                },
                {
                    name: "skip", 
                    isRequired: false
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
        "configurable": false,
        "configurationRequired": false
    }
};

// Base de datos de contenido mejorada
const dataset = {
    // Películas
    "demo_movie_1": {
        id: "demo_movie_1",
        type: "movie",
        name: "Big Buck Bunny",
        genre: ["Comedy", "Animation"],
        year: 2008,
        director: ["Sacha Goedegebure"],
        cast: ["Frank Vitale", "Maureen McMahon"],
        description: "A large and lovable rabbit deals with three tiny bullies, led by a flying squirrel, who are determined to squelch his happiness.",
        poster: "https://peach.blender.org/wp-content/uploads/bbb-splash.png",
        background: "https://peach.blender.org/wp-content/uploads/bbb-splash.png",
        logo: "https://peach.blender.org/wp-content/uploads/title_anouncement.jpg",
        runtime: "10 min",
        imdbRating: 6.3,
        language: "en",
        country: "Netherlands",
        // Stream HTTP directo
        streams: [{
            title: "1080p HD",
            url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            quality: "1080p"
        }]
    },
    
    "demo_movie_2": {
        id: "demo_movie_2", 
        type: "movie",
        name: "Sintel",
        genre: ["Action", "Adventure", "Fantasy", "Animation"],
        year: 2010,
        director: ["Colin Levy"],
        cast: ["Halina Reijn", "Thom Hoffman"],
        description: "A lonely young woman, Sintel, helps and befriends a dragon, whom she calls Scales. But when he is kidnapped by an adult dragon, Sintel decides to embark on a dangerous quest to find her lost friend Scales.",
        poster: "https://durian.blender.org/wp-content/uploads/2010/09/sintel_poster_small.jpg",
        background: "https://durian.blender.org/wp-content/uploads/2010/09/sintel_poster_small.jpg",
        runtime: "14 min",
        imdbRating: 7.4,
        language: "en",
        country: "Netherlands",
        // Streams múltiples
        streams: [
            {
                title: "1080p Torrent",
                infoHash: "08ada5a7a6183aae1e09d831df6748d566095a10",
                sources: ["dht:08ada5a7a6183aae1e09d831df6748d566095a10"],
                quality: "1080p"
            },
            {
                title: "720p HTTP",
                url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
                quality: "720p"
            }
        ]
    },

    // Series - Información base
    "tt0229889": {
        id: "tt0229889",
        type: "series",
        name: "El Chavo del 8",
        genre: ["Comedy", "Family"],
        year: 1971,
        director: ["Roberto Gómez Bolaños"],
        cast: ["Roberto Gómez Bolaños", "María Antonieta de las Nieves", "Ramón Valdés", "Carlos Villagrán"],
        description: "Las aventuras de El Chavo, un niño huérfano que vive en una vecindad y se mete en divertidos problemas con sus amigos y vecinos.",
        poster: "https://m.media-amazon.com/images/M/MV5BNzA4Zjk3NzktYWU0ZC00YWQyLWFkYTYtOGM4OTJlYWRhYzEyXkEyXkFqcGdeQXVyNzI1NzMxNzM@._V1_SX300.jpg",
        background: "https://m.media-amazon.com/images/M/MV5BNzA4Zjk3NzktYWU0ZC00YWQyLWFkYTYtOGM4OTJlYWRhYzEyXkEyXkFqcGdeQXVyNzI1NzMxNzM@._V1_SX300.jpg",
        imdbRating: 8.5,
        language: "es",
        country: "Mexico",
        videos: []
    },
    
    // Episodios individuales
    "tt0229889:1:1": {
        id: "tt0229889:1:1",
        type: "episode",
        name: "Los Globos",
        genre: ["Comedy", "Family"],
        year: 1971,
        episode: 1,
        season: 1,
        seriesId: "tt0229889",
        seriesName: "El Chavo del 8",
        description: "El Chavo y Quico juegan con globos en el patio de la vecindad, pero las cosas se complican cuando Don Ramón se involucra.",
        poster: "https://m.media-amazon.com/images/M/MV5BNzA4Zjk3NzktYWU0ZC00YWQyLWFkYTYtOGM4OTJlYWRhYzEyXkEyXkFqcGdeQXVyNzI1NzMxNzM@._V1_SX300.jpg",
        runtime: "30 min",
        released: "1971-06-20",
        streams: [{
            title: "SD",
            url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            quality: "480p"
        }]
    },
    
    "tt0229889:1:2": {
        id: "tt0229889:1:2",
        type: "episode", 
        name: "El Lavadero",
        genre: ["Comedy", "Family"],
        year: 1971,
        episode: 2,
        season: 1,
        seriesId: "tt0229889",
        seriesName: "El Chavo del 8",
        description: "Doña Florinda lleva su ropa al lavadero público y El Chavo la ayuda, pero su ayuda no siempre es bien recibida.",
        poster: "https://m.media-amazon.com/images/M/MV5BNzA4Zjk3NzktYWU0ZC00YWQyLWFkYTYtOGM4OTJlYWRhYzEyXkEyXkFqcGdeQXVyNzI1NzMxNzM@._V1_SX300.jpg",
        runtime: "30 min",
        released: "1971-06-25",
        streams: [{
            title: "SD",
            url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
            quality: "480p"
        }]
    },
    
    "tt0229889:1:3": {
        id: "tt0229889:1:3",
        type: "episode", 
        name: "La Torta de Jamón",
        genre: ["Comedy", "Family"],
        year: 1971,
        episode: 3,
        season: 1,
        seriesId: "tt0229889",
        seriesName: "El Chavo del 8",
        description: "El Chavo tiene mucha hambre y sueña con comer una deliciosa torta de jamón, pero conseguirla no será tan fácil.",
        poster: "https://m.media-amazon.com/images/M/MV5BNzA4Zjk3NzktYWU0ZC00YWQyLWFkYTYtOGM4OTJlYWRhYzEyXkEyXkFqcGdeQXVyNzI1NzMxNzM@._V1_SX300.jpg",
        runtime: "30 min",
        released: "1971-07-01",
        streams: [
            {
                title: "1080p Torrent (Dual Latino)",
                infoHash: "1956751B7227B131471EBDD41F9AA2536613A376",
                sources: [
                    "tracker:udp://tracker.opentrackr.org:1337/announce",
                    "tracker:udp://open.demonii.com:1337/announce", 
                    "tracker:udp://open.stealth.si:80/announce",
                    "tracker:udp://tracker.torrent.eu.org:451/announce",
                    "tracker:udp://explodie.org:6969/announce",
                    "dht:1956751B7227B131471EBDD41F9AA2536613A376"
                ],
                quality: "1080p",
                language: "es"
            },
            {
                title: "SD Backup",
                url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
                quality: "480p"
            }
        ]
    }
};

// Función mejorada para generar metadatos del catálogo
const generateMetaPreview = function(item) {
    return {
        id: item.id,
        type: item.type,
        name: item.name,
        genre: item.genre,
        year: item.year,
        poster: item.poster,
        posterShape: "poster",
        background: item.background,
        logo: item.logo,
        description: item.description,
        imdbRating: item.imdbRating
    };
};

// Función mejorada para generar metadatos completos
const generateMeta = function(item) {
    const meta = {
        id: item.id,
        type: item.type,
        name: item.name,
        genre: item.genre,
        year: item.year,
        poster: item.poster,
        posterShape: "poster", 
        background: item.background,
        logo: item.logo,
        description: item.description,
        director: item.director,
        cast: item.cast,
        runtime: item.runtime,
        country: item.country,
        language: item.language,
        imdbRating: item.imdbRating,
        website: "https://github.com/tu-usuario/stremio-demo-addon"
    };
    
    // Para series, agregar información de episodios
    if (item.type === "series") {
        const episodes = Object.values(dataset)
            .filter(ep => ep.seriesId === item.id && ep.type === "episode")
            .map(ep => ({
                id: ep.id,
                title: ep.name,
                season: ep.season,
                episode: ep.episode,
                overview: ep.description,
                released: new Date(ep.released).toISOString(),
                thumbnail: ep.poster
            }));
        
        meta.videos = episodes;
    }
    
    return meta;
};

// Crear el builder del addon
const builder = new addonBuilder(manifest);

// Manejador de streams mejorado
builder.defineStreamHandler(function(args) {
    console.log("🎬 Stream request for:", args.id);
    
    const item = dataset[args.id];
    if (item && item.streams) {
        console.log(`✅ Found ${item.streams.length} streams for:`, item.name || args.id);
        return Promise.resolve({ 
            streams: item.streams.map(stream => ({
                ...stream,
                behaviorHints: {
                    bingeGroup: item.seriesId || item.id,
                    countryWhitelist: ["US", "CA", "MX", "AR", "ES"],
                    notWebReady: stream.infoHash ? true : false
                }
            }))
        });
    } else {
        console.log("❌ No streams found for:", args.id);
        return Promise.resolve({ streams: [] });
    }
});

// Manejador de catálogos mejorado
builder.defineCatalogHandler(function(args) {
    console.log("📚 Catalog request:", args.type, args.id, args.extra);
    
    const skip = parseInt(args.extra?.skip) || 0;
    const genre = args.extra?.genre;
    
    let items = Object.values(dataset).filter(item => {
        // Filtrar por tipo
        if (item.type !== args.type) return false;
        
        // Para series, solo mostrar la serie principal, no episodios
        if (args.type === "series" && item.type !== "series") return false;
        
        // Filtrar por género si se especifica
        if (genre && (!item.genre || !item.genre.includes(genre))) return false;
        
        return true;
    });
    
    // Paginación
    const pageSize = 20;
    const paginatedItems = items.slice(skip, skip + pageSize);
    
    const metas = paginatedItems.map(generateMetaPreview);
    
    console.log(`📊 Returning ${metas.length} items (${skip}-${skip + metas.length} of ${items.length})`);
    return Promise.resolve({ metas: metas });
});

// Manejador de metadatos mejorado
builder.defineMetaHandler(function(args) {
    console.log("🔍 Meta request for:", args.id, args.type);
    
    const item = dataset[args.id];
    if (item) {
        const meta = generateMeta(item);
        console.log("✅ Meta found:", meta.name);
        return Promise