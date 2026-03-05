const express = require('express')
const router = express.Router()
const authController = require('../controllers/auth.controller')
const passport = require('../config/passport')
const jwt = require('jsonwebtoken')

// Routes normales
router.post('/register', authController.register)
router.post('/login', authController.login)

// Routes Google
router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
)

router.get('/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/login.html' }),
    (req, res) => {
        const token = jwt.sign(
            { id: req.user.id, email: req.user.email, nom: req.user.nom },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        )

        console.log("✅ Token généré:", token)

        // ✅ Page HTML qui sauvegarde le token et redirige
        res.send(`
            <!DOCTYPE html>
            <html>
            <body>
            <script>
                sessionStorage.setItem('token', '${token}')
                window.location.href = '/index.html'
            </script>
            </body>
            </html>
        `)
    }
)

module.exports = router