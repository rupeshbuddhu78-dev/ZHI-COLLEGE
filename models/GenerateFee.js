const generateFeeStructure = (courseName) => {
    let baseTuition = (courseName && courseName.toLowerCase() === 'mca') ? 25000 : 16880;
    let heads = [
        { headName: "Admission Fee (Non Refundable)", amount: 30000, dueDate: "01-08-2025" },
        { headName: "University Reg. Fees", amount: 2100, dueDate: "30-08-2025" },
        { headName: "1st Sem Tuition Fees - 1st Installment", amount: 12130, dueDate: "30-08-2025" },
        { headName: "1st Sem Tuition Fees - 2nd Installment", amount: 10530, dueDate: "30-11-2025" },
        { headName: "Examination Fees (Sem 1)", amount: 3700, dueDate: "30-11-2025" },
        { headName: "2nd Sem Tuition Fees - 1st Installment", amount: baseTuition, dueDate: "15-02-2026" },
        { headName: "2nd Sem Tuition Fees - 2nd Installment", amount: baseTuition, dueDate: "20-05-2026" },
        { headName: "Examination Fees (Sem 2)", amount: 3700, dueDate: "20-05-2026" },
        { headName: "3rd Sem Tuition Fees - 1st Installment", amount: baseTuition, dueDate: "01-09-2026" },
        { headName: "3rd Sem Tuition Fees - 2nd Installment", amount: baseTuition, dueDate: "01-12-2026" },
        { headName: "Examination Fees (Sem 3)", amount: 3700, dueDate: "01-12-2026" },
        { headName: "4th Sem Tuition Fees - 1st Installment", amount: baseTuition, dueDate: "15-02-2027" },
        { headName: "4th Sem Tuition Fees - 2nd Installment", amount: baseTuition, dueDate: "20-05-2027" },
        { headName: "Examination Fees (Sem 4)", amount: 3700, dueDate: "20-05-2027" },
        { headName: "5th Sem Tuition Fees - 1st Installment", amount: baseTuition, dueDate: "01-09-2027" },
        { headName: "5th Sem Tuition Fees - 2nd Installment", amount: baseTuition, dueDate: "01-12-2027" },
        { headName: "Examination Fees (Sem 5)", amount: 3700, dueDate: "01-12-2027" },
        { headName: "6th Sem Tuition Fees - 1st Installment", amount: baseTuition, dueDate: "15-02-2028" },
        { headName: "Provisional Certificate Fees", amount: 500, dueDate: "20-05-2028" },
        { headName: "6th Sem Tuition Fees - 2nd Installment", amount: baseTuition, dueDate: "20-05-2028" },
        { headName: "Examination Fees (Sem 6)", amount: 3700, dueDate: "20-05-2028" }
    ];
    let processedHeads = heads.map(h => ({ ...h, discount: 0, fine: 0, paid: 0, due: h.amount, status: "Due" }));
    let total = processedHeads.reduce((sum, h) => sum + h.amount, 0);
    return { feeHeads: processedHeads, totalAmount: total, totalDue: total, totalPaid: 0, totalDiscount: 0 };
};
