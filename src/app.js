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
                email VARCHAR(150) NOT NULL,        -- ✅ UNIQUE supprimé ici
                date_ajout DATE DEFAULT CURRENT_DATE,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
            )
        `)

      
        await pool.query(`
            ALTER TABLE contacts 
            DROP CONSTRAINT IF EXISTS contacts_email_key
        `)

       
        await pool.query(`
            DO $$ BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_constraint 
                    WHERE conname = 'contacts_email_user_unique'
                ) THEN
                    ALTER TABLE contacts 
                    ADD CONSTRAINT contacts_email_user_unique 
                    UNIQUE(email, user_id);
                END IF;
            END $$;
        `)

        console.log("✅ Tables et contraintes configurées")
    } catch(error) {
        console.error("❌ Erreur:", error.message)
    }
}

// 🔧 Route temporaire pour fixer la contrainte — À SUPPRIMER APRÈS
app.get('/fix-constraint', async (req, res) => {
    try {
        await pool.query(`
            ALTER TABLE contacts 
            DROP CONSTRAINT IF EXISTS contacts_email_key
        `)

        await pool.query(`
            DO $$ BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_constraint 
                    WHERE conname = 'contacts_email_user_unique'
                ) THEN
                    ALTER TABLE contacts 
                    ADD CONSTRAINT contacts_email_user_unique 
                    UNIQUE(email, user_id);
                END IF;
            END $$;
        `)

        res.json({ message: "✅ Contrainte corrigée avec succès !" })
    } catch(error) {
        res.json({ error: error.message })
    }
})

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