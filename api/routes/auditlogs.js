const moment = require('moment');
const express = require('express');
const router = express.Router();
const Response = require('../lib/Response');
const AuditLogs = require('../db/models/AuditLogs');
const auth=require('../lib/auth')();


router.all("*",auth.authenticate(),(req,res,next)=>{
next();
}) 


router.post("/",auth.checkRoles("auditlogs_view"), async (req, res, next) => {
    try {
        let body = req.body;
        let query = {};
        let skip = body.skip;
        let limit = body.limit;

        if (typeof body.limit !== "number") {
            skip = 0;
        }
        if (typeof body.skip !== "number" || body.limit > 500) {
            limit = 500;
        }

        if (body.begin_date && body.end_date) {
            query.created_at = {
                $gte: moment(body.begin_date),
                $lte: moment(body.end_date)
            }
        } else {
            query.created_at = {
                $gte: moment().subtract(1, "day").startOf("day"),
                $lte: moment()
            }
        }


        let auditlogs = await AuditLogs.find(query).sort({created_at:-1}).skip(skip).limit(limit);
        res.json(Response.sucsessResponse(auditlogs));
    } catch (err) {
        let errResponse = Response.errorResponse(err);
        res.status(errResponse.code).json(errResponse);
    }
})



module.exports = router;