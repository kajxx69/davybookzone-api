import mongoose from 'mongoose';

const purchaseSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    book_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    transaction_id: {
        type: String,
        required: true,
        unique: true
    },
    purchased_at: {
        type: Date,
        default: Date.now
    },
    customer_info: {
        name: {
            type: String,
            required: true
        },
        surname: {
            type: String,
            required: true
        },
        phone_number: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        country: {
            type: String,
            required: true,
            maxlength: 2
        },
        state: {
            type: String,
            required: true,
            maxlength: 2
        },
        zip_code: {
            type: String,
            required: true,
            maxlength: 5
        }
    }
}, {
    timestamps: true
});

export default mongoose.model('Purchase', purchaseSchema); 