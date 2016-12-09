//MANEJADOR DE WEB
var express = require('express');
//PARA ACCEDER AL BODY
var bodyParser = require("body-parser");
//INSTANCIA DE WEB
var app = express();
//app USA BODY PARSE
app.use(bodyParser.urlencoded({
	extended:true
}));
//app.use(bodyParser.json());
///SUBIR ARCHIVOS
var fileUpload = require('express-fileupload');
///USAR FILEUPLOAD
app.use(fileUpload());
///MONGOOSE PARA EL MANEJO DE MONGOOSE
var mongoose = require("mongoose");
//PUERTO DONDE SE VA A ESCUCHAR
var puerto = 3000;
//EL USER DE LA API
var idApi = "ElusuarioDeApp@";
//EL PASSWORD DE LA API
var pwApi = "hkklejr9808trefws13kh_DA*"

//MANEJADOR DE ACTIVE DIRECTORY
var ActiveDirectory = require('activedirectory');

//BD
var BD = "mongodb://Localhost/test"
mongoose.connect(BD);
//USUARIO
var Usuario = require("./Usuario");
//Publicacion
var Publicacion = require("./Publicacion");

//MANEJADOR DE MYSQL
var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  port     :  '8889',
  user     : 'jobjob_user',
  password : '@123.abc',
  database : 'JobJob'
});




var Respuesta = function(){
	this.logs = [];
}

var Marca = function(){
  this. marca;
  this.archivos = [];
  function anadir(obj){
    this.archivos.push(obj);
  }
}





///FUNCION QUE MANEJA EL LOGIN
app.post('/login', function(req, res){
  	console.log("Hola Login");
	var respuesta = new Respuesta();
	if (!req.headers.authorization) {
		respuesta.error = {"error":"DEBE AUTENTICAR"};
    	res.json(respuesta);
  	}
 	var encoded = req.headers.authorization.split(' ')[1];
  	var decoded = new Buffer(encoded, 'base64').toString('utf8');
  	console.log("user: "+decoded.split(':')[0]);
  	console.log("pw: "+decoded.split(':')[1]);
  	if (idApi == decoded.split(':')[0] && pwApi == decoded.split(':')[1]) {
  		var usuario = req.body.usuario;
  		var password = req.body.clave;
  		if (usuario != null && password != null) {
  			console.log("Entra a todo");
  			respuesta.logs.push({"log":"ENTRO A TODO"});
  			var extension = "@compufacil.com.co";
  			var config = { url: 'ldap://corp.int',
               baseDN: 'dc=corp,dc=int',
               username: usuario+extension,
               password: password 
           	}
           	var ad = new ActiveDirectory(config);
           	ad.authenticate(usuario+extension, password, function(err, auth) {
  				if (err) {
    				console.log('ERROR: '+JSON.stringify(err));
    				respuesta.error = {'ERROR':JSON.stringify(err)};
    				return res.json(respuesta);
  				}else{
  					if (auth) {
    					console.log('Authenticated!');
    					var sAMAccountName = usuario;
    					ad.findUser(sAMAccountName, function(err, user) {
  							if (err) {
    							console.log('ERROR (2): ' +JSON.stringify(err));
    							respuesta.error = {"ERROR":JSON.stringify(err)};
    							return res.json(respuesta);
  							}
							if (! user){
								console.log('User: ' + sAMAccountName + ' not found.');
								respuesta.error = {"ERROR":"usuario no encontrado"};
    							return res.json(respuesta);
							}
							else{
								Usuario.findOne({'sAMAccountName':sAMAccountName},function(err,persona){
									if (err) {
										console.log("Error en usuario: "+err);
									}else{
										if (persona == null) {
											console.log("Crear usuario");
											Usuario.create({'sAMAccountName':sAMAccountName},function(err,usr){
												if (err) {
													console.log("Error creando nuevo usuario: "+err);
													respuesta.usrLDAP = user;
													respuesta.usuario = {"ERROR":err};
													return res.json(respuesta);
												}else{
													respuesta.usrLDAP = user;
													respuesta.usuario = usr;
													return res.json(respuesta);
												}
											});
										}else{
											console.log("Usuario: "+persona);
											console.log(JSON.stringify(user));
											respuesta.usrLDAP = user;
											respuesta.usuario = persona;
											return res.json(respuesta);
										}
									}
								});
								
							} 
						});
  					}
  					else {
    					console.log('Authentication failed!');
    					respuesta.error = {"ERROR":"Usuario o contraseña incorrectos"};
  						return res.json(respuesta);
  					}
  				}
  				
			});
  		}else{
  			respuesta.error = {"error":"Debe autenticarse"};
  			return res.json(respuesta);
  		}	
  	}else{
  		respuesta.error = {"error":"AUTENTICACION INVALIDA"};
    	return res.json(respuesta);
  	}
  	//res.end();
});
//EN POST NO HAY NADA
app.post('/', function(req, res){
	res.json({
		"error":"aca no hay nada"
	});
});
//EN GET NO HAY NADA
app.get('/', function(req, res){
	res.json({
		"error":"aca no hay nada"
	});
});

//IMAGEN DE PERFIL
app.post('/subirImagen',function(req,res){
	
	var respuesta = new Respuesta();
	if (!req.headers.authorization) {
		respuesta.error = {"error":"DEBE AUTENTICAR"};
    	res.json(respuesta);
  	}
 	var encoded = req.headers.authorization.split(' ')[1];
  	var decoded = new Buffer(encoded, 'base64').toString('utf8');
  	if (idApi == decoded.split(':')[0] && pwApi == decoded.split(':')[1]) {
  		//subir archivo
      var sampleFile;
      if (req.files.foto.name == "") {
        res.json({"error":"DEBE ADJUNTAR UN ARCHIVO"});
        return;
      }else{
        console.log();
      sampleFile = req.files.foto;
      console.log("Imagen");
      //console.log(req.files);
      var identificador = req.body.identificador;
      console.log("El identificador: "+identificador + Date.now());
      //var ruta = "imagenes/"
      var ruta = "../htdocs/archivos/usuarios/fotosPerfil/"
      var nombreImagen = identificador+'_'+Date.now()+'.png'
      sampleFile.mv(ruta+nombreImagen, function(err) {
        if (err) {
            res.status(500).json({"error":err});
            console.log("No subio imagen");
        }
        else {
            Usuario.findByIdAndUpdate(identificador,{
              $push:{
                "imgPerfil":{
                  ruta:nombreImagen
                }
              }
            },{
              safe:true,
              upsert:true
            },function(err,usuario){
              if (err) {
                console.log("Error creando imagen en el usuario: "+err);
                res.json({"error":err});
              }else{
                console.log("Usuario actualizado con exito");
                res.json({"mensaje":"OK"});
              }
            });
        }
      });
    }

  	}else{
  		respuesta.error = {"error":"AUTENTICACION INVALIDA"};
    	return res.json(respuesta);
  	}
  	
  	
});

//CONFIGURAR TELEFONO
app.post("/configurarCelular",function(req,res){
  var respuesta = new Respuesta();
  if (!req.headers.authorization) {
      respuesta.error = {"error":"DEBE AUTENTICAR"};
      return res.json(respuesta);
  }
  var encoded = req.headers.authorization.split(' ')[1];
    var decoded = new Buffer(encoded, 'base64').toString('utf8');
    if (idApi == decoded.split(':')[0] && pwApi == decoded.split(':')[1]) {
      var identificador = req.body.identificador;
      var celular = req.body.celular;
      if (identificador == null || celular == null) {
        return res.json({"error":"Debe enviar datos"});
      }
      Usuario.findByIdAndUpdate(identificador,
        {
          $set:{
            celular:celular
          }
        },
        {
          safe:true,
          upsert:true
        },function(err,usuario){
          if (err) {
            res.json({"error":err});
          }else{
            res.json({"msj":"OK"});
          }
        });
    }else{
      respuesta.error = {"error":"AUTENTICACION INVALIDA"};
      return res.json(respuesta);
    }
});



//NUEVO COMPARTIR MOVIL
app.post('/compartirMovil',function(req,res){
	var respuesta = new Respuesta();
	if (!req.headers.authorization) {
		respuesta.error = {"error":"DEBE AUTENTICAR"};
    	res.json(respuesta);
  	}
 	var encoded = req.headers.authorization.split(' ')[1];
  	var decoded = new Buffer(encoded, 'base64').toString('utf8');
  	if (idApi == decoded.split(':')[0] && pwApi == decoded.split(':')[1]) {

  	}else{
  		respuesta.error = {"error":"AUTENTICACION INVALIDA"};
    	return res.json(respuesta);
  	}
});


///PRUEBA PARA SABER QUE ESTA FUNCIONANDO EL LDAP
app.post('/pruebaLDAP',function(req,res){
	console.log("Entrada LDAP");
	var usuario = "hguzmanp";
	var password = "Marzo07Gp"
	var extension = "@compufacil.com.co";
  	var config = { 
  		url: 'ldap://corp.int',
        baseDN: 'dc=corp,dc=int',
        username: usuario+extension,
        password: password
    }
    console.log("Usuario: "+usuario+extension);
    console.log("Password: "+password);
    var ad = new ActiveDirectory(config);
    ad.authenticate(usuario+extension, password, function(err, auth) {
    	if (err) {
    		console.log("ERROR(1): "+err);
    	}else{
    		console.log("No error");
    		if (auth) {
    			console.log("AUTH")
    		}else{
    			console.log("NO AUTH");
    		}
    	}
    	res.json({"MSJ":"SALIO"});
    });
});

app.all("/test",function(req,res){
    console.log(req.headers);
    console.log(req.body);
    res.send("");
});







///INICIAR EL SERVIDOR WEB
app.listen(puerto,function(){
	console.log("Listen on port: "+puerto);
});





