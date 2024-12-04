const express = require('express')
const router = express.Router()
const Response = require('../lib/Response.js')
const CustomError = require('../lib/Error.js')
const Enum = require("../config/Enum.js")
const Roles = require("../db/models/Roles")
const role_privileges = require('../config/role_privileges.js')
const RolePrivileges = require('../db/models/RolePrivileges.js')


router.get("/", async (req, res, next) => {
    try {
        let roles = await Roles.find({})
        res.json(Response.sucsessResponse(SpeechRecognitionResultList))
    } catch (err) {
        let errorResponse = Response.errorResponse(err)
        res.status(errorResponse.code).json(Response.errorResponse(err))
    }

})

/* router.post("/add", async (req, res, next) => {
    let body = req.body;

    try {
        if (
            !body.role_name &&
            typeof body.is_active !== "boolean"
        ) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error", "All field must be provided")
 
        if (!Array.isArray(body.permissions) || body.permissions.length === 0) {
            throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error", "All permissions field must be an Array")
        } 

        let role = new Roles({
            role_name: body.role_name,
            is_active: body.is_active,
            created_by: req.user?.id
        })
        await role.save();

        for (let i = 0; i < body.permissions.length; i++) {
            let priv = new RolePrivileges({
                role_id: role._id,
                permission: body.permissions[i],
                created_by: req.user?.id
            })
            await priv.save();
        }


        res.json(Response.sucsessResponse({ success: true }))
    } catch (err) {
        let errorResponse = Response.errorResponse(err)
        res.status(errorResponse.code).json(Response.errorResponse(err))
    }

}) */

router.post("/add", async (req, res, next) => {
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
            let privileges = body.permissions.map(permission => ({
                role_id: role._id,
                permission: permission,
                created_by: req.user?.id
            }));
            await RolePrivileges.insertMany(privileges);
    
            // Başarılı Yanıt
            res.json(Response.sucsessResponse({ success: true }));
        } catch (err) {
            // Hata Yönetimi
            let errorResponse = Response.errorResponse(err);
            res.status(errorResponse.code).json(errorResponse);
        }
    });
    
/* router.post("/update", async (req, res, next) => {
    let body = req.body;

    try {
        if (!body._id
        ) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error", "All field must be provided")
        let updates = {};
        if (body.role_name) updates.role_name = body.role_name;
        if (typeof body.is_active === 'boolean') updates.is_active = body.is_active;

        if (!body.permissions || Array.isArray(body.permissions) || body.permissions.length === 0) {
            let permissions = await RolePrivileges.find({ role_id: body._id });

            let removedPermissions = permissions.filter(x => !body.permissions.includes(x.permissions));
            let newPermissions = body.permissions.filter(x => !permissions.map(p => p.permission).includes(x));

            if (removedPermissions.length > 0) {
                await RolePrivileges.deleteOne({ _id: { $in: removedPermissions.map(x => x._id) } });
            }
            if (newPermissions.length > 0) {
                for (let i = 0; i < newPermissions.length; i++) {
                    let priv = new RolePrivileges({
                        role_id: body._id,
                        permission: body.permissions[i],
                        created_by: req.user?.id
                    })
                    await priv.save();
                }
            }
        }

        await Roles.updateOne({ _id: body._id }, updates)
        res.json(Response.sucsessResponse({ susscess: true }))
    } catch (err) {
        let errorResponse = Response.errorResponse(err)
        res.status(errorResponse.code).json(Response.errorResponse(err))
    }

}) */

router.post("/update", async (req, res, next) => {
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
            let existingPermissions = await RolePrivileges.find({ role_id: body._id });
    
            // Silinecek ve eklenecek izinleri belirle
            let removedPermissions = existingPermissions.filter(x => !body.permissions.includes(x.permission));
            let newPermissions = body.permissions.filter(x => !existingPermissions.map(p => p.permission).includes(x));
    
            // Silme işlemi
            if (removedPermissions.length > 0) {
                await RolePrivileges.deleteMany({ _id: { $in: removedPermissions.map(x => x._id) } });
            }
    
            // Yeni izin ekleme işlemi
            for (let i = 0; i < newPermissions.length; i++) {
                let priv = new RolePrivileges({
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
    

router.post("/delete", async (req, res, next) => {
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

router.get("/role_privileges", async (req, res) => {
    res.json(role_privileges)
})

module.exports = router;