const { addonBuilder, serveHTTP } = require("stremio-addon-sdk");
const express = require("express");
const path = require("path");

const manifest = {
    "id": "org.stremio.addon-latino-chile",
    "version": "1.2.0",
    "name": "Reproducir ahora",
    "description": "Contenido en Español Latino",
    "icon": "https://us.123rf.com/450wm/vladwel/vladwel1702/vladwel170200039/71606485-ilustraci%C3%B3n-de-vector-de-claqueta-aislada-sobre-fondo-de-color-azul-icono-de-claqueta-de-estilo.jpg?ver=6",
    "resources": ["catalog", "stream", "meta"],
    "types": ["movie", "series"],
    "catalogs": [
        {
            type: "movie",
            id: "peliculas-latino-cl",
            name: "Recomendación",
            extra: [{ name: "genre", options: ["Acción", "Comedia", "Drama", "Animación", "Aventura", "Familiar"] }]
        },
        {
            type: "series",
            id: "series-latino-cl",
            name: "Recomendación",
            extra: [{ name: "genre", options: ["Comedia", "Animación", "Familiar", "Drama"] }]
        }
    ],
    "idPrefixes": ["latino_", "tt"],
    "behaviorHints": {
        "adult": true,
        "p2p": true,
        "configurable": false,
        "configurationRequired": false
    }
};

// Dataset inicial
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
        background: "https://m.media-amazon.com/images/M/MV5BMjAwOTY3ODAzNl5BMl5BanBnXkFtZTcwNjYzNDc3Mw@@._V1_.jpg",
        runtime: "90 min",
        imdbRating: "7.9",
        url: "https://archive.org/download/dercro-2040/DERCRO2040.mkv",
        quality: "1080p",
        language: "Latino"
    },
    "tt0229889": {
        id: "tt0229889",
        type: "series",
        name: "El Chavo del 8",
        seriesId: "tt0229889",
        seriesName: "El Chavo del 8",
        genre: ["Comedia", "Familiar"],
        year: "1971",
        director: "Roberto Gómez Bolaños",
        cast: ["Roberto Gómez Bolaños", "Ramón Valdés", "Carlos Villagrán", "María Antonieta de las Nieves"],
        description: "Las aventuras de un niño huérfano que vive en una vecindad y sus travesuras con los demás habitantes del lugar.",
        poster: "https://images.sr.roku.com/idType/roku/context/global/id/aac4ecd26e9153c49b232aac064cecca/rokuFeed/assets/842e678ebeda580e8d8c527970f63f95.jpg/magic/800x0/filters:quality(100)",
        background: "https://m.media-amazon.com/images/M/MV5BNjQwNjlkOGUtMzhhMi00N2NjLTk0ZTMtODhkM2IzOTVlNWUzXkEyXkFqcGc@._V1_QL75_UX820_.jpg",
        imdbRating: "8.5",
        language: "Latino"
    },
    "tt0229889:1:1": {
        id: "tt0229889:1:1",
        type: "series",
        name: "El Ropavejero",
        genre: ["Comedia", "Familiar"],
        year: 1971,
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
        year: 1971,
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

const createMetaPreview = (item, key) => ({
    id: extractBaseId(key),
    type: item.type,
    name: item.seriesName || item.name,
    genre: item.genre,
    year: item.year,
    poster: item.poster,
    posterShape: "poster",
    background: item.background,
    description: item.description,
    imdbRating: item.imdbRating,
    language: item.language
});

const createFullMeta = (item, key) => {
    const meta = createMetaPreview(item, key);
    
    Object.assign(meta, {
        director: item.director,
        cast: item.cast,
        runtime: item.runtime,
        language: "Español Latino"
    });
    
    if (item.type === "series") {
        meta.videos = Object.entries(dataset)
            .filter(([k, v]) => v.seriesId === item.seriesId && isEpisode(k))
            .sort((a, b) => {
                const [aSeason, aEpisode] = [parseInt(a[0].split(":")[1]), parseInt(a[0].split(":")[2])];
                const [bSeason, bEpisode] = [parseInt(b[0].split(":")[1]), parseInt(b[0].split(":")[2])];
                return aSeason !== bSeason ? aSeason - bSeason : aEpisode - bEpisode;
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
    }
    
    return meta;
};

const createStream = (item) => {
    const stream = {
        title: `${item.name} - ${getQuality(item)} Latino`
    };
    
    if (item.url) stream.url = item.url;
    if (item.infoHash) stream.infoHash = item.infoHash;
    if (item.sources) stream.sources = item.sources;
    
    if (item.url) {
        stream.behaviorHints = {
            notWebReady: false,
            bingeGroup: item.seriesId || item.id,
            countryWhitelist: ['CL', 'AR', 'MX', 'CO', 'PE', 'UY', 'EC', 'BO', 'PY']
        };
        
        stream.httpHeaders = {
            'User-Agent': 'Stremio/4.4.106',
            'Accept': '*/*',
            'Accept-Language': 'es-CL,es;q=0.9',
            'Referer': 'https://app.strem.io/'
        };
    }
    
    if (item.infoHash) {
        stream.behaviorHints = { p2p: true };
    }
    
    return stream;
};

// Configurar Express para el panel de administración
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTML del panel de administración
const adminHTML = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Panel de Administración - Stremio Addon</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
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
        
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        
        .tabs {
            display: flex;
            background: #f8f9fa;
            border-bottom: 1px solid #dee2e6;
        }
        
        .tab {
            flex: 1;
            padding: 15px 20px;
            background: none;
            border: none;
            cursor: pointer;
            font-size: 16px;
            transition: all 0.3s;
        }
        
        .tab.active {
            background: white;
            border-bottom: 3px solid #667eea;
            color: #667eea;
        }
        
        .tab-content {
            display: none;
            padding: 30px;
        }
        
        .tab-content.active {
            display: block;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }
        
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: 600;
            color: #333;
        }
        
        input, textarea, select {
            width: 100%;
            padding: 12px;
            border: 2px solid #e1e5e9;
            border-radius: 8px;
            font-size: 16px;
            transition: border-color 0.3s;
        }
        
        input:focus, textarea:focus, select:focus {
            outline: none;
            border-color: #667eea;
        }
        
        textarea {
            resize: vertical;
            min-height: 100px;
        }
        
        .checkbox-group {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 10px;
            margin-top: 10px;
        }
        
        .checkbox-item {
            display: flex;
            align-items: center;
        }
        
        .checkbox-item input {
            width: auto;
            margin-right: 8px;
        }
        
        .btn {
            padding: 12px 30px;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
        }
        
        .btn-primary {
            background: linear-gradient(45deg, #667eea, #764ba2);
            color: white;
        }
        
        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
        }
        
        .btn-danger {
            background: #dc3545;
            color: white;
        }
        
        .content-list {
            margin-top: 30px;
        }
        
        .content-item {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 15px;
            border-left: 4px solid #667eea;
        }
        
        .content-item h3 {
            color: #333;
            margin-bottom: 10px;
        }
        
        .content-item p {
            color: #666;
            margin-bottom: 5px;
        }
        
        .content-actions {
            margin-top: 15px;
        }
        
        .alert {
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
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
        
        .episode-form {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-top: 20px;
        }
        
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
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
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎬 Panel de Administración</h1>
            <p>Gestiona el contenido de tu addon de Stremio</p>
        </div>
        
        <div class="tabs">
            <button class="tab active" onclick="showTab('movies')">Películas</button>
            <button class="tab" onclick="showTab('series')">Series</button>
            <button class="tab" onclick="showTab('episodes')">Episodios</button>
            <button class="tab" onclick="showTab('list')">Contenido</button>
        </div>
        
        <div id="alert-container"></div>
        
        <!-- Tab Películas -->
        <div id="movies" class="tab-content active">
            <h2>Añadir Película</h2>
            <form id="movieForm">
                <div class="form-row">
                    <div class="form-group">
                        <label>ID de IMDb *</label>
                        <input type="text" name="id" placeholder="tt1234567" required>
                    </div>
                    <div class="form-group">
                        <label>Nombre *</label>
                        <input type="text" name="name" placeholder="Nombre de la película" required>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>Año *</label>
                        <input type="number" name="year" min="1900" max="2030" required>
                    </div>
                    <div class="form-group">
                        <label>Director</label>
                        <input type="text" name="director" placeholder="Director de la película">
                    </div>
                </div>
                
                <div class="form-group">
                    <label>Géneros</label>
                    <div class="checkbox-group">
                        <div class="checkbox-item">
                            <input type="checkbox" name="genre" value="Acción" id="g1">
                            <label for="g1">Acción</label>
                        </div>
                        <div class="checkbox-item">
                            <input type="checkbox" name="genre" value="Comedia" id="g2">
                            <label for="g2">Comedia</label>
                        </div>
                        <div class="checkbox-item">
                            <input type="checkbox" name="genre" value="Drama" id="g3">
                            <label for="g3">Drama</label>
                        </div>
                        <div class="checkbox-item">
                            <input type="checkbox" name="genre" value="Animación" id="g4">
                            <label for="g4">Animación</label>
                        </div>
                        <div class="checkbox-item">
                            <input type="checkbox" name="genre" value="Aventura" id="g5">
                            <label for="g5">Aventura</label>
                        </div>
                        <div class="checkbox-item">
                            <input type="checkbox" name="genre" value="Familiar" id="g6">
                            <label for="g6">Familiar</label>
                        </div>
                    </div>
                </div>
                
                <div class="form-group">
                    <label>Reparto (separado por comas)</label>
                    <input type="text" name="cast" placeholder="Actor 1, Actor 2, Actor 3">
                </div>
                
                <div class="form-group">
                    <label>Descripción</label>
                    <textarea name="description" placeholder="Descripción de la película"></textarea>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>URL del Póster</label>
                        <input type="url" name="poster" placeholder="https://...">
                    </div>
                    <div class="form-group">
                        <label>URL de Fondo</label>
                        <input type="url" name="background" placeholder="https://...">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>Duración</label>
                        <input type="text" name="runtime" placeholder="120 min">
                    </div>
                    <div class="form-group">
                        <label>Calificación IMDb</label>
                        <input type="text" name="imdbRating" placeholder="7.5">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>URL del Video *</label>
                        <input type="url" name="url" placeholder="https://..." required>
                    </div>
                    <div class="form-group">
                        <label>Calidad</label>
                        <select name="quality">
                            <option value="SD">SD</option>
                            <option value="720p">720p</option>
                            <option value="1080p">1080p</option>
                            <option value="4K">4K</option>
                        </select>
                    </div>
                </div>
                
                <button type="submit" class="btn btn-primary">Añadir Película</button>
            </form>
        </div>
        
        <!-- Tab Series -->
        <div id="series" class="tab-content">
            <h2>Añadir Serie</h2>
            <form id="seriesForm">
                <div class="form-row">
                    <div class="form-group">
                        <label>ID de IMDb *</label>
                        <input type="text" name="id" placeholder="tt1234567" required>
                    </div>
                    <div class="form-group">
                        <label>Nombre *</label>
                        <input type="text" name="name" placeholder="Nombre de la serie" required>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>Año de Inicio *</label>
                        <input type="text" name="year" placeholder="1971" required>
                    </div>
                    <div class="form-group">
                        <label>Director/Creador</label>
                        <input type="text" name="director" placeholder="Creador de la serie">
                    </div>
                </div>
                
                <div class="form-group">
                    <label>Géneros</label>
                    <div class="checkbox-group">
                        <div class="checkbox-item">
                            <input type="checkbox" name="genre" value="Comedia" id="sg1">
                            <label for="sg1">Comedia</label>
                        </div>
                        <div class="checkbox-item">
                            <input type="checkbox" name="genre" value="Animación" id="sg2">
                            <label for="sg2">Animación</label>
                        </div>
                        <div class="checkbox-item">
                            <input type="checkbox" name="genre" value="Familiar" id="sg3">
                            <label for="sg3">Familiar</label>
                        </div>
                        <div class="checkbox-item">
                            <input type="checkbox" name="genre" value="Drama" id="sg4">
                            <label for="sg4">Drama</label>
                        </div>
                    </div>
                </div>
                
                <div class="form-group">
                    <label>Reparto Principal (separado por comas)</label>
                    <input type="text" name="cast" placeholder="Actor 1, Actor 2, Actor 3">
                </div>
                
                <div class="form-group">
                    <label>Descripción</label>
                    <textarea name="description" placeholder="Descripción de la serie"></textarea>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>URL del Póster</label>
                        <input type="url" name="poster" placeholder="https://...">
                    </div>
                    <div class="form-group">
                        <label>URL de Fondo</label>
                        <input type="url" name="background" placeholder="https://...">
                    </div>
                </div>
                
                <div class="form-group">
                    <label>Calificación IMDb</label>
                    <input type="text" name="imdbRating" placeholder="8.5">
                </div>
                
                <button type="submit" class="btn btn-primary">Añadir Serie</button>
            </form>
        </div>
        
        <!-- Tab Episodios -->
        <div id="episodes" class="tab-content">
            <h2>Añadir Episodio</h2>
            <div class="form-group">
                <label>Seleccionar Serie</label>
                <select id="seriesSelect" onchange="updateEpisodeForm()">
                    <option value="">Selecciona una serie...</option>
                </select>
            </div>
            
            <div class="episode-form" id="episodeForm" style="display: none;">
                <form id="episodeFormData">
                    <input type="hidden" name="seriesId" id="selectedSeriesId">
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label>Temporada *</label>
                            <input type="number" name="season" min="1" required>
                        </div>
                        <div class="form-group">
                            <label>Episodio *</label>
                            <input type="number" name="episode" min="1" required>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>Título del Episodio *</label>
                        <input type="text" name="name" placeholder="Título del episodio" required>
                    </div>
                    
                    <div class="form-group">
                        <label>Descripción</label>
                        <textarea name="description" placeholder="Descripción del episodio"></textarea>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label>URL del Video *</label>
                            <input type="url" name="url" placeholder="https://..." required>
                        </div>
                        <div class="form-group">
                            <label>Duración</label>
                            <input type="text" name="runtime" placeholder="25 min">
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label>URL del Póster/Thumbnail</label>
                            <input type="url" name="poster" placeholder="https://...">
                        </div>
                        <div class="form-group">
                            <label>Calidad</label>
                            <select name="quality">
                                <option value="SD">SD</option>
                                <option value="720p">720p</option>
                                <option value="1080p">1080p</option>
                                <option value="4K">4K</option>
                            </select>
                        </div>
                    </div>
                    
                    <button type="submit" class="btn btn-primary">Añadir Episodio</button>
                </form>
            </div>
        </div>
        
        <!-- Tab Lista de Contenido -->
        <div id="list" class="tab-content">
            <h2>Contenido Actual</h2>
            
            <div class="stats" id="stats">
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
            
            <div class="content-list" id="contentList">
                <!-- El contenido se cargará aquí -->
            </div>
        </div>
    </div>
    
    <script>
        // Funciones para cambiar tabs
        function showTab(tabName) {
            document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            
            event.target.classList.add('active');
            document.getElementById(tabName).classList.add('active');
            
            if (tabName === 'list') {
                loadContentList();
            } else if (tabName === 'episodes') {
                loadSeriesList();
            }
        }
        
        // Mostrar alertas
        function showAlert(message, type = 'success') {
            const alertContainer = document.getElementById('alert-container');
            const alert = document.createElement('div');
            alert.className = \`alert alert-\${type}\`;
            alert.textContent = message;
            alertContainer.appendChild(alert);
            
            setTimeout(() => {
                alert.remove();
            }, 5000);
        }
        
        // Formulario de películas
        document.getElementById('movieForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = {
                id: formData.get('id'),
                type: 'movie',
                name: formData.get('name'),
                year: parseInt(formData.get('year')),
                director: formData.get('director'),
                cast: formData.get('cast') ? formData.get('cast').split(',').map(s => s.trim()) : [],
                description: formData.get('description'),
                poster: formData.get('poster'),
                background: formData.get('background'),
                runtime: formData.get('runtime'),
                imdbRating: formData.get('imdbRating'),
                url: formData.get('url'),
                quality: formData.get('quality'),
                language: 'Latino',
                genre: Array.from(formData.getAll('genre'))
            };
            
            try {
                const response = await fetch('/admin/add-movie', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                
                if (response.ok) {
                    showAlert('Película añadida exitosamente');
                    e.target.reset();
                } else {
                    const error = await response.text();
                    showAlert(error, 'error');
                }
            } catch (error) {
                showAlert('Error al añadir película: ' + error.message, 'error');
            }
        });
        
        // Formulario de series
        document.getElementById('seriesForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = {
                id: formData.get('id'),
                type: 'series',
                name: formData.get('name'),
                seriesId: formData.get('id'),
                seriesName: formData.get('name'),
                year: formData.get('year'),
                director: formData.get('director'),
                cast: formData.get('cast') ? formData.get('cast').split(',').map(s => s.trim()) : [],
                description: formData.get('description'),
                poster: formData.get('poster'),
                background: formData.get('background'),
                imdbRating: formData.get('imdbRating'),
                language: 'Latino',
                genre: Array.from(formData.getAll('genre'))
            };
            
            try {
                const response = await fetch('/admin/add-series', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                
                if (response.ok) {
                    showAlert('Serie añadida exitosamente');
                    e.target.reset();
                    loadSeriesList();
                } else {
                    const error = await response.text();
                    showAlert(error, 'error');
                }
            } catch (error) {
                showAlert('Error al añadir serie: ' + error.message, 'error');
            }
        });
        
        // Formulario de episodios
        document.getElementById('episodeFormData').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const seriesId = formData.get('seriesId');
            const season = formData.get('season');
            const episode = formData.get('episode');
            const episodeId = \`\${seriesId}:\${season}:\${episode}\`;
            
            const data = {
                id: episodeId,
                type: 'series',
                name: formData.get('name'),
                season: parseInt(season),
                episode: parseInt(episode),
                seriesId: seriesId,
                description: formData.get('description'),
                poster: formData.get('poster'),
                runtime: formData.get('runtime'),
                url: formData.get('url'),
                quality: formData.get('quality'),
                language: 'Latino'
            };
            
            try {
                const response = await fetch('/admin/add-episode', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                
                if (response.ok) {
                    showAlert('Episodio añadido exitosamente');
                    e.target.reset();
                } else {
                    const error = await response.text();
                    showAlert(error, 'error');
                }
            } catch (error) {
                showAlert('Error al añadir episodio: ' + error.message, 'error');
            }
        });
        
        // Cargar lista de series para episodios
        async function loadSeriesList() {
            try {
                const response = await fetch('/admin/series-list');
                const series = await response.json();
                const select = document.getElementById('seriesSelect');
                select.innerHTML = '<option value="">Selecciona una serie...</option>';
                
                series.forEach(serie => {
                    const option = document.createElement('option');
                    option.value = serie.id;
                    option.textContent = serie.name;
                    select.appendChild(option);
                });
            } catch (error) {
                console.error('Error loading series:', error);
            }
        }
        
        // Actualizar formulario de episodios
        function updateEpisodeForm() {
            const select = document.getElementById('seriesSelect');
            const form = document.getElementById('episodeForm');
            const seriesIdInput = document.getElementById('selectedSeriesId');
            
            if (select.value) {
                form.style.display = 'block';
                seriesIdInput.value = select.value;
            } else {
                form.style.display = 'none';
            }
        }
        
        // Cargar lista de contenido
        async function loadContentList() {
            try {
                const response = await fetch('/admin/content-list');
                const content = await response.json();
                
                // Actualizar estadísticas
                document.getElementById('movieCount').textContent = content.movies.length;
                document.getElementById('seriesCount').textContent = content.series.length;
                document.getElementById('episodeCount').textContent = content.episodes.length;
                
                // Mostrar contenido
                const contentList = document.getElementById('contentList');
                contentList.innerHTML = '';
                
                // Películas
                if (content.movies.length > 0) {
                    const moviesSection = document.createElement('div');
                    moviesSection.innerHTML = '<h3>🎬 Películas</h3>';
                    content.movies.forEach(movie => {
                        const item = createContentItem(movie, 'movie');
                        moviesSection.appendChild(item);
                    });
                    contentList.appendChild(moviesSection);
                }
                
                // Series
                if (content.series.length > 0) {
                    const seriesSection = document.createElement('div');
                    seriesSection.innerHTML = '<h3>📺 Series</h3>';
                    content.series.forEach(serie => {
                        const item = createContentItem(serie, 'series');
                        seriesSection.appendChild(item);
                    });
                    contentList.appendChild(seriesSection);
                }
                
                // Episodios
                if (content.episodes.length > 0) {
                    const episodesSection = document.createElement('div');
                    episodesSection.innerHTML = '<h3>🎭 Episodios</h3>';
                    content.episodes.forEach(episode => {
                        const item = createContentItem(episode, 'episode');
                        episodesSection.appendChild(item);
                    });
                    contentList.appendChild(episodesSection);
                }
                
            } catch (error) {
                console.error('Error loading content:', error);
            }
        }
        
        // Crear elemento de contenido
        function createContentItem(item, type) {
            const div = document.createElement('div');
            div.className = 'content-item';
            
            let typeIcon = type === 'movie' ? '🎬' : type === 'series' ? '📺' : '🎭';
            let typeText = type === 'movie' ? 'Película' : type === 'series' ? 'Serie' : 'Episodio';
            
            div.innerHTML = \`
                <h3>\${typeIcon} \${item.name}</h3>
                <p><strong>Tipo:</strong> \${typeText}</p>
                <p><strong>ID:</strong> \${item.id}</p>
                <p><strong>Año:</strong> \${item.year}</p>
                \${item.genre ? \`<p><strong>Géneros:</strong> \${Array.isArray(item.genre) ? item.genre.join(', ') : item.genre}</p>\` : ''}
                \${item.season && item.episode ? \`<p><strong>Temporada/Episodio:</strong> S\${item.season}E\${item.episode}</p>\` : ''}
                \${item.description ? \`<p><strong>Descripción:</strong> \${item.description.substring(0, 100)}...</p>\` : ''}
                <div class="content-actions">
                    <button class="btn btn-danger" onclick="deleteContent('\${item.id}', '\${type}')">Eliminar</button>
                </div>
            \`;
            
            return div;
        }
        
        // Eliminar contenido
        async function deleteContent(id, type) {
            if (!confirm('¿Estás seguro de que quieres eliminar este contenido?')) {
                return;
            }
            
            try {
                const response = await fetch(\`/admin/delete/\${id}\`, {
                    method: 'DELETE'
                });
                
                if (response.ok) {
                    showAlert('Contenido eliminado exitosamente');
                    loadContentList();
                } else {
                    const error = await response.text();
                    showAlert(error, 'error');
                }
            } catch (error) {
                showAlert('Error al eliminar contenido: ' + error.message, 'error');
            }
        }
        
        // Cargar datos iniciales
        window.addEventListener('load', () => {
            loadContentList();
            loadSeriesList();
        });
    </script>
</body>
</html>
`;

// Rutas del panel de administración
app.get('/admin', (req, res) => {
    res.send(adminHTML);
});

// API para añadir película
app.post('/admin/add-movie', (req, res) => {
    try {
        const movie = req.body;
        
        if (!movie.id || !movie.name || !movie.url) {
            return res.status(400).send('Faltan campos requeridos: id, name, url');
        }
        
        if (dataset[movie.id]) {
            return res.status(400).send('Ya existe una película con ese ID');
        }
        
        dataset[movie.id] = movie;
        res.send('Película añadida exitosamente');
    } catch (error) {
        console.error('Add movie error:', error);
        res.status(500).send('Error interno del servidor');
    }
});

// API para añadir serie
app.post('/admin/add-series', (req, res) => {
    try {
        const series = req.body;
        
        if (!series.id || !series.name) {
            return res.status(400).send('Faltan campos requeridos: id, name');
        }
        
        if (dataset[series.id]) {
            return res.status(400).send('Ya existe una serie con ese ID');
        }
        
        dataset[series.id] = series;
        res.send('Serie añadida exitosamente');
    } catch (error) {
        console.error('Add series error:', error);
        res.status(500).send('Error interno del servidor');
    }
});

// API para añadir episodio
app.post('/admin/add-episode', (req, res) => {
    try {
        const episode = req.body;
        
        if (!episode.id || !episode.name || !episode.url || !episode.seriesId) {
            return res.status(400).send('Faltan campos requeridos: id, name, url, seriesId');
        }
        
        if (!dataset[episode.seriesId]) {
            return res.status(400).send('La serie padre no existe');
        }
        
        if (dataset[episode.id]) {
            return res.status(400).send('Ya existe un episodio con ese ID');
        }
        
        // Heredar información de la serie padre
        const parentSeries = dataset[episode.seriesId];
        episode.genre = parentSeries.genre;
        episode.year = parentSeries.year;
        episode.seriesName = parentSeries.name;
        
        dataset[episode.id] = episode;
        res.send('Episodio añadido exitosamente');
    } catch (error) {
        console.error('Add episode error:', error);
        res.status(500).send('Error interno del servidor');
    }
});

// API para obtener lista de series
app.get('/admin/series-list', (req, res) => {
    try {
        const series = Object.entries(dataset)
            .filter(([key, value]) => value.type === 'series' && !key.includes(':'))
            .map(([key, value]) => ({ id: key, name: value.name }));
        
        res.json(series);
    } catch (error) {
        console.error('Series list error:', error);
        res.status(500).json({ error: 'Error loading series list' });
    }
});

// API para obtener lista de contenido
app.get('/admin/content-list', (req, res) => {
    try {
        const movies = Object.entries(dataset)
            .filter(([key, value]) => value.type === 'movie')
            .map(([key, value]) => ({ ...value, key }));
        
        const series = Object.entries(dataset)
            .filter(([key, value]) => value.type === 'series' && !key.includes(':'))
            .map(([key, value]) => ({ ...value, key }));
        
        const episodes = Object.entries(dataset)
            .filter(([key, value]) => value.type === 'series' && key.includes(':'))
            .map(([key, value]) => ({ ...value, key }));
        
        res.json({ movies, series, episodes });
    } catch (error) {
        console.error('Content list error:', error);
        res.status(500).json({ error: 'Error loading content list' });
    }
});

// API para eliminar contenido
app.delete('/admin/delete/:id', (req, res) => {
    try {
        const id = decodeURIComponent(req.params.id);
        
        if (!dataset[id]) {
            return res.status(404).send('Contenido no encontrado');
        }
        
        // Si es una serie, eliminar también sus episodios
        if (dataset[id].type === 'series' && !id.includes(':')) {
            Object.keys(dataset).forEach(key => {
                if (key.startsWith(id + ':')) {
                    delete dataset[key];
                }
            });
        }
        
        delete dataset[id];
        res.send('Contenido eliminado exitosamente');
    } catch (error) {
        console.error('Delete content error:', error);
        res.status(500).send('Error interno del servidor');
    }
});

// Configurar el addon de Stremio
const builder = new addonBuilder(manifest);

builder.defineStreamHandler(({ id }) => {
    try {
        const item = dataset[id];
        return Promise.resolve({
            streams: item ? [createStream(item)] : []
        });
    } catch (error) {
        console.error('Stream handler error:', error);
        return Promise.resolve({ streams: [] });
    }
});

builder.defineCatalogHandler((args) => {
    try {
        const skip = parseInt(args.extra?.skip) || 0;
        const limit = 20;
        
        const items = Object.entries(dataset)
            .filter(([key, value]) => {
                if (value.type !== args.type || (value.type === "series" && isEpisode(key))) return false;
                
                if (args.extra?.genre) {
                    return value.genre?.some(g => 
                        g.toLowerCase().includes(args.extra.genre.toLowerCase()) ||
                        args.extra.genre.toLowerCase().includes(g.toLowerCase())
                    );
                }
                
                return true;
            })
            .slice(skip, skip + limit)
            .map(([key, value]) => createMetaPreview(value, key));
        
        return Promise.resolve({ metas: items });
    } catch (error) {
        console.error('Catalog handler error:', error);
        return Promise.resolve({ metas: [] });
    }
});

builder.defineMetaHandler(({ id }) => {
    try {
        let item = Object.entries(dataset).find(([key]) => key === id);
        
        if (!item) {
            item = Object.entries(dataset).find(([key, value]) => 
                extractBaseId(key) === id || value.seriesId === id
            );
        }
        
        return Promise.resolve({
            meta: item ? createFullMeta(item[1], item[0]) : null
        });
    } catch (error) {
        console.error('Meta handler error:', error);
        return Promise.resolve({ meta: null });
    }
});

// Configurar servidor
const port = process.env.PORT || 3000;

// Configurar rutas del addon de Stremio
app.get('/manifest.json', (req, res) => {
    res.json(manifest);
});

app.get('/catalog/:type/:id.json', async (req, res) => {
    try {
        const args = {
            type: req.params.type,
            id: req.params.id,
            extra: {}
        };
        const result = await builder.getInterface().catalog(args);
        res.json(result);
    } catch (error) {
        console.error('Catalog error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/catalog/:type/:id/:extra.json', async (req, res) => {
    try {
        const args = {
            type: req.params.type,
            id: req.params.id,
            extra: {}
        };
        
        // Parsear parámetros extra
        const extraParams = req.params.extra.split('&');
        extraParams.forEach(param => {
            const [key, value] = param.split('=');
            if (key && value) {
                args.extra[key] = decodeURIComponent(value);
            }
        });
        
        const result = await builder.getInterface().catalog(args);
        res.json(result);
    } catch (error) {
        console.error('Catalog with extra error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/meta/:type/:id.json', async (req, res) => {
    try {
        const args = {
            type: req.params.type,
            id: req.params.id
        };
        const result = await builder.getInterface().meta(args);
        res.json(result);
    } catch (error) {
        console.error('Meta error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/stream/:type/:id.json', async (req, res) => {
    try {
        const args = {
            type: req.params.type,
            id: req.params.id
        };
        const result = await builder.getInterface().stream(args);
        res.json(result);
    } catch (error) {
        console.error('Stream error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Iniciar servidor
app.listen(port, () => {
    console.log(`🚀 Addon Chile iniciado en puerto ${port}`);
    console.log(`📱 Manifest: http://localhost:${port}/manifest.json`);
    console.log(`⚙️  Panel Admin: http://localhost:${port}/admin`);
    console.log(`🎬 Películas: ${Object.values(dataset).filter(v => v.type === 'movie').length}`);
    console.log(`📺 Series: ${Object.values(dataset).filter(v => v.type === 'series' && !v.id.includes(':')).length}`);
});

['SIGINT', 'SIGTERM'].forEach(signal => {
    process.on(signal, () => process.exit(0));
});