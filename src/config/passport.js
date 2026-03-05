const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const pool = require('./db')

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
},
async (accessToken, refreshToken, profile, done) => {
    try {
        const email = profile.emails[0].value
        const nom = profile.displayName

        // Vérifie si l'utilisateur existe déjà
        const existingUser = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        )

        if(existingUser.rows[0]){
            return done(null, existingUser.rows[0]) // ✅ connecte
        }

        // Crée automatiquement si nouveau
        const newUser = await pool.query(
            `INSERT INTO users(nom, email, password)
             VALUES($1, $2, $3)
             RETURNING id, nom, email`,
            [nom, email, null]
        )

        return done(null, newUser.rows[0])

    } catch(error) {
        return done(error, null)
    }
}))

module.exports = passport