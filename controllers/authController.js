
const dotenv = require('dotenv');
const path = require('path')
dotenv.config()


exports.test = async (req, res) => {
    res.status(400).json({ message: 'backend is working well' });
}

exports.display = async (req, res) => {
    const rootpath = path.resolve(__dirname, '..');
    const filePath = path.resolve(
        rootpath,
        `uploads/${req.params.filename}`
    );
    res.sendFile(filePath);
}