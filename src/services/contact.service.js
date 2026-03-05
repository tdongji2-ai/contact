// ✅ Chaque opération filtre par user_id
const pool = require('../config/db') 
exports.getAllContact = async (search, user_id) => {
    if(search){
        const result = await pool.query(
            `SELECT * FROM contacts
             WHERE user_id = $1
             AND (nom ILIKE $2 OR prenom ILIKE $3)
             ORDER BY id DESC`,
            [user_id, `%${search}%`, `%${search}%`]
        )
        return result.rows
    } else {
        const result = await pool.query(
            "SELECT * FROM contacts WHERE user_id = $1 ORDER BY id DESC",
            [user_id]
        )
        return result.rows
    }
}

// contact.service.js
exports.getContactById = async (id, user_id) => {
    const result = await pool.query(
        "SELECT * FROM contacts WHERE id = $1 AND user_id = $2",
        [id, user_id]
    )
    return result.rows[0]
}

exports.createContact = async ({nom, prenom, email, user_id}) => {
    const result = await pool.query(
        `INSERT INTO contacts(nom, prenom, email, user_id)
         VALUES($1, $2, $3, $4)
         RETURNING *`,
        [nom, prenom, email, user_id]
    )
    return result.rows[0]
}

exports.updateContact = async (id, data, user_id) => {
    const {nom, prenom, email} = data
    const result = await pool.query(
        `UPDATE contacts
         SET nom=$1, prenom=$2, email=$3
         WHERE id=$4 AND user_id=$5
         RETURNING *`,
        [nom, prenom, email, id, user_id]
    )
    return result.rows[0]
}

exports.deleteContact = async (id, user_id) => {
    await pool.query(
        "DELETE FROM contacts WHERE id=$1 AND user_id=$2",
        [id, user_id]
    )
}