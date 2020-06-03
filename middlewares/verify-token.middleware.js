const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
    const token = req.header('Authorization');

    if (!token) return res.status(401).send('Acceso denegado');

    try {
        const verified = jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
            if (err) {
                return res.json({
                    success: false,
                    msj: 'Token inválido',
                    data: {}
                });
            } else {
                req.decoded = decoded;
            }
        });
        req.user = verified;
        next();
    } catch (err) {
        console.log('VerifyToken', err);
        res.status(400).send('Token Inválido');
    }
};
