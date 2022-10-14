const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categorySchema = new Schema({
    title:{type: String, required: true, maxLength: 100},
});

categorySchema.virtual("url").get(function() {
    return `/inventory/category/${this._id}`;
});

module.exports = mongoose.model("Category", categorySchema);