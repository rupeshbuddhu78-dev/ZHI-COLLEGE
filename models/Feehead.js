const feeHeadSchema = new mongoose.Schema({
    headName: String, dueDate: String, amount: Number, discount: { type: Number, default: 0 },
    fine: { type: Number, default: 0 }, paid: { type: Number, default: 0 },
    due: Number, status: { type: String, default: "Due" }
});
