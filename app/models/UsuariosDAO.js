const crypto = require("crypto")


function UsuariosDAO(connection){
    this._connection = connection();
}

UsuariosDAO.prototype.inserirUsuario = function(usuario){
    this._connection.open(function(err, mongoclient){
        mongoclient.collection("usuarios", function(err, collection){

            var senhaCriptografada = crypto.createHash('md5').update(usuario.senha).digest("hex");

            usuario.senha = senhaCriptografada;

            collection.insert(usuario);
            mongoclient.close();
        });
    });
}

UsuariosDAO.prototype.autenticar = function(usuario, req, res){
    this._connection.open(function(err, mongoclient){
        mongoclient.collection("usuarios", function(err, collection){
            collection.find(usuario).toArray(function(err, result){

                var senhaCriptografada = crypto.createHash('md5').update(usuario.senha).digest("hex");
                usuario.senha = senhaCriptografada;
                
                if(result[0] != undefined){

                    req.session.autorizado = true;

                    req.session.usuario = result[0].usuario;
                    req.session.casa = result[0].casa;

                }

                if(req.session.autorizado){
                    res.redirect("jogo");
                }else{
                    res.render("index", { validacao: {} });
                }

            });
            mongoclient.close();
        });
    });
}

module.exports = function(){
    return UsuariosDAO;
}