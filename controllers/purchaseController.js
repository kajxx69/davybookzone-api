import Purchase from '../models/Purchase.js';
import Book from '../models/Book.js';
import axios from 'axios';

// Fonction pour initialiser la transaction CinetPay
async function initializeCinetPayTransaction(purchase, res) {
    try {
        const response = await axios.post(process.env.CINETPAY_API_URL || 'https://api-checkout.cinetpay.com/v2/payment', {
            apikey: process.env.CINETPAY_API_KEY,
            site_id: process.env.CINETPAY_SITE_ID,
            transaction_id: purchase.transaction_id,
            amount: purchase.price,
            currency: 'XOF',
            description: 'Achat du livre ID : ' + purchase.book_id,
            return_url: `${process.env.APP_URL || 'http://localhost:5173'}/purchase/verify/${purchase.transaction_id}`,
            notify_url: `${process.env.APP_URL || 'http://localhost:5173'}/api/purchases/${purchase.transaction_id}/notify`,
            channels: 'ALL',
            // Informations du client
            customer_name: purchase.customer_info.name,
            customer_surname: purchase.customer_info.surname,
            customer_phone_number: purchase.customer_info.phone_number,
            customer_email: purchase.customer_info.email,
            customer_address: purchase.customer_info.address,
            customer_city: purchase.customer_info.city,
            customer_country: purchase.customer_info.country,
            customer_state: purchase.customer_info.state,
            customer_zip_code: purchase.customer_info.zip_code
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.data.code === '201' && response.data.message === 'CREATED') {
            return res.status(200).json({
                success: true,
                data: {
                    payment_url: response.data.data.payment_url,
                    transaction_id: purchase.transaction_id
                }
            });
        }

        throw new Error('Échec de l\'initialisation de la transaction CinetPay');
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Une erreur s\'est produite lors de l\'initialisation du paiement'
        });
    }
}

// Fonction pour vérifier le statut de la transaction
async function checkStatus(purchase) {
    try {
        const response = await axios.post(`${process.env.CINETPAY_API_URL || 'https://api-checkout.cinetpay.com/v2/payment'}/check`, {
            apikey: process.env.CINETPAY_API_KEY,
            site_id: process.env.CINETPAY_SITE_ID,
            transaction_id: purchase.transaction_id
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.data.code === '00' && response.data.message === 'SUCCES') {
            purchase.status = 'completed';
            purchase.purchased_at = new Date();
        } else {
            purchase.status = 'failed';
        }
        await purchase.save();
        return true;
    } catch (error) {
        return false;
    }
}

// Afficher les détails d'un achat
export const show = async (req, res) => {
    try {
        const purchase = await Purchase.findById(req.params.id)
            .populate('user_id')
            .populate('book_id');

        if (!purchase) {
            return res.status(404).json({
                success: false,
                message: 'Achat non trouvé'
            });
        }

        res.status(200).json({
            success: true,
            data: purchase
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};

// Créer un nouvel achat
export const purchase = async (req, res) => {
    try {
        const { bookId } = req.params;
        const {
            name,
            surname,
            phone_number,
            email,
            address,
            city,
            country,
            state,
            zip_code
        } = req.body;

        // Validation des champs obligatoires
        const requiredFields = [
            'name',
            'surname',
            'phone_number',
            'email',
            'address',
            'city',
            'country',
            'state',
            'zip_code'
        ];

        const missingFields = requiredFields.filter(field => !req.body[field]);
        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Champs obligatoires manquants',
                missingFields
            });
        }

        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(404).json({
                success: false,
                message: 'Livre non trouvé'
            });
        }

        const purchase = new Purchase({
            user_id: req.user._id,
            book_id: bookId,
            price: book.price,
            status: 'pending',
            transaction_id: 'txn_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            customer_info: {
                name,
                surname,
                phone_number,
                email,
                address,
                city,
                country,
                state,
                zip_code
            }
        });

        await purchase.save();
        return initializeCinetPayTransaction(purchase, res);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la création de l\'achat'
        });
    }
};

// Notification de paiement
export const notification = async (req, res) => {
    try {
        const { transaction_id } = req.params;

        const purchase = await Purchase.findOne({ transaction_id });
        if (!purchase) {
            return res.status(200).send();
        }

        await checkStatus(purchase);
        res.status(200).send();
    } catch (error) {
        res.status(200).send();
    }
};

// Vérification du statut de la transaction
export const verification = async (req, res) => {
    try {
        const { transaction_id } = req.params;
        let purchase = await Purchase.findOne({ transaction_id }).populate('book_id');

        if (!purchase) {
            return res.status(404).json({
                success: false,
                message: 'Transaction non trouvée'
            });
        }

        if (purchase.status === 'completed') {
            return res.status(200).json({
                success: true,
                message: 'Transaction réussie. Merci pour votre achat!',
                data: purchase
            });
        }

        await checkStatus(purchase);
        await purchase.refresh();

        purchase = await Purchase.findOne({ transaction_id }).populate('book_id');

        if (purchase.status === 'completed') {
            return res.status(200).json({
                success: true,
                message: 'Transaction réussie. Merci pour votre achat!',
                data: purchase
            });
        }

        return res.status(400).json({
            success: false,
            message: 'Transaction échouée ou en attente. Veuillez réessayer plus tard.'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};

// Obtenir l'historique des achats d'un utilisateur
export const getPurchaseHistory = async (req, res) => {
    try {
        const purchases = await Purchase.find({ user_id: req.user._id })
            .populate('book_id', 'title author coverImage')
            .sort({ purchased_at: -1 });

        res.status(200).json(purchases);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur' });
    }
}; 