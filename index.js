const { addonBuilder, serveHTTP } = require("stremio-addon-sdk");
const express = require("express");
const path = require("path");

const manifest = {
    "id": "org.stremio.addon-latino-chile",
    "version": "1.2.1",
    "name": "Reproducir ahora",
    "description": "Contenido en Español Latino para Chile",
    "icon": "https://us.123rf.com/450wm/vladwel/vladwel1702/vladwel170200039/71606485-ilustraci%C3%B3n-de-vector-de-claqueta-aislada-sobre-fondo-de-color-azul-icono-de-claqueta-de-estilo.jpg?ver=6",
    "resources": ["catalog", "stream", "meta"],
    "types": ["movie", "series"],
    "catalogs": [
        {
            "type": "movie",
            "id": "peliculas-latino-cl",
            "name": "Películas Latino",
            "extra": [
                {
                    "name": "genre",
                    "isRequired": false,
                    "options": ["Acción", "Comedia", "Drama", "Animación", "Aventura", "Familiar"]
                },
                {
                    "name": "skip",
                    "isRequired": false
                }
            ]
        },
        {
            "type": "series", 
            "id": "series-latino-cl",
            "name": "Series Latino",
            "extra": [
                {
                    "name": "genre",
                    "isRequired": false,
                    "options": ["Comedia", "Animación", "Familiar", "Drama"]
                },
                {
                    "name": "skip",
                    "isRequired": false
                }
            ]
        }
    ],
    "idPrefixes": ["latino_", "tt"],
    "behaviorHints": {
        "adult": false,
        "p2p": false,
        "configurable": true,
        "configurationRequired": false
    }
};

// Dataset inicial con más contenido
let dataset = {
    "tt0126029": {
        id: "tt0126029",
        type: "movie",
        name: "Shrek",
        genre: ["Comedia", "Animación", "Aventura", "Familiar"],
        year: 2001,
        director: ["Andrew Adamson", "Vicky Jenson"],
        cast: ["Mike Myers", "Eddie Murphy", "Cameron Díaz", "John Lithgow"],
        description: "Un ogro malhumorado vive tranquilo en su pantano hasta que un día su preciada soledad se ve interrumpida por una invasión de personajes de cuentos de hadas que han sido exiliados de su reino por el malvado Lord Farquaad.",
        poster: "https://m.media-amazon.com/images/M/MV5BOWIzMmI4ZDktZTNmZS00YzQ4LWFhYzgtNWQ4YjgwMGJhNDYwXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
        background: "https://m.media-amazon.com/images/M/MV5BMjAwOTY3ODAzNl5BMl5BanBnXkFtZTcwNjYzNDc3Mw@@._V1_.jpg",
        runtime: "90 min",
        imdbRating: 7.9,
        url: "https://archive.org/download/dercro-2040/DERCRO2040.mkv",
        quality: "1080p",
        language: "Latino"
    },
    "tt0117500": {
        id: "tt0117500",
        type: "movie", 
        name: "The Rock",
        genre: ["Acción", "Aventura"],
        year: 1996,
        director: ["Michael Bay"],
        cast: ["Sean Connery", "Nicolas Cage", "Ed Harris"],
        description: "Un ex-presidiario de Alcatraz se une a un agente del FBI para detener a un general rebelde que amenaza San Francisco con armas químicas.",
        poster: "https://m.media-amazon.com/images/M/MV5BZDJjOTE0N2EtMmRlZS00NzU0LWE0ZWQtM2Q3MWMxNjcwZjBhXkEyXkFqcGdeQXVyNDk3NzU2MTQ@._V1_.jpg",
        background: "https://m.media-amazon.com/images/M/MV5BZDJjOTE0N2EtMmRlZS00NzU0LWE0ZWQtM2Q3MWMxNjcwZjBhXkEyXkFqcGdeQXVyNDk3NzU2MTQ@._V1_.jpg",
        runtime: "136 min",
        imdbRating: 7.4,
        url: "https://archive.org/download/TheRock1996/TheRock1996.mp4",
        quality: "720p",
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
        director: ["Roberto Gómez Bolaños"],
        cast: ["Roberto Gómez Bolaños", "Ramón Valdés", "Carlos Villagrán", "María Antonieta de las Nieves"],
        description: "Las aventuras de un niño huérfano que vive en una vecindad y sus travesuras con los demás habitantes del lugar.",
        poster: "https://images.sr.roku.com/idType/roku/context/global/id/aac4ecd26e9153c49b232aac064cecca/rokuFeed/assets/842e678ebeda580e8d8c527970f63f95.jpg/magic/800x0/filters:quality(100)",
        background: "https://m.media-amazon.com/images/M/MV5BNjQwNjlkOGUtMzhhMi00N2NjLTk0ZTMtODhkM2IzOTVlNWUzXkEyXkFqcGc@._V1_QL75_UX820_.jpg",
        imdbRating: 8.5,
        language: "Latino"
    },
    "tt0229889:1:1": {
        id: "tt0229889:1:1",
        type: "series",
        name: "El Ropavejero",
        genre: ["Comedia", "Familiar"],
        released: "1971-01-01T00:00:00.000Z",
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
        released: "1971-01-08T00:00:00.000Z",
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
    }
};

// Funciones auxiliares
const extractBaseId = (key) => key.split(":")[0];
const isEpisode = (key) => key.includes(":");
const getQuality = (item) => item.quality || (item.url?.includes('1080p') ? '1080p' : item.url?.includes('720p') ? '720p' : 'SD');

const createMetaPreview = (item, key) => {
    const baseId = extractBaseId(key);
    return {
        id: baseId,
        type: item.type,
        name: item.seriesName || item.name,
        genre: Array.isArray(item.genre) ? item.genre : [item.genre].filter(Boolean),
        year: parseInt(item.year) || new Date().getFullYear(),
        poster: item.poster,
        posterShape: "poster",
        background: item.background,
        description: item.description,
        imdbRating: typeof item.imdbRating === 'string' ? item.imdbRating : item.imdbRating?.toString(),
        language: item.language || "Latino"
    };
};

const createFullMeta = (item, key) => {
    const meta = createMetaPreview(item, key);
    
    // Añadir información adicional
    if (item.director) meta.director = Array.isArray(item.director) ? item.director : [item.director];
    if (item.cast) meta.cast = Array.isArray(item.cast) ? item.cast : [item.cast];
    if (item.runtime) meta.runtime = item.runtime;
    
    // Para series, añadir videos (episodios)
    if (item.type === "series" && !isEpisode(key)) {
        const episodes = Object.entries(dataset)
            .filter(([k, v]) => v.seriesId === item.seriesId && isEpisode(k))
            .sort((a, b) => {
                const [aSeason, aEpisode] = [parseInt(a[0].split(":")[1]) || 0, parseInt(a[0].split(":")[2]) || 0];
                const [bSeason, bEpisode] = [parseInt(b[0].split(":")[1]) || 0, parseInt(b[0].split(":")[2]) || 0];
                return aSeason !== bSeason ? aSeason - bSeason : aEpisode - bEpisode;
            })
            .map(([k, v]) => ({
                id: k,
                title: `S${v.season}E${v.episode} - ${v.name}`,
                season: parseInt(v.season) || 1,
                episode: parseInt(v.episode) || 1,
                overview: v.description || "",
                released: v.released || `${v.year || 1971}-01-01T00:00:00.000Z`,
                thumbnail: v.poster
            }));
        
        if (episodes.length > 0) {
            meta.videos = episodes;
        }
    }
    
    return meta;
};

const createStream = (item) => {
    if (!item || !item.url) {
        return null;
    }
    
    const stream = {
        title: `${item.name || 'Sin título'} - ${getQuality(item)} Latino`,
        url: item.url
    };
    
    // Configurar headers HTTP
    stream.behaviorHints = {
        notWebReady: false,
        bingeGroup: item.seriesId || item.id,
        countryWhitelist: ['CL', 'AR', 'MX', 'CO', 'PE', 'UY', 'EC', 'BO', 'PY']
    };
    
    return stream;
};

// Configurar el addon de Stremio
const builder = new addonBuilder(manifest);

// Handler para streams
builder.defineStreamHandler(({ type, id }) => {
    console.log(`Stream request - Type: ${type}, ID: ${id}`);
    
    try {
        const item = dataset[id];
        if (!item) {
            console.log(`No item found for ID: ${id}`);
            return Promise.resolve({ streams: [] });
        }
        
        const stream = createStream(item);
        const streams = stream ? [stream] : [];
        
        console.log(`Returning ${streams.length} streams for ${id}`);
        return Promise.resolve({ streams });
    } catch (error) {
        console.error('Stream handler error:', error);
        return Promise.resolve({ streams: [] });
    }
});

// Handler para catálogos
builder.defineCatalogHandler(({ type, id, extra }) => {
    console.log(`Catalog request - Type: ${type}, ID: ${id}, Extra:`, extra);
    
    try {
        const skip = parseInt(extra?.skip) || 0;
        const limit = 100; // Aumentado para mostrar más contenido
        
        let items = Object.entries(dataset)
            .filter(([key, value]) => {
                // Filtrar por tipo
                if (value.type !== type) return false;
                
                // Para series, no mostrar episodios individuales en el catálogo
                if (value.type === "series" && isEpisode(key)) return false;
                
                // Filtrar por género si se especifica
                if (extra?.genre && value.genre) {
                    const itemGenres = Array.isArray(value.genre) ? value.genre : [value.genre];
                    return itemGenres.some(g => 
                        g.toLowerCase().includes(extra.genre.toLowerCase()) ||
                        extra.genre.toLowerCase().includes(g.toLowerCase())
                    );
                }
                
                return true;
            })
            .slice(skip, skip + limit)
            .map(([key, value]) => createMetaPreview(value, key))
            .filter(meta => meta && meta.id); // Filtrar elementos válidos
        
        console.log(`Returning ${items.length} items for catalog ${type}:${id}`);
        return Promise.resolve({ metas: items });
    } catch (error) {
        console.error('Catalog handler error:', error);
        return Promise.resolve({ metas: [] });
    }
});

// Handler para metadatos
builder.defineMetaHandler(({ type, id }) => {
    console.log(`Meta request - Type: ${type}, ID: ${id}`);
    
    try {
        // Buscar el item exacto o el item base para episodios
        let item = Object.entries(dataset).find(([key]) => key === id);
        
        if (!item) {
            // Buscar por ID base o series ID
            item = Object.entries(dataset).find(([key, value]) => 
                extractBaseId(key) === id || value.seriesId === id
            );
        }
        
        if (!item) {
            console.log(`No meta found for ID: ${id}`);
            return Promise.resolve({ meta: null });
        }
        
        const meta = createFullMeta(item[1], item[0]);
        console.log(`Returning meta for ${id}:`, meta.name);
        return Promise.resolve({ meta });
    } catch (error) {
        console.error('Meta handler error:', error);
        return Promise.resolve({ meta: null });
    }
});

// Configurar Express
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTML del panel de administración (igual que antes)
const adminHTML = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Panel Admin - Stremio Latino Chile</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(45deg, #1e3c72, #2a5298);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            padding: 30px;
            background: #f8f9fa;
        }
        .stat-card {
            background: linear-gradient(45deg, #667eea, #764ba2);
            color: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
        }
        .stat-number {
            font-size: 2em;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .content {
            padding: 30px;
        }
        .addon-url {
            background: #e9ecef;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            font-family: monospace;
            word-break: break-all;
        }
        .btn {
            padding: 10px 20px;
            background: #667eea;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
            margin: 5px;
        }
        .btn:hover { background: #5a67d8; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎬 Stremio Addon - Latino Chile</h1>
            <p>Panel de Control v1.2.1</p>
        </div>
        
        <div class="stats">
            <div class="stat-card">
                <div class="stat-number" id="movieCount">0</div>
                <div>Películas</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="seriesCount">0</div>
                <div>Series</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="episodeCount">0</div>
                <div>Episodios</div>
            </div>
        </div>
        
        <div class="content">
            <h2>URLs del Addon</h2>
            <p><strong>Manifest:</strong></p>
            <div class="addon-url" id="manifestUrl"></div>
            
            <p><strong>Para instalar en Stremio:</strong></p>
            <div class="addon-url" id="installUrl"></div>
            
            <a href="#" class="btn" onclick="copyManifest()">Copiar URL de Instalación</a>
            <a href="/manifest.json" class="btn" target="_blank">Ver Manifest</a>
            
            <h3>Contenido Disponible</h3>
            <div id="contentList"></div>
        </div>
    </div>
    
    <script>
        function updateStats() {
            fetch('/admin/stats')
                .then(r => r.json())
                .then(data => {
                    document.getElementById('movieCount').textContent = data.movies;
                    document.getElementById('seriesCount').textContent = data.series;
                    document.getElementById('episodeCount').textContent = data.episodes;
                })
                .catch(console.error);
        }
        
        function loadContent() {
            fetch('/admin/content')
                .then(r => r.json())
                .then(data => {
                    const list = document.getElementById('contentList');
                    list.innerHTML = data.map(item => 
                        \`<div style="margin: 10px 0; padding: 10px; background: #f8f9fa; border-radius: 5px;">
                            <strong>\${item.name}</strong> (\${item.type}) - \${item.year}
                        </div>\`
                    ).join('');
                })
                .catch(console.error);
        }
        
        function setupUrls() {
            const base = window.location.origin;
            const manifestUrl = base + '/manifest.json';
            const installUrl = base + '/manifest.json';
            
            document.getElementById('manifestUrl').textContent = manifestUrl;
            document.getElementById('installUrl').textContent = installUrl;
        }
        
        function copyManifest() {
            const url = document.getElementById('installUrl').textContent;
            navigator.clipboard.writeText(url).then(() => {
                alert('URL copiada al portapapeles');
            });
        }
        
        window.addEventListener('load', () => {
            setupUrls();
            updateStats();
            loadContent();
        });
    </script>
</body>
</html>
`;

// Rutas del panel de administración
app.get('/admin', (req, res) => {
    res.send(adminHTML);
});

app.get('/admin/stats', (req, res) => {
    const movies = Object.values(dataset).filter(v => v.type === 'movie').length;
    const series = Object.values(dataset).filter(v => v.type === 'series' && !v.id?.includes(':')).length;
    const episodes = Object.values(dataset).filter(v => v.type === 'series' && v.id?.includes(':')).length;
    
    res.json({ movies, series, episodes });
});

app.get('/admin/content', (req, res) => {
    const content = Object.values(dataset)
        .filter(item => !item.id?.includes(':'))
        .map(item => ({
            id: item.id,
            name: item.name,
            type: item.type,
            year: item.year
        }));
    
    res.json(content);
});

// Integrar las rutas del addon con Express
const addonInterface = builder.getInterface();

app.get('/manifest.json', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', '*');
    res.json(manifest);
});

app.get('/catalog/:type/:id.json', async (req, res) => {
    try {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', '*');
        
        const args = {
            type: req.params.type,
            id: req.params.id,
            extra: {}
        };
        
        const result = await addonInterface.catalog(args);
        res.json(result);
    } catch (error) {
        console.error('Catalog route error:', error);
        res.status(500).json({ metas: [] });
    }
});

app.get('/catalog/:type/:id/:extra.json', async (req, res) => {
    try {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', '*');
        
        const args = {
            type: req.params.type,
            id: req.params.id,
            extra: {}
        };
        
        // Parsear parámetros extra
        const extraString = decodeURIComponent(req.params.extra);
        const extraParams = extraString.split('&');
        
        extraParams.forEach(param => {
            const [key, value] = param.split('=');
            if (key && value) {
                args.extra[key] = decodeURIComponent(value);
            }
        });
        
        const result = await addonInterface.catalog(args);
        res.json(result);
    } catch (error) {
        console.error('Catalog with extra route error:', error);
        res.status(500).json({ metas: [] });
    }
});

app.get('/meta/:type/:id.json', async (req, res) => {
    try {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', '*');
        
        const args = {
            type: req.params.type,
            id: req.params.id
        };
        
        const result = await addonInterface.meta(args);
        res.json(result);
    } catch (error) {
        console.error('Meta route error:', error);
        res.status(500).json({ meta: null });
    }
});

app.get('/stream/:type/:id.json', async (req, res) => {
    try {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', '*');
        
        const args = {
            type: req.params.type,
            id: req.params.id
        };
        
        const result = await addonInterface.stream(args);
        res.json(result);
    } catch (error) {
        console.error('Stream route error:', error);
        res.status(500).json({ streams: [] });
    }
});

// Manejar CORS para todas las rutas
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// Iniciar servidor
const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`🚀 Stremio Addon iniciado correctamente`);
    console.log(`📍 Puerto: ${port}`);
    console.log(`📱 Manifest: http://localhost:${port}/manifest.json`);
    console.log(`⚙️  Admin Panel: http://localhost:${port}/admin`);
    console.log(`🎬 Películas disponibles: ${Object.values(dataset).filter(v => v.type === 'movie').length}`);
    console.log(`📺 Series disponibles: ${Object.values(dataset).filter(v => v.type === 'series' && !v.id?.includes(':')).length}`);
    console.log(`🎭 Episodios disponibles: ${Object.values(dataset).filter(v => v.type === 'series' && v.id?.includes(':')).length}`);
    console.log(`\n📋 Para instalar en Stremio, usa esta URL:`);
    console.log(`   http://localhost:${port}/manifest.json`);
});

// Manejo de señales de terminación
['SIGINT', 'SIGTERM'].forEach(signal => {
    process.on(signal, () => {
        console.log(`\n🔄 Cerrando servidor por señal ${signal}`);
        process.exit(0);
    });
});