const contactServices = require('../services/contact.service')

exports.getContact = async (req, res) => {
    try {
        const search = req.query.search || ""
        const user_id = req.user.id  // 👈 récupéré depuis le token JWT

        const contact = await contactServices.getAllContact(search, user_id)
        res.status(200).json(contact)

    } catch(error) {
        console.log(error)
        res.status(500).json({ error: "Erreur du serveur" })
    }
}

exports.createContact = async (req, res) => {
    try {
        const { nom, prenom, email } = req.body
        const user_id = req.user.id  // 👈 récupéré depuis le token JWT

        if(!nom || !prenom || !email){
            return res.status(400).json({ error: "Tous les champs sont obligatoires" })
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if(!emailRegex.test(email)){
            return res.status(400).json({ error: "Email incorrect" })
        }

        const contact = await contactServices.createContact({
            ...req.body,
            user_id  // ✅ ajouté automatiquement depuis le token
        })
        res.status(201).json(contact)

    } catch(error) {
        console.error("Erreur détaillée :", error.message)

        if(error.code === "23505"){
            return res.status(400).json({ error: "Email déjà existant" })
        }

        return res.status(500).json({
            error: "Problème du serveur",
            detail: error.message
        })
    }
}

// contact.controller.js
exports.getContactById = async (req, res) => {
    try {
        const { id } = req.params
        const user_id = req.user.id

        const contact = await contactServices.getContactById(id, user_id)

        if(!contact){
            return res.status(404).json({ error: "Contact introuvable" })
        }

        res.json(contact)
    } catch(error) {
        console.error("Erreur getContactById:", error.message)
        res.status(500).json({ error: "Erreur du serveur" })
    }
}



exports.updateContact = async (req, res) => {
    try {
        const { nom, prenom, email } = req.body
        const user_id = req.user.id  // 👈 récupéré depuis le token JWT

        if(!nom || !prenom || !email){
            return res.status(400).json({ error: "Tous les champs sont obligatoires" })
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if(!emailRegex.test(email)){
            return res.status(400).json({ error: "Email invalide" })
        }

        const resultat = await contactServices.updateContact(
            req.params.id,
            req.body,
            user_id  // ✅ vérifie que le contact appartient à l'user
        )

        if(!resultat){
            return res.status(404).json({ error: "Contact introuvable" })
        }

        res.json(resultat)

    } catch(error) {
        if(error.code === "23505"){
            return res.status(400).json({ error: "Cet email existe déjà" })
        }
        res.status(500).json({ error: "Erreur du serveur" })
    }
}

exports.deleteContact = async (req, res) => {
    try {
        const user_id = req.user.id  // 👈 récupéré depuis le token JWT

        await contactServices.deleteContact(req.params.id, user_id)  // ✅ sécurisé
        res.status(200).json({ message: "Contact supprimé" })

    } catch(error) {
        res.status(500).json({ error: "Erreur du serveur" })
    }
}