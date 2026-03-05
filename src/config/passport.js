require('dotenv').config()

const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const pool = require('./db')

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET

if(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET){
    passport.use(new GoogleStrategy({
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: "https://contact-s5ve.onrender.com/api/auth/google/callback" // ✅ URL Render
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            const email = profile.emails[0].value
            const nom = profile.displayName

            const existingUser = await pool.query(
                "SELECT * FROM users WHERE email = $1",
                [email]
            )

            if(existingUser.rows[0]){
                return done(null, existingUser.rows[0])
            }

            const newUser = await pool.query(
                `INSERT INTO users(nom, email, password, auth_type)
                 VALUES($1, $2, $3, $4)
                 RETURNING id, nom, email`,
                [nom, email, null, 'google']
            )

            return done(null, newUser.rows[0])

        } catch(error) {
            return done(error, null)
        }
    }))
    console.log("✅ Google Strategy chargée")
} else {
    console.log("⚠️ Google OAuth désactivé")
}

module.exports = passport