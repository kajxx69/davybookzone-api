import express from 'express';
import {
    purchase,
    verification,
    show,
    notification,
    getPurchaseHistory
} from '../controllers/purchaseController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Routes protégées par l'authentification
router.use(protect);

// Route pour l'historique des achats (doit être avant les routes avec paramètres)
router.get('/history', getPurchaseHistory);

// Route pour initier un achat
router.post('/:bookId', purchase);

// Route pour vérifier le statut d'une transaction
router.all('/:transaction_id/verify', verification);

// Route pour afficher la réponse après l'achat
router.get('/:transaction_id/response', show);

// Route pour les notifications de paiement (sans protection CSRF)
router.all('/:transaction_id/notify', notification);

export default router; 