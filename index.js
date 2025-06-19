const { addonBuilder, serveHTTP } = require("stremio-addon-sdk");
const express = require('express');
const path = require('path');

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

// Dataset inicial vacío - el contenido se añadirá desde el panel
let dataset = {};

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

// Crear el builder de Stremio
const builder = new addonBuilder(manifest);

builder.defineStreamHandler(({ id }) => {
    const item = dataset[id];
    return Promise.resolve({
        streams: item ? [createStream(item)] : []
    });
});

builder.defineCatalogHandler((args) => {
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
});

builder.defineMetaHandler(({ id }) => {
    let item = Object.entries(dataset).find(([key]) => key === id);
    
    if (!item) {
        item = Object.entries(dataset).find(([key, value]) => 
            extractBaseId(key) === id || value.seriesId === id
        );
    }
    
    return Promise.resolve({
        meta: item ? createFullMeta(item[1], item[0]) : null
    });
});

// Crear servidor Express para el panel de administración
const app = express();
app.use(express.json());
app.use(express.static('public'));

// Panel de administración HTML
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
        .tabs { display: flex; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 20px; }
        .tab { flex: 1; padding: 15px 20px; background: #f8f9fa; border: none; cursor: pointer; transition: all 0.3s; font-size: 16px; }
        .tab.active { background: #667eea; color: white; }
        .tab:hover { background: #e9ecef; }
        .tab.active:hover { background: #5a6fd8; }
        .form-container { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 20px; }
        .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .form-group { margin-bottom: 20px; }
        .form-group label { display: block; margin-bottom: 8px; font-weight: 600; color: #333; }
        .form-group input, .form-group textarea, .form-group select { width: 100%; padding: 12px; border: 2px solid #e1e5e9; border-radius: 6px; font-size: 14px; transition: border-color 0.3s; }
        .form-group input:focus, .form-group textarea:focus, .form-group select:focus { outline: none; border-color: #667eea; }
        .form-group textarea { resize: vertical; min-height: 80px; }
        .btn { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 24px; border: none; border-radius: 6px; cursor: pointer; font-size: 16px; transition: transform 0.2s; }
        .btn:hover { transform: translateY(-2px); }
        .btn-danger { background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%); }
        .content-list { background: white; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .content-item { padding: 20px; border-bottom: 1px solid #eee; display: flex; align-items: center; gap: 15px; }
        .content-item:last-child { border-bottom: none; }
        .content-poster { width: 60px; height: 90px; object-fit: cover; border-radius: 4px; }
        .content-info { flex: 1; }
        .content-title { font-size: 18px; font-weight: 600; margin-bottom: 5px; }
        .content-meta { color: #666; font-size: 14px; }
        .status { padding: 20px; text-align: center; border-radius: 6px; margin: 10px 0; }
        .status.success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .status.error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
        .hidden { display: none; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .stat-card { background: white; padding: 25px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; }
        .stat-number { font-size: 32px; font-weight: bold; color: #667eea; }
        .stat-label { color: #666; margin-top: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎬 Panel de Administración - Stremio Addon</h1>
            <p>Gestiona tu contenido de forma fácil e intuitiva</p>
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

        <div class="tabs">
            <button class="tab active" onclick="showTab('movie')">📽️ Añadir Película</button>
            <button class="tab" onclick="showTab('series')">📺 Añadir Serie</button>
            <button class="tab" onclick="showTab('episode')">🎞️ Añadir Episodio</button>
            <button class="tab" onclick="showTab('list')">📋 Ver Contenido</button>
        </div>

        <div id="status"></div>

        <!-- Formulario Película -->
        <div id="movieForm" class="form-container">
            <h2>🎬 Añadir Nueva Película</h2>
            <form onsubmit="addMovie(event)">
                <div class="form-grid">
                    <div class="form-group">
                        <label>ID IMDb *</label>
                        <input type="text" name="id" placeholder="tt1234567" required>
                    </div>
                    <div class="form-group">
                        <label>Título *</label>
                        <input type="text" name="name" required>
                    </div>
                    <div class="form-group">
                        <label>Año *</label>
                        <input type="number" name="year" min="1900" max="2030" required>
                    </div>
                    <div class="form-group">
                        <label>Géneros *</label>
                        <select name="genre" multiple size="4" required>
                            <option value="Acción">Acción</option>
                            <option value="Comedia">Comedia</option>
                            <option value="Drama">Drama</option>
                            <option value="Animación">Animación</option>
                            <option value="Aventura">Aventura</option>
                            <option value="Familiar">Familiar</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Director</label>
                        <input type="text" name="director">
                    </div>
                    <div class="form-group">
                        <label>Reparto (separado por comas)</label>
                        <input type="text" name="cast" placeholder="Actor 1, Actor 2, Actor 3">
                    </div>
                    <div class="form-group">
                        <label>Duración</label>
                        <input type="text" name="runtime" placeholder="120 min">
                    </div>
                    <div class="form-group">
                        <label>Rating IMDb</label>
                        <input type="text" name="imdbRating" placeholder="7.5">
                    </div>
                    <div class="form-group">
                        <label>URL del Poster</label>
                        <input type="url" name="poster">
                    </div>
                    <div class="form-group">
                        <label>URL de Fondo</label>
                        <input type="url" name="background">
                    </div>
                    <div class="form-group">
                        <label>URL del Video *</label>
                        <input type="url" name="url" required>
                    </div>
                    <div class="form-group">
                        <label>Calidad</label>
                        <select name="quality">
                            <option value="1080p">1080p</option>
                            <option value="720p">720p</option>
                            <option value="SD">SD</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>Descripción</label>
                    <textarea name="description" rows="4"></textarea>
                </div>
                <button type="submit" class="btn">➕ Añadir Película</button>
            </form>
        </div>

        <!-- Formulario Serie -->
        <div id="seriesForm" class="form-container hidden">
            <h2>📺 Añadir Nueva Serie</h2>
            <form onsubmit="addSeries(event)">
                <div class="form-grid">
                    <div class="form-group">
                        <label>ID IMDb *</label>
                        <input type="text" name="id" placeholder="tt1234567" required>
                    </div>
                    <div class="form-group">
                        <label>Título *</label>
                        <input type="text" name="name" required>
                    </div>
                    <div class="form-group">
                        <label>Año de Inicio *</label>
                        <input type="number" name="year" min="1900" max="2030" required>
                    </div>
                    <div class="form-group">
                        <label>Géneros *</label>
                        <select name="genre" multiple size="4" required>
                            <option value="Comedia">Comedia</option>
                            <option value="Animación">Animación</option>
                            <option value="Familiar">Familiar</option>
                            <option value="Drama">Drama</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Director</label>
                        <input type="text" name="director">
                    </div>
                    <div class="form-group">
                        <label>Reparto (separado por comas)</label>
                        <input type="text" name="cast" placeholder="Actor 1, Actor 2, Actor 3">
                    </div>
                    <div class="form-group">
                        <label>Rating IMDb</label>
                        <input type="text" name="imdbRating" placeholder="8.5">
                    </div>
                    <div class="form-group">
                        <label>URL del Poster</label>
                        <input type="url" name="poster">
                    </div>
                    <div class="form-group">
                        <label>URL de Fondo</label>
                        <input type="url" name="background">
                    </div>
                </div>
                <div class="form-group">
                    <label>Descripción</label>
                    <textarea name="description" rows="4"></textarea>
                </div>
                <button type="submit" class="btn">➕ Añadir Serie</button>
            </form>
        </div>

        <!-- Formulario Episodio -->
        <div id="episodeForm" class="form-container hidden">
            <h2>🎞️ Añadir Nuevo Episodio</h2>
            <form onsubmit="addEpisode(event)">
                <div class="form-grid">
                    <div class="form-group">
                        <label>Serie *</label>
                        <select name="seriesId" id="seriesSelect" required>
                            <option value="">Selecciona una serie</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Temporada *</label>
                        <input type="number" name="season" min="1" required>
                    </div>
                    <div class="form-group">
                        <label>Episodio *</label>
                        <input type="number" name="episode" min="1" required>
                    </div>
                    <div class="form-group">
                        <label>Título del Episodio *</label>
                        <input type="text" name="name" required>
                    </div>
                    <div class="form-group">
                        <label>Año</label>
                        <input type="number" name="year" min="1900" max="2030">
                    </div>
                    <div class="form-group">
                        <label>Duración</label>
                        <input type="text" name="runtime" placeholder="25 min">
                    </div>
                    <div class="form-group">
                        <label>URL del Video *</label>
                        <input type="url" name="url" required>
                    </div>
                    <div class="form-group">
                        <label>Calidad</label>
                        <select name="quality">
                            <option value="1080p">1080p</option>
                            <option value="720p">720p</option>
                            <option value="SD">SD</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>URL del Poster</label>
                        <input type="url" name="poster">
                    </div>
                </div>
                <div class="form-group">
                    <label>Descripción</label>
                    <textarea name="description" rows="4"></textarea>
                </div>
                <button type="submit" class="btn">➕ Añadir Episodio</button>
            </form>
        </div>

        <!-- Lista de Contenido -->
        <div id="contentList" class="hidden">
            <div class="content-list" id="contentItems">
                <!-- El contenido se cargará aquí -->
            </div>
        </div>
    </div>

    <script>
        function showTab(tab) {
            // Ocultar todos los formularios
            document.querySelectorAll('.form-container, #contentList').forEach(el => el.classList.add('hidden'));
            document.querySelectorAll('.tab').forEach(el => el.classList.remove('active'));
            
            // Mostrar el formulario seleccionado
            if (tab === 'movie') {
                document.getElementById('movieForm').classList.remove('hidden');
            } else if (tab === 'series') {
                document.getElementById('seriesForm').classList.remove('hidden');
            } else if (tab === 'episode') {
                document.getElementById('episodeForm').classList.remove('hidden');
                loadSeries();
            } else if (tab === 'list') {
                document.getElementById('contentList').classList.remove('hidden');
                loadContent();
            }
            
            // Activar pestaña
            event.target.classList.add('active');
        }

        function showStatus(message, type = 'success') {
            const status = document.getElementById('status');
            status.innerHTML = \`<div class="status \${type}">\${message}</div>\`;
            setTimeout(() => status.innerHTML = '', 5000);
        }

        async function addMovie(event) {
            event.preventDefault();
            const formData = new FormData(event.target);
            const data = Object.fromEntries(formData.entries());
            
            // Procesar géneros
            data.genre = Array.from(event.target.genre.selectedOptions).map(option => option.value);
            
            // Procesar reparto
            if (data.cast) data.cast = data.cast.split(',').map(s => s.trim());
            
            try {
                const response = await fetch('/admin/add-movie', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                if (result.success) {
                    showStatus('✅ Película añadida correctamente');
                    event.target.reset();
                    updateStats();
                } else {
                    showStatus(result.error, 'error');
                }
            } catch (error) {
                showStatus('❌ Error al añadir película', 'error');
            }
        }

        async function addSeries(event) {
            event.preventDefault();
            const formData = new FormData(event.target);
            const data = Object.fromEntries(formData.entries());
            
            data.genre = Array.from(event.target.genre.selectedOptions).map(option => option.value);
            if (data.cast) data.cast = data.cast.split(',').map(s => s.trim());
            
            try {
                const response = await fetch('/admin/add-series', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                if (result.success) {
                    showStatus('✅ Serie añadida correctamente');
                    event.target.reset();
                    updateStats();
                } else {
                    showStatus(result.error, 'error');
                }
            } catch (error) {
                showStatus('❌ Error al añadir serie', 'error');
            }
        }

        async function addEpisode(event) {
            event.preventDefault();
            const formData = new FormData(event.target);
            const data = Object.fromEntries(formData.entries());
            
            try {
                const response = await fetch('/admin/add-episode', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                if (result.success) {
                    showStatus('✅ Episodio añadido correctamente');
                    event.target.reset();
                    updateStats();
                } else {
                    showStatus(result.error, 'error');
                }
            } catch (error) {
                showStatus('❌ Error al añadir episodio', 'error');
            }
        }

        async function loadSeries() {
            try {
                const response = await fetch('/admin/series');
                const series = await response.json();
                const select = document.getElementById('seriesSelect');
                select.innerHTML = '<option value="">Selecciona una serie</option>';
                
                series.forEach(s => {
                    const option = document.createElement('option');
                    option.value = s.id;
                    option.textContent = s.name;
                    select.appendChild(option);
                });
            } catch (error) {
                console.error('Error loading series:', error);
            }
        }

        async function loadContent() {
            try {
                const response = await fetch('/admin/content');
                const content = await response.json();
                const container = document.getElementById('contentItems');
                
                if (content.length === 0) {
                    container.innerHTML = '<div style="padding: 40px; text-align: center; color: #666;">No hay contenido añadido aún</div>';
                    return;
                }
                
                container.innerHTML = content.map(item => \`
                    <div class="content-item">
                        <img src="\${item.poster || '/placeholder.jpg'}" alt="\${item.name}" class="content-poster" onerror="this.src='https://via.placeholder.com/60x90?text=No+Image'">
                        <div class="content-info">
                            <div class="content-title">\${item.name}</div>
                            <div class="content-meta">
                                \${item.type === 'movie' ? '🎬 Película' : item.type === 'series' ? '📺 Serie' : '🎞️ Episodio'} • 
                                \${item.year} • 
                                \${item.genre ? item.genre.join(', ') : 'Sin género'}
                            </div>
                        </div>
                        <button class="btn btn-danger" onclick="deleteContent('\${item.id}')">🗑️ Eliminar</button>
                    </div>
                \`).join('');
            } catch (error) {
                console.error('Error loading content:', error);
            }
        }

        async function deleteContent(id) {
            if (!confirm('¿Estás seguro de que quieres eliminar este contenido?')) return;
            
            try {
                const response = await fetch(\`/admin/delete/\${id}\`, { method: 'DELETE' });
                const result = await response.json();
                
                if (result.success) {
                    showStatus('✅ Contenido eliminado correctamente');
                    loadContent();
                    updateStats();
                } else {
                    showStatus(result.error, 'error');
                }
            } catch (error) {
                showStatus('❌ Error al eliminar contenido', 'error');
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

// Rutas del panel de administración
app.get('/admin', (req, res) => {
    res.send(adminPanelHTML);
});

app.post('/admin/add-movie', (req, res) => {
    const movie = req.body;
    movie.type = 'movie';
    movie.language = 'Latino';
    
    dataset[movie.id] = movie;
    res.json({ success: true });
});

app.post('/admin/add-series', (req, res) => {
    const series = req.body;
    series.type = 'series';
    series.language = 'Latino';
    series.seriesId = series.id;
    series.seriesName = series.name;
    
    dataset[series.id] = series;
    res.json({ success: true });
});

app.post('/admin/add-episode', (req, res) => {
    const episode = req.body;
    const seriesData = dataset[episode.seriesId];
    
    if (!seriesData) {
        return res.json({ success: false, error: 'Serie no encontrada' });
    }
    
    const episodeId = `${episode.seriesId}:${episode.season}:${episode.episode}`;
    
    episode.type = 'series';
    episode.language = 'Latino';
    episode.seriesName = seriesData.name;
    episode.genre = seriesData.genre;
    episode.season = parseInt(episode.season);
    episode.episode = parseInt(episode.episode);
    episode.year = episode.year || seriesData.year;
    
    dataset[episodeId] = episode;
    res.json({ success: true });
});

app.get('/admin/series', (req, res) => {
    const series = Object.values(dataset)
        .filter(item => item.type === 'series' && !item.id.includes(':'))
        .map(s => ({ id: s.id, name: s.name }));
    res.json(series);
});

app.get('/admin/content', (req, res) => {
    const content = Object.entries(dataset)
        .map(([key, item]) => ({
            ...item,
            id: key,
            type: item.type === 'series' && key.includes(':') ? 'episode' : item.type
        }))
        .sort((a, b) => {
            if (a.type !== b.type) {
                const order = { movie: 0, series: 1, episode: 2 };
                return order[a.type] - order[b.type];
            }
            return a.name.localeCompare(b.name);
        });
    res.json(content);
});

app.delete('/admin/delete/:id', (req, res) => {
    const id = req.params.id;
    
    if (dataset[id]) {
        // Si es una serie, también eliminar sus episodios
        if (dataset[id].type === 'series' && !id.includes(':')) {
            Object.keys(dataset).forEach(key => {
                if (key.startsWith(id + ':')) {
                    delete dataset[key];
                }
            });
        }
        
        delete dataset[id];
        res.json({ success: true });
    } else {
        res.json({ success: false, error: 'Contenido no encontrado' });
    }
});

app.get('/admin/stats', (req, res) => {
    const movies = Object.values(dataset).filter(item => item.type === 'movie').length;
    const series = Object.values(dataset).filter(item => item.type === 'series' && !item.id.includes(':')).length;
    const episodes = Object.keys(dataset).filter(key => key.includes(':')).length;
    
    res.json({ movies, series, episodes });
});

// Integrar el addon de Stremio con Express
const port = process.env.PORT || 3000;

// Crear servidor que maneje tanto el addon como el panel
const addonInterface = builder.getInterface();

// Rutas del addon de Stremio
app.get('/manifest.json', (req, res) => {
    res.json(addonInterface.manifest);
});

app.get('/catalog/:type/:id.json', (req, res) => {
    addonInterface.get(req, res);
});

app.get('/catalog/:type/:id/:extra.json', (req, res) => {
    addonInterface.get(req, res);
});

app.get('/meta/:type/:id.json', (req, res) => {
    addonInterface.get(req, res);
});

app.get('/stream/:type/:id.json', (req, res) => {
    addonInterface.get(req, res);
});

// Ruta raíz que redirige al panel
app.get('/', (req, res) => {
    res.redirect('/admin');
});

app.listen(port, () => {
    console.log(`🚀 Addon Chile iniciado en puerto ${port}`);
    console.log(`📱 Panel de Administración: http://localhost:${port}/admin`);
    console.log(`📱 Manifest: http://localhost:${port}/manifest.json`);
    console.log(`🎬 Películas: ${Object.values(dataset).filter(v => v.type === 'movie').length}`);
    console.log(`📺 Series: ${Object.values(dataset).filter(v => v.type === 'series' && !v.id.includes(':')).length}`);
    console.log(`🎞️ Episodios: ${Object.keys(dataset).filter(k => k.includes(':')).length}`);
});

['SIGINT', 'SIGTERM'].forEach(signal => {
    process.on(signal, () => process.exit(0));
});