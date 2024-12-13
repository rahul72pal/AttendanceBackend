const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const teacherSchema = require('../models/user/teacherSchema');
const bcrypt = require('bcrypt');

// Configure the local strategy
passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    async (email, password, done) => {
      try {
        // Find the teacher by email
        const teacher = await teacherSchema.findOne({ email });
        if (!teacher) {
          return done(null, false, { message: 'No User Found Thsi Email' });
        }

        // Validate password
        try {
          const isMatch = await teacher.validatePassword(password);
          if (!isMatch) {
            return done(null, false, { message: 'Incorrect email or password.' });
          }
        } catch (error) {
          return done(error);
        }

        // Return the teacher if valid
        return done(null, teacher);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// Serialize user ID into session (optional, if using sessions)
// passport.serializeUser((user, done) => {
//   done(null, user._id);
// });

// // Deserialize user ID from session (optional, if using sessions)
// passport.deserializeUser(async (id, done) => {
//   try {
//     const teacher = await teacherSchema.findById(id);
//     done(null, teacher);
//   } catch (error) {
//     done(error);
//   }
// });

module.exports = passport;
