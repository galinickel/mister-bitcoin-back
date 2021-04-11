const express = require('express')
const cors = require('cors')
const path = require('path')
const expressSession = require('express-session')
const {cloudinary} = require('./services/cloudinary.service')

const app = express()
const http = require('http').createServer(app)

const session = expressSession({
    secret: 'coding is amazing',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
})
// Express App Config
app.use(express.json({limit: '50mb'}))
app.use(session)
app.use(express.static('public'));
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'public')))
} else {
    const corsOptions = {
        origin: ['http://127.0.0.1:8080', 'http://localhost:8080', 'http://127.0.0.1:3000', 'http://localhost:3000'],
        credentials: true
    }
    app.use(cors(corsOptions))
}

const authRoutes = require('./api/auth/auth.routes')
const userRoutes = require('./api/user/user.routes')
const contactRoutes = require('./api/contact/contact.routes')
app.post('/api/upload', async (req, res) => {
    try {
        const fileStr = req.body.img
        const uploadedRes = await cloudinary.uploader.upload(fileStr, {
            upload_preset: 'ml_default'
        });
        res.json(uploadedRes.url);
    } catch (err) {
        console.log(err);
    }
})
const { connectSockets } = require('./services/socket.service')

// routes
const setupAsyncLocalStorage = require('./middlewares/setupAls.middleware')
app.all('*', setupAsyncLocalStorage)

// TODO: check with app.use

app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/contact', contactRoutes)
connectSockets(http, session)

// Make every server-side-route to match the index.html
// so when requesting http://localhost:3030/index.html/car/123 it will still respond with
// our SPA (single page app) (the index.html file) and allow vue/react-router to take it from there
app.get('/**', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

const logger = require('./services/logger.service')
const port = process.env.PORT || 3030
http.listen(port, () => {
    logger.info('Server is running on port: ' + port)
})




