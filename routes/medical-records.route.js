const router = require('express').Router();
const verify = require('../middlewares/verify-token.middleware');
const MedicalRecord = require('../models/medical-record.model');
const { check, validationResult } = require('express-validator');
const permissions = require('../middlewares/permissions.middleware');

// GET ALL MEDICAL RECORDS
router.get('/medicalRecord/:userId/:userFamily', verify, permissions, (req, res) => {
    try {
        if ( req.params.userFamily === 'all' ) {
            MedicalRecord.find({}, function(err, medicalRecord) {
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
                    data: medicalRecord
                });
            });
        } else {
            MedicalRecord.aggregate([{
                $match: {
                    family: req.params.userFamily
                }
            }], function (err, items) {
                if (err) {
                    res.json({
                        success: false,
                        msg: 'Error',
                        data: err
                    });
                    next();
                }
                res.json({
                    success: true,
                    msg: 'Solicitado',
                    data: items
                });
            });
        }
    } catch (err) {
        res.json({
            success: false,
            msg: 'Ocurrió un error',
            data: err
        });
    }
});

// GET MY MEDICAL RECORDS
router.get('/medicalRecord/:userId/:userFamily/mines', verify, permissions, async function(req, res) {
    try {
        MedicalRecord.aggregate([{
            $match: {
                family: req.params.userFamily,
                userId: req.params.userId
            }
        }], function (err, items) {
            if (err) {
                res.json({
                    success: false,
                    msg: 'Error',
                    data: err
                });
                next();
            }
            res.json({
                success: true,
                msg: 'Solicitado',
                data: items
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

//GET Medical Record using the ID
router.get('/medicalRecord/:userId/:userFamily/:id', verify, permissions, async function(req, res) {
    try {
        const medicalRecord = await MedicalRecord.findById(req.params.id);
        if (!medicalRecord) {
            return res.json({
                success: false,
                msg: 'Datos no encontrados',
                data: {}
            });
        } else {
            if ( (medicalRecord.family === req.params.userFamily) || (req.params.userFamily === 'all') ) {
                MedicalRecord.findById(req.params.id)
                    .then(thing => {
                        if (!thing) {
                            return res.json({
                                success: false,
                                msg: 'Datos no encontrados',
                                data: {}
                            });
                        }
                        return res.json({
                            success: true,
                            msg: 'Solicitado',
                            data: thing
                        });
                    });
            } else {
                res.status(401).json({success: false, msg: "Unauthorized", data: 'No estás autorizado para ver este contenido'});
            }
        }
    } catch (err) {
        return res.json({
            success: false,
            msg: 'Ocurrió un error',
            data: err
        });
    }
});

router.post('/medicalRecord/:userId/:userFamily', verify, permissions, async(req, res) => {

        const medicalRecord = new MedicalRecord({
            recordName: req.body.recordName,
            date: req.body.date,
            description: req.body.description,
            quantity: req.body.quantity,
            userId: req.params.userId,
            family: req.params.userFamily,
            username: req.body.username
        });
        try {
            const savedMedicalRecord = await medicalRecord.save();
            return res.json({
                success: true,
                msg: 'Datos guardados',
                data: savedMedicalRecord
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

router.put('/medicalRecord/:userId/:userFamily/:id', verify, function(req, res) {
    const conditions = { _id: req.params.id };

    MedicalRecord.updateOne(conditions, req.body)
        .then(medicalRecord => {
            if (!medicalRecord) {
                return res.json({
                    success: false,
                    msg: 'Datos no encontrados',
                    data: {}
                });
            }
            return res.json({
                success: true,
                msg: 'Datos actualizados',
                data: medicalRecord
            });
        });
});

router.delete('/medicalRecord/:userId/:userFamily/:id', verify, async(req, res) => {
        try {
            //Vaidation
            const medicalRecord = await MedicalRecord.findById(req.params.id);
            if (!medicalRecord) return res.json({
                success: false,
                msg: 'Datos no encontrados',
                data: {}
            });

            if ((medicalRecord.family === req.params.userFamily) || (req.params.userFamily === 'all')) {
                MedicalRecord.deleteOne({ _id: req.params.id })
                    .exec()
                    .then(medicalRecord => {
                        if (!medicalRecord) {
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
