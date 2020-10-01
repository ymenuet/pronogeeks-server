exports.catchErrors = controller => (req, res, next) => controller(req, res).catch(next)

exports.ensureLogin = (req, res, next) => {
    if (req.user) next();
    else res.status(401).json({
        message: 'Please connect to a user account.'
    })
}

exports.checkRole = roles => (req, res, next) => {
    if (roles.includes(req.user.role)) next()
    else res.status(401).json({
        message: 'You are not authorized for executing this action.'
    })
}