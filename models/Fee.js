const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student', // Yeh tumhare Student model se connect karega
        required: true,
        unique: true   // Ek student ka ek hi fee record hoga
    },
    totalFee: {
        type: Number,
        required: true,
        default: 0
    },
    paid: {
        type: Number,
        required: true,
        default: 0
    },
    due: {
        type: Number,
        required: true,
        default: 0
    },
    // 🔥 Pro Feature: Jab student install-ment mein fees dega, toh saari transactions yahan save hongi
    paymentHistory: [
        {
            amountPaid: { type: Number, required: true },
            paymentDate: { type: Date, default: Date.now },
            paymentMode: { type: String, enum: ['Cash', 'Online', 'UPI', 'Cheque'], default: 'Cash' },
            transactionId: { type: String, default: 'N/A' },
            remarks: { type: String, default: '' }
        }
    ]
}, { timestamps: true }); // Isse createdAt aur updatedAt khud ban jayega

// ⚡ AUTO-CALCULATE DUE: Fees save hone se pehle 'due' amount apne aap calculate ho jayega
feeSchema.pre('save', function (next) {
    this.due = this.totalFee - this.paid;
    next();
});

module.exports = mongoose.model('Fee', feeSchema);
