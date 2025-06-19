const { addonBuilder, serveHTTP } = require("stremio-addon-sdk");
const magnet = require("magnet-uri");
const express = require("express");
const path = require("path");
const fs = require("fs").promises;

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

// Dataset inicial (se cargará desde archivo JSON si existe)
let dataset = {
    // Movies with IMDB IDs
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
    }
};

// Funciones de persistencia
const DATA_FILE = 'addon_data.json';

async function loadDataset() {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf8');
        const parsed = JSON.parse(data);
        dataset = { ...dataset, ...parsed };
        console.log('✅ Dataset cargado desde archivo');
    } catch (error) {
        console.log('ℹ️ Usando dataset por defecto');
    }
}

async function saveDataset() {
    try {
        await fs.writeFile(DATA_FILE, JSON.stringify(dataset, null, 2));
        console.log('✅ Dataset guardado');
    } catch (error) {
        console.error('❌ Error guardando dataset:', error);
    }
}

// Función para generar ID único
function generateId(type, name, year) {
    const base = `latino_${type}_${name.toLowerCase().replace(/[^a-z0-9]/g, '')}_${year}`;
    let counter = 0;
    let id = base;
    
    while (dataset[id]) {
        counter++;
        id = `${base}_${counter}`;
    }
    
    return id;
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

// Create Express app for admin panel
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Admin panel HTML
const adminHTML = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Panel de Administración - Stremio Addon Latino</title>
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
            padding: 20px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #FF6B6B, #4ECDC4);
            color: white;
            padding: 30px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        
        .header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        
        .tabs {
            display: flex;
            background: #f8f9fa;
            border-bottom: 2px solid #e9ecef;
        }
        
        .tab {
            flex: 1;
            padding: 20px;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s ease;
            font-weight: 600;
            color: #666;
        }
        
        .tab:hover {
            background: #e9ecef;
        }
        
        .tab.active {
            background: white;
            color: #667eea;
            border-bottom: 3px solid #667eea;
        }
        
        .tab-content {
            display: none;
            padding: 30px;
        }
        
        .tab-content.active {
            display: block;
        }
        
        .form-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 8px;
            color: #333;
            font-weight: 600;
        }
        
        .form-group input,
        .form-group select,
        .form-group textarea {
            width: 100%;
            padding: 12px;
            border: 2px solid #e9ecef;
            border-radius: 8px;
            font-size: 16px;
            transition: border-color 0.3s ease;
        }
        
        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
            outline: none;
            border-color: #667eea;
        }
        
        .form-group textarea {
            resize: vertical;
            min-height: 100px;
        }
        
        .btn {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 15px 30px;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.3s ease;
        }
        
        .btn:hover {
            transform: translateY(-2px);
        }
        
        .btn-danger {
            background: linear-gradient(135deg, #ff6b6b, #ee5a24);
        }
        
        .content-list {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
            margin-top: 30px;
        }
        
        .content-item {
            background: #f8f9fa;
            border-radius: 10px;
            padding: 20px;
            border: 2px solid #e9ecef;
            transition: all 0.3s ease;
        }
        
        .content-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }
        
        .content-item h3 {
            color: #333;
            margin-bottom: 10px;
        }
        
        .content-item p {
            color: #666;
            margin-bottom: 15px;
            font-size: 14px;
        }
        
        .content-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        
        .content-type {
            background: #667eea;
            color: white;
            padding: 5px 10px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
        }
        
        .content-year {
            color: #999;
            font-weight: 600;
        }
        
        .alert {
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            font-weight: 600;
        }
        
        .alert-success {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        
        .alert-error {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .stat-card {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
        }
        
        .stat-number {
            font-size: 2.5em;
            font-weight: 700;
            display: block;
        }
        
        .stat-label {
            font-size: 1.1em;
            opacity: 0.9;
        }
        
        .genre-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 5px;
            margin-top: 10px;
        }
        
        .genre-tag {
            background: #e9ecef;
            color: #666;
            padding: 3px 8px;
            border-radius: 15px;
            font-size: 12px;
        }
        
        @media (max-width: 768px) {
            .tabs {
                flex-direction: column;
            }
            
            .form-grid {
                grid-template-columns: 1fr;
            }
            
            .content-list {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎬 Panel de Administración</h1>
            <p>Gestiona tu contenido de Stremio Addon Latino</p>
        </div>
        
        <div class="tabs">
            <div class="tab active" onclick="showTab('add')">➕ Agregar Contenido</div>
            <div class="tab" onclick="showTab('list')">📋 Lista de Contenido</div>
            <div class="tab" onclick="showTab('stats')">📊 Estadísticas</div>
        </div>
        
        <div id="add-tab" class="tab-content active">
            <div id="alert-container"></div>
            
            <form id="content-form">
                <div class="form-grid">
                    <div class="form-group">
                        <label for="type">Tipo de Contenido</label>
                        <select id="type" name="type" required onchange="toggleSeriesFields()">
                            <option value="">Seleccionar tipo</option>
                            <option value="movie">Película</option>
                            <option value="series">Serie</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="name">Nombre</label>
                        <input type="text" id="name" name="name" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="year">Año</label>
                        <input type="number" id="year" name="year" min="1900" max="2030" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="imdbId">ID de IMDB (opcional)</label>
                        <input type="text" id="imdbId" name="imdbId" placeholder="tt1234567">
                    </div>
                </div>
                
                <div class="form-grid">
                    <div class="form-group">
                        <label for="director">Director</label>
                        <input type="text" id="director" name="director">
                    </div>
                    
                    <div class="form-group">
                        <label for="cast">Reparto (separado por comas)</label>
                        <input type="text" id="cast" name="cast" placeholder="Actor 1, Actor 2, Actor 3">
                    </div>
                    
                    <div class="form-group">
                        <label for="runtime">Duración</label>
                        <input type="text" id="runtime" name="runtime" placeholder="120 min">
                    </div>
                    
                    <div class="form-group">
                        <label for="imdbRating">Calificación IMDB</label>
                        <input type="number" id="imdbRating" name="imdbRating" step="0.1" min="0" max="10">
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="description">Descripción</label>
                    <textarea id="description" name="description" required></textarea>
                </div>
                
                <div class="form-grid">
                    <div class="form-group">
                        <label for="genre">Géneros (mantén Ctrl para seleccionar varios)</label>
                        <select id="genre" name="genre" multiple required>
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
                    
                    <div class="form-group">
                        <label for="quality">Calidad</label>
                        <select id="quality" name="quality">
                            <option value="SD">SD</option>
                            <option value="720p">720p</option>
                            <option value="1080p">1080p</option>
                            <option value="4K">4K</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-grid">
                    <div class="form-group">
                        <label for="poster">URL del Póster</label>
                        <input type="url" id="poster" name="poster">
                    </div>
                    
                    <div class="form-group">
                        <label for="background">URL del Fondo</label>
                        <input type="url" id="background" name="background">
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="url">URL del Video o Magnet URI</label>
                    <input type="text" id="url" name="url" required placeholder="https://... o magnet:?xt=...">
                </div>
                
                <button type="submit" class="btn">🚀 Agregar Contenido</button>
            </form>
        </div>
        
        <div id="list-tab" class="tab-content">
            <div id="content-list" class="content-list">
                <!-- El contenido se carga dinámicamente -->
            </div>
        </div>
        
        <div id="stats-tab" class="tab-content">
            <div id="stats-container" class="stats">
                <!-- Las estadísticas se cargan dinámicamente -->
            </div>
        </div>
    </div>
    
    <script>
        function showTab(tabName) {
            // Ocultar todas las pestañas
            document.querySelectorAll('.tab-content').forEach(tab => {
                tab.classList.remove('active');
            });
            document.querySelectorAll('.tab').forEach(tab => {
                tab.classList.remove('active');
            });
            
            // Mostrar la pestaña seleccionada
            document.getElementById(tabName + '-tab').classList.add('active');
            event.target.classList.add('active');
            
            if (tabName === 'list') {
                loadContentList();
            } else if (tabName === 'stats') {
                loadStats();
            }
        }
        
        function showAlert(message, type = 'success') {
            const alertContainer = document.getElementById('alert-container');
            alertContainer.innerHTML = \`<div class="alert alert-\${type}">\${message}</div>\`;
            setTimeout(() => {
                alertContainer.innerHTML = '';
            }, 5000);
        }
        
        document.getElementById('content-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());
            
            // Procesar géneros múltiples
            const selectedGenres = Array.from(document.getElementById('genre').selectedOptions)
                .map(option => option.value);
            data.genre = selectedGenres;
            
            // Procesar cast
            if (data.cast) {
                data.cast = data.cast.split(',').map(actor => actor.trim());
            }
            
            try {
                const response = await fetch('/admin/add-content', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                
                if (result.success) {
                    showAlert('✅ Contenido agregado exitosamente', 'success');
                    e.target.reset();
                } else {
                    showAlert('❌ Error: ' + result.message, 'error');
                }
            } catch (error) {
                showAlert('❌ Error de conexión: ' + error.message, 'error');
            }
        });
        
        async function loadContentList() {
            try {
                const response = await fetch('/admin/content-list');
                const data = await response.json();
                
                const contentList = document.getElementById('content-list');
                contentList.innerHTML = '';
                
                data.content.forEach(item => {
                    const contentItem = document.createElement('div');
                    contentItem.className = 'content-item';
                    contentItem.innerHTML = \`
                        <div class="content-meta">
                            <span class="content-type">\${item.type === 'movie' ? 'Película' : 'Serie'}</span>
                            <span class="content-year">\${item.year}</span>
                        </div>
                        <h3>\${item.name}</h3>
                        <p>\${item.description.substring(0, 100)}...</p>
                        <div class="genre-tags">
                            \${item.genre.map(g => \`<span class="genre-tag">\${g}</span>\`).join('')}