const express = require('express')
const router = express.Router()
const Response = require('../lib/Response.js')
const CustomError = require('../lib/Error.js')
const Enum = require("../config/Enum.js")
const Roles = require("../db/models/Roles")
const role_priviliges = require('../config/role_priviliges.js')
const rolePriviliges = require('../db/models/RolePriviliges.js')
const auth=require('../lib/auth.js')()


router.all("*",auth.authenticate(),(req,res,next)=>{
    next();
    })

router.get("/", auth.checkRoles("role_view"), async (req, res, next) => {
    try {
        let roles = await Roles.find({})
        res.json(Response.sucsessResponse({success:true}))
    } catch (err) {
        let errorResponse = Response.errorResponse(err)
        res.status(errorResponse.code).json(Response.errorResponse(err))
    }

})

router.post("/add",auth.checkRoles("role_add"), async (req, res, next) => {
        let body = req.body;
    
        try {
            // Doğrulama
            if (!body.role_name || typeof body.is_active !== "boolean") {
                throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error", "All fields must be provided");
            }
    
            if (!Array.isArray(body.permissions) || body.permissions.length === 0) {
                throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error", "Permissions must be a non-empty array");
            }
    
            // Rol Kaydı
            let role = new Roles({
                role_name: body.role_name,
                is_active: body.is_active,
                created_by: req.user?.id
            });
            await role.save();
    
            // İzinler Kaydı (Toplu)
            let priviliges = body.permissions.map(permission => ({
                role_id: role._id,
                permission: permission,
                created_by: req.user?.id
            }));
            await rolePriviliges.insertMany(priviliges);
    
            // Başarılı Yanıt
            res.json(Response.sucsessResponse({ success: true }));
        } catch (err) {
            // Hata Yönetimi
            let errorResponse = Response.errorResponse(err);
            res.status(errorResponse.code).json(errorResponse);
        }
    });

router.post("/update",auth.checkRoles("role_update"),async (req, res, next) => {
        let body = req.body;
    
        try {
            // Temel doğrulamalar
            if (!body._id) {
                throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error", "ID must be provided");
            }
    
            // Güncelleme objesi oluştur
            let updates = {};
            if (body.role_name) updates.role_name = body.role_name;
            if (typeof body.is_active === "boolean") updates.is_active = body.is_active;
    
            // Boş güncelleme kontrolü
            if (Object.keys(updates).length === 0) {
                throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error", "No valid update fields provided");
            }
    
            // İzinler kontrolü
            if (!Array.isArray(body.permissions) || body.permissions.length === 0) {
                throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error", "Permissions field must be a non-empty array");
            }
    
            // Mevcut izinleri al
            let existingPermissions = await rolePriviliges.find({ role_id: body._id });
    
            // Silinecek ve eklenecek izinleri belirle
            let removedPermissions = existingPermissions.filter(x => !body.permissions.includes(x.permission));
            let newPermissions = body.permissions.filter(x => !existingPermissions.map(p => p.permission).includes(x));
    
            // Silme işlemi
            if (removedPermissions.length > 0) {
                await rolePriviliges.deleteMany({ _id: { $in: removedPermissions.map(x => x._id) } });
            }
    
            // Yeni izin ekleme işlemi
            for (let i = 0; i < newPermissions.length; i++) {
                let priv = new rolePriviliges({
                    role_id: body._id,
                    permission: newPermissions[i],
                    created_by: req.user?.id
                });
                await priv.save();
            }
    
            // Rol güncellemesi
            await Roles.updateOne({ _id: body._id }, updates);
    
            res.json(Response.sucsessResponse({ success: true }));
        } catch (err) {
            let errorResponse = Response.errorResponse(err);
            res.status(errorResponse.code).json(errorResponse);
        }
    });
    
router.post("/delete",auth.checkRoles("role_delete"),async (req, res, next) => {
    let body = req.body;

    try {
        if (!body._id
        ) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error", "All field must be provided")


        await Roles.deleteOne({ _id: body._id })
        res.json(Response.sucsessResponse({ susscess: true }))
    } catch (err) {
        let errorResponse = Response.errorResponse(err)
        res.status(errorResponse.code).json(Response.errorResponse(err))
    }

})

router.get("/role_priviliges", async (req, res) => {
    res.json(role_priviliges)
})

module.exports = router;