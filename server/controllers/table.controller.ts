import User from '../models/user.model'
import nodemailer from 'nodemailer'
import {Request, Response} from 'express'
import config from '../config/config'
import mongoose from 'mongoose'

module.exports.users = async (req: Request, res: Response) => {

  await User.find({}, (err, users) => {
    let userMap: any = [];
    users.forEach((user) => {
      userMap.push({
        id: user._id,
        user: {
          'fullName': user.profile.firstName + ' ' + user.profile.lastName,
          'phone': user.profile.phone,
          'email': user.profile.shareMyEmail ? user.profile.email : '-',
          'rating': user.profile.rating
        }
      })
    })
    res.status(200).json(userMap)
  })
}

module.exports.sendMessage = async function (req: Request, res: Response) {
  try {
    let id = mongoose.Types.ObjectId(req.body.id)
    let user = await User.collection.findOne({_id: id});
    if (!user) {
      res.status(300).json("UserDocument.ts not found")
    }
    let firstName = user?.profile.firstName
    let lastName = user?.profile.lastName
    let email = user?.profile.email

    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: config.email,
        pass: config.password
      }
    })
    const mailOptions = {
      from: `"${firstName} ${lastName}" <${email}>`,
      to: email,
      subject: req.body.subject,
      text: req.body.text
    }
    let sendMailResponse = await transporter.sendMail(mailOptions)
    if (!sendMailResponse) {
      res.status(300).json('Send Mail error')
    }
    res.status(200).json(sendMailResponse.response)
  } catch (error) {
    res.status(400).json(error)
  }
  /*
  Response if Error
  {
  "code": "EAUTH",
  "response": "535-5.7.8 Username and Password not accepted .....",
  "responseCode": 535,
  "command": "AUTH PLAIN"
  }
  */
}