const { addonBuilder, serveHTTP } = require("stremio-addon-sdk");
const express = require("express");
const path = require("path");

const manifest = {
    "id": "org.demo.stremio-addon-latino",
    "version": "1.0.2",
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

// Dataset inicial (tu contenido existente)
let dataset = {
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
    // ... resto de tu dataset existente
};

// Utilidades
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
    
    meta.director = value.director;
    meta.cast = value.cast;
    meta.runtime = value.runtime;
    meta.country = "Estados Unidos";
    meta.language = "Español Latino";
    meta.awards = "Varios premios internacionales";
    meta.website = "https://github.com/tu-usuario/stremio-addon-latino";
    
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

const getStreamQuality = (item) => {
    if (item.quality) return item.quality;
    if (item.url && item.url.includes('1080p')) return '1080p';
    if (item.url && item.url.includes('720p')) return '720p';
    return 'SD';
};

// Crear addon builder
const builder = new addonBuilder(manifest);

// Handlers del addon
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
        
        if (item.infoHash) {
            stream.title += " (Torrent)";
            stream.behaviorHints.p2p = true;
        }
        
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

builder.defineCatalogHandler(function(args) {
    console.log("📚 Solicitud de catálogo:", args);
    
    const skip = parseInt(args.extra?.skip) || 0;
    const limit = 20;
    
    let filteredItems = Object.entries(dataset)
        .filter(([key, value]) => {
            if (value.type !== args.type) return false;
            if (value.type === "series" && key.includes(":")) {
                return false;
            }
            
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
    
    console.log(`📄 Página ${Math.floor(skip/limit) + 1}: ${paginatedItems.length} items`);
    
    return Promise.resolve({ metas: paginatedItems });
});

builder.defineMetaHandler(function(args) {
    console.log("📝 Solicitud de metadatos para:", args.id);
    
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
        console.log("✅ Metadatos encontrados:", meta.name);
        return Promise.resolve({ meta: meta }); 
    } else {
        console.log("❌ No se encontraron metadatos para:", args.id);
        return Promise.resolve({ meta: null });
    }
});

// Crear servidor Express para el panel de administración
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Generar ID único para nuevos elementos
const generateId = (type) => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `latino_${type}_${timestamp}_${random}`;
};

// API Routes para el panel de administración

// Obtener todo el contenido
app.get('/api/content', (req, res) => {
    const movies = Object.entries(dataset)
        .filter(([key, value]) => value.type === 'movie')
        .map(([key, value]) => ({ id: key, ...value }));
    
    const series = Object.entries(dataset)
        .filter(([key, value]) => value.type === 'series' && !key.includes(':'))
        .map(([key, value]) => ({ id: key, ...value }));
    
    res.json({ movies, series });
});

// Agregar película
app.post('/api/movies', (req, res) => {
    try {
        const movieData = req.body;
        const id = movieData.imdbId || generateId('movie');
        
        const newMovie = {
            id: id,
            type: "movie",
            name: movieData.name,
            genre: Array.isArray(movieData.genre) ? movieData.genre : movieData.genre.split(',').map(g => g.trim()),
            year: parseInt(movieData.year),
            director: movieData.director,
            cast: Array.isArray(movieData.cast) ? movieData.cast : movieData.cast.split(',').map(c => c.trim()),
            description: movieData.description,
            poster: movieData.poster,
            background: movieData.background || movieData.poster,
            logo: movieData.logo,
            runtime: movieData.runtime,
            imdbRating: movieData.imdbRating,
            url: movieData.url,
            infoHash: movieData.infoHash,
            magnetUri: movieData.magnetUri,
            sources: movieData.infoHash ? [`dht:${movieData.infoHash}`] : undefined,
            title: `${movieData.name} (${movieData.year}) - ${movieData.quality || 'HD'} Latino`,
            quality: movieData.quality || 'HD',
            language: "Latino"
        };
        
        // Limpiar campos undefined
        Object.keys(newMovie).forEach(key => {
            if (newMovie[key] === undefined || newMovie[key] === '') {
                delete newMovie[key];
            }
        });
        
        dataset[id] = newMovie;
        
        console.log(`✅ Nueva película agregada: ${newMovie.name} (${id})`);
        res.json({ success: true, id: id, movie: newMovie });
    } catch (error) {
        console.error('❌ Error al agregar película:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Agregar serie
app.post('/api/series', (req, res) => {
    try {
        const seriesData = req.body;
        const id = seriesData.imdbId || generateId('series');
        
        const newSeries = {
            id: id,
            type: "series",
            name: seriesData.name,
            seriesId: id,
            seriesName: seriesData.name,
            genre: Array.isArray(seriesData.genre) ? seriesData.genre : seriesData.genre.split(',').map(g => g.trim()),
            year: parseInt(seriesData.year),
            director: seriesData.director,
            cast: Array.isArray(seriesData.cast) ? seriesData.cast : seriesData.cast.split(',').map(c => c.trim()),
            description: seriesData.description,
            poster: seriesData.poster,
            background: seriesData.background || seriesData.poster,
            imdbRating: seriesData.imdbRating,
            language: "Latino"
        };
        
        // Limpiar campos undefined
        Object.keys(newSeries).forEach(key => {
            if (newSeries[key] === undefined || newSeries[key] === '') {
                delete newSeries[key];
            }
        });
        
        dataset[id] = newSeries;
        
        console.log(`✅ Nueva serie agregada: ${newSeries.name} (${id})`);
        res.json({ success: true, id: id, series: newSeries });
    } catch (error) {
        console.error('❌ Error al agregar serie:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Agregar episodio a una serie
app.post('/api/series/:seriesId/episodes', (req, res) => {
    try {
        const { seriesId } = req.params;
        const episodeData = req.body;
        
        if (!dataset[seriesId] || dataset[seriesId].type !== 'series') {
            return res.status(404).json({ success: false, error: 'Serie no encontrada' });
        }
        
        const episodeId = `${seriesId}:${episodeData.season}:${episodeData.episode}`;
        
        const newEpisode = {
            id: episodeId,
            type: "series",
            name: episodeData.name,
            genre: dataset[seriesId].genre,
            year: dataset[seriesId].year,
            episode: parseInt(episodeData.episode),
            season: parseInt(episodeData.season),
            seriesId: seriesId,
            seriesName: dataset[seriesId].name,
            description: episodeData.description,
            poster: dataset[seriesId].poster,
            background: dataset[seriesId].background,
            runtime: episodeData.runtime || "30 min",
            url: episodeData.url,
            infoHash: episodeData.infoHash,
            magnetUri: episodeData.magnetUri,
            sources: episodeData.infoHash ? [`dht:${episodeData.infoHash}`] : undefined,
            title: `S${episodeData.season}E${episodeData.episode} - ${episodeData.name} - ${episodeData.quality || 'HD'} Latino`,
            quality: episodeData.quality || 'HD',
            language: "Latino"
        };
        
        // Limpiar campos undefined
        Object.keys(newEpisode).forEach(key => {
            if (newEpisode[key] === undefined || newEpisode[key] === '') {
                delete newEpisode[key];
            }
        });
        
        dataset[episodeId] = newEpisode;
        
        console.log(`✅ Nuevo episodio agregado: ${newEpisode.seriesName} S${newEpisode.season}E${newEpisode.episode}`);
        res.json({ success: true, id: episodeId, episode: newEpisode });
    } catch (error) {
        console.error('❌ Error al agregar episodio:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Eliminar contenido
app.delete('/api/content/:id', (req, res) => {
    try {
        const { id } = req.params;
        
        if (!dataset[id]) {
            return res.status(404).json({ success: false, error: 'Contenido no encontrado' });
        }
        
        const item = dataset[id];
        
        // Si es una serie, eliminar también todos sus episodios
        if (item.type === 'series' && !id.includes(':')) {
            Object.keys(dataset).forEach(key => {
                if (key.startsWith(id + ':')) {
                    delete dataset[key];
                    console.log(`🗑️ Episodio eliminado: ${key}`);
                }
            });
        }
        
        delete dataset[id];
        console.log(`🗑️ Contenido eliminado: ${item.name} (${id})`);
        
        res.json({ success: true, message: 'Contenido eliminado correctamente' });
    } catch (error) {
        console.error('❌ Error al eliminar contenido:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Servir panel de administración
app.get('/admin', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Panel de Administración - Stremio Addon Latino</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 12px; margin-bottom: 30px; text-align: center; }
        .header h1 { font-size: 2.5em; margin-bottom: 10px; }
        .header p { opacity: 0.9; font-size: 1.1em; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .stat-card { background: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); text-align: center; }
        .stat-number { font-size: 2.5em; font-weight: bold; color: #667eea; }
        .tabs { display: flex; gap: 10px; margin-bottom: 30px; }
        .tab { background: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 16px; transition: all 0.3s; }
        .tab.active { background: #667eea; color: white; }
        .tab-content { display: none; }
        .tab-content.active { display: block; }
        .form-section { background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); margin-bottom: 30px; }
        .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .form-group { margin-bottom: 20px; }
        .form-group label { display: block; margin-bottom: 8px; font-weight: 600; color: #333; }
        .form-group input, .form-group textarea, .form-group select { width: 100%; padding: 12px; border: 2px solid #e1e5e9; border-radius: 8px; font-size: 16px; transition: border-color 0.3s; }
        .form-group input:focus, .form-group textarea:focus, .form-group select:focus { outline: none; border-color: #667eea; }
        .form-group textarea { height: 100px; resize: vertical; }
        .btn { background: #667eea; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 16px; transition: all 0.3s; }
        .btn:hover { background: #5a6fd8; transform: translateY(-2px); }
        .btn-danger { background: #e74c3c; }
        .btn-danger:hover { background: #c0392b; }
        .content-list { background: white; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden; }
        .content-item { display: flex; align-items: center; padding: 20px; border-bottom: 1px solid #eee; }
        .content-item:last-child { border-bottom: none; }
        .content-poster { width: 60px; height: 90px; object-fit: cover; border-radius: 8px; margin-right: 20px; }
        .content-info { flex: 1; }
        .content-title { font-size: 18px; font-weight: 600; margin-bottom: 5px; }
        .content-meta { color: #666; font-size: 14px; }
        .content-actions { display: flex; gap: 10px; }
        .manifest-info { background: #e8f4fd; border: 1px solid #bee5eb; border-radius: 8px; padding: 20px; margin-bottom: 30px; }
        .manifest-url { background: white; padding: 10px; border-radius: 4px; font-family: monospace; word-break: break-all; margin: 10px 0; }
        .success-message { background: #d4edda; color: #155724; padding: 15px; border-radius: 8px; margin-bottom: 20px; display: none; }
        .error-message { background: #f8d7da; color: #721c24; padding: 15px; border-radius: 8px; margin-bottom: 20px; display: none; }
    </style>
</head>
<body>
    <div class="container">
        <header class="header">
            <h1>🎬 Panel de Administración</h1>
            <p>Gestiona fácilmente el contenido de tu Addon de Stremio</p>
        </header>

        <div class="manifest-info">
            <h3>📱 URL del Manifest para Stremio:</h3>
            <div class="manifest-url" id="manifestUrl">Cargando...</div>
            <small>Copia esta URL y pégala en Stremio para instalar el addon</small>
        </div>

        <div class="stats" id="stats"></div>

        <div class="success-message" id="successMessage"></div>
        <div class="error-message" id="errorMessage"></div>

        <div class="tabs">
            <button class="tab active" onclick="showTab('add-movie')">➕ Agregar Película</button>
            <button class="tab" onclick="showTab('add-series')">📺 Agregar Serie</button>
            <button class="tab" onclick="showTab('manage-content')">📚 Gestionar Contenido</button>
        </div>

        <div id="add-movie" class="tab-content active">
            <div class="form-section">
                <h2>🎬 Agregar Nueva Película</h2>
                <form id="movieForm" class="form-grid">
                    <div class="form-group">
                        <label for="movieName">Nombre de la Película *</label>
                        <input type="text" id="movieName" name="name" required>
                    </div>
                    <div class="form-group">
                        <label for="movieYear">Año *</label>
                        <input type="number" id="seriesYear" name="year" min="1900" max="2030" required>
                    </div>
                    <div class="form-group">
                        <label for="seriesImdbId">ID de IMDB (opcional)</label>
                        <input type="text" id="seriesImdbId" name="imdbId" placeholder="tt1234567">
                    </div>
                    <div class="form-group">
                        <label for="seriesGenre">Géneros (separados por comas) *</label>
                        <input type="text" id="seriesGenre" name="genre" placeholder="Comedia, Drama, Familiar" required>
                    </div>
                    <div class="form-group">
                        <label for="seriesDirector">Director/Creador</label>
                        <input type="text" id="seriesDirector" name="director">
                    </div>
                    <div class="form-group">
                        <label for="seriesCast">Reparto (separado por comas)</label>
                        <input type="text" id="seriesCast" name="cast" placeholder="Actor 1, Actor 2, Actor 3">
                    </div>
                    <div class="form-group">
                        <label for="seriesRating">Calificación IMDB</label>
                        <input type="text" id="seriesRating" name="imdbRating" placeholder="8.5">
                    </div>
                    <div class="form-group">
                        <label for="seriesPoster">URL del Poster *</label>
                        <input type="url" id="seriesPoster" name="poster" required>
                    </div>
                    <div class="form-group">
                        <label for="seriesBackground">URL del Fondo</label>
                        <input type="url" id="seriesBackground" name="background">
                    </div>
                    <div class="form-group" style="grid-column: 1 / -1;">
                        <label for="seriesDescription">Descripción *</label>
                        <textarea id="seriesDescription" name="description" required></textarea>
                    </div>
                    <div style="grid-column: 1 / -1;">
                        <button type="submit" class="btn">📺 Crear Serie</button>
                    </div>
                </form>
            </div>

            <div class="form-section" id="episodeSection" style="display: none;">
                <h2>➕ Agregar Episodio a Serie</h2>
                <form id="episodeForm" class="form-grid">
                    <input type="hidden" id="episodeSeriesId" name="seriesId">
                    <div class="form-group">
                        <label for="episodeSeason">Temporada *</label>
                        <input type="number" id="episodeSeason" name="season" min="1" required>
                    </div>
                    <div class="form-group">
                        <label for="episodeNumber">Número de Episodio *</label>
                        <input type="number" id="episodeNumber" name="episode" min="1" required>
                    </div>
                    <div class="form-group">
                        <label for="episodeName">Nombre del Episodio *</label>
                        <input type="text" id="episodeName" name="name" required>
                    </div>
                    <div class="form-group">
                        <label for="episodeRuntime">Duración</label>
                        <input type="text" id="episodeRuntime" name="runtime" placeholder="30 min">
                    </div>
                    <div class="form-group">
                        <label for="episodeQuality">Calidad</label>
                        <select id="episodeQuality" name="quality">
                            <option value="1080p">1080p</option>
                            <option value="720p">720p</option>
                            <option value="480p">480p</option>
                            <option value="HD">HD</option>
                            <option value="SD">SD</option>
                        </select>
                    </div>
                    <div class="form-group" style="grid-column: 1 / -1;">
                        <label for="episodeDescription">Descripción *</label>
                        <textarea id="episodeDescription" name="description" required></textarea>
                    </div>
                    <div class="form-group" style="grid-column: 1 / -1;">
                        <label for="episodeUrl">URL del Video (HTTP/HTTPS)</label>
                        <input type="url" id="episodeUrl" name="url" placeholder="https://ejemplo.com/episodio.mp4">
                        <small>O usa magnet/torrent abajo</small>
                    </div>
                    <div class="form-group">
                        <label for="episodeInfoHash">Info Hash (Torrent)</label>
                        <input type="text" id="episodeInfoHash" name="infoHash" placeholder="1234567890ABCDEF...">
                    </div>
                    <div class="form-group">
                        <label for="episodeMagnet">Magnet URI</label>
                        <input type="text" id="episodeMagnet" name="magnetUri" placeholder="magnet:?xt=urn:btih:...">
                    </div>
                    <div style="grid-column: 1 / -1;">
                        <button type="submit" class="btn">➕ Agregar Episodio</button>
                        <button type="button" class="btn" onclick="hideEpisodeForm()">Cancelar</button>
                    </div>
                </form>
            </div>
        </div>

        <div id="manage-content" class="tab-content">
            <div class="content-list" id="contentList">
                <p style="padding: 20px; text-align: center;">Cargando contenido...</p>
            </div>
        </div>
    </div>

    <script>
        let currentContent = { movies: [], series: [] };
        
        // Obtener URL base
        const baseUrl = window.location.origin;
        document.getElementById('manifestUrl').textContent = baseUrl + '/manifest.json';

        // Funciones de UI
        function showTab(tabName) {
            // Ocultar todos los tabs
            document.querySelectorAll('.tab-content').forEach(tab => {
                tab.classList.remove('active');
            });
            document.querySelectorAll('.tab').forEach(tab => {
                tab.classList.remove('active');
            });
            
            // Mostrar tab seleccionado
            document.getElementById(tabName).classList.add('active');
            event.target.classList.add('active');
            
            // Cargar contenido si es el tab de gestión
            if (tabName === 'manage-content') {
                loadContent();
            }
        }

        function showMessage(message, isError = false) {
            const successEl = document.getElementById('successMessage');
            const errorEl = document.getElementById('errorMessage');
            
            if (isError) {
                errorEl.textContent = message;
                errorEl.style.display = 'block';
                successEl.style.display = 'none';
            } else {
                successEl.textContent = message;
                successEl.style.display = 'block';
                errorEl.style.display = 'none';
            }
            
            // Ocultar mensaje después de 5 segundos
            setTimeout(() => {
                successEl.style.display = 'none';
                errorEl.style.display = 'none';
            }, 5000);
        }

        function updateStats() {
            const statsEl = document.getElementById('stats');
            const totalMovies = currentContent.movies.length;
            const totalSeries = currentContent.series.length;
            
            // Contar episodios
            let totalEpisodes = 0;
            currentContent.series.forEach(series => {
                // Esto sería más preciso con una llamada al servidor, pero estimamos
                totalEpisodes += 5; // Estimación
            });
            
            statsEl.innerHTML = `
                <div class="stat-card">
                    <div class="stat-number">${totalMovies}</div>
                    <div>Películas</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${totalSeries}</div>
                    <div>Series</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${totalEpisodes}+</div>
                    <div>Episodios</div>
                </div>
            `;
        }

        // Cargar contenido desde el servidor
        async function loadContent() {
            try {
                const response = await fetch('/api/content');
                const data = await response.json();
                currentContent = data;
                updateStats();
                renderContentList();
            } catch (error) {
                console.error('Error loading content:', error);
                showMessage('Error al cargar el contenido', true);
            }
        }

        function renderContentList() {
            const contentListEl = document.getElementById('contentList');
            const allContent = [...currentContent.movies, ...currentContent.series];
            
            if (allContent.length === 0) {
                contentListEl.innerHTML = '<p style="padding: 20px; text-align: center;">No hay contenido agregado aún</p>';
                return;
            }
            
            contentListEl.innerHTML = allContent.map(item => `
                <div class="content-item">
                    <img src="${item.poster}" alt="${item.name}" class="content-poster" onerror="this.src='https://via.placeholder.com/60x90?text=No+Image'">
                    <div class="content-info">
                        <div class="content-title">${item.name}</div>
                        <div class="content-meta">
                            ${item.type === 'movie' ? '🎬' : '📺'} ${item.year} • ${item.genre.join(', ')}
                            ${item.imdbRating ? `• ⭐ ${item.imdbRating}` : ''}
                        </div>
                    </div>
                    <div class="content-actions">
                        ${item.type === 'series' ? `<button class="btn" onclick="showEpisodeForm('${item.id}', '${item.name}')">➕ Episodio</button>` : ''}
                        <button class="btn btn-danger" onclick="deleteContent('${item.id}', '${item.name}')">🗑️ Eliminar</button>
                    </div>
                </div>
            `).join('');
        }

        function showEpisodeForm(seriesId, seriesName) {
            document.getElementById('episodeSeriesId').value = seriesId;
            document.getElementById('episodeSection').style.display = 'block';
            document.querySelector('#episodeSection h2').textContent = `➕ Agregar Episodio a: ${seriesName}`;
            
            // Scroll to episode form
            document.getElementById('episodeSection').scrollIntoView({ behavior: 'smooth' });
        }

        function hideEpisodeForm() {
            document.getElementById('episodeSection').style.display = 'none';
            document.getElementById('episodeForm').reset();
        }

        async function deleteContent(id, name) {
            if (!confirm(`¿Estás seguro de eliminar "${name}"?`)) return;
            
            try {
                const response = await fetch(`/api/content/${id}`, {
                    method: 'DELETE'
                });
                
                const result = await response.json();
                
                if (result.success) {
                    showMessage(`"${name}" eliminado correctamente`);
                    loadContent(); // Recargar lista
                } else {
                    showMessage(result.error || 'Error al eliminar', true);
                }
            } catch (error) {
                console.error('Error deleting content:', error);
                showMessage('Error al eliminar el contenido', true);
            }
        }

        // Event Listeners para formularios
        document.getElementById('movieForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(e.target);
            const movieData = Object.fromEntries(formData);
            
            try {
                const response = await fetch('/api/movies', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(movieData)
                });
                
                const result = await response.json();
                
                if (result.success) {
                    showMessage(`Película "${movieData.name}" agregada correctamente`);
                    e.target.reset();
                    loadContent(); // Actualizar stats
                } else {
                    showMessage(result.error || 'Error al agregar película', true);
                }
            } catch (error) {
                console.error('Error adding movie:', error);
                showMessage('Error al agregar la película', true);
            }
        });

        document.getElementById('seriesForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(e.target);
            const seriesData = Object.fromEntries(formData);
            
            try {
                const response = await fetch('/api/series', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(seriesData)
                });
                
                const result = await response.json();
                
                if (result.success) {
                    showMessage(`Serie "${seriesData.name}" creada correctamente`);
                    e.target.reset();
                    loadContent(); // Actualizar stats
                    
                    // Mostrar formulario de episodios
                    setTimeout(() => {
                        showEpisodeForm(result.id, seriesData.name);
                    }, 1000);
                } else {
                    showMessage(result.error || 'Error al crear serie', true);
                }
            } catch (error) {
                console.error('Error adding series:', error);
                showMessage('Error al crear la serie', true);
            }
        });

        document.getElementById('episodeForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(e.target);
            const episodeData = Object.fromEntries(formData);
            const seriesId = episodeData.seriesId;
            
            try {
                const response = await fetch(`/api/series/${seriesId}/episodes`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(episodeData)
                });
                
                const result = await response.json();
                
                if (result.success) {
                    showMessage(`Episodio "${episodeData.name}" agregado correctamente`);
                    // Limpiar solo los campos del episodio, mantener seriesId
                    const seriesIdValue = document.getElementById('episodeSeriesId').value;
                    e.target.reset();
                    document.getElementById('episodeSeriesId').value = seriesIdValue;
                } else {
                    showMessage(result.error || 'Error al agregar episodio', true);
                }
            } catch (error) {
                console.error('Error adding episode:', error);
                showMessage('Error al agregar el episodio', true);
            }
        });

        // Cargar contenido inicial
        loadContent();
    </script>
</body>
</html>
    `);
});

// Crear addon interface
const addonInterface = builder.getInterface();

// Montar el addon en Express
app.get('/manifest.json', (req, res) => {
    res.json(manifest);
});

app.get('/catalog/:type/:id/:extra?', (req, res) => {
    const catalogHandler = addonInterface.catalog;
    if (catalogHandler) {
        catalogHandler(req.params)
            .then(result => res.json(result))
            .catch(err => res.status(500).json({ error: err.message }));
    } else {
        res.status(404).json({ error: 'Catalog not found' });
    }
});

app.get('/meta/:type/:id', (req, res) => {
    const metaHandler = addonInterface.meta;
    if (metaHandler) {
        metaHandler(req.params)
            .then(result => res.json(result))
            .catch(err => res.status(500).json({ error: err.message }));
    } else {
        res.status(404).json({ error: 'Meta not found' });
    }
});

app.get('/stream/:type/:id', (req, res) => {
    const streamHandler = addonInterface.stream;
    if (streamHandler) {
        streamHandler(req.params)
            .then(result => res.json(result))
            .catch(err => res.status(500).json({ error: err.message }));
    } else {
        res.status(404).json({ error: 'Stream not found' });
    }
});

// Ruta principal que redirige al panel de administración
app.get('/', (req, res) => {
    res.redirect('/admin');
});

// Iniciar servidor
const port = process.env.PORT || 3000;
const host = process.env.HOST || '0.0.0.0';

app.listen(port, host, () => {
    console.log(`\n🚀 ═══════════════════════════════════════════════════════`);
    console.log(`   STREMIO ADDON LATINO CON PANEL DE ADMINISTRACIÓN`);
    console.log(`🚀 ═══════════════════════════════════════════════════════`);
    console.log(`🌐 Servidor: http://${host === '0.0.0.0' ? 'localhost' : host}:${port}`);
    console.log(`📱 Manifest: http://${host === '0.0.0.0' ? 'localhost' : host}:${port}/manifest.json`);
    console.log(`⚙️  Panel Admin: http://${host === '0.0.0.0' ? 'localhost' : host}:${port}/admin`);
    
    console.log(`\n📊 CONTENIDO ACTUAL:`);
    console.log(`   🎬 Películas: ${Object.values(dataset).filter(v => v.type === 'movie').length}`);
    console.log(`   📺 Series: ${Object.values(dataset).filter(v => v.type === 'series' && !v.id.includes(':')).length}`);
    
    console.log(`\n💡 INSTRUCCIONES:`);
    console.log(`   1. Ve a: http://${host === '0.0.0.0' ? 'localhost' : host}:${port}/admin`);
    console.log(`   2. Usa los formularios para agregar contenido fácilmente`);
    console.log(`   3. Copia el Manifest URL para Stremio`);
    console.log(`   4. ¡Disfruta de tu addon personalizado!`);
    console.log(`\n🔥 ═══════════════════════════════════════════════════════\n`);
});

module.exports = app;" id="movieYear" name="year" min="1900" max="2030" required>
                    </div>
                    <div class="form-group">
                        <label for="movieImdbId">ID de IMDB (opcional)</label>
                        <input type="text" id="movieImdbId" name="imdbId" placeholder="tt1234567">
                    </div>
                    <div class="form-group">
                        <label for="movieGenre">Géneros (separados por comas) *</label>
                        <input type="text" id="movieGenre" name="genre" placeholder="Acción, Aventura, Comedia" required>
                    </div>
                    <div class="form-group">
                        <label for="movieDirector">Director</label>
                        <input type="text" id="movieDirector" name="director">
                    </div>
                    <div class="form-group">
                        <label for="movieCast">Reparto (separado por comas)</label>
                        <input type="text" id="movieCast" name="cast" placeholder="Actor 1, Actor 2, Actor 3">
                    </div>
                    <div class="form-group">
                        <label for="movieRuntime">Duración</label>
                        <input type="text" id="movieRuntime" name="runtime" placeholder="120 min">
                    </div>
                    <div class="form-group">
                        <label for="movieRating">Calificación IMDB</label>
                        <input type="text" id="movieRating" name="imdbRating" placeholder="7.5">
                    </div>
                    <div class="form-group">
                        <label for="moviePoster">URL del Poster *</label>
                        <input type="url" id="moviePoster" name="poster" required>
                    </div>
                    <div class="form-group">
                        <label for="movieBackground">URL del Fondo</label>
                        <input type="url" id="movieBackground" name="background">
                    </div>
                    <div class="form-group">
                        <label for="movieLogo">URL del Logo</label>
                        <input type="url" id="movieLogo" name="logo">
                    </div>
                    <div class="form-group">
                        <label for="movieQuality">Calidad</label>
                        <select id="movieQuality" name="quality">
                            <option value="1080p">1080p</option>
                            <option value="720p">720p</option>
                            <option value="480p">480p</option>
                            <option value="HD">HD</option>
                            <option value="SD">SD</option>
                        </select>
                    </div>
                    <div class="form-group" style="grid-column: 1 / -1;">
                        <label for="movieDescription">Descripción *</label>
                        <textarea id="movieDescription" name="description" required></textarea>
                    </div>
                    <div class="form-group" style="grid-column: 1 / -1;">
                        <label for="movieUrl">URL del Video (HTTP/HTTPS)</label>
                        <input type="url" id="movieUrl" name="url" placeholder="https://ejemplo.com/pelicula.mp4">
                        <small>O usa magnet/torrent abajo</small>
                    </div>
                    <div class="form-group">
                        <label for="movieInfoHash">Info Hash (Torrent)</label>
                        <input type="text" id="movieInfoHash" name="infoHash" placeholder="1234567890ABCDEF...">
                    </div>
                    <div class="form-group">
                        <label for="movieMagnet">Magnet URI</label>
                        <input type="text" id="movieMagnet" name="magnetUri" placeholder="magnet:?xt=urn:btih:...">
                    </div>
                    <div style="grid-column: 1 / -1;">
                        <button type="submit" class="btn">🎬 Agregar Película</button>
                    </div>
                </form>
            </div>
        </div>

        <div id="add-series" class="tab-content">
            <div class="form-section">
                <h2>📺 Agregar Nueva Serie</h2>
                <form id="seriesForm" class="form-grid">
                    <div class="form-group">
                        <label for="seriesName">Nombre de la Serie *</label>
                        <input type="text" id="seriesName" name="name" required>
                    </div>
                    <div class="form-group">
                        <label for="seriesYear">Año *</label>
                        <input type="number