const jwt = require('jsonwebtoken')
const authServices = require('../services/auth.service')

// INSCRIPTION
exports.register = async (req, res) => {
    try {
        const { nom, email, password } = req.body

        // Validation des champs
        if(!nom || !email || !password){
            return res.status(400).json({ 
                error: "Tous les champs sont obligatoires" 
            })
        }

        // Validation email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if(!emailRegex.test(email)){
            return res.status(400).json({ 
                error: "Email invalide" 
            })
        }

        // Validation mot de passe
        if(password.length < 6){
            return res.status(400).json({ 
                error: "Le mot de passe doit contenir au moins 6 caractères" 
            })
        }

        const user = await authServices.register({ nom, email, password })

        res.status(201).json({ 
            message: "Inscription réussie", 
            user 
        })

    } catch(error) {
        console.error("Erreur register :", error.message)

        if(error.code === "23505"){
            return res.status(400).json({ 
                error: "Email déjà existant" 
            })
        }

        res.status(500).json({ 
            error: "Problème du serveur" 
        })
    }
}

// CONNEXION
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body

        // Validation des champs
        if(!email || !password){
            return res.status(400).json({ 
                error: "Tous les champs sont obligatoires" 
            })
        }

        // Validation email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if(!emailRegex.test(email)){
            return res.status(400).json({ 
                error: "Email ou mot de passe incorrect" 
            })
        }

        const user = await authServices.login({ email, password })

        // Génère le token JWT
        const token = jwt.sign(
            { id: user.id, email: user.email, nom: user.nom },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        )

        res.status(200).json({ 
            message: "Connexion réussie", 
            token,
            user: {
                id: user.id,
                nom: user.nom,
                email: user.email
            }
        })

    } catch(error) {
        console.error("Erreur login :", error.message)

        // Erreurs venant du service
        if(error.message === "Email ou mot de passe incorrect" || error.message === "Email incorrect" || error.message === "Mot de passe incorrect"){
            return res.status(401).json({ 
                error: error.message 
            })
        }

        res.status(500).json({ 
            error: "Problème du serveur" 
        })
    }
}