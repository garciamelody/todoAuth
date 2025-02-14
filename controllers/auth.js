const passport = require('passport')
const validator = require('validator')
const User = require('../models/User')
exports.getLogin = (req, res) => {
  if (req.user) {
    return res.redirect('/todos')
  }
  res.render('login', {
    title: 'Login'
  })
}
// this will render the security question page if the first login attempt fails
 exports.getSecurityQuestion = (req, res) => {
    if (req.user) {
      return res.redirect('/todos')
    }
    res.render('securityQuestion', {
      title: 'Security Question'
    })
  }
  
  exports.postLogin = (req, res, next) => {
    const validationErrors = []
    if (!validator.isEmail(req.body.email)) validationErrors.push({ msg: 'Please enter a valid email address.' })
    if (validator.isEmpty(req.body.password)) validationErrors.push({ msg: 'Password cannot be blank.' })
    // if (validator.isEmpty(req.body.qAnswer)) validationErrors.push({ msg: 'Security answer cannot be blank.' })--- Wrong section, maybe used for secQ sign-in
  
    if (validationErrors.length) {
      req.flash('errors', validationErrors)
      // redirecting to security question page instead of just the plain login page
      return res.redirect('/securityQuestion')
    }
    req.body.email = validator.normalizeEmail(req.body.email, { gmail_remove_dots: false })
  
    passport.authenticate('local', (err, user, info) => {
      if (err) { return next(err) }
      if (!user) {
        req.flash('errors', info)
        // redirecting to security question page instead of just the plain login page
        return res.redirect('/securityQuestion')
      }
      req.logIn(user, (err) => {
        if (err) { return next(err) }
        req.flash('success', { msg: 'Success! You are logged in.' })
        res.redirect(req.session.returnTo || '/todos')
      })
    })(req, res, next)
  }
  //This is what runs on the security login page, it's pretty much the same thing as the login page just a little different
  exports.secQLogin = (req, res, next) => {
    const validationErrors = []
    if (!validator.isEmail(req.body.email)) validationErrors.push({ msg: 'Please enter a valid email address.' })
    if (validator.isEmpty(req.body.password)) validationErrors.push({ msg: 'Password cannot be blank.' })
    if (validator.isEmpty(req.body.qAnswer)) validationErrors.push({ msg: 'Security answer cannot be blank.'})
    if (validationErrors.length) {
      req.flash('errors', validationErrors)
      return res.redirect('/securityQuestion')
    }
    req.body.email = validator.normalizeEmail(req.body.email, { gmail_remove_dots: false })
  
    passport.authenticate('local', (err, user, info) => {
      if (err) { return next(err) }
      if (!user) {
        req.flash('errors', info)
        return res.redirect('/securityQuestion')
      }
      req.logIn(user, (err) => {
        if (err) { return next(err) }
        req.flash('success', { msg: 'Success! You are logged in.' })
        res.redirect(req.session.returnTo || '/todos')
      })
    })(req, res, next)
  }
  exports.logout = (req, res, next) => {
    // req.logout() --- Passport update, this is now async
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/') //--- causes error later with the session destroy
    })
    // req.session.destroy((err) => {
    //   if (err) console.log('Error : Failed to destroy the session during logout.', err)
    //   req.user = null
    //   res.redirect('/')
    // })
  }
  
  exports.getSignup = (req, res) => {
    if (req.user) {
      return res.redirect('/todos')
    }
    res.render('signup', {
      title: 'Create Account'
    })
  }
  
  exports.postSignup = (req, res, next) => {
    const validationErrors = []
    if (!validator.isEmail(req.body.email)) validationErrors.push({ msg: 'Please enter a valid email address.' })
    if (!validator.isLength(req.body.password, { min: 8 })) validationErrors.push({ msg: 'Password must be at least 8 characters long' })
    if (req.body.password !== req.body.confirmPassword) validationErrors.push({ msg: 'Passwords do not match' })
    // if (validator.isEmpty(req.body.secQuestion)) validationErrors.push({ msg: 'Must select a security question.' })
    // if (validator.isEmpty(req.body.qAnswer)) validationErrors.push({ msg: 'Security answer cannot be blank.' })
  
    if (validationErrors.length) {
      req.flash('errors', validationErrors)
      return res.redirect('../signup')
    }
    req.body.email = validator.normalizeEmail(req.body.email, { gmail_remove_dots: false })
  
    const user = new User({
      // firstName: req.body.firstName,
      // lastName: req.body.lastName,
      userName: req.body.userName,
      email: req.body.email,
      password: req.body.password,
      // secQuestion: req.body.secQuestion,
      // qAnswer: req.body.qAnswer
    })
  
    User.findOne({$or: [
      {email: req.body.email},
      {userName: req.body.userName}
    ]}, (err, existingUser) => {
      if (err) { return next(err) }
      if (existingUser) {
        req.flash('errors', { msg: 'Account with that email address or username already exists.' })
        return res.redirect('../signup')
      }
      user.save((err) => {
        if (err) { return next(err) }
        req.logIn(user, (err) => {
          if (err) {
            return next(err)
          }
          res.redirect('/todos')
        })
      })
    })
  }