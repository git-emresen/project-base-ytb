const express = require('express')
const router = express.Router()
const Categories = require('../db/models/Categories')
const Response = require('../lib/Response.js')
const CustomError = require('../lib/Error.js')
const Enum = require("../config/Enum.js")


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
            is_active: true,
            created_by: req.user?.id
        })

        await category.save();

        res.json(Response.sucsessResponse({ success: true }));

    } catch (err) {
        res.status(err.code || Enum.HTTP_CODES.INT_SERVER_ERROR).json(Response.errorResponse(err));
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

        res.json(Response.sucsessResponse({ success: true }));

    } catch (err) {
        let errorResponse = Response.errorResponse(err);
        res.status(errorResponse.code).json(errorResponse);
    }
})

module.exports = router;