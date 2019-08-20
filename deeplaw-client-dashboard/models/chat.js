const mongoose = require("mongoose");

const chatSchema = mongoose.Schema({
	username: {
		type: String,
		required: true
	},
	content: [{
		sender: String,
		text: String,
		date: {
			type: Date,
			default: Date.now()
		}
	}]
});

module.exports = mongoose.model("Chat", chatSchema);
