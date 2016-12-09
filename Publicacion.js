var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var PublicacionSchema = new Schema({
	fecha:{
		type:Date,
		default:Date.now
	},
	usuario:{
		type: Number, ref: 'Usuario'
	},
	texto:{
		type:String
	},
	imagen:{
		type:String
	},
	leInteresa:[{
		type: Number, ref: 'Usuario'
	}]
});

module.exports = mongoose.model("Publicacion",PublicacionSchema);