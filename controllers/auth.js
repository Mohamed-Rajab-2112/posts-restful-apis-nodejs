const {validationResult} = require('express-validator')
const bcrypt = require('bcryptjs')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

exports.signup = (req, res, next) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()) {
        const error = new Error('Validation error, entered data is incorrect')
        error.statusCode = 422
        error.data = errors.array()
        throw error
    }
    const {email, name, password} = req.body
    bcrypt.hash(password, 12)
        .then(password => {
        const user = new User({
            email, name, password
        })
        return user.save()
        })
        .then(result => {
            res.status(201).json({
                message: 'User created!',
                userId: result._id
            })
        })
        .catch((err ) => {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err)
        })
}

exports.login = (req, res, next) => {
    const {email, password} = req.body
    let loadedUser
    User.findOne({email})
        .then(user => {
            if (!user) {
                const error = new Error('User with this email not found')
                error.statusCode = 401
                throw error
            }
            loadedUser = user
            return bcrypt.compare(password, user.password)
        })
        .then(isEqual => {
            if (!isEqual) {
               const error = new Error('Wrong password!')
               error.statusCode = 401
               throw error
            }
            const token = jwt.sign({
                email,
                userId: loadedUser._id.toString()
            }, 'secretKey', {
                expiresIn: '1h'
            })
            res.status(200).json({
                token, userId: loadedUser._id.toString()
            })
        })
        .catch((err ) => {
        if (!err.statusCode) {
            err.statusCode = 500
        }
        next(err)
    })
}