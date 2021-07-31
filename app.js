const express = require("express");
const morgan = require("morgan");
const dotenv = require("dotenv");
const colors = require("colors");
const cors = require("cors");
const connectDB = require("./config/db");
const Token = require('./model/Token')
var twilio = require('twilio');
const User = require("./model/User");
const bcrypt = require("bcrypt");
const bodyParser = require('body-parser')


const app = express();
app.use(morgan("dev"));
app.use(cors());
// app.use(express.json({ extended: false }));
app.use(bodyParser.urlencoded({ extended: false }))
dotenv.config({ path: "config/config.env" });

connectDB();
const PORT = process.env.PORT || 3001;

app.use(express.static(__dirname + '/public'))

var accountSid = 'ACbc1da315d4d806563ee930894998328a'; // Your Account SID from www.twilio.com/console
var authToken = 'ea0a5ee0a70ef2cb9e61129c5894c91d';


app.post('/verify', async (req, res, next) => {
    console.log("🚀 ~ file: app.js ~ line 31 ~ app.post ~ req", req.body)

    try {
        var client = new twilio(accountSid, authToken);
        let code = Math.floor(100000 + Math.random() * 900000)

        const isAlreadySent = await Token.find({ phone: req.body.code + req.body.phn })

        if (isAlreadySent.length == 0) {
            let obj = {
                phone: req.body.code + req.body.phn,
                token: code
            }

            let tmsg = await client.messages.create({
                body: `Verification code is ${code}`,
                to: req.body.code + req.body.phn,  // Text this number
                from: '+13124677610' // From a valid Twilio number
            })
            console.log("🚀 ~ file: app.js ~ line 50 ~ app.post ~ tmsg", tmsg)

            await Token.create(obj)
            return res.status(200).json({ success: true })
        }

        return res.status(409).json({ success: false, })

    } catch (error) {
        console.log("🚀 ~ file: app.js ~ line 30 ~ app.post ~ error", error)

    }

})




app.post('/register', async (req, res, next) => {

    try {
        let userToken = await Token.findOne({ phone: req.body.phoneCode + req.body.phone })


        if (req.body.verifyCode !== userToken.token) {
            return res.status(400).json({ success: false })
        }





        let obj = {
            phone: req.body.phoneCode + req.body.phone,
            username: req.body.username,
            email: req.body.email,
            plainPassword: req.body.psw,
        }

        const salt = await bcrypt.genSalt(10);
        obj.password = await bcrypt.hash(obj.plainPassword, salt);



        await User.create(obj)
        await Token.findOneAndDelete({ phone: req.body.phoneCode + req.body.phone })
        res.status(200).json({ success: true, msg: "Signup has been completed" })
    } catch (error) {
        console.log("🚀 ~ file: app.js ~ line 30 ~ app.post ~ error", error)

    }

})


app.post('/login', async (req, res, next) => {

    try {
        const {email,password} = req.body
        console.log("🚀 ~ file: app.js ~ line 109 ~ app.post ~ req.body", req.body)
        let user = await User.findOne({ email })


        if (!user || !email || !password) {
            return res.status(400).json({ success: false, msg: " Invalid Credentials" })
        }

        const isMatch = await bcrypt.compare(
            password,
            user.password
          );
    
          if (!isMatch) {
            return res.status(400).json({ success: false, msg: " Invalid Credentials" })
          }



        res.status(200).json({ success: true, msg: "Successfully Login" })
    } catch (error) {
        console.log("🚀 ~ file: app.js ~ line 30 ~ app.post ~ error", error)

    }

})

app.listen(PORT, () => {
    console.log(
        `Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow
            .bold
    );
});
