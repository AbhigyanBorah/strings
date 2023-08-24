import mongoose from "mongoose";

const stringSchema = new mongoose.Schema({
    text: { type: String, required: true },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    community: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Community',
    },
    createdAt: {
        type: Date,
        default:Date.now
    },
    parentId: {
        type: String,
    },
    children: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref:'Strings'
        }
    ]
});

const Strings = mongoose.models.Strings || mongoose.model('Strings', stringSchema);

export default Strings;