const express = require('express')
const app = express()
const feedRoutes = require('./routes/feed')
const authRoutes = require('./routes/auth')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const path = require('path')
const multer = require('multer')

app.use('/images', express.static(path.join(__dirname, 'images')))
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    next()
})

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images')
    },
    fileName: (req, file, cb) => {
        cb(null, new Date().toISOString() + '-' + file.originalname )
    }
})

const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg'
    ) {
        cb(null, true)
    } else {
        cb(null, false)
    }
}
app.use(bodyParser.json())
app.use(multer({storage: fileStorage, fileFilter}).single('image'))
app.use('/feed' ,feedRoutes)
app.use('/auth' ,authRoutes)
app.use((error, res) => {
    const status = error.statusCode ?? 500
    const {message, data} = error
    res.status(status).json({message, data})
})

mongoose.connect('mongodb+srv://mrajab2112:nXmSQv7bU0BJ3Lk7@cluster0.sceyhl2.mongodb.net/test', {useNewUrlParser: true}).then(() => {
    console.log('database connected')
    const server = app.listen('8080')
    const io = require('./socket').init( server)
    io.on('connection', socket => {
        console.log('client connect')
    })

}).catch(console.log)