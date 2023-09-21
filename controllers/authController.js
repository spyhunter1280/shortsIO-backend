const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const otpGenerator = require('otp-generator');
const emailSender = require("../utils/sendMail");
const dotenv = require('dotenv');
const path = require('path')
dotenv.config()

const generateToken = (user) => {
    const secretKey = process.env.SECRETKEY; // Replace with your own secret key
    const payload = {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        userName: user.userName,
        email: user.email,
        walletID: user.walletID
    };
    const token = jwt.sign(payload, secretKey, { expiresIn: '24h' });
    return token;
};

exports.signup = async (req, res) => {
    try {
        // return res.status(401).json({ message: 'Still developing now' });
        const { email, password, userName } = req.body;
        let user = await User.findOne({ email });
        if (user) {
            return res.status(401).json({ message: 'Email already exists' });
        }
        let userC = await User.findOne({ userName });
        if (userC) {
            return res.status(401).json({ message: 'UserName already exists' });
        }
        const otp = otpGenerator.generate(6, { digits: true, alphabets: false, upperCase: false, specialChars: false });
        const saltRounds = 5;
        const hashpassword = await bcrypt.hash(password, saltRounds);
        user = new User({ email, otp, password: hashpassword, userName });
        await user.save();
        const result = await emailSender.sendMail({
            to: email,
            subject: 'verification',
            text: `Hello \n
            Welcome to ArcadeCashino \n\n
            before login ousr wite you sould verify your account\n
            Verification code: ${otp}
            `
        });
        console.log(result)
        res.status(200).json({ message: 'success', data:result });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: err });
    }
}

exports.verify = async (req, res) => {
    try {
        const { email, otp } = req.body;
        let user = await User.findOne({ email });
        console.log(email, otp)
        if (user.otp === otp) {
            user.verify = true; // Update the verify property to true
            await user.save();
            return res.status(200).json({ message: 'success' });
        }
        res.status(401).json({ message: 'Failed' });
    } catch (err) {
        res.status(500).json({ message: req.body });
    }
}

exports.login = async (req, res) => {
    try {
        // return res.status(401).json({ message: 'Still developing now' });
        const { email, password } = req.body;

        let user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'User doesnt exists' });
        }
        console.log(password, user.password);
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('password');
            return res.status(401).json({ message: 'Invalid credentials---password' });
        }
        
        if (user.verify == false) {
            const otp = otpGenerator.generate(6, { digits: true, alphabets: false, upperCase: false, specialChars: false });
            user.otp = otp;
            user.save();
            const result = await emailSender.sendMail({
                to: email,
                subject: 'verification',
                text: `Hello \n
                Welcome to ArcadeCashino \n\n
                before login ousr wite you sould verify your account\n
                Verification code: ${otp}
                `
            });
            console.log(result)
            return res.status(401).json({ message: 'User is not verified', data:result })
        }
        const token = generateToken(user);
        console.log()
        res.status(200).json({ token: token, user: user });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: err });
    }
}

exports.profile = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        const originemail = jwt.verify(token, process.env.SECRETKEY).email;

        const { firstName, lastName, userName, country, password } = req.body;
        const saltRounds = 5;
        let hashpassword;
        if (!password) {
            hashpassword = User.find({ email: originemail }).password
            console.log(2)
        } else {
            hashpassword = await bcrypt.hash(password, saltRounds);
            console.log(1)
        }
        console.log(hashpassword)
        // Check if user exists
        User.updateOne({ email: originemail }, {
            $set: {
                firstName: firstName,
                lastName: lastName,
                userName: userName,
                country: country,
                password: hashpassword
            }
        }).then(() => { console.log('update is successfully') })
        // Check if password is correct
        let user = await User.findOne({ email: originemail });
        token1 = generateToken(user)
        res.status(200).json({ user: user, token: token1 })
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.avatar = async (req, res) => {
    try {
        const { filename } = req.body;
        const token = req.headers.authorization?.split(' ')[1];
        const originemail = jwt.verify(token, process.env.SECRETKEY).email;
        // Check if user exists
        User.updateOne({ email: originemail }, {
            $set: { avatar: filename }
        }).then(() => { console.log('update is successfully') })
        // Check if password is correct
        let user = await User.findOne({ email: originemail });
        res.status(200).json({ user: user })
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

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