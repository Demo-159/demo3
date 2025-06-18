const { addonBuilder, serveHTTP } = require("stremio-addon-sdk");
const magnet = require("magnet-uri");

// Configuración del addon
const manifest = {
    "id": "org.demo.stremio-addon-latino",
    "version": "1.0.0",
    "name": "Addon Demo Stremio Latino",
    "description": "Addon de demostración con películas y series en español latino",
    "icon": "https://via.placeholder.com/256x256/FF6B6B/FFFFFF?text=LATINO",
    "background": "https://via.placeholder.com/1920x1080/4ECDC4/FFFFFF?text=ADDON+LATINO",
    
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
            id: "peliculas-latino",
            name: "Películas Latino",
            extra: [
                {
                    name: "genre",
                    options: ["Acción", "Comedia", "Drama", "Terror", "Ciencia Ficción", "Animación", "Aventura", "Familiar"]
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
                }
            ]
        }
    ],
    
    // Prefijos de IDs soportados
    "idPrefixes": ["latino_", "tt"],
    
    // Configuración del comportamiento
    "behaviorHints": {
        "adult": false,
        "p2p": true,
        "configurable": true
    }
};

// Base de datos de contenido
const dataset = {
    // Películas de Shrek
    "latino_pelicula_1": {
        id: "latino_pelicula_1",
        type: "movie",
        name: "Shrek",
        genre: ["Comedia", "Animación", "Aventura", "Familiar"],
        year: 2001,
        director: "Andrew Adamson, Vicky Jenson",
        cast: ["Mike Myers", "Eddie Murphy", "Cameron Díaz", "John Lithgow"],
        description: "Un ogro malhumorado vive tranquilo en su pantano hasta que un día su preciada soledad se ve interrumpida por una invasión de personajes de cuentos de hadas que han sido exiliados de su reino por el malvado Lord Farquaad. Decidido a salvar su hogar, Shrek hace un trato con Farquaad y se dispone a rescatar a la princesa Fiona para ser la novia del señor. Para ello estará acompañado por un burro parlanchín.",
        poster: "https://m.media-amazon.com/images/M/MV5BOGZhM2FhNTItODAzNi00YjA0LWEyN2UtNjJlYWQzYzU1MDg5L2ltYWdlL2ltYWdlXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg",
        background: "https://images.justwatch.com/backdrop/178788925/s1920/shrek.jpg",
        logo: "https://logoeps.com/wp-content/uploads/2013/12/shrek-vector-logo.png",
        runtime: "90 min",
        url: "https://archive-video-proxy.davidmonrroy7.workers.dev/shrek-2001",
        title: "Shrek (2001) - 1080p Latino"
    },
    
    "latino_pelicula_2": {
        id: "latino_pelicula_2", 
        type: "movie",
        name: "Shrek 2",
        genre: ["Comedia", "Animación", "Aventura", "Familiar"],
        year: 2004,
        director: "Andrew Adamson, Kelly Asbury, Conrad Vernon",
        cast: ["Mike Myers", "Eddie Murphy", "Cameron Díaz", "Julie Andrews"],
        description: "Shrek y Fiona regresan de su luna de miel para recibir una invitación de los padres de Fiona para cenar en el Reino de Muy Muy Lejano. Sin embargo, nadie podía imaginar lo difícil que resultaría para Shrek conocer a sus suegros. Junto con Burro, la pareja viaja al reino, donde los esperan muchas sorpresas y aventuras divertidas.",
        poster: "https://m.media-amazon.com/images/M/MV5BMDJhMGRjN2QtNDUxYy00NGM3LWI3MjUtMTMzZDU0OWJiOTQ4XkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg",
        background: "https://images.justwatch.com/backdrop/178788932/s1920/shrek-2.jpg",
        logo: "https://logoeps.com/wp-content/uploads/2013/12/shrek-2-vector-logo.png",
        runtime: "93 min",
        url: "https://store-na-phx-1.gofile.io/download/web/37817e78-be2e-49b9-b5b4-90339fbde307/Shrek.2001.1080p-dual-lat.mp4",
        title: "Shrek 2 (2004) - 1080p Latino"
    },

    "latino_pelicula_3": {
        id: "latino_pelicula_3",
        type: "movie",
        name: "Shrek Tercero",
        genre: ["Comedia", "Animación", "Aventura", "Familiar"],
        year: 2007,
        director: "Chris Miller, Raman Hui",
        cast: ["Mike Myers", "Cameron Díaz", "Eddie Murphy", "Antonio Banderas"],
        description: "Cuando el Rey Harold de Muy Muy Lejano se encuentra en su lecho de muerte, Shrek debe encontrar a un heredero para el trono o se convertirá en el nuevo rey. El candidato más probable es Arturo, el sobrino del rey, pero resulta ser un adolescente tímido e inadaptado. Mientras tanto, el Príncipe Encantador planea vengarse de Shrek.",
        poster: "https://m.media-amazon.com/images/M/MV5BOTgyMjc3ODk2MV5BMl5BanBnXkFtZTcwMjY0MjEzMw@@._V1_SX300.jpg",
        background: "https://images.justwatch.com/backdrop/178788939/s1920/shrek-the-third.jpg",
        logo: "https://seeklogo.com/images/S/shrek-the-third-logo-6B8B8B5F5E-seeklogo.com.png",
        runtime: "93 min",
        url: "https://archive-video-proxy.davidmonrroy7.workers.dev/shrek-tercero-2007",
        title: "Shrek Tercero (2007) - 1080p Latino"
    },

    "latino_pelicula_4": {
        id: "latino_pelicula_4",
        type: "movie",
        name: "Shrek Para Siempre",
        genre: ["Comedia", "Animación", "Aventura", "Familiar"],
        year: 2010,
        director: "Mike Mitchell",
        cast: ["Mike Myers", "Cameron Díaz", "Eddie Murphy", "Antonio Banderas"],
        description: "Shrek está pasando por una crisis de la mediana edad. Ya no se siente como un verdadero ogro aterrador, sino como un padre de familia domesticado. Desesperado por sentirse como un ogro de verdad otra vez, hace un trato con Rumpelstiltskin. Pero es engañado y transportado a una realidad alternativa donde Rumpel es el rey, los ogros son cazados y él nunca conoció a Fiona.",
        poster: "https://m.media-amazon.com/images/M/MV5BNjA0MjYyOTU3MF5BMl5BanBnXkFtZTcwMTg1MjY0Mw@@._V1_SX300.jpg",
        background: "https://images.justwatch.com/backdrop/10890619/s1920/shrek-forever-after",
        logo: "https://seeklogo.com/images/S/shrek-forever-after-logo-689A537D1C-seeklogo.com.png",
        runtime: "93 min",
        url: "https://archive-video-proxy.davidmonrroy7.workers.dev",
        title: "Shrek Para Siempre (2010) - 1080p Latino"
    },
    
    // El Chavo del 8 - Serie
    "tt0229889:1:1": {
        id: "tt0229889:1:1",
        type: "series",
        name: "El Chavo del 8 - Episodio 1: Los Dulces Prohibidos",
        genre: ["Comedia", "Familiar"],
        year: 1971,
        episode: 1,
        season: 1,
        seriesId: "tt0229889",
        seriesName: "El Chavo del 8",
        description: "En este primer episodio, el Chavo se mete en problemas cuando encuentra unos dulces y no sabe de quién son. Como siempre, sus travesuras inocentes causan malentendidos divertidos en la vecindad del número 8.",
        poster: "https://m.media-amazon.com/images/M/MV5BNzA4Zjk3NzktYWU0ZC00YWQyLWFkYTYtOGM4OTJlYWRhYzEyXkEyXkFqcGdeQXVyNzI1NzMxNzM@._V1_SX300.jpg",
        background: "https://m.media-amazon.com/images/M/MV5BNzA4Zjk3NzktYWU0ZC00YWQyLWFkYTYtOGM4OTJlYWRhYzEyXkEyXkFqcGdeQXVyNzI1NzMxNzM@._V1_SX300.jpg",
        runtime: "30 min",
        infoHash: "1956751B7227B131471EBDD41F9AA2536613A376",
        magnetUri: "magnet:?xt=urn:btih:1956751B7227B131471EBDD41F9AA2536613A376&dn=The.avengers.2012.1080p-dual-lat.mp4&tr=udp%3a%2f%2ftracker.opentrackr.org%3a1337%2fannounce&tr=udp%3a%2f%2fopen.demonii.com%3a1337%2fannounce&tr=udp%3a%2f%2fopen.stealth.si%3a80%2fannounce&tr=udp%3a%2f%2ftracker.torrent.eu.org%3a451%2fannounce&tr=udp%3a%2f%2fexplodie.org%3a6969%2fannounce",
        sources: ["dht:1956751B7227B131471EBDD41F9AA2536613A376"],
        title: "Episodio 1 - 1080p Latino"
    },
    
    "tt0229889:1:2": {
        id: "tt0229889:1:2",
        type: "series", 
        name: "El Chavo del 8 - Episodio 2: El Cumpleaños de la Chilindrina",
        genre: ["Comedia", "Familiar"],
        year: 1971,
        episode: 2,
        season: 1,
        seriesId: "tt0229889",
        seriesName: "El Chavo del 8",
        description: "Es el cumpleaños de la Chilindrina y todos los niños de la vecindad están invitados a la fiesta, excepto el Chavo. Don Ramón trata de explicarle a su hija por qué no puede invitar al Chavo, pero las cosas se complican cuando aparece la Bruja del 71.",
        poster: "https://m.media-amazon.com/images/M/MV5BNzA4Zjk3NzktYWU0ZC00YWQyLWFkYTYtOGM4OTJlYWRhYzEyXkEyXkFqcGdeQXVyNzI1NzMxNzM@._V1_SX300.jpg",
        background: "https://m.media-amazon.com/images/M/MV5BNzA4Zjk3NzktYWU0ZC00YWQyLWFkYTYtOGM4OTJlYWRhYzEyXkEyXkFqcGdeQXVyNzI1NzMxNzM@._V1_SX300.jpg",
        runtime: "30 min",
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        title: "Episodio 2 - Latino"
    },
    
    "tt0229889:1:3": {
        id: "tt0229889:1:3",
        type: "series", 
        name: "El Chavo del 8 - Episodio 3: El Juego de Béisbol",
        genre: ["Comedia", "Familiar"],
        year: 1971,
        episode: 3,
        season: 1,
        seriesId: "tt0229889",
        seriesName: "El Chavo del 8",
        description: "Los niños de la vecindad deciden jugar béisbol en el patio. El Chavo, como siempre, quiere participar pero no sabe muy bien las reglas del juego. Sus intentos por ayudar resultan en situaciones cómicas que involucran a todos los vecinos, especialmente al Señor Barriga.",
        poster: "https://m.media-amazon.com/images/M/MV5BNzA4Zjk3NzktYWU0ZC00YWQyLWFkYTYtOGM4OTJlYWRhYzEyXkEyXkFqcGdeQXVyNzI1NzMxNzM@._V1_SX300.jpg",
        background: "https://m.media-amazon.com/images/M/MV5BNzA4Zjk3NzktYWU0ZC00YWQyLWFkYTYtOGM4OTJlYWRhYzEyXkEyXkFqcGdeQXVyNzI1NzMxNzM@._V1_SX300.jpg",
        runtime: "30 min",
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        title: "Episodio 3 - Latino"
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
    meta.country = "Estados Unidos";
    meta.language = "Español Latino";
    meta.awards = "Varios premios internacionales";
    meta.website = "https://github.com/tu-usuario/stremio-addon-latino";
    
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
    console.log("Solicitud de stream para:", args.id);
    
    if (dataset[args.id]) {
        const item = dataset[args.id];
        
        // Configuración base del stream
        const stream = {
            title: item.title || "Stream Latino",
            url: item.url,
            infoHash: item.infoHash,
            sources: item.sources
        };
        
        // Configuraciones especiales para diferentes tipos de streams
        if (item.url && (item.url.includes('pixeldrain.com') || item.url.includes('gofile.io') || item.url.includes('workers.dev'))) {
            stream.behaviorHints = {
                notWebReady: false,
                bingeGroup: item.id
            };
            
            // Headers adicionales
            stream.httpHeaders = {
                'User-Agent': 'Stremio/4.4.0',
                'Accept': '*/*',
                'Accept-Language': 'es-MX,es;q=0.9,en;q=0.8',
                'Referer': 'https://stremio.com/',
                'Origin': 'https://stremio.com'
            };
            
            console.log("Stream directo configurado con headers");
        }
        
        // Si hay un magnet URI, agregarlo como información adicional
        if (item.magnetUri) {
            console.log("Magnet URI disponible:", item.magnetUri);
        }
        
        // Limpiar propiedades undefined
        Object.keys(stream).forEach(key => {
            if (stream[key] === undefined) {
                delete stream[key];
            }
        });
        
        console.log("Stream encontrado:", stream);
        return Promise.resolve({ streams: [stream] });
    } else {
        console.log("No se encontró stream para:", args.id);
        return Promise.resolve({ streams: [] });
    }
});

// Manejador de catálogos
builder.defineCatalogHandler(function(args) {
    console.log("Solicitud de catálogo:", args);
    
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
                return value.genre && value.genre.some(g => 
                    g.toLowerCase().includes(args.extra.genre.toLowerCase()) ||
                    args.extra.genre.toLowerCase().includes(g.toLowerCase())
                );
            }
            
            return true;
        })
        .map(([key, value]) => generateMetaPreview(value, key));
    
    console.log("Metas encontradas en catálogo:", metas.length);
    console.log("Películas en catálogo:", metas.filter(m => m.type === 'movie').map(m => m.name));
    return Promise.resolve({ metas: metas });
});

// Manejador de metadatos
builder.defineMetaHandler(function(args) {
    console.log("Solicitud de metadatos para:", args.id);
    
    // Buscar el item por ID exacto primero
    let item = Object.entries(dataset).find(([key, value]) => key === args.id);
    
    // Si no se encuentra, buscar por ID base o seriesId
    if (!item) {
        item = Object.entries(dataset).find(([key, value]) => {
            const baseId = key.split(":")[0];
            return baseId === args.id || value.seriesId === args.id;
        });
    }
    
    if (item) {
        const [key, value] = item;
        const meta = generateMeta(value, key);
        console.log("Metadatos encontrados:", meta.name);
        return Promise.resolve({ meta: meta }); 
    } else {
        console.log("No se encontraron metadatos para:", args.id);
        return Promise.resolve({ meta: null });
    }
});

// Configurar el servidor
const addonInterface = builder.getInterface();

// Iniciar servidor
const port = process.env.PORT || 3000;
serveHTTP(addonInterface, { port: port }).then(() => {
    console.log(`✅ Servidor de addon Stremio ejecutándose en puerto ${port}`);
    console.log(`🌐 URL del Addon: http://localhost:${port}/manifest.json`);
    console.log(`📱 Instalar en Stremio: http://localhost:${port}/manifest.json`);
    console.log(`\n🎬 Películas configuradas en Español Latino:`);
    console.log(`   - Shrek (2001): ${dataset.latino_pelicula_1.url}`);
    console.log(`   - Shrek 2 (2004): ${dataset.latino_pelicula_2.url}`);
    console.log(`   - Shrek Tercero (2007): ${dataset.latino_pelicula_3.url}`);
    console.log(`   - Shrek Para Siempre (2010): ${dataset.latino_pelicula_4.url}`);
    console.log(`📺 El Chavo del 8 - 3 episodios disponibles en Latino`);
}).catch(err => {
    console.error("❌ Error al iniciar el servidor:", err);
    process.exit(1);
});