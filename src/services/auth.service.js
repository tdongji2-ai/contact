const pool = require('../config/db')
const bcrypt = require('bcrypt')

// INSCRIPTION
exports.register = async ({nom, email, password}) => {

    // Chiffre le mot de passe
    const hash = await bcrypt.hash(password, 10)

    const result = await pool.query(
        `INSERT INTO users(nom, email, password)
         VALUES($1, $2, $3)
         RETURNING id, nom, email`,
        [nom, email, hash]  // ✅ sauvegarde le hash, jamais le vrai mot de passe
    )

    return result.rows[0]
}

// CONNEXION
exports.login = async ({email, password}) => {

    // Cherche l'utilisateur par email
    const result = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
    )

    const user = result.rows[0]

    // Vérifie si l'utilisateur existe
    if(!user) throw new Error("Email ou mot de passe incorrect")

    // Compare le mot de passe avec le hash
    const valid = await bcrypt.compare(password, user.password)
    if(!valid) throw new Error("Email ou mot de passe incorrect")

    return user
}

