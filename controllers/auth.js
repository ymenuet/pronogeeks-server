const passport = require("passport");
const User = require("../models/User");
const Pronogeek = require("../models/Pronogeek");

const transporter = require("../config/mailer");

const { userPopulator } = require("../utils/populators");

// Bcrypt to encrypt passwords
const { genSaltSync, hashSync } = require("bcryptjs");

const bcryptSalt = 12;

const {
  emailFormatter,
  doesUsernameExist,
  generateRandomToken,
} = require("../utils/helpers");

const { profileFilter } = require("../utils/constants");

exports.signupProcess = async (req, res, next) => {
  const { email: emailNotFormatted, username, password } = req.body;
  let photo = req.body.photo;

  const email = emailFormatter(emailNotFormatted);

  if (!username || !password || !email)
    return res.status(401).json({
      message: {
        en: "Please indicate correct email, username and password",
        fr: `Merci de compléter les champs du pseudo, de l'email et du mot de passe.`,
      },
    });

  if (!photo)
    photo =
      "https://res.cloudinary.com/dlyw9xi3k/image/upload/v1601160365/pronogeeks/default-profile-pic.jpg";

  const user = await User.findOne({
    email,
  });

  if (user)
    return res.status(401).json({
      message: {
        en: "Something went wrong. Try again with another email.",
        fr: `Échec lors de la création du compte. Essaye peut-être avec un autre email.`,
      },
    });

  const usernameExists = await doesUsernameExist(username);

  if (usernameExists)
    return res.status(401).json({
      message: {
        en: "Please indicate a unique username.",
        fr: "Ce pseudo est déjà utilisé, trouves-en un plus original !",
      },
    });

  const hashPass = hashSync(password, genSaltSync(bcryptSalt));

  const confirmToken = generateRandomToken(30);

  const newUser = await User.create({
    email,
    username,
    photo,
    confirmToken,
    password: hashPass,
    geekLeagues: [],
    friends: [],
    seasons: [],
  }).catch((err) =>
    res.status(500).json({
      message: {
        en: "Something went wrong on the server side.",
        fr: `Il y a eu un problème du côté du server.`,
      },
    })
  );

  await transporter.sendMail({
    from: "Pronogeeks <no-reply@pronogeeks.com>",
    to: email,
    subject: "Validation de ton compte Pronogeeks",
    html: `
        <h2>Bienvenue sur Pronogeeks, ${username} !</h2>
        <p>Avant de commencer à pronogeeker, merci de confirmer ton email en cliquant sur ce <a href='${process.env.FRONTENDPOINT}/confirm-account/${newUser._id}/${newUser.confirmToken}'>lien</a>.</p>
        `,
  });

  res.status(200).json({
    message: {
      en: "User created successfully.",
      fr: `Nouvel utilisateur créé.`,
    },
  });
};

exports.loginProcess = async (req, res, next) => {
  passport.authenticate("local", (err, user, failureDetails) => {
    if (err)
      return res.status(500).json({
        message: {
          en: "Something went wrong with the authentication.",
          fr: `Il y a eu un problème lors de l'authentification.`,
        },
      });

    if (!user) return res.status(401).json(failureDetails);

    req.login(user, (err) => {
      if (err)
        return res.status(500).json({
          message: {
            en: "Session save went bad.",
            fr: "La sauvegarde de la session a échoué.",
          },
        });
      res.status(200).json(user);
    });
  })(req, res, next);
};

exports.logout = (req, res) => {
  req.logout();
  res.status(200).json({
    message: {
      en: "User logged out.",
      fr: "Utilisateur déconnecté.",
    },
  });
};

exports.getCurrentUser = (req, res) => {
  res.status(200).json({
    user: req.user,
  });
};

exports.editProfileProcess = async (req, res) => {
  const { username } = req.body;
  if (!username)
    return res.status(401).json({
      message: {
        en: "Please indicate a username",
        fr: "Tu ne peux pas sauvegarder ton profil sans pseudo.",
      },
    });
  const existingUsername = await doesUsernameExist(username);
  if (existingUsername)
    return res.status(401).json({
      message: {
        en: "Please indicate a unique username",
        fr: "Ce pseudo est déjà utilisé, trouves-en un plus original !",
      },
    });
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      username,
    },
    {
      new: true,
    }
  )
    .populate(userPopulator)
    .select(profileFilter)
    .catch((err) => {
      res.status(500).json({
        message: {
          en: "Something went wrong in the server.",
          fr: `Il y a eu un problème du côté du server.`,
        },
      });
    });
  res.status(200).json({
    user,
  });
};

exports.editPhoto = async (req, res) => {
  const { photo } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      photo,
    },
    {
      new: true,
    }
  )
    .populate(userPopulator)
    .select(profileFilter)
    .catch((err) => {
      res.status(500).json({
        message: {
          en: "Something went wrong in the server.",
          fr: `Il y a eu un problème du côté du server.`,
        },
      });
    });
  res.status(200).json({
    user,
  });
};

exports.facebookLogin = passport.authenticate("facebook", {
  scope: ["email"],
});

exports.facebookCallback = (req, res, next) => {
  passport.authenticate(
    "facebook",
    {
      scope: ["email"],
    },
    (err, user, info) => {
      if (err)
        return res.status(500).json({
          err,
          info,
        });
      if (!user)
        return res.status(401).json({
          err,
          info,
        });
      req.login(user, (error) => {
        if (error)
          return res.status(401).json({
            error,
          });
        return res.redirect(`${process.env.FRONTENDPOINT}/?status=success`);
      });
    }
  )(req, res, next);
};

exports.googleLogin = passport.authenticate("google", {
  scope: ["profile", "email"],
});

exports.googleCallback = (req, res, next) => {
  passport.authenticate(
    "google",
    {
      scope: ["email"],
    },
    (err, user, info) => {
      if (err)
        return res.status(500).json({
          err,
          info,
        });
      if (!user)
        return res.status(401).json({
          err,
          info,
        });
      req.login(user, (error) => {
        if (error)
          return res.status(401).json({
            error,
          });
        return res.redirect(`${process.env.FRONTENDPOINT}/profile`);
      });
    }
  )(req, res, next);
};

exports.confirmUser = async (req, res) => {
  const { userID, confirmToken } = req.params;

  const userConfirmed = await User.findOneAndUpdate(
    {
      _id: userID,
      confirmToken,
    },
    {
      confirmed: true,
    },
    {
      new: true,
    }
  );

  if (!userConfirmed)
    return res.status(401).json({
      message: {
        en: `This link is not valid. Try to connect to your account.`,
        fr: `Ce lien n'est pas valable. Essaye de te connecter à ton compte.`,
      },
    });

  res.status(200).json({
    message: {
      en: "Email confirmed.",
      fr: "Email confirmé.",
    },
    username: userConfirmed.username,
  });
};

exports.resetPwd = async (req, res) => {
  const { email: emailNotFormatted } = req.body;
  const email = emailFormatter(emailNotFormatted);
  if (!email)
    return res.status(401).json({
      message: {
        en: "Please enter an email.",
        fr: "Merci de renseigner un email.",
      },
    });

  const renewToken = generateRandomToken(30);
  const user = await User.findOne({
    email,
  });
  if (!user)
    return res.status(401).json({
      message: {
        en: "This email is not linked to any account. Try another one or create a new account !",
        fr: "Aucun compte lié à cet email. Essaye avec un autre email ou crée-toi un compte !",
      },
    });
  if (user.googleID)
    return res.status(401).json({
      message: {
        en: `You created your account using Google. Use it to connect to your account.`,
        fr: `Tu as créé ton compte avec Google. Utilise Google pour te connecter.`,
      },
    });
  if (user.facebookID)
    return res.status(401).json({
      message: {
        en: `You created your account using Facebook. Use it to connect to your account.`,
        fr: `Tu as créé ton compte avec Facebook. Utilise Facebook pour te connecter.`,
      },
    });
  user.renewToken = renewToken;
  await user.save();
  await transporter.sendMail({
    from: "Pronogeeks <no-reply@pronogeeks.com>",
    to: email,
    subject: "Changement du mot de passe de ton compte",
    html: `
        <h2>Salut ${user.username} !</h2>
        <p>Pour changer ton mot de passe, clique sur ce <a href='${process.env.FRONTENDPOINT}/reset-pwd/${user._id}/${user.renewToken}'>lien</a>.</p>
        `,
  });
  res.status(200).json({
    message: {
      en: "Mail to renew password sent.",
      fr: "Mail pour renouvellement de mot de passe envoyé.",
    },
  });
};

exports.updatePwd = async (req, res) => {
  const { userID, renewToken } = req.params;
  const { password } = req.body;
  const hashPass = hashSync(password, genSaltSync(bcryptSalt));
  const user = await User.findOne({
    _id: userID,
  });
  if (!user || user.renewToken !== renewToken || !user.renewToken)
    return res.status(401).json({
      message: {
        en: `This link is not valid anymore. Please check if you did not receive a more recent email, or ask for a new one.`,
        fr: `Ce lien n'est plus valable. Vérifie si tu n'as pas reçu un lien plus récent, ou demandes-en un autre.`,
      },
    });
  user.renewToken = null;
  user.password = hashPass;
  await user.save();
  res.status(200).json({
    message: {
      en: "Password updated.",
      fr: "Mot de passe actualisé.",
    },
  });
};

exports.deleteUserAccount = async (req, res) => {
  const userID = req.user._id;
  const pronogeeksUser = await Pronogeek.find({
    geek: userID,
  });
  await Promise.all(
    pronogeeksUser.map(async (pronogeek) => await pronogeek.deleteOne())
  );
  await User.findByIdAndDelete(userID);
  res.status(200).json({
    message: {
      en: "User deleted.",
      fr: "Compte supprimé.",
    },
  });
};
