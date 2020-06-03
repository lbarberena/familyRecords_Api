const router = require('express').Router();
const verify = require('../middlewares/verify-token.middleware');
const Family = require('../models/family.model');
const permissions = require('../middlewares/permissions.middleware');

// GET ALL Families
router.get('/families', (req, res) => {
    try {
        Family.find({}, function(err, family) {
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
                data: family
            });
        });
    } catch (err) {
        res.json({
            success: false,
            msg: 'Ocurrió un error',
            data: err
        });
    }
});

router.post('/families', async(req, res) => {

        const family = new Family({
            familyName: req.body.familyName,
            date: req.body.date
        });
        try {
            const savedFamily = await family.save();
            return res.json({
                success: true,
                msg: 'Datos guardados',
                data: savedFamily
            });
        } catch (err) {
            return res.json({
                success: false,
                msg: err,
                data: {}
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

router.delete('/families/:userId/:userFamily/:id', verify, permissions, async (req, res) => {
    try {
        //Vaidation
        const family = await Family.findById(req.params.id);
        if (!family) return res.json({
            success: false,
            msg: 'Datos no encontrados',
            data: {}
        });

        if (req.params.userFamily === 'all') {
            Family.deleteOne({ _id: req.params.id })
                .exec()
                .then(family => {
                    if (!family) {
                        return res.json({
                            success: false,
                            msg: 'Datos no encontrados',
                            data: {}
                        });
                    }
                    return res.json({
                        success: true,
                        msg: 'Datos eliminados',
                        data: {}
                    });
                })
                .catch(err => next(err));
        } else {
            res.status(401).json({success: false, msg: "Unauthorized", data: 'No estás autorizado para eliminar este contenido'});
        }
    } catch (err) {
        return res.json({
            success: false,
            msg: 'Ocurrió un error',
            data: err
        });
    }
});

module.exports = router;
