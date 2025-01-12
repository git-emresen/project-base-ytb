const express = require("express");
const moment = require("moment");
const Response = require("../lib/Response");
const AuditLogs = require("../db/models/AuditLogs");
const Categories = require("../db/models/Categories");
const Users = require("../db/models/Users");
const auth = require('../lib/auth')();
const router = express.Router();

router.all("*", auth.authenticate(), (req, res, next) => {
    next();
})

router.post("/auditlogs", async (req, res) => {
   let filter={};
   let body=req.body;
 
   if(typeof body.is_active==="boolean") filter.is_active=body.is_active;
   if(typeof body.location==="string") filter.location=body.location;

    try {
        let result = await AuditLogs.aggregate([
            { $match: filter },
            { $group: { _id: { email: "$email", proc_type: "$proc_type" }, count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ])

        res.json(Response.successResponse({ result }));
    } catch (err) {
        let errorResponse = Response.errorResponse(err);
        res.status(errorResponse.code).json(errorResponse);
    }
});

router.post("/categories/uniquie", async (req, res) => {
    try {
        let result = await Categories.distinct("name", { is_active: true })
        

        res.json(Response.successResponse({ result }));

    } catch (err) {
        let errorResponse = Response.errorResponse(err);
        res.status(errorResponse.code).json(errorResponse);
    }
});

router.post("/users/count", async (req, res) => {
    try {
        let result = await Users.countDocuments({ is_active: true });        

        res.json(Response.successResponse({ result }));

    } catch (err) {
        let errorResponse = Response.errorResponse(err);
        res.status(errorResponse.code).json(errorResponse);
    }
});



module.exports = router;