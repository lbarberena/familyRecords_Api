const User = require('../models/user.model');

module.exports = function permissions(req, res, next) {
    try {
        const userId = req.params.userId;
        const family = req.params.userFamily;

        User.findById(userId, function(err, foundUser) {

            if(err){
                res.status(422).json({success: false, msg: "Usuario no encontrado", data: ''});
                return next(err);
            }

            if(foundUser.family === family || foundUser.role === 'admin') {
                return next();
            }

            res.status(401).json({success: false, msg: "Unauthorized", data: 'No estás autorizado para ver este contenido'});
            return next('Unauthorized');

        });
    } catch (error) {
        console.log('permissions', error);
        res.status(403).json({ success: false, msg: 'Ocurrió un error', data: error }); // user is forbidden
    }
};
