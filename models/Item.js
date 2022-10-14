const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const itemSchema = new Schema({
    title: {type: String, required: true, maxLength: 100},
    description: {type: String, required: true, maxLength: 500},
    category: {type: Schema.Types.ObjectId, ref: "Category", required: true},
    price: {type: Number, required: true, min: 0},
    img: {data: Buffer, contentType: String},
    quantity: {type: Number, required: true, min: 0}

});

itemSchema.virtual("url").get(function() {
    return `/inventory/item/${this._id}`;
})

module.exports = mongoose.model("Item", itemSchema);