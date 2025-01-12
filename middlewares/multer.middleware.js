const multer = require('multer')

const storage = multer.memoryStorage()

const uploadFile = multer({storage}).single("image")

module.exports = uploadFile