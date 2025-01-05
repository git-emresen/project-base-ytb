const express = require('express');
const router = express.Router();
const { HTTP_CODES } = require('../config/Enum');
const emitter = require('../lib/Emitter');

emitter.addEmitter("notifications");

router.get("/",(req, res) => {

    res.writeHead(HTTP_CODES.OK, {
       "Content-Type": "text/event-stream",  // Düzeltildi: doğru content-type
        "Connection": "keep-alive",           // Bağlantıyı açık tutuyoruz
        "Cache-Control": "no-cache, no-transform"          // Caching'i kapatıyoruz
        /* "Transfer-Encoding": "chunked",       // Veri parçalı gönderilecek */
    })
    const listener = (data) => {
        res.write("data:" + JSON.stringify(data) + "\n\n");
    }
    emitter.getEmitter("notifications").on("messages", listener);

    req.on("close", () => {
        emitter.getEmitter("notifications").off("messages", listener);
    })

})

module.exports=router;