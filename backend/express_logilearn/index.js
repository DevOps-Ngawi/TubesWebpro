const express = require('express')
const cors = require('cors');
require('dotenv').config()

const app = express()
const port = process.env.PORT || 3030

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

const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',').map(o => o.trim());
app.use(cors({
  origin: allowedOrigins,
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
app.use('/api', jawabanPGRouter)
app.use('/api', jawabanEsaiRouter)
app.use('/api', dashboardRouter)

app.get('/', (req, res) => {
    res.send('Hello world')
})

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
})
module.exports = app;