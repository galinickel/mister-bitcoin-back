const cloudinary = require('cloudinary').v2;
cloudinary.config({
    cloud_name: 'dklqusztc',
    api_key: '346198892254232',
    api_secret: 'VbovCPKe_3xVHLUqk863-njrl8M'
})

module.exports = {cloudinary}