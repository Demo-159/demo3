const { addonBuilder } = require("stremio-addon-sdk");
const express = require('express');

const manifest = {
    "id": "org.stremio.addon-latino-chile",
    "version": "1.2.0",
    "name": "Reproducir ahora",
    "description": "Contenido en Español Latino",
    "icon": "https://i.imgur.com/ZKoR8Qa.png",
    "resources": ["catalog", "stream", "meta"],
    "types": ["movie", "series"],
    "catalogs": [
        {
            type: "movie",
            id: "peliculas-latino-cl",
            name: "Películas Latino",
            extra: [
                { 
                    name: "genre", 
                    options: ["Acción", "Comedia", "Drama", "Animación", "Aventura", "Familiar"],
                    isRequired: false
                },
                {
                    name: "skip",
                    isRequired: false
                }
            ]
        },
        {
            type: "series",
            id: "series-latino-cl", 
            name: "Series Latino",
            extra: [
                { 
                    name: "genre", 
                    options: ["Comedia", "Animación", "Familiar", "Drama"],
                    isRequired: false
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
        "p2p": false,
        "configurable": true,
        "configurationRequired": false
    }
};

// Dataset inicial vacío - el contenido se añadirá desde el panel
let dataset = {};

// Funciones auxiliares mejoradas
const extractBaseId = (key) => key.split(":")[0];
const isEpisode = (key) => key.includes(":");
const getQuality = (item) => item.quality || (item.url?.includes('1080p') ? '1080p' : item.url?.includes('720p') ? '720p' : 'SD');

const createMetaPreview = (item, key) => {
    const baseId = extractBaseId(key);
    return {
        id: baseId,
        type: item.type,
        name: item.seriesName || item.name,
        genres: Array.isArray(item.genre) ? item.genre : [item.genre || "General"],
        year: parseInt(item.year) || new Date().getFullYear(),
        poster: item.poster || "https://via.placeholder.com/300x450/000000/FFFFFF/?text=No+Image",
        posterShape: "poster",
        background: item.background || item.poster,
        description: item.description || "Sin descripción disponible",
        imdbRating: item.imdbRating ? parseFloat(item.imdbRating) : undefined,
        language: "spa"
    };
};

const createFullMeta = (item, key) => {
    try {
        const meta = createMetaPreview(item, key);
        
        // Añadir información adicional
        if (item.director) meta.director = Array.isArray(item.director) ? item.director : [item.director];
        if (item.cast) meta.cast = Array.isArray(item.cast) ? item.cast : item.cast.split(',').map(s => s.trim());
        if (item.runtime) meta.runtime = item.runtime;
        
        // Para series, añadir episodes
        if (item.type === "series") {
            const episodes = Object.entries(dataset)
                .filter(([k, v]) => {
                    return v.seriesId === item.seriesId && isEpisode(k);
                })
                .sort((a, b) => {
                    const [aSeason, aEpisode] = [parseInt(a[0].split(":")[1]), parseInt(a[0].split(":")[2])];
                    const [bSeason, bEpisode] = [parseInt(b[0].split(":")[1]), parseInt(b[0].split(":")[2])];
                    return aSeason !== bSeason ? aSeason - bSeason : aEpisode - bEpisode;
                })
                .map(([k, v]) => ({
                    id: k,
                    title: `S${String(v.season).padStart(2, '0')}E${String(v.episode).padStart(2, '0')} - ${v.name}`,
                    season: parseInt(v.season),
                    episode: parseInt(v.episode),
                    overview: v.description || "Sin descripción",
                    released: new Date(v.year || item.year, 0, 1).toISOString(),
                    thumbnail: v.poster || item.poster
                }));
            
            if (episodes.length > 0) {
                meta.videos = episodes;
            }
        }
        
        return meta;
    } catch (error) {
        console.error('Error creating full meta:', error);
        return null;
    }
};

const createStream = (item) => {
    const quality = getQuality(item);
    const stream = {
        title: `${item.name || item.seriesName} - ${quality} [Latino]`,
        name: `${item.name || item.seriesName}`,
        description: `Calidad: ${quality} | Idioma: Español Latino`
    };
    
    // Configurar URL o torrent
    if (item.url) {
        stream.url = item.url;
        stream.behaviorHints = {
            notWebReady: false,
            bingeGroup: item.seriesId || item.id,
            countryWhitelist: ['CL', 'AR', 'MX', 'CO', 'PE', 'UY', 'EC', 'BO', 'PY']
        };
    } else if (item.infoHash) {
        stream.infoHash = item.infoHash;
        stream.behaviorHints = { p2p: true };
        if (item.fileIdx) stream.fileIdx = item.fileIdx;
    }
    
    return stream;
};

// Crear el builder de Stremio
const builder = new addonBuilder(manifest);

// Handler para streams
builder.defineStreamHandler(({ type, id }) => {
    console.log(`Stream request: ${type}/${id}`);
    
    try {
        const item = dataset[id];
        if (!item) {
            console.log(`No item found for ID: ${id}`);
            return Promise.resolve({ streams: [] });
        }
        
        const stream = createStream(item);
        console.log(`Stream created:`, stream.title);
        
        return Promise.resolve({ streams: [stream] });
    } catch (error) {
        console.error('Error in streamHandler:', error);
        return Promise.resolve({ streams: [] });
    }
});

// Handler para catálogos
builder.defineCatalogHandler(({ type, id, extra }) => {
    console.log(`Catalog request: ${type}/${id}`, extra);
    
    try {
        const skip = parseInt(extra?.skip) || 0;
        const limit = 20;
        
        let items = Object.entries(dataset)
            .filter(([key, value]) => {
                // Filtrar por tipo
                if (value.type !== type) return false;
                
                // Para series, no mostrar episodios en el catálogo
                if (value.type === "series" && isEpisode(key)) return false;
                
                // Filtrar por género si se especifica
                if (extra?.genre) {
                    const itemGenres = Array.isArray(value.genre) ? value.genre : [value.genre];
                    return itemGenres.some(g => 
                        g && (
                            g.toLowerCase().includes(extra.genre.toLowerCase()) ||
                            extra.genre.toLowerCase().includes(g.toLowerCase())
                        )
                    );
                }
                
                return true;
            })
            .slice(skip, skip + limit)
            .map(([key, value]) => createMetaPreview(value, key))
            .filter(item => item !== null);
        
        console.log(`Catalog response: ${items.length} items`);
        return Promise.resolve({ metas: items });
    } catch (error) {
        console.error('Error in catalogHandler:', error);
        return Promise.resolve({ metas: [] });
    }
});

// Handler para metadatos
builder.defineMetaHandler(({ type, id }) => {
    console.log(`Meta request: ${type}/${id}`);
    
    try {
        // Buscar por ID exacto primero
        let item = Object.entries(dataset).find(([key]) => key === id);
        
        // Si no se encuentra, buscar por ID base o seriesId
        if (!item) {
            item = Object.entries(dataset).find(([key, value]) => 
                extractBaseId(key) === id || value.seriesId === id
            );
        }
        
        if (!item) {
            console.log(`No meta found for ID: ${id}`);
            return Promise.resolve({ meta: null });
        }
        
        const meta = createFullMeta(item[1], item[0]);
        console.log(`Meta created for:`, meta?.name);
        
        return Promise.resolve({ meta });
    } catch (error) {
        console.error('Error in metaHandler:', error);
        return Promise.resolve({ meta: null });
    }
});

// Panel de administración (manteniendo el HTML original pero simplificado)
const adminPanelHTML = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Panel de Administración - Stremio Addon</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; margin-bottom: 30px; text-align: center; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .stat-card { background: white; padding: 25px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; }
        .stat-number { font-size: 32px; font-weight: bold; color: #667eea; }
        .stat-label { color: #666; margin-top: 5px; }
        .addon-url { background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 30px; }
        .url-box { display: flex; align-items: center; gap: 10px; }
        .url-input { flex: 1; padding: 10px; border: 2px solid #e1e5e9; border-radius: 6px; font-family: monospace; }
        .btn { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer; }
        .form-container { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 20px; }
        .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .form-group { margin-bottom: 20px; }
        .form-group label { display: block; margin-bottom: 8px; font-weight: 600; color: #333; }
        .form-group input, .form-group textarea, .form-group select { width: 100%; padding: 12px; border: 2px solid #e1e5e9; border-radius: 6px; font-size: 14px; }
        .status { padding: 15px; text-align: center; border-radius: 6px; margin: 10px 0; }
        .status.success { background: #d4edda; color: #155724; }
        .status.error { background: #f8d7da; color: #721c24; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎬 Panel de Administración - Stremio Addon Chile</h1>
            <p>Gestiona tu contenido de forma fácil e intuitiva</p>
        </div>

        <div class="addon-url">
            <h3>📱 URL del Addon para Stremio:</h3>
            <div class="url-box">
                <input type="text" class="url-input" id="addonUrl" readonly>
                <button class="btn" onclick="copyUrl()">📋 Copiar</button>
            </div>
            <p style="margin-top: 10px; color: #666; font-size: 14px;">
                Copia esta URL y pégala en Stremio → Addons → Add Addon
            </p>
        </div>

        <div class="stats">
            <div class="stat-card">
                <div class="stat-number" id="movieCount">0</div>
                <div class="stat-label">Películas</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="seriesCount">0</div>
                <div class="stat-label">Series</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="episodeCount">0</div>
                <div class="stat-label">Episodios</div>
            </div>
        </div>

        <div id="status"></div>

        <div class="form-container">
            <h2>🎬 Añadir Película de Prueba</h2>
            <button class="btn" onclick="addTestMovie()">➕ Añadir Película de Prueba</button>
            <p style="margin-top: 10px; color: #666;">
                Esto añadirá una película de prueba para verificar que el addon funciona correctamente.
            </p>
        </div>
    </div>

    <script>
        // Establecer URL del addon
        document.getElementById('addonUrl').value = window.location.origin + '/manifest.json';

        function copyUrl() {
            const urlInput = document.getElementById('addonUrl');
            urlInput.select();
            document.execCommand('copy');
            showStatus('✅ URL copiada al portapapeles');
        }

        function showStatus(message, type = 'success') {
            const status = document.getElementById('status');
            status.innerHTML = \`<div class="status \${type}">\${message}</div>\`;
            setTimeout(() => status.innerHTML = '', 5000);
        }

        async function addTestMovie() {
            const testMovie = {
                id: 'tt0111161',
                name: 'The Shawshank Redemption',
                year: 1994,
                genre: ['Drama'],
                type: 'movie',
                description: 'Película de prueba para verificar el funcionamiento del addon.',
                poster: 'https://m.media-amazon.com/images/M/MV5BMDFkYTc0MGEtZmNhMC00ZDIzLWFmNTEtODM1ZmRlYWMwMWFmXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_SX300.jpg',
                url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                quality: '1080p',
                language: 'Latino'
            };

            try {
                const response = await fetch('/admin/add-movie', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(testMovie)
                });
                
                const result = await response.json();
                if (result.success) {
                    showStatus('✅ Película de prueba añadida correctamente');
                    updateStats();
                } else {
                    showStatus(result.error, 'error');
                }
            } catch (error) {
                showStatus('❌ Error al añadir película de prueba', 'error');
            }
        }

        async function updateStats() {
            try {
                const response = await fetch('/admin/stats');
                const stats = await response.json();
                
                document.getElementById('movieCount').textContent = stats.movies;
                document.getElementById('seriesCount').textContent = stats.series;
                document.getElementById('episodeCount').textContent = stats.episodes;
            } catch (error) {
                console.error('Error updating stats:', error);
            }
        }

        // Cargar estadísticas al inicio
        updateStats();
    </script>
</body>
</html>
`;

// Crear servidor Express
const app = express();
app.use(express.json());

// Panel de administración
app.get('/admin', (req, res) => {
    res.send(adminPanelHTML);
});

// API endpoints para el panel
app.post('/admin/add-movie', (req, res) => {
    try {
        const movie = req.body;
        
        if (!movie.id || !movie.name || !movie.url) {
            return res.json({ success: false, error: 'Campos obligatorios faltantes' });
        }
        
        movie.type = 'movie';
        movie.language = 'Latino';
        
        dataset[movie.id] = movie;
        console.log(`Movie added: ${movie.name} (${movie.id})`);
        res.json({ success: true });
    } catch (error) {
        console.error('Error adding movie:', error);
        res.json({ success: false, error: 'Error interno del servidor' });
    }
});

app.get('/admin/stats', (req, res) => {
    try {
        const movies = Object.values(dataset).filter(item => item.type === 'movie').length;
        const series = Object.values(dataset).filter(item => item.type === 'series' && !item.id?.includes(':')).length;
        const episodes = Object.keys(dataset).filter(key => key.includes(':')).length;
        
        res.json({ movies, series, episodes });
    } catch (error) {
        console.error('Error getting stats:', error);
        res.json({ movies: 0, series: 0, episodes: 0 });
    }
});

// Rutas del addon de Stremio
const stremioInterface = builder.getInterface();

app.get('/manifest.json', (req, res) => {
    console.log('Manifest requested');
    res.json(stremioInterface.manifest);
});

app.get('/catalog/:type/:id.json', (req, res) => {
    console.log(`Catalog requested: ${req.params.type}/${req.params.id}`);
    stremioInterface(req, res);
});

app.get('/catalog/:type/:id/:extra.json', (req, res) => {
    console.log(`Catalog with extra requested: ${req.params.type}/${req.params.id}/${req.params.extra}`);
    stremioInterface(req, res);
});

app.get('/meta/:type/:id.json', (req, res) => {
    console.log(`Meta requested: ${req.params.type}/${req.params.id}`);
    stremioInterface(req, res);
});

app.get('/stream/:type/:id.json', (req, res) => {
    console.log(`Stream requested: ${req.params.type}/${req.params.id}`);
    stremioInterface(req, res);
});

// Ruta raíz
app.get('/', (req, res) => {
    res.redirect('/admin');
});

// Iniciar servidor
const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`🚀 Stremio Addon Chile iniciado en puerto ${port}`);
    console.log(`📱 Panel de Administración: http://localhost:${port}/admin`);
    console.log(`📱 Manifest URL: http://localhost:${port}/manifest.json`);
    console.log(`🎬 Total contenido: ${Object.keys(dataset).length} items`);
}).on('error', (error) => {
    console.error('Error starting server:', error);
});