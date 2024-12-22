const express = require('express')
const router = express.Router()
const Categories = require('../db/models/Categories')
const Response = require('../lib/Response.js')
const CustomError = require('../lib/Error.js')
const Enum = require("../config/Enum.js")
const AuditLogs=require('../lib/AuditLogs.js')
const logger=require('../lib/logger/loggerClass.js')


router.get("/", async (req, res, next) => {
    try {
        let categories = await Categories.find({})
        res.json(Response.sucsessResponse(categories))
    } catch (err) {
        let errorResponse = Response.errorResponse(err)
        res.status(errorResponse.code).json(Response.errorResponse(err))
    }

})

router.post("/add", async (req, res, next) => {
    let body = req.body;

    try {
        if (!body.name) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error", "Name field must be filled")
        let category = new Categories({
            name: body.name,
            is_active: body.is_active,
            created_by: req.user?.id
        })

        await category.save();
        AuditLogs.info(req.user?.email,"Categories","Add",category)
        logger.info(req.user?.email,"Categories","Add",category)
        res.json(Response.sucsessResponse({ success: true }));

    } catch (err) {
        res.status(err.code || Enum.HTTP_CODES.INT_SERVER_ERROR).json(Response.errorResponse(err));
        logger.err(req.user?.email,"Categories","Add",err)
    }
})

router.post("/update", async (req, res) => {
    let body = req.body;
    try {
        if (!body._id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error", "Name field must be filled");

        let updates = {}

        if (body.name) updates.name = body.name;
        if (typeof body.is_active === 'boolean') updates.is_active = body.is_active;

        await Categories.updateOne({ _id: body._id }, updates);
        AuditLogs.info(null,"Categories","Update",{_id:body._id, ...updates})
       
        res.json(Response.sucsessResponse({ success: true }))

    } catch (err) {
        let errorResponse = Response.errorResponse(err);
        res.status(errorResponse.code).json(Response.errorResponse(err));
    }
})

router.post("/delete", async (req, res,) => {
    let body = req.body;
    try {

        if (!body._id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error", "_id field must be provided");

        const result =await Categories.deleteOne({ _id: body._id })
        if (result.deletedCount === 0) { //TODO:BU DENETİMİ YAPMAZSAN DA HATA ALINCA CATCH KISMINDA HATA FIRLATABİLİR!
            throw new CustomError(Enum.HTTP_CODES.NOT_FOUND, "Not Found", "No document found with the provided _id")
        }
        AuditLogs.info(req.user?.email,"Categories","delete",{_id:body._id})
        res.json(Response.sucsessResponse({ success: true }));

    } catch (err) {
        let errorResponse = Response.errorResponse(err);
        res.status(errorResponse.code).json(errorResponse);
    }
})

module.exports = router;