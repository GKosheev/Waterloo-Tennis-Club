import {Request, Response} from "express";
import User from "../models/user.model";
import Token from "../models/token.model";
import * as crypto from 'crypto'
import nodemailer from "nodemailer";
import config from "../config/config";
import Joi from 'joi'
import bcrypt from "bcrypt";

module.exports.forgotPassword = function (req: Request, res: Response) {
  const email = req.body.email

  User.findOne({"profile.email": email}, (err: any, user: any) => {
    if (err)
      return res.status(500).send({error: err})
    if (!user)
      return res.status(400).send({error: 'User with such email does not exist.'})

    let token = new Token({_userId: user._id, token: crypto.randomBytes(20).toString('hex')})
    token.save((err) => {
      if (err)
        return res.status(500).send({error: err.message})

      let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: config.email,
          pass: config.password
        }
      })

      const mailOptions = {
        from: config.email,
        to: user.profile.email,
        subject: 'Account Verification Link',
        text: 'Hello ' + user.profile.firstName + ',\n\n' + 'Please reset your password by clicking the link: \nhttp:\/\/' + 'localhost:4200'/*req.headers.host*/ + '\/#' + '\/reset-password\/' + user.profile.email + '\/' + token.token + '\n\nThank You!\n'
      }

      let sendMailResponse = transporter.sendMail(mailOptions)
      if (!sendMailResponse) {
        res.status(300).json({error: 'Send Mail error'})
      }
      res.status(200).json({message: 'Check your email to validate your account'})

    })
  })
}

module.exports.resetPassword = async function (req: Request, res: Response) {
  let email: string = req.params.email
  let token: string = req.params.token
  let password: string = req.body.password

  let joiObject = Joi.object({
    email: Joi.string().email().required(),
    token: Joi.string().min(40).max(40).required(),
    password: Joi.string().required().regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/)
  })

  const validationResult = await joiObject.validate({
    email: email,
    token: token,
    password: password
  })
  if (validationResult.error)
    return res.status(400).json({error: validationResult.error.message})

  await User.findOne({"profile.email": email}, (err: any, user: any) => {
    if (!user)
      return res.status(400).send({error: 'User with such Email does not exist. Please SignUp.'})

    Token.findOne({_userId: user._id, token: token}, (err: any, token: any) => {
      if (!token)
        return res.status(400).send({error: 'Token has been expired, please click resend button', resend: true})

      token.delete()
      user.hashedPassword = bcrypt.hashSync(password, 10)
      user.save()

      return res.status(200).json({message: "Password has been changed"})
    })
  })
}
