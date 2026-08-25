const express = require('express');
const router = express.Router();

const countriesRouter = require('./countries');
const breedersRouter = require('./breeders');
const horsesRouter = require('./horses');
const usersRouter = require('./users');

router.use('/countries',countriesRouter);
router.use('/breeders',breedersRouter);
router.use('/horses',horsesRouter);
router.use('/users',usersRouter);

module.exports = router;