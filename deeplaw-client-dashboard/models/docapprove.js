const mongoose = require("mongoose");

const docapproveSchema = mongoose.Schema({
	user: {
		type: String,
		required: true
	},
	approver: {
		type: String,
		required: true
	},
	link: [{
		url: String,
		status: String,
		date: {
			type: Date,
			default: Date.now()
		}
	}]
});

module.exports = mongoose.model("DocApprove", docapproveSchema);
