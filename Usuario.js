var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var UsuarioSchema = new Schema({
	sAMAccountName:{
		type:String,
		unique:true,
		required:true
	},
	imgPerfil:[{
		ruta:String,
		creada:{
			type:Date,
			default: Date.now
		}
	}],
	publicaciones:[{
		type: Schema.Types.ObjectId, ref: 'Publicacion'
	}],
	celular:String
});

module.exports = mongoose.model("Usuario",UsuarioSchema);