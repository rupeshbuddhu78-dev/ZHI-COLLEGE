const studentFeeSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    totalAmount: Number, totalDiscount: Number, totalPaid: Number, totalDue: Number,
    feeHeads: [feeHeadSchema]
});
const StudentFee = mongoose.model('StudentFee', studentFeeSchema);
