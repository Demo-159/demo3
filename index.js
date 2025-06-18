const { addonBuilder, serveHTTP } = require("stremio-addon-sdk");
const magnet = require("magnet-uri");

// Enhanced addon configuration
const manifest = {
    "id": "org.demo.stremio-addon-latino",
    "version": "1.0.1",
    "name": "Addon Demo Stremio Latino",
    "description": "Addon de demostración con películas y series en español latino - Contenido familiar y entretenimiento",
    "icon": "https://via.placeholder.com/256x256/FF6B6B/FFFFFF?text=LATINO",
    "background": "https://via.placeholder.com/1920x1080/4ECDC4/FFFFFF?text=ADDON+LATINO",
    
    "resources": ["catalog", "stream", "meta"],
    "types": ["movie", "series"],
    
    "catalogs": [
        {
            type: "movie",
            id: "peliculas-latino",
            name: "Películas Latino",
            extra: [
                {
                    name: "genre",
                    options: ["Acción", "Comedia", "Drama", "Terror", "Ciencia Ficción", "Animación", "Aventura", "Familiar"]
                },
                {
                    name: "skip",
                    isRequired: false
                }
            ]
        },
        {
            type: "series",
            id: "series-latino", 
            name: "Series Latino",
            extra: [
                {
                    name: "genre",
                    options: ["Comedia", "Animación", "Aventura", "Familiar", "Terror", "Drama"]
                },
                {
                    name: "skip",
                    isRequired: false
                }
            ]
        }
    ],
    
    "idPrefixes": ["latino_", "tt"],
    
    "behaviorHints": {
        "adult": false,
        "p2p": true,
        "configurable": true,
        "configurationRequired": false
    }
};

// Enhanced dataset with better organization
const dataset = {
    // Shrek Movies Collection with IMDB IDs
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
        logo: "https://logoeps.com/wp-content/uploads/2013/12/shrek-vector-logo.png",
        runtime: "90 min",
        imdbRating: "7.9",
        url: "https://archive.org/download/dercro-2040/DERCRO2040.mkv",
        title: "Shrek (2001) - 1080p Latino",
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
        logo: "https://logoeps.com/wp-content/uploads/2013/12/shrek-2-vector-logo.png",
        runtime: "93 min",
        imdbRating: "7.3",
        url: "https://archive.org/download/THREN/THREN.mkv",
        title: "Shrek 2 (2004) - 1080p Latino",
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
        logo: "https://seeklogo.com/images/S/shrek-the-third-logo-6B8B8B5F5E-seeklogo.com.png",
        runtime: "93 min",
        imdbRating: "6.1",
        url: "https://video.gumlet.io/684cd82890b0148cd24b3fab/684cdcc9c4269590ab78ef00/684cdcc9c4269590ab78ef00_0_540p.m3u8",
        title: "Shrek Tercero (2007) - 1080p Latino",
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
        logo: "https://seeklogo.com/images/S/shrek-forever-after-logo-689A537D1C-seeklogo.com.png",
        runtime: "93 min",
        imdbRating: "6.3",
        url: "https://archive-video-proxy.davidmonrroy7.workers.dev/shrek-para-siempre-2010",
        title: "Shrek Para Siempre (2010) - 1080p Latino",
        quality: "1080p",
        language: "Latino"
    },
    
    // El Chavo del 8 Series
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
        background: "https://m.media-amazon.com/images/M/MV5BNzA4Zjk3NzktYWU0ZC00YWQyLWFkYTYtOGM4OTJlYWRhYzEyXkEyXkFqcGdeQXVyNzI1NzMxNzM@._V1_SX300.jpg",
        runtime: "30 min",
        infoHash: "1956751B7227B131471EBDD41F9AA2536613A376",
        magnetUri: "magnet:?xt=urn:btih:1956751B7227B131471EBDD41F9AA2536613A376&dn=The.avengers.2012.1080p-dual-lat.mp4&tr=udp%3a%2f%2ftracker.opentrackr.org%3a1337%2fannounce",
        sources: ["dht:1956751B7227B131471EBDD41F9AA2536613A376"],
        title: "Episodio 1 - Los Dulces Prohibidos - 1080p Latino",
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
        background: "https://m.media-amazon.com/images/M/MV5BNzA4Zjk3NzktYWU0ZC00YWQyLWFkYTYtOGM4OTJlYWRhYzEyXkEyXkFqcGdeQXVyNzI1NzMxNzM@._V1_SX300.jpg",
        runtime: "30 min",
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        title: "Episodio 2 - El Cumpleaños de la Chilindrina - Latino",
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
        background: "https://m.media-amazon.com/images/M/MV5BNzA4Zjk3NzktYWU0ZC00YWQyLWFkYTYtOGM4OTJlYWRhYzEyXkEyXkFqcGdeQXVyNzI1NzMxNzM@._V1_SX300.jpg",
        runtime: "30 min",
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        title: "Episodio 3 - El Juego de Béisbol - Latino",
        quality: "720p",
        language: "Latino"
    }
};

// Enhanced utility functions
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
        description: value.description,
        imdbRating: value.imdbRating,
        language: value.language
    };
};

const generateMeta = function(value, key) {
    const meta = generateMetaPreview(value, key);
    
    // Add detailed metadata
    meta.director = value.director;
    meta.cast = value.cast;
    meta.runtime = value.runtime;
    meta.country = "Estados Unidos";
    meta.language = "Español Latino";
    meta.awards = "Varios premios internacionales";
    meta.website = "https://github.com/tu-usuario/stremio-addon-latino";
    
    // Enhanced series metadata
    if (value.type === "series") {
        const seriesEpisodes = Object.entries(dataset)
            .filter(([k, v]) => v.seriesId === value.seriesId && k.includes(":"))
            .sort((a, b) => {
                const aSeason = parseInt(a[0].split(":")[1]);
                const aEpisode = parseInt(a[0].split(":")[2]);
                const bSeason = parseInt(b[0].split(":")[1]);
                const bEpisode = parseInt(b[0].split(":")[2]);
                
                if (aSeason !== bSeason) return aSeason - bSeason;
                return aEpisode - bEpisode;
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

// Enhanced stream quality detection
const getStreamQuality = (item) => {
    if (item.quality) return item.quality;
    if (item.url && item.url.includes('1080p')) return '1080p';
    if (item.url && item.url.includes('720p')) return '720p';
    return 'SD';
};

// Create addon builder
const builder = new addonBuilder(manifest);

// Enhanced stream handler with better error handling
builder.defineStreamHandler(function(args) {
    console.log("🎬 Solicitud de stream para:", args.id);
    
    if (dataset[args.id]) {
        const item = dataset[args.id];
        const quality = getStreamQuality(item);
        
        const stream = {
            title: `${item.title || item.name} - ${quality} Latino`,
            url: item.url,
            infoHash: item.infoHash,
            sources: item.sources
        };
        
        // Enhanced stream configuration
        if (item.url) {
            stream.behaviorHints = {
                notWebReady: false,
                bingeGroup: item.seriesId || item.id,
                countryWhitelist: ['MX', 'AR', 'CO', 'VE', 'PE', 'CL', 'EC', 'UY', 'PY', 'BO']
            };
            
            stream.httpHeaders = {
                'User-Agent': 'Stremio/4.4.0 (https://stremio.com)',
                'Accept': '*/*',
                'Accept-Language': 'es-MX,es;q=0.9,en;q=0.8',
                'Referer': 'https://stremio.com/',
                'Origin': 'https://stremio.com'
            };
        }
        
        // Torrent stream configuration
        if (item.infoHash) {
            stream.title += " (Torrent)";
            stream.behaviorHints.p2p = true;
        }
        
        // Clean undefined properties
        Object.keys(stream).forEach(key => {
            if (stream[key] === undefined) {
                delete stream[key];
            }
        });
        
        console.log("✅ Stream encontrado:", stream.title);
        return Promise.resolve({ streams: [stream] });
    } else {
        console.log("❌ No se encontró stream para:", args.id);
        return Promise.resolve({ streams: [] });
    }
});

// Enhanced catalog handler with pagination
builder.defineCatalogHandler(function(args) {
    console.log("📚 Solicitud de catálogo:", args);
    
    const skip = parseInt(args.extra?.skip) || 0;
    const limit = 20; // Items per page
    
    let filteredItems = Object.entries(dataset)
        .filter(([key, value]) => {
            // Filter by type
            if (value.type !== args.type) return false;
            
            // For series, only show main series entry (not individual episodes)
            if (value.type === "series" && key.includes(":")) {
                return false;
            }
            
            // Genre filtering
            if (args.extra && args.extra.genre) {
                return value.genre && value.genre.some(g => 
                    g.toLowerCase().includes(args.extra.genre.toLowerCase()) ||
                    args.extra.genre.toLowerCase().includes(g.toLowerCase())
                );
            }
            
            return true;
        });
    
    // Apply pagination
    const paginatedItems = filteredItems
        .slice(skip, skip + limit)
        .map(([key, value]) => generateMetaPreview(value, key));
    
    console.log(`📄 Página ${Math.floor(skip/limit) + 1}: ${paginatedItems.length} items`);
    console.log("🎭 Contenido:", paginatedItems.map(m => `${m.name} (${m.year})`));
    
    return Promise.resolve({ metas: paginatedItems });
});

// Enhanced meta handler
builder.defineMetaHandler(function(args) {
    console.log("📝 Solicitud de metadatos para:", args.id);
    
    // Find by exact ID first
    let item = Object.entries(dataset).find(([key, value]) => key === args.id);
    
    // If not found, search by base ID or series ID
    if (!item) {
        item = Object.entries(dataset).find(([key, value]) => {
            const baseId = key.split(":")[0];
            return baseId === args.id || value.seriesId === args.id;
        });
    }
    
    if (item) {
        const [key, value] = item;
        const meta = generateMeta(value, key);
        console.log("✅ Metadatos encontrados:", meta.name);
        return Promise.resolve({ meta: meta }); 
    } else {
        console.log("❌ No se encontraron metadatos para:", args.id);
        return Promise.resolve({ meta: null });
    }
});

// Create addon interface
const addonInterface = builder.getInterface();

// Enhanced server startup
const port = process.env.PORT || 3000;
const host = process.env.HOST || 'localhost';

serveHTTP(addonInterface, { port: port }).then(() => {
    console.log(`\n🚀 ═══════════════════════════════════════════════════════`);
    console.log(`   STREMIO ADDON LATINO - SERVIDOR INICIADO`);
    console.log(`🚀 ═══════════════════════════════════════════════════════`);
    console.log(`🌐 URL del Servidor: http://${host}:${port}`);
    console.log(`📱 Manifest URL: http://${host}:${port}/manifest.json`);
    console.log(`🔗 Instalar en Stremio: http://${host}:${port}/manifest.json`);
    
    console.log(`\n🎬 PELÍCULAS DISPONIBLES (${Object.values(dataset).filter(v => v.type === 'movie').length}):`);
    Object.values(dataset)
        .filter(v => v.type === 'movie')
        .forEach(movie => {
            console.log(`   📽️  ${movie.name} (${movie.year}) - ${getStreamQuality(movie)}`);
        });
    
    console.log(`\n📺 SERIES DISPONIBLES:`);
    const series = Object.values(dataset).filter(v => v.type === 'series' && !v.id.includes(':'));
    series.forEach(show => {
        const episodeCount = Object.values(dataset).filter(v => v.seriesId === show.id).length;
        console.log(`   📺 ${show.name} - ${episodeCount} episodios`);
    });
    
    console.log(`\n💡 INSTRUCCIONES:`);
    console.log(`   1. Copia la URL del manifest: http://${host}:${port}/manifest.json`);
    console.log(`   2. Abre Stremio y ve a Addons`);
    console.log(`   3. Pega la URL en "Addon Repository URL"`);
    console.log(`   4. ¡Disfruta del contenido en español latino!`);
    console.log(`\n🔥 ═══════════════════════════════════════════════════════\n`);
    
}).catch(err => {
    console.error("❌ Error al iniciar el servidor:", err);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n👋 Cerrando servidor gracefully...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n👋 Cerrando servidor gracefully...');
    process.exit(0);
});