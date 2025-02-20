import mongoose from 'mongoose';

const DataSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    entryId: {type: String, required: true },
    section: { type: String, required: true },
    category: { type: String, required: true },
    name: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    memo: { type: String },
    date: { type: Date, default: Date.now },
});

export default mongoose.models.Data || mongoose.model('Data', DataSchema);
