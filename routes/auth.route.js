const router = require('express').Router();
const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const verify = require('../middlewares/verify-token.middleware');
const permissions = require('../middlewares/permissions.middleware');

router.get('/users/:userId/:userFamily', verify, permissions, (req, res) => {
    try {
        if ( req.params.userFamily === 'all' ) {
            User.find({}, function(err, users) {
                if (err) {
                    res.json({
                        success: false,
                        msg: 'Datos no encontrados',
                        data: {}
                    });
                    next();
                }
                res.json({
                    success: true,
                    msg: 'Solicitado',
                    data: users
                });
            });
        } else {
            User.aggregate([{
                $match: {
                    family: req.params.userFamily
                }
            }], function (err, items) {
                if (err) {
                    res.json({
                        success: false,
                        msj: 'Error',
                        data: err
                    });
                    next();
                }
                res.json({
                    success: true,
                    msj: 'Solicitado',
                    data: items
                });
            });
        }
    } catch (err) {
        res.json({
            success: false,
            msj: 'Ocurrió un error',
            data: err
        });
    }
});

// GET USERS IN A FAMILY
router.get('/users/:userId/:userFamily/:family', verify, permissions, (req, res) => {
    try {
        if ( req.params.userFamily === 'all' ) {
            User.find({}, function(err, users) {
                if (err) {
                    res.json({
                        success: false,
                        msg: 'Datos no encontrados',
                        data: {}
                    });
                    next();
                }
                res.json({
                    success: true,
                    msg: 'Solicitado',
                    data: users
                });
            });
        } else if ( (req.params.userFamily !== 'all') && (req.params.family === req.params.userFamily) ) {
            User.aggregate([{
                $match: {
                    family: req.params.family,
                    active: 'true'
                }
            }], function (err, items) {
                if (err) {
                    res.json({
                        success: false,
                        msj: 'Error',
                        data: err
                    });
                    next();
                }
                res.json({
                    success: true,
                    msj: 'Solicitado',
                    data: items
                });
            });
        } else if ( (req.params.userFamily !== 'all') && (req.params.family !== req.params.userFamily) ) {
            res.status(401).json({success: false, msg: "Unauthorized", data: 'No estás autorizado para ver este contenido'});
        }
    } catch (err) {
        res.json({
            success: false,
            msj: 'Ocurrió un error',
            data: err
        });
    }
});

// GET USERS BY ID
router.get('/users/:userId/:userFamily/id/:id', verify, (req, res) => {
    try {
        const user = User.findById(req.params.id);
        if (!user) {
            return res.json({
                success: false,
                msg: 'Datos no encontrados',
                data: {}
            });
        } else {
            User.findById(req.params.id)
                .then(thing => {
                    if (!thing) {
                        return res.json({
                            success: false,
                            msg: 'Datos no encontrados',
                            data: {}
                        });
                    }
                    if ( thing && ((thing.family === req.params.userFamily) || (req.params.userFamily === 'all')) ) {
                        return res.json({
                            success: true,
                            msg: 'Solicitado',
                            data: thing
                        });
                    } else {
                        res.status(401).json({success: false, msg: "Unauthorized", data: 'No estás autorizado para ver este contenido'});
                    }
                });

        }
    } catch (err) {
        return res.json({
            success: false,
            msg: 'Ocurrió un error',
            data: err
        });
    }
});

//REGISTER A NEW USER

router.post('/register', async(req, res) => {

        //Check if the user and email already exist
        const userExist = await User.findOne({ username: req.body.username });
        if (userExist) return res.json({
            success: false,
            msg: 'El usuario ya existe',
            data: {}
        });

        const emailExist = await User.findOne({ email: req.body.email });
        if (emailExist) return res.json({
            success: false,
            msg: 'El correo ya existe',
            data: {}
        });

        //Encrypting the password and the send it to the Data base
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        //Create a new user
        const user = new User({
            username: req.body.username,
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword,
            family: req.body.family,
            active: req.body.active,
            loggedin: req.body.loggedin,
            role: req.body.role,
            date: req.body.date
        });

        try {
            const savedUser = await user.save();
            return res.json({
                success: true,
                msg: 'Usuario Guardado',
                data: savedUser
            });
        } catch (err) {
            return res.json({
                success: false,
                msg: 'Sucedió un error',
                data: err
            });
        }
    },
    err => {
        return res.json({
            success: false,
            msg: 'Ocurrió un error',
            data: err
        });
    });

//LOGIN

router.post('/login', async(req, res) => {
        let conditions = { username: req.body.username };

        //Checking if the user exist
        const user = await User.findOne({ username: req.body.username });
        if (!user) return res.json({
            success: false,
            msg: "Usuario no existe",
            data: {}
        }).status(400);

        //Checking if the password is correct
        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) return res.json({
            success: false,
            msg: "Contraseña incorrecta",
            data: {}
        }).status(400);

        //Checking if the user state is active
        if (!user.active) return res.json({
            success: false,
            msg: "Usuario está desactivado",
            data: {}
        }).status(400);

        if (user && user.active) User.updateOne(conditions, { loggedin: true })
                .then(() => {});


        //JWT
        const token = jwt.sign({
            _id: user._id,
            username: user.username,
            family: user.family
        }, process.env.TOKEN_SECRET);

        return res.header('Authorization', token).json({
            success: true,
            msg: "Sesión iniciada",
            data: {
                token: token,
                userId: user._id,
                name: user.name,
                username: user.username,
                userFamily: user.family
            }
        });
    },
    err => {
        return res.json({
            success: false,
            msg: 'Ocurrió un error',
            data: err
        });
    });

//Change password while logged in
router.put('/password/:userId/:userFamily', async(req, res) => {
        const conditions = { username: req.body.username };

        //Checking if the user exist
        const user = await User.findOne({ username: req.body.username });
        if (!user) return res.json({
            success: false,
            msg: "Usuario no existe",
            data: {}
        }).status(400);

        //Encrypting the password and then send it to the Data base
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        if ( user._id === req.params.userId || req.params.userFamily === 'all' ) {
            User.updateOne(conditions, { password: hashedPassword })
                .then(user => {
                    if (!user) {
                        res.json({
                            success: false,
                            msg: 'Usuario no encontrado',
                            data: {}
                        });
                    }
                    return res.json({
                        success: true,
                        msg: 'Contraseña actualizada',
                        data: user
                    });
                });
        } else {
            res.status(401).json({success: false, msg: "Unauthorized", data: 'No puedes cambiar la contraseña de otro usuario'});
        }

    },
    err => {
        return res.json({
            success: false,
            msg: 'Ocurrió un error',
            data: err
        });
    });

//Change password while not logged in
router.put('/password', async(req, res) => {
        const conditions = { username: req.body.username };

        //Checking if the user exist
        const user = await User.findOne({ username: req.body.username });
        if (!user) return res.json({
            success: false,
            msg: "Usuario no existe",
            data: {}
        }).status(400);

        //Encrypting the password and then send it to the Data base
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        User.updateOne(conditions, { password: hashedPassword })
            .then(user => {
                if (!user) {
                    res.json({
                        success: false,
                        msg: 'Usuario no encontrado',
                        data: {}
                    });
                }
                return res.json({
                    success: true,
                    msg: 'Contraseña actualizada',
                    data: user
                });
            });

    },
    err => {
        return res.json({
            success: false,
            msg: 'Ocurrió un error',
            data: err
        });
    });

// PUT User
router.put('/users/:id', async(req, res) => {
    try {
        const conditions = { _id: req.params.id };

        //Checking if the user exist
        const user = await User.findOne({ _id: req.params.id });
        if (!user) return res.json({
            success: false,
            msg: "Usuario no existe",
            data: {}
        }).status(400);

        User.updateOne(conditions, req.body)
            .then(user => {
                if (!user) {
                    res.json({
                        success: false,
                        msg: 'Usuario no encontrado',
                        data: {}
                    });
                }
                return res.json({
                    success: true,
                    msg: 'Usuario actualizado',
                    data: user
                });
            });
    } catch (err) {
        return res.json({
            success: false,
            msg: 'Ocurrió un error',
            data: err
        });
    }
});

// Verify if user exist
router.post('/user', async(req, res) => {
        const conditions = { username: req.body.username };

        //Checking if the user exist
        const user = await User.findOne({ username: req.body.username });
        if (!user) return res.json({
            success: false,
            msg: "Usuario no existe",
            data: {}
        }).status(400);

        if (user) return res.json({
            success: true,
            msg: 'Usuario existe',
            data: conditions
        }).status(200);
    },
    err => {
        return res.json({
            success: false,
            msg: 'Ocurrió un error',
            data: err
        });
    });

router.delete('/users/:id', verify, async(req, res) => {
    try {
        //Vaidation
        const user = await User.findById(req.params.id);
        if (!user) return res.json({
            success: false,
            msg: 'Datos no encontrados',
            data: {}
        });

        User.deleteOne({ _id: req.params.id })
            .exec()
            .then(user => {
                if (!user) {
                    return res.json({
                        success: false,
                        msg: 'Usuario no encontrado',
                        data: {}
                    });
                }
                return res.json({
                    success: true,
                    msg: 'Usuario eliminados',
                    data: {}
                });
            })
            .catch(err => next(err));
    } catch (err) {
        return res.json({
            success: false,
            msg: 'Ocurrió un error',
            data: err
        });
    }
});


module.exports = router;
