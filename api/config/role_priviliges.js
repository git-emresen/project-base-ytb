module.exports={
    privGroups:[
        {
            id:"USERS",
            name:"user permissins"
        },
        {
            id:"ROLES",
            name:"role permissions"
        },
        {
            id:"CATEGORIES",
            name:"category permissions"
        },
        {
            id:"AUDITLOGS",
            name:"AuditLOGS permissions"
        }
    ],

    priviliges: [
        {
            key:"user_view",   //permission: { type: String, required: true },
            name:"User view",  
            group:"USERS",
            description:"User View"
        },
        {
            key:"user_add",
            name:"User Add",
            group:"USERS",
            description:"User Add"
        },
        {
            key:"user_update",
            name:"User Update",
            group:"USERS",
            description:"User Update"
        },
        {
            key:"user_delete",
            name:"User Delete",
            group:"USERS",
            description:"User Delete"
        },
        {
            key:"role_view",
            name:"Role view",
            group:"ROLES",
            description:"Role View"
        },
        {
            key:"role_add",
            name:"Role Add",
            group:"ROLES",
            description:"Role Add"
        },
        {
            key:"role_update",
            name:"Role Update",
            group:"ROLES",
            description:"Role Update"
        },
        {
            key:"role_delete",
            name:"Role Delete",
            group:"ROLE",
            description:"Role Delete"
        },
        {
            key:"category_view",
            name:"Category view",
            group:"CATEGORIES",
            description:"Category View"
        },
        {
            key:"category_add",
            name:"Category Add",
            group:"CATEGORIES",
            description:"Category Add"
        },
        {
            key:"category_update",
            name:"Category Update",
            group:"CATEGORIES",
            description:"Category Update"
        },
        {
            key:"category_delete",
            name:"Category Delete",
            group:"CATEGORIES",
            description:"Category Delete"
        },
        {
            key:"category_export",
            name:"Category export",
            group:"CATEGORIES",
            description:"Category export"
        },
        {
            key:"category_import",
            name:"Category import",
            group:"CATEGORIES",
            description:"Category import"
        },
        {
            key:"auditslogs_view",
            name:"Auditslog view",
            group:"AUDITLOGS",
            description:"Auditlogs View"
        }
   
    ]
}