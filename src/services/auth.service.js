const pool = require('../config/db')
const bcrypt = require('bcrypt')

// INSCRIPTION
exports.register = async ({nom, email, password}) => {
    const hash = await bcrypt.hash(password, 10)

    const result = await pool.query(
        `INSERT INTO users(nom, email, password, auth_type)
         VALUES($1, $2, $3, 'local')
         RETURNING id, nom, email`,
        [nom, email, hash]
    )

    return result.rows[0]
}

// CONNEXION
exports.login = async ({email, password}) => {
    const result = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
    )

    const user = result.rows[0]

    if(!user) throw new Error("Email ou mot de passe incorrect")

    // ✅ Vérifie si compte Google
    if(user.auth_type === 'google'){
        throw new Error("Ce compte utilise Google pour se connecter")
    }

    // ✅ Vérifie si password est null
    if(!user.password){
        throw new Error("Email ou mot de passe incorrect")
    }

    const valid = await bcrypt.compare(password, user.password)
    if(!valid) throw new Error("Email ou mot de passe incorrect")

    return user
}