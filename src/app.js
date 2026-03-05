const express = require("express")
const cors = require("cors")
const session = require("express-session")
require('dotenv').config()

const passport = require('./config/passport') // 👈 ajouté
const contactRoutes = require('./routes/contact.routes')
const authRoutes = require('./routes/auth.routes')

const app = express()

// Middlewares
app.use(cors())
app.use(express.json())
app.use(express.static("public"))

// Session pour passport
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))

app.use(passport.initialize()) // 👈 ajouté

// Redirige vers login
app.get('/', (req, res) => {
    res.redirect('/login.html')
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/contacts', contactRoutes)

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log(`serveur connecté au port ${PORT}`)
})