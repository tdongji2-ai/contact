const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {

    // Récupère le token dans le header
    const authHeader = req.headers.authorization

    // Vérifie si le header existe
    if(!authHeader || !authHeader.startsWith('Bearer ')){
        return res.status(401).json({ 
            error: "Token manquant" 
        })
    }

    // Extrait le token  →  "Bearer TOKEN" → "TOKEN"
    const token = authHeader.split(' ')[1]

    try {
        // Vérifie et décode le token
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        req.user = decoded // ✅ disponible dans tous les controllers via req.user.id

        next() // ✅ passe à la suite

    } catch(error) {
        console.error("Erreur token :", error.message)

        // Token expiré
        if(error.name === "TokenExpiredError"){
            return res.status(401).json({ 
                error: "Token expiré, veuillez vous reconnecter" 
            })
        }

        // Token invalide
        return res.status(401).json({ 
            error: "Token invalide" 
        })
    }
}

