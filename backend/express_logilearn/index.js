const express = require('express')
const cors = require('cors');
require('dotenv').config()

const app = express()
const port = process.env.PORT || 3030

// Prometheus metrics setup
const client = require('prom-client');
const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status'],
});

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 10]
});

register.registerMetric(httpRequestsTotal);
register.registerMetric(httpRequestDuration);

app.use((req, res, next) => {
  const start = process.hrtime();
  res.on('finish', () => {
    const diff = process.hrtime(start);
    const durationInSeconds = diff[0] + diff[1] / 1e9;
    
    const route = req.route ? req.route.path : req.path;
    const labels = {
      method: req.method,
      route: route || req.path,
      status: res.statusCode.toString()
    };
    
    httpRequestsTotal.inc(labels);
    httpRequestDuration.observe(labels, durationInSeconds);
  });
  next();
});

//import routes
const authRoutes = require('./src/routes/authRoutes');
const sectionRouter = require('./src/routes/sectionRoutes')
const levelRouter = require('./src/routes/levelRoutes')
const soalPGRouter = require('./src/routes/soalPGRoutes')
const esaiRouter = require('./src/routes/soalesaiRoutes')
const attemptRouter = require('./src/routes/attemptRoutes')
const jawabanPGRouter = require('./src/routes/jawabanPGRoutes')
const jawabanEsaiRouter = require('./src/routes/jawabanEsaiRoutes')
const pelajarRoutes = require('./src/routes/pelajarRoutes');
const dashboardRouter = require('./src/routes/dashboardRoutes');
const leaderboardRouter = require('./src/routes/leaderboardRoutes');

const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',').map(o => o.trim());
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);

    // Check if the origin is in the allowed list or is a localhost/127.0.0.1 origin
    const isLocal = origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:') || origin === 'http://localhost' || origin === 'http://127.0.0.1';
    if (allowedOrigins.includes(origin) || isLocal) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true,
}));
app.use(express.json())
app.use('/api/auth', authRoutes);
//routes section

app.use('/api', sectionRouter)
app.use('/api', levelRouter)
app.use('/api', esaiRouter)
app.use('/api', soalPGRouter)
app.use('/api', attemptRouter)
app.use('/api', pelajarRoutes)
app.use('/api', leaderboardRouter)
app.use('/api', jawabanPGRouter)
app.use('/api', jawabanEsaiRouter)
app.use('/api', dashboardRouter)

app.get('/favicon.ico', (req, res) => res.status(204).end());

app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    res.status(500).end(err);
  }
});

app.get('/', (req, res) => {
  res.send('Hello world')
})

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})
module.exports = app;