const { addonBuilder, serveHTTP } = require("stremio-addon-sdk");
const express = require("express");

// Manifest del addon
const manifest = {
    "id": "org.stremio.addon-latino-chile",
    "version": "2.0.0",
    "name": "Latino Chile",
    "description": "Contenido en Español Latino para Chile",
    "icon": "https://i.imgur.com/QQzjJFh.png",
    "resources": ["catalog", "stream", "meta"],
    "types": ["movie", "series"],
    "catalogs": [
        {
            "type": "movie",
            "id": "peliculas-latino",
            "name": "Películas Latino",
            "extra": [
                {
                    "name": "genre",
                    "options": ["Acción", "Comedia", "Drama", "Animación", "Aventura", "Familiar", "Terror", "Ciencia Ficción"]
                }
            ]
        },
        {
            "type": "series", 
            "id": "series-latino",
            "name": "Series Latino",
            "extra": [
                {
                    "name": "genre",
                    "options": ["Comedia", "Drama", "Animación", "Familiar", "Acción", "Thriller"]
                }
            ]
        }
    ],
    "idPrefixes": ["tt"],
    "behaviorHints": {
        "adult": false,
        "p2p": false,
        "configurable": true,
        "configurationRequired": false
    }
};

// Base de datos de contenido
let contentDB = {
    // Películas
    "tt0126029": {
        id: "tt0126029",
        type: "movie",
        name: "Shrek",
        genres: ["Comedia", "Animación", "Aventura", "Familiar"],
        year: 2001,
        director: ["Andrew Adamson", "Vicky Jenson"],
        cast: ["Mike Myers", "Eddie Murphy", "Cameron Diaz", "John Lithgow"],
        description: "Un ogro malhumorado vive tranquilo en su pantano hasta que un día su preciada soledad se ve interrumpida por una invasión de personajes de cuentos de hadas que han sido exiliados de su reino por el malvado Lord Farquaad.",
        poster: "https://m.media-amazon.com/images/M/MV5BOWIzMmI4ZDktZTNmZS00YzQ4LWFhYzgtNWQ4YjgwMGJhNDYwXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
        background: "https://m.media-amazon.com/images/M/MV5BMjAwOTY3ODAzNl5BMl5BanBnXkFtZTcwNjYzNDc3Mw@@._V1_.jpg",
        runtime: "90 min",
        imdbRating: 7.9,
        language: "Español Latino",
        country: "US",
        released: "2001-05-18T00:00:00.000Z",
        streams: [
            {
                url: "https://archive.org/download/dercro-2040/DERCRO2040.mkv",
                quality: "1080p",
                title: "Shrek - 1080p Latino"
            }
        ]
    },

    "tt0449059": {
        id: "tt0449059",
        type: "movie", 
        name: "El Libro de la Vida",
        genres: ["Animación", "Aventura", "Comedia", "Familiar"],
        year: 2014,
        director: ["Jorge R. Gutierrez"],
        cast: ["Diego Luna", "Zoe Saldana", "Channing Tatum"],
        description: "Un joven debe elegir entre cumplir las expectativas de su familia o seguir su corazón. Antes de elegir, se embarca en una increíble aventura que abarca tres mundos fantásticos.",
        poster: "https://m.media-amazon.com/images/M/MV5BMjEzNDQ4OTE4MV5BMl5BanBnXkFtZTgwMjIzNDEyMjE@._V1_FMjpg_UX1000_.jpg",
        background: "https://m.media-amazon.com/images/M/MV5BMjEzNDQ4OTE4MV5BMl5BanBnXkFtZTgwMjIzNDEyMjE@._V1_.jpg",
        runtime: "95 min",
        imdbRating: 7.2,
        language: "Español Latino",
        country: "US",
        released: "2014-10-17T00:00:00.000Z",
        streams: [
            {
                url: "https://archive.org/download/ElLibroDeLaVida2014/ElLibroDeLaVida2014.mp4",
                quality: "720p",
                title: "El Libro de la Vida - 720p Latino"
            }
        ]
    },

    // Series
    "tt0229889": {
        id: "tt0229889",
        type: "series",
        name: "El Chavo del 8",
        genres: ["Comedia", "Familiar"],
        year: 1971,
        director: ["Roberto Gómez Bolaños"],
        cast: ["Roberto Gómez Bolaños", "Ramón Valdés", "Carlos Villagrán", "María Antonieta de las Nieves"],
        description: "Las aventuras de un niño huérfano que vive en una vecindad y sus travesuras con los demás habitantes del lugar.",
        poster: "https://images.sr.roku.com/idType/roku/context/global/id/aac4ecd26e9153c49b232aac064cecca/rokuFeed/assets/842e678ebeda580e8d8c527970f63f95.jpg",
        background: "https://m.media-amazon.com/images/M/MV5BNjQwNjlkOGUtMzhhMi00N2NjLTk0ZTMtODhkM2IzOTVlNWUzXkEyXkFqcGc@._V1_QL75_UX820_.jpg",
        runtime: "30 min",
        imdbRating: 8.5,
        language: "Español Latino",
        country: "MX",
        released: "1971-06-20T00:00:00.000Z",
        videos: [
            {
                id: "tt0229889:1:1",
                title: "S1E1 - El Ropavejero",
                season: 1,
                episode: 1,
                released: "1971-06-20T00:00:00.000Z",
                overview: "Don Ramón asusta a la Chilindrina con el ropavejero para que tome su medicina, pero El Chavo lo cree real y la ayuda a esconderse.",
                thumbnail: "https://archive.org/download/El-Chavo-Del-8-1971/El-Chavo-Del-8-1971.thumbs/001%20El%20Ropavejero_000001.jpg"
            },
            {
                id: "tt0229889:1:2", 
                title: "S1E2 - El Peso de Quico",
                season: 1,
                episode: 2,
                released: "1971-06-27T00:00:00.000Z",
                overview: "El Chavo encuentra un peso que resulta ser de Quico, pero la Chilindrina se lo quita, causando peleas hasta que Don Ramón lo arregla.",
                thumbnail: "https://archive.org/download/El-Chavo-Del-8-1971/El-Chavo-Del-8-1971.thumbs/002%20El%20Peso_000508.jpg"
            }
        ]
    }
};

// Base de datos de streams para episodios
const episodeStreams = {
    "tt0229889:1:1": [
        {
            url: "https://ia802309.us.archive.org/35/items/El-Chavo-Del-8-1971/001%20El%20Ropavejero.mp4",
            quality: "1080p",
            title: "El Ropavejero - 1080p Latino"
        }
    ],
    "tt0229889:1:2": [
        {
            url: "https://dn720307.ca.archive.org/0/items/El-Chavo-Del-8-1971/002%20El%20Peso.mp4", 
            quality: "720p",
            title: "El Peso de Quico - 720p Latino"
        }
    ]
};

// Crear el addon
const builder = new addonBuilder(manifest);

// Handler para catálogos
builder.defineCatalogHandler(({ type, id, extra }) => {
    console.log(`Catalog request: type=${type}, id=${id}, extra=${JSON.stringify(extra)}`);
    
    const metas = Object.values(contentDB)
        .filter(item => {
            // Filtrar por tipo
            if (item.type !== type) return false;
            
            // Filtrar por género si se especifica
            if (extra && extra.genre) {
                const hasGenre = item.genres && item.genres.some(g => 
                    g.toLowerCase().includes(extra.genre.toLowerCase()) ||
                    extra.genre.toLowerCase().includes(g.toLowerCase())
                );
                if (!hasGenre) return false;
            }
            
            return true;
        })
        .map(item => ({
            id: item.id,
            type: item.type,
            name: item.name,
            genres: item.genres,
            year: item.year,
            poster: item.poster,
            posterShape: "poster",
            background: item.background,
            description: item.description,
            imdbRating: item.imdbRating,
            releaseInfo: item.year?.toString()
        }));

    console.log(`Returning ${metas.length} items for catalog ${id}`);
    return Promise.resolve({ metas });
});

// Handler para metadatos
builder.defineMetaHandler(({ type, id }) => {
    console.log(`Meta request: type=${type}, id=${id}`);
    
    const item = contentDB[id];
    if (!item) {
        console.log(`No metadata found for ${id}`);
        return Promise.resolve({ meta: null });
    }

    const meta = {
        id: item.id,
        type: item.type,
        name: item.name,
        genres: item.genres,
        year: item.year,
        poster: item.poster,
        posterShape: "poster", 
        background: item.background,
        description: item.description,
        runtime: item.runtime,
        imdbRating: item.imdbRating,
        director: item.director,
        cast: item.cast,
        language: item.language,
        country: item.country,
        released: item.released,
        releaseInfo: item.year?.toString()
    };

    // Agregar videos para series
    if (item.type === 'series' && item.videos) {
        meta.videos = item.videos;
    }

    console.log(`Returning metadata for ${id}:`, meta.name);
    return Promise.resolve({ meta });
});

// Handler para streams
builder.defineStreamHandler(({ type, id }) => {
    console.log(`Stream request: type=${type}, id=${id}`);
    
    let streams = [];
    
    // Para películas, buscar en contentDB
    if (contentDB[id] && contentDB[id].streams) {
        streams = contentDB[id].streams.map(stream => ({
            title: stream.title,
            url: stream.url,
            behaviorHints: {
                notWebReady: false,
                bingeGroup: `stremio-latino-${id}`,
                countryWhitelist: ['CL', 'AR', 'MX', 'CO', 'PE', 'UY', 'EC', 'BO', 'PY']
            }
        }));
    }
    
    // Para episodios, buscar en episodeStreams
    if (episodeStreams[id]) {
        streams = episodeStreams[id].map(stream => ({
            title: stream.title,
            url: stream.url,
            behaviorHints: {
                notWebReady: false,
                bingeGroup: `stremio-latino-${id.split(':')[0]}`,
                countryWhitelist: ['CL', 'AR', 'MX', 'CO', 'PE', 'UY', 'EC', 'BO', 'PY']
            }
        }));
    }

    console.log(`Returning ${streams.length} streams for ${id}`);
    return Promise.resolve({ streams });
});

// Configurar Express
const app = express();
app.use(express.json());
app.use(express.static('public'));

// Panel de administración simplificado
const adminPanel = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Panel - Latino Chile</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            margin-bottom: 30px;
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .stat-card {
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            text-align: center;
        }
        .stat-number {
            font-size: 2em;
            font-weight: bold;
            color: #667eea;
        }
        .content-list {
            background: white;
            border-radius: 10px;
            padding: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .content-item {
            border-bottom: 1px solid #eee;
            padding: 15px 0;
            display: flex;
            align-items: center;
        }
        .content-item:last-child {
            border-bottom: none;
        }
        .content-poster {
            width: 60px;
            height: 90px;
            background-size: cover;
            background-position: center;
            border-radius: 5px;
            margin-right: 15px;
            flex-shrink: 0;
        }
        .content-info h3 {
            margin: 0 0 5px 0;
            color: #333;
        }
        .content-info p {
            margin: 0;
            color: #666;
            font-size: 14px;
        }
        .install-section {
            background: white;
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .install-url {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            border: 1px solid #dee2e6;
            font-family: monospace;
            word-break: break-all;
            margin: 10px 0;
        }
        .copy-btn {
            background: #667eea;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            margin-left: 10px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎬 Latino Chile Admin</h1>
        <p>Panel de administración del addon de Stremio</p>
    </div>

    <div class="install-section">
        <h2>📱 Instalar Addon</h2>
        <p>Usa esta URL para instalar el addon en Stremio:</p>
        <div class="install-url" id="installUrl">
            ${process.env.PORT ? `https://your-app.herokuapp.com/manifest.json` : `http://localhost:${process.env.PORT || 3000}/manifest.json`}
        </div>
        <button class="copy-btn" onclick="copyInstallUrl()">Copiar URL</button>
    </div>

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

    <div class="content-list">
        <h2>📚 Contenido Disponible</h2>
        <div id="contentItems"></div>
    </div>

    <script>
        async function loadStats() {
            try {
                const response = await fetch('/admin/stats');
                const stats = await response.json();
                
                document.getElementById('movieCount').textContent = stats.movies;
                document.getElementById('seriesCount').textContent = stats.series;
                document.getElementById('episodeCount').textContent = stats.episodes;
                
                const contentItems = document.getElementById('contentItems');
                contentItems.innerHTML = '';
                
                stats.content.forEach(item => {
                    const div = document.createElement('div');
                    div.className = 'content-item';
                    div.innerHTML = \`
                        <div class="content-poster" style="background-image: url('\${item.poster}')"></div>
                        <div class="content-info">
                            <h3>\${item.name} (\${item.year})</h3>
                            <p><strong>Tipo:</strong> \${item.type === 'movie' ? 'Película' : 'Serie'} | <strong>Géneros:</strong> \${item.genres ? item.genres.join(', ') : 'N/A'}</p>
                            <p><strong>ID:</strong> \${item.id} | <strong>Rating:</strong> ⭐ \${item.imdbRating || 'N/A'}</p>
                        </div>
                    \`;
                    contentItems.appendChild(div);
                });
                
            } catch (error) {
                console.error('Error loading stats:', error);
            }
        }

        function copyInstallUrl() {
            const url = document.getElementById('installUrl').textContent;
            navigator.clipboard.writeText(url).then(() => {
                alert('URL copiada al portapapeles');
            });
        }

        window.addEventListener('load', loadStats);
    </script>
</body>
</html>
`;

// Rutas del admin
app.get('/admin', (req, res) => {
    res.send(adminPanel);
});

app.get('/admin/stats', (req, res) => {
    const movies = Object.values(contentDB).filter(item => item.type === 'movie');
    const series = Object.values(contentDB).filter(item => item.type === 'series');
    const episodes = Object.values(contentDB).reduce((total, item) => {
        return total + (item.videos ? item.videos.length : 0);
    }, 0);

    res.json({
        movies: movies.length,
        series: series.length,
        episodes: episodes,
        content: Object.values(contentDB)
    });
});

// Rutas del addon
const addonInterface = builder.getInterface();

app.get('/manifest.json', (req, res) => {
    res.json(manifest);
});

app.get('/catalog/:type/:id.json', (req, res) => {
    addonInterface.catalog({ 
        type: req.params.type, 
        id: req.params.id, 
        extra: req.query 
    }).then(result => {
        res.json(result);
    }).catch(err => {
        console.error('Catalog error:', err);
        res.status(500).json({ error: err.message });
    });
});

app.get('/catalog/:type/:id/:extra.json', (req, res) => {
    const extra = {};
    const extraStr = req.params.extra;
    
    // Parse extra parameters
    if (extraStr.includes('=')) {
        const params = extraStr.split('&');
        params.forEach(param => {
            const [key, value] = param.split('=');
            if (key && value) {
                extra[key] = decodeURIComponent(value);
            }
        });
    }

    addonInterface.catalog({ 
        type: req.params.type, 
        id: req.params.id, 
        extra: extra 
    }).then(result => {
        res.json(result);
    }).catch(err => {
        console.error('Catalog with extra error:', err);
        res.status(500).json({ error: err.message });
    });
});

app.get('/meta/:type/:id.json', (req, res) => {
    addonInterface.meta({ 
        type: req.params.type, 
        id: req.params.id 
    }).then(result => {
        res.json(result);
    }).catch(err => {
        console.error('Meta error:', err);
        res.status(500).json({ error: err.message });
    });
});

app.get('/stream/:type/:id.json', (req, res) => {
    addonInterface.stream({ 
        type: req.params.type, 
        id: req.params.id 
    }).then(result => {
        res.json(result);
    }).catch(err => {
        console.error('Stream error:', err);
        res.status(500).json({ error: err.message });
    });
});

// Página de inicio
app.get('/', (req, res) => {
    res.send(`
        <h1>🎬 Stremio Addon - Latino Chile</h1>
        <p>Addon funcionando correctamente</p>
        <p><strong>Manifest:</strong> <a href="/manifest.json">Ver Manifest</a></p>
        <p><strong>Admin Panel:</strong> <a href="/admin">Panel de Administración</a></p>
        <p><strong>Para instalar:</strong> Copia la URL del manifest en Stremio</p>
    `);
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Addon Latino Chile iniciado en puerto ${PORT}`);
    console.log(`📱 Manifest: http://localhost:${PORT}/manifest.json`);
    console.log(`⚙️  Admin Panel: http://localhost:${PORT}/admin`);
    console.log(`🎬 Contenido cargado: ${Object.keys(contentDB).length} elementos`);
    
    // Log del contenido disponible
    const movies = Object.values(contentDB).filter(item => item.type === 'movie');
    const series = Object.values(contentDB).filter(item => item.type === 'series');
    console.log(`   - Películas: ${movies.length}`);
    console.log(`   - Series: ${series.length}`);
    
    movies.forEach(movie => console.log(`     📽️  ${movie.name} (${movie.year})`));
    series.forEach(serie => console.log(`     📺 ${serie.name} (${serie.year})`));
});

// Manejo de cierre graceful
process.on('SIGINT', () => {
    console.log('\n🛑 Cerrando servidor...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Cerrando servidor...');
    process.exit(0);
});