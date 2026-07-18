const express = require('express');
const router = express.Router();

const countriesRouter = require('./countries');
const breedersRouter = require('./breeders');
const horsesRouter = require('./horses');

router.use('/countries',countriesRouter);
router.use('/breeders',breedersRouter);
router.use('/horses',horsesRouter);

module.exports = router;