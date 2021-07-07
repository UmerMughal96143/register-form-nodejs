const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TokenSchema = new Schema(
    {
        phone: {
            type: String,
            required: true,
        },
        token: {
            type: String,
            required: true,
        },
    }
);

module.exports = mongoose.model("Token", TokenSchema);
