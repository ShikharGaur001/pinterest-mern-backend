const mongoose = require('mongoose')

const boardSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: [100, "Title cannot exceed 100 characters"]
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, "Description cannot exceed 500 characters"]
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    pins: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'pin'
    }],
    category: {
        type: String,
        enum: ["Art", "Photography", "DIY", "Food", "Fashion", "Travel", "Other"],
        default: "Other",
    },
    tags: {
        type: [String],
        default: []
    },
    collaborators: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }],
    isSecret: {
        type: Boolean,
        default: false
    }
},
{
    timestamps: true
})

const boardModel = mongoose.model('board', boardSchema)
module.exports = boardModel