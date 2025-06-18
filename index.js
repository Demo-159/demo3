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
        // Stream HTTP directo
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
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
    
    // Serie con 2 episodios
    "demo_series_1:1:1": {
        id: "demo_series_1:1:1",
        type: "series",
        name: "Tears of Steel - Episode 1",
        genre: ["Sci-Fi", "Action"],
        year: 2012,
        episode: 1,
        season: 1,
        seriesId: "demo_series_1",
        seriesName: "Tears of Steel",
        description: "The film's premise is about a group of warriors and scientists, who gather at the Oude Kerk in Amsterdam to stage a crucial event from the past, in a desperate attempt to rescue the world from destructive robots.",
        poster: "https://media.xiph.org/tearsofsteel/tearsofsteel-poster.png",
        background: "https://media.xiph.org/tearsofsteel/tearsofsteel-poster.png",
        runtime: "12 min",
        url: "https://media.xiph.org/tearsofsteel/tearsofsteel-surround.mp4"
    },
    
    "demo_series_1:1:2": {
        id: "demo_series_1:1:2",
        type: "series", 
        name: "Tears of Steel - Episode 2",
        genre: ["Sci-Fi", "Action"],
        year: 2012,
        episode: 2,
        season: 1,
        seriesId: "demo_series_1",
        seriesName: "Tears of Steel",
        description: "Continuation of the epic battle against the destructive robots. Our heroes must make difficult decisions to save humanity.",
        poster: "https://media.xiph.org/tearsofsteel/tearsofsteel-poster.png",
        background: "https://media.xiph.org/tearsofsteel/tearsofsteel-poster.png",
        runtime: "12 min",
        url: "https://media.xiph.org/tearsofsteel/tearsofsteel-surround.mp4"
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
        const stream = {
            title: item.title || "Demo Stream",
            url: item.url,
            infoHash: item.infoHash,
            sources: item.sources
        };
        
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
}).catch(err => {
    console.error("❌ Error starting server:", err);
    process.exit(1);
});