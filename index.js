const { addonBuilder, serveHTTP } = require("stremio-addon-sdk");
const fs = require('fs');
const path = require('path');
const url = require('url');

// Enhanced addon configuration
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

// Archivo para guardar el dataset
const DATASET_FILE = path.join(__dirname, 'dataset.json');

// Función para cargar el dataset desde archivo
function loadDataset() {
    try {
        if (fs.existsSync(DATASET_FILE)) {
            const data = fs.readFileSync(DATASET_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error cargando dataset:', error);
    }
    
    // Dataset por defecto si no existe el archivo
    return {
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
        }
    };
}

// Función para guardar el dataset
function saveDataset(dataset) {
    try {
        fs.writeFileSync(DATASET_FILE, JSON.stringify(dataset, null, 2));
        console.log('✅ Dataset guardado exitosamente');
        return true;
    } catch (error) {
        console.error('❌ Error guardando dataset:', error);
        return false;
    }
}

// Cargar dataset al iniciar
let dataset = loadDataset();

// Función para recargar el dataset
function reloadDataset() {
    dataset = loadDataset();
    console.log(`📚 Dataset recargado: ${Object.keys(dataset).length} elementos`);
}

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

// HTML del panel de administración
const adminPanelHTML = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Panel Admin - Stremio Addon Latino</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: #333;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }

        .header {
            text-align: center;
            color: white;
            margin-bottom: 30px;
        }

        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }

        .header p {
            font-size: 1.2rem;
            opacity: 0.9;
        }

        .tabs {
            display: flex;
            justify-content: center;
            margin-bottom: 30px;
            background: rgba(255,255,255,0.1);
            border-radius: 15px;
            padding: 5px;
            backdrop-filter: blur(10px);
        }

        .tab-btn {
            padding: 12px 24px;
            background: transparent;
            border: none;
            color: white;
            cursor: pointer;
            border-radius: 10px;
            transition: all 0.3s ease;
            font-size: 1rem;
            margin: 0 5px;
        }

        .tab-btn:hover {
            background: rgba(255,255,255,0.2);
        }

        .tab-btn.active {
            background: rgba(255,255,255,0.9);
            color: #333;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }

        .tab-content {
            display: none;
            background: white;
            border-radius: 20px;
            padding: 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            backdrop-filter: blur(10px);
        }

        .tab-content.active {
            display: block;
            animation: fadeIn 0.5s ease;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .form-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 20px;
        }

        .form-group {
            margin-bottom: 20px;
        }

        label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: #555;
        }

        input, textarea, select {
            width: 100%;
            padding: 12px 16px;
            border: 2px solid #e1e5e9;
            border-radius: 10px;
            font-size: 1rem;
            transition: all 0.3s ease;
            background: #f8f9fa;
        }

        input:focus, textarea:focus, select:focus {
            outline: none;
            border-color: #667eea;
            background: white;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        textarea {
            min-height: 100px;
            resize: vertical;
        }

        .btn {
            padding: 12px 24px;
            border: none;
            border-radius: 10px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            display: inline-flex;
            align-items: center;
            gap: 8px;
        }

        .btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }

        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }

        .btn-secondary {
            background: #6c757d;
            color: white;
        }

        .btn-danger {
            background: #dc3545;
            color: white;
        }

        .btn-success {
            background: #28a745;
            color: white;
        }

        .content-list {
            margin-top: 30px;
        }

        .content-item {
            background: #f8f9fa;
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 15px;
            border-left: 4px solid #667eea;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .content-info h3 {
            color: #333;
            margin-bottom: 5px;
        }

        .content-info p {
            color: #666;
            font-size: 0.9rem;
        }

        .content-actions {
            display: flex;
            gap: 10px;
        }

        .alert {
            padding: 15px;
            border-radius: 10px;
            margin-bottom: 20px;
            border-left: 4px solid;
        }

        .alert-success {
            background: #d4edda;
            border-color: #28a745;
            color: #155724;
        }

        .alert-error {
            background: #f8d7da;
            border-color: #dc3545;
            color: #721c24;
        }

        .json-output {
            background: #1e1e1e;
            color: #f8f8f2;
            padding: 20px;
            border-radius: 10px;
            font-family: 'Courier New', monospace;
            font-size: 0.9rem;
            max-height: 400px;
            overflow-y: auto;
            white-space: pre-wrap;
            margin-top: 20px;
        }

        .floating-btn {
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
            transition: all 0.3s ease;
        }

        .floating-btn:hover {
            transform: scale(1.1);
            box-shadow: 0 6px 25px rgba(102, 126, 234, 0.6);
        }

        @media (max-width: 768px) {
            .form-grid {
                grid-template-columns: 1fr;
            }
            
            .tabs {
                flex-direction: column;
            }
            
            .content-item {
                flex-direction: column;
                align-items: flex-start;
                gap: 15px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1><i class="fas fa-video"></i> Panel de Administración</h1>
            <p>Gestiona tu contenido de Stremio fácilmente</p>
        </div>

        <div class="tabs">
            <button class="tab-btn active" onclick="showTab('movies')">
                <i class="fas fa-film"></i> Películas
            </button>
            <button class="tab-btn" onclick="showTab('series')">
                <i class="fas fa-tv"></i> Series
            </button>
            <button class="tab-btn" onclick="showTab('episodes')">
                <i class="fas fa-list"></i> Episodios
            </button>
            <button class="tab-btn" onclick="showTab('export')">
                <i class="fas fa-download"></i> Exportar
            </button>
        </div>

        <!-- Movies Tab -->
        <div id="movies" class="tab-content active">
            <h2><i class="fas fa-film"></i> Agregar Película</h2>
            <form id="movieForm">
                <div class="form-grid">
                    <div class="form-group">
                        <label for="movieId">ID IMDB *</label>
                        <input type="text" id="movieId" placeholder="tt1234567" required>
                    </div>
                    <div class="form-group">
                        <label for="movieName">Nombre *</label>
                        <input type="text" id="movieName" placeholder="Nombre de la película" required>
                    </div>
                    <div class="form-group">
                        <label for="movieYear">Año *</label>
                        <input type="number" id="movieYear" placeholder="2023" min="1900" max="2030" required>
                    </div>
                    <div class="form-group">
                        <label for="movieGenre">Géneros *</label>
                        <select id="movieGenre" multiple>
                            <option value="Acción">Acción</option>
                            <option value="Comedia">Comedia</option>
                            <option value="Drama">Drama</option>
                            <option value="Terror">Terror</option>
                            <option value="Ciencia Ficción">Ciencia Ficción</option>
                            <option value="Animación">Animación</option>
                            <option value="Aventura">Aventura</option>
                            <option value="Familiar">Familiar</option>
                        </select>
                    </div>
                </div>

                <div class="form-grid">
                    <div class="form-group">
                        <label for="movieDirector">Director</label>
                        <input type="text" id="movieDirector" placeholder="Nombre del director">
                    </div>
                    <div class="form-group">
                        <label for="movieCast">Reparto (separado por comas)</label>
                        <input type="text" id="movieCast" placeholder="Actor 1, Actor 2, Actor 3">
                    </div>
                    <div class="form-group">
                        <label for="movieRuntime">Duración</label>
                        <input type="text" id="movieRuntime" placeholder="120 min">
                    </div>
                    <div class="form-group">
                        <label for="movieRating">Calificación IMDB</label>
                        <input type="text" id="movieRating" placeholder="7.5">
                    </div>
                </div>

                <div class="form-group">
                    <label for="movieDescription">Descripción</label>
                    <textarea id="movieDescription" placeholder="Descripción de la película..."></textarea>
                </div>

                <div class="form-grid">
                    <div class="form-group">
                        <label for="moviePoster">URL del Poster</label>
                        <input type="url" id="moviePoster" placeholder="https://...">
                    </div>
                    <div class="form-group">
                        <label for="movieBackground">URL del Fondo</label>
                        <input type="url" id="movieBackground" placeholder="https://...">
                    </div>
                    <div class="form-group">
                        <label for="movieLogo">URL del Logo</label>
                        <input type="url" id="movieLogo" placeholder="https://...">
                    </div>
                    <div class="form-group">
                        <label for="movieUrl">URL del Video *</label>
                        <input type="url" id="movieUrl" placeholder="https://..." required>
                    </div>
                </div>

                <div class="form-grid">
                    <div class="form-group">
                        <label for="movieQuality">Calidad</label>
                        <select id="movieQuality">
                            <option value="1080p">1080p</option>
                            <option value="720p">720p</option>
                            <option value="480p">480p</option>
                            <option value="SD">SD</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="movieLanguage">Idioma</label>
                        <select id="movieLanguage">
                            <option value="Latino">Latino</option>
                            <option value="Español">Español</option>
                            <option value="Subtitulado">Subtitulado</option>
                        </select>
                    </div>
                </div>

                <button type="submit" class="btn btn-primary">
                    <i class="fas fa-plus"></i> Agregar Película
                </button>
            </form>
        </div>

        <!-- Series Tab -->
        <div id="series" class="tab-content">
            <h2><i class="fas fa-tv"></i> Agregar Serie</h2>
            <form id="seriesForm">
                <div class="form-grid">
                    <div class="form-group">
                        <label for="seriesId">ID IMDB *</label>
                        <input type="text" id="seriesId" placeholder="tt1234567" required>
                    </div>
                    <div class="form-group">
                        <label for="seriesName">Nombre *</label>
                        <input type="text" id="seriesName" placeholder="Nombre de la serie" required>
                    </div>
                    <div class="form-group">
                        <label for="seriesYear">Año *</label>
                        <input type="number" id="seriesYear" placeholder="2023" min="1900" max="2030" required>
                    </div>
                    <div class="form-group">
                        <label for="seriesGenre">Géneros *</label>
                        <select id="seriesGenre" multiple>
                            <option value="Comedia">Comedia</option>
                            <option value="Drama">Drama</option>
                            <option value="Animación">Animación</option>
                            <option value="Aventura">Aventura</option>
                            <option value="Familiar">Familiar</option>
                            <option value="Terror">Terror</option>
                            <option value="Acción">Acción</option>
                        </select>
                    </div>
                </div>

                <div class="form-grid">
                    <div class="form-group">
                        <label for="seriesDirector">Director/Creador</label>
                        <input type="text" id="seriesDirector" placeholder="Nombre del director">
                    </div>
                    <div class="form-group">
                        <label for="seriesCast">Reparto (separado por comas)</label>
                        <input type="text" id="seriesCast" placeholder="Actor 1, Actor 2, Actor 3">
                    </div>
                    <div class="form-group">
                        <label for="seriesRating">Calificación IMDB</label>
                        <input type="text" id="seriesRating" placeholder="8.5">
                    </div>
                    <div class="form-group">
                        <label for="seriesLanguage">Idioma</label>
                        <select id="seriesLanguage">
                            <option value="Latino">Latino</option>
                            <option value="Español">Español</option>
                            <option value="Subtitulado">Subtitulado</option>
                        </select>
                    </div>
                </div>

                <div class="form-group">
                    <label for="seriesDescription">Descripción</label>
                    <textarea id="seriesDescription" placeholder="Descripción de la serie..."></textarea>
                </div>

                <div class="form-grid">
                    <div class="form-group">
                        <label for="seriesPoster">URL del Poster</label>
                        <input type="url" id="seriesPoster" placeholder="https://...">
                    </div>
                    <div class="form-group">
                        <label for="seriesBackground">URL del Fondo</label>
                        <input type="url" id="seriesBackground" placeholder="https://...">
                    </div>
                </div>

                <button type="submit" class="btn btn-primary">
                    <i class="fas fa-plus"></i> Agregar Serie
                </button>
            </form>
        </div>

        <!-- Episodes Tab -->
        <div id="episodes" class="tab-content">
            <h2><i class="fas fa-list"></i> Agregar Episodio</h2>
            <form id="episodeForm">
                <div class="form-grid">
                    <div class="form-group">
                        <label for="episodeSeriesId">ID de la Serie *</label>
                        <input type="text" id="episodeSeriesId" placeholder="tt1234567" required>
                    </div>
                    <div class="form-group">
                        <label for="episodeName">Nombre del Episodio *</label>
                        <input type="text" id="episodeName" placeholder="Título del episodio" required>
                    </div>
                    <div class="form-group">
                        <label for="episodeSeason">Temporada *</label>
                        <input type="number" id="episodeSeason" placeholder="1" min="1" required>
                    </div>
                    <div class="form-group">
                        <label for="episodeNumber">Número de Episodio *</label>
                        <input type="number" id="episodeNumber" placeholder="1" min="1" required>
                    </div>
                </div>

                <div class="form-group">
                    <label for="episodeDescription">Descripción</label>
                    <textarea id="episodeDescription" placeholder="Descripción del episodio..."></textarea>
                </div>

                <div class="form-grid">
                    <div class="form-group">
                        <label for="episodeUrl">URL del Video *</label>
                        <input type="url" id="episodeUrl" placeholder="https://..." required>
                    </div>
                    <div class="form-group">
                        <label for="episodeQuality">Calidad</label>
                        <select id="episodeQuality">
                            <option value="1080p">1080p</option>
                            <option value="720p">720p</option>
                            <option value="480p">480p</option>
                            <option value="SD">SD</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="episodeRuntime">Duración</label>
                        <input type="text" id="episodeRuntime" placeholder="30 min">
                    </div>
                    <div class="form-group">
                        <label for="episodeLanguage">Idioma</label>
                        <select id="episodeLanguage">
                            <option value="Latino">Latino</option>
                            <option value="Español">Español</option>
                            <option value="Subtitulado">Subtitulado</option>
                        </select>
                    </div>
                </div>

                <button type="submit" class="btn btn-primary">
                    <i class="fas fa-plus"></i> Agregar Episodio
                </button>
            </form>
        </div>

        <!-- Export Tab -->
        <div id="export" class="tab-content">
            <h2><i class="fas fa-download"></i> Exportar Configuración</h2>
            <p>Aquí puedes ver y copiar el código JavaScript generado para tu addon:</p>
            
            <div style="margin: 20px 0;">
                <button class="btn btn-success" onclick="generateDataset()">
                    <i class="fas fa-code"></i> Generar Código
                </button>
                <button class="btn btn-secondary" onclick="copyToClipboard()">
                    <i class="fas fa-copy"></i> Copiar al Portapapeles
                </button>
            </div>

            <div id="jsonOutput" class="json-output">
                // Haz clic en "Generar Código" para ver el dataset actualizado
            </div>
        </div>

        <!-- Content List -->
        <div class="content-list">
            <h3>Contenido Agregado</h3>
            <div id="contentItems"></div>
        </div>
    </div>

    <!-- Floating Action Button -->
    <button class="floating-btn" onclick="clearAll()" title="Limpiar todo">
        <i class="fas fa-trash"></i>
    </button>

    <script>
        // Storage for content
        let contentData = JSON.parse(localStorage.getItem('stremioContent') || '{}');

        // Tab functionality
        function showTab(tabName) {
            document.querySelectorAll('.tab-content').forEach(tab => {
                tab.classList.remove('active');
            });
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            
            document.getElementById(tabName).classList.add('active');
            event.target.classList.add('active');
        }

        // Show success message
        function showMessage(message, type = 'success') {
            const alertDiv = document.createElement('div');
            alertDiv.className = `alert alert-${type}`;
            alertDiv.innerHTML = `<i class="fas fa-${type === 'success' ? 'check' : 'exclamation'}-circle"></i> ${message}`;
            
            const container = document.querySelector('.container');
            container.insertBefore(alertDiv, container.children[1]);
            
            setTimeout(() => alertDiv.remove(), 3000);
        }

        // Movie form handler
        document.getElementById('movieForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(e.target);
            const movieId = document.getElementById('movieId').value;
            
            const movieData = {
                id: movieId,
                type: "movie",
                name: document.getElementById('movieName').value,
                genre: Array.from(document.getElementById('movieGenre').selectedOptions).map(opt => opt.value),
                year: parseInt(document.getElementById('movieYear').value),
                director: document.getElementById('movieDirector').value,
                cast: document.getElementById('movieCast').value.split(',').map(s => s.trim()).filter(s => s),
                description: document.getElementById('movieDescription').value,
                poster: document.getElementById('moviePoster').value,
                background: document.getElementById('movieBackground').value,
                logo: document.getElementById('movieLogo').value,
                runtime: document.getElementById('movieRuntime').value,
                imdbRating: document.getElementById('movieRating').value,
                url: document.getElementById('movieUrl').value,
                title: `${document.getElementById('movieName').value} (${document.getElementById('movieYear').value}) - ${document.getElementById('movieQuality').value} ${document.getElementById('movieLanguage').value}`,
                quality: document.getElementById('movieQuality').value,
                language: document.getElementById('movieLanguage').value
            };
            
            contentData[movieId] = movieData;
            saveData();
            updateContentList();
            e.target.reset();
            showMessage('¡Película agregada exitosamente!');
        });

        // Series form handler
        document.getElementById('seriesForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const seriesId = document.getElementById('seriesId').value;
            
            const seriesData = {
                id: seriesId,
                type: "series",
                name: document.getElementById('seriesName').value,
                seriesId: seriesId,
                seriesName: document.getElementById('seriesName').value,
                genre: Array.from(document.getElementById('seriesGenre').selectedOptions).map(opt => opt.value),
                year: parseInt(document.getElementById('seriesYear').value),
                director: document.getElementById('seriesDirector').value,
                cast: document.getElementById('seriesCast').value.split(',').map(s => s.trim()).filter(s => s),
                description: document.getElementById('seriesDescription').value,
                poster: document.getElementById('seriesPoster').value,
                background: document.getElementById('seriesBackground').value,
                imdbRating: document.getElementById('seriesRating').value,
                language: document.getElementById('seriesLanguage').value
            };
            
            contentData[seriesId] = seriesData;
            saveData();
            updateContentList();
            e.target.reset();
            showMessage('¡Serie agregada exitosamente!');
        });

        // Episode form handler
        document.getElementById('episodeForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const seriesId = document.getElementById('episodeSeriesId').value;
            const season = document.getElementById('episodeSeason').value;
            const episode = document.getElementById('episodeNumber').value;
            const episodeId = `${seriesId}:${season}:${episode}`;
            
            const episodeData = {
                id: episodeId,
                type: "series",
                name: document.getElementById('episodeName').value,
                genre: contentData[seriesId]?.genre || ["Comedia"],
                year: contentData[seriesId]?.year || new Date().getFullYear(),
                episode: parseInt(episode),
                season: parseInt(season),
                seriesId: seriesId,
                seriesName: contentData[seriesId]?.name || "Serie Desconocida",
                description: document.getElementById('episodeDescription').value,
                poster: contentData[seriesId]?.poster || "",
                background: contentData[seriesId]?.background || "",
                runtime: document.getElementById('episodeRuntime').value,
                url: document.getElementById('episodeUrl').value,
                title: `S${season}E${episode} - ${document.getElementById('episodeName').value} - ${document.getElementById('episodeQuality').value} ${document.getElementById('episodeLanguage').value}`,
                quality: document.getElementById('episodeQuality').value,
                language: document.getElementById('episodeLanguage').value
            };
            
            contentData[episodeId] = episodeData;
            saveData();
            updateContentList();
            e.target.reset();
            showMessage('¡Episodio agregado exitosamente!');
        });

        // Save data to localStorage
        function saveData() {
            localStorage.setItem('stremioContent', JSON.stringify(contentData));
        }

        // Update content list
        function updateContentList() {
            const container = document.getElementById('contentItems');
            container.innerHTML = '';
            
            Object.entries(contentData).forEach(([key, item]) => {
                const div = document.createElement('div');
                div.className = 'content-item';
                
                const typeIcon = item.type === 'movie' ? 'film' : 'tv';
                const typeText = item.type === 'movie' ? 'Película' : 
                    (key.includes(':') ? 'Episodio' : 'Serie');
                
                div.innerHTML = `
                    <div class="content-info">
                        <h3><i class="fas fa-${typeIcon}"></i> ${item.name}</h3>
                        <p>${typeText} - ${item.year || 'Sin año'} - ${item.language || 'Latino'}</p>
                        <small>ID: ${key}</small>
                    </div>
                    <div class="content-actions">
                        <button class="btn btn-danger" onclick="removeItem('${key}')">
                            <i class="fas fa-trash"></i> Eliminar
                        </button>
                    </div>
                `;
                
                container.appendChild(div);
            });
        }

        // Remove item
        function removeItem(key) {
            if (confirm('¿Estás seguro de eliminar este elemento?')) {
                delete contentData[key];
                saveData();
                updateContentList();
                showMessage('Elemento eliminado exitosamente');
            }
        }

        // Generate dataset code
        function generateDataset() {
            const output = document.getElementById('jsonOutput');
            const datasetCode = `const dataset = ${JSON.stringify(contentData, null, 4)};`;
            output.textContent = datasetCode;
        }

        // Copy to clipboard
        function copyToClipboard() {
            const output = document.getElementById('jsonOutput');
            navigator.clipboard.writeText(output.textContent).then(() => {
                showMessage('¡Código copiado al portapapeles!');
            }).catch(() => {
                showMessage('Error al copiar al portapapeles', 'error');
            });
        }

        // Clear all data
        function clearAll() {
            if (confirm('¿Estás seguro de eliminar todo el contenido? Esta acción no se puede deshacer.')) {
                contentData = {};
                saveData();
                updateContentList();
                document.getElementById('jsonOutput').textContent = '// Contenido eliminado';
                showMessage('Todo el contenido ha sido eliminado');
            }
        }

        // Initialize
        updateContentList();
    </script>
</body>
</html>`