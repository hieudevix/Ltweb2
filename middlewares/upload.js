const multer  = require('multer');
var storage = multer.memoryStorage()
const upload = multer({ storage: storage })

module.exports = upload;