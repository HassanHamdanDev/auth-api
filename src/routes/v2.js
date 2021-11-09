'use strict';

const express = require('express');
const dataModules = require('../models');

const routerV2 = express.Router();

const bearerAuth = require('../middleware/bearer.js');
const permissions = require('../middleware/acl.js');

routerV2.param('model', (req, res, next) => {
    const modelName = req.params.model;
    if (dataModules[modelName]) {
        req.model = dataModules[modelName];
        next();
    } else {
        next('Invalid Model');
    }
});

routerV2.get('/:model', bearerAuth, permissions('read'), handleGetAll);
routerV2.get('/:model/:id', bearerAuth, permissions('read'), handleGetOne);
routerV2.post('/:model', bearerAuth, permissions('create'), handleCreate);
routerV2.put('/:model/:id', bearerAuth, permissions('update'), handleUpdate);
routerV2.delete('/:model/:id', bearerAuth, permissions('delete'), handleDelete);

async function handleGetAll(req, res) {
    let allRecords = await req.model.get();
    res.status(200).json(allRecords);
}

async function handleGetOne(req, res) {
    const id = req.params.id;
    let theRecord = await req.model.get(id)
    res.status(200).json(theRecord);
}

async function handleCreate(req, res) {
    let obj = req.body;
    let newRecord = await req.model.create(obj);
    res.status(201).json(newRecord);
}

async function handleUpdate(req, res) {
    const id = req.params.id;
    const obj = req.body;
    let updatedRecord = await req.model.update(id, obj)
    res.status(201).json(updatedRecord);
}

async function handleDelete(req, res) {
    let id = req.params.id;
    let deletedRecord = await req.model.delete(id);
    res.status(204).json(deletedRecord);
}


module.exports = routerV2;