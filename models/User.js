const bcrypt = require('bcrypt')
const mongoose = require('mongoose')

// const UserSchema = new mongoose.Schema({
//   userName: { type: String, unique: true },
//   email: { type: String, unique: true },
//   password: String
// })
const UserSchema = new mongoose.Schema({
  // firstName: { type: String, unique: true },
  // lastName: { type: String, unique: true },
  userName: { type: String, unique: true },
  email: { type: String, unique: true },
  password: String,
  // secQuestion: { type: String },
  // qAnswer: {type: String}
})


// Password hash middleware.
 
 UserSchema.pre('save', function save(next) {
  const user = this
  if (!user.isModified('password')) { return next() }
  bcrypt.genSalt(10, (err, salt) => {
    if (err) { return next(err) }
    bcrypt.hash(user.password, salt, (err, hash) => {
      if (err) { return next(err) }
      user.password = hash
      next()
    })
  })
})

// Attempt at sec pass hash

UserSchema.pre('save', function save(next) {
  const user = this
  if (!user.isModified('qAnswer')) { return next() }
  bcrypt.genSalt(10, (err, salt) => {
    if (err) { return next(err) }
    bcrypt.hash(user.qAnswer, salt, (err, hash) => {
      if (err) { return next(err) }
      user.qAnswer = hash
      next()
    })
  })
})


// Helper method for validating user's password.

UserSchema.methods.comparePassword = function comparePassword(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    cb(err, isMatch)
  })
}

UserSchema.methods.compareAnswer = function compareAnswer(candidateAnswer, cb) {
  bcrypt.compare(candidateAnswer, this.qAnswer, (err, isMatch) => {
    cb(err, isMatch)
  })
}

module.exports = mongoose.model('User', UserSchema)
