const express = require('express');
const router = express.Router()
const contactController = require('../controllers/contact.controller')


// contact.routes.js
const authMiddleware = require('../middlewares/auth.middleware')
router.get('/:id', authMiddleware, contactController.getContactById)
router.get('/', authMiddleware, contactController.getContact)
router.post('/', authMiddleware, contactController.createContact)
router.put('/:id', authMiddleware, contactController.updateContact)
router.delete('/:id', authMiddleware, contactController.deleteContact)

module.exports = router
