import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';
import { GoogleAuth } from 'google-auth-library';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// Configuración de Rate Limiting por seguridad
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Límite de 100 peticiones por IP
  message: { error: 'Demasiadas peticiones, por favor intenta más tarde.' }
});

app.use('/api/', limiter);
app.use(express.json());

// Inicializar Google Auth (Para proxy de APIs de Google Cloud si es necesario)
const auth = new GoogleAuth({
  scopes: 'https://www.googleapis.com/auth/cloud-platform'
});

// Endpoint de prueba / Healthcheck
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Spa Glow Kitty API Backend is running 🎀',
    timestamp: new Date().toISOString()
  });
});

// Ejemplo de Proxy para Google Cloud API (Vertex AI, etc.)
app.post('/api/gcloud-proxy', async (req, res) => {
  try {
    // Verificar un header secreto si se configuró en Cloud Run
    const proxyHeader = process.env.PROXY_HEADER;
    if (proxyHeader && req.headers['x-proxy-secret'] !== proxyHeader) {
      return res.status(403).json({ error: 'Acceso denegado al proxy.' });
    }

    const client = await auth.getClient();
    const projectId = process.env.GOOGLE_CLOUD_PROJECT;
    
    // Aquí iría la lógica real de llamada a la API de Google
    // const response = await client.request({ url: '...', method: 'POST', data: req.body });
    
    res.json({ success: true, message: 'Proxy configurado correctamente.' });
  } catch (error) {
    console.error('Error en el proxy:', error);
    res.status(500).json({ error: 'Error interno del servidor proxy.' });
  }
});

// Servir los archivos estáticos del Frontend (React/Vite)
// En Docker, el WORKDIR es /app, por lo que frontend/dist está en ../frontend/dist relativo a este archivo
const frontendPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendPath));

// Catch-all: Cualquier ruta que no sea de la API, devuelve el index.html de React (Soporte para React Router)
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🎀 Spa Glow Kitty Server corriendo en el puerto ${PORT}`);
  console.log(`📁 Sirviendo frontend desde: ${frontendPath}`);
});
