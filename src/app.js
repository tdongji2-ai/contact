const express = require("express")
const cors = require("cors")
const session = require("express-session")
require('dotenv').config()

const passport = require('./config/passport')
const contactRoutes = require('./routes/contact.routes')
const authRoutes = require('./routes/auth.routes')
const pool = require('./config/db')

const app = express()

const createTables = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users(
                id SERIAL PRIMARY KEY,
                nom VARCHAR(50) NOT NULL,
                email VARCHAR(150) NOT NULL UNIQUE,
                password VARCHAR(255),
                auth_type VARCHAR(10) DEFAULT 'local',
                date_inscription DATE DEFAULT CURRENT_DATE
            )
        `)

        await pool.query(`
            CREATE TABLE IF NOT EXISTS contacts(
                id SERIAL PRIMARY KEY,
                nom VARCHAR(50) NOT NULL,
                prenom VARCHAR(50) NOT NULL,
                email VARCHAR(150) NOT NULL,
                date_ajout DATE DEFAULT CURRENT_DATE,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
            )
        `)

        console.log("✅ Tables et contraintes configurées")
    } catch(error) {
        console.error("❌ Erreur:", error.message)
    }
}

createTables()

// Middlewares
app.use(cors())
app.use(express.json())
app.use(express.static("public"))

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))

app.use(passport.initialize())

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