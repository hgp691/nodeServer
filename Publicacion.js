var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var PublicacionSchema = new Schema({
	fecha:{
		type:Date,
		default:Date.now
	},
	usuario:
});

module.exports = mongoose.model("Publicacion",PublicacionSchema);