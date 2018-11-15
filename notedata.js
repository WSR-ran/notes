const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');

const Schema = mongoose.Schema;

const noteSchema = new Schema({
    id: {
        type: String,
        required: true
    },
    left: {
        type: Number,
        required: true
    },
    top: {
        type: Number,
        required: true
    },
    zIndex: {
        type: Number,
        required: true
    },
    content: {
        type: String,
        required: false
    },
    createTime: {
        type: Number,
        required: true
    },
    bgColor: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('Notes', noteSchema);