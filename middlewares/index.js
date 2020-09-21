exports.catchErrors = controller => (req, res, next) => controller(req, res).catch(next)

exports.ensureLogin = (req, res, next) => {
    if (req.user) next();
    else res.status(401).json({
        message: 'Please connect to a user account.'
    })
}

exports.checkRole = role => (req, res, next) => {
    if (req.user.role === role) next()
    else res.status(401).json({
        message: 'You are not authorized for executing this action.'
    })
}