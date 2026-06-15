const expenseSchema = new mongoose.Schema({
    voucherNo: { type: String, unique: true }, category: String, date: Date,
    mode: String, amount: Number, description: String
}, { timestamps: true });
const Expense = mongoose.model('Expense', expenseSchema);
