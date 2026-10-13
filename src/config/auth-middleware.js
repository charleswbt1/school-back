const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const token = req.cookies?.token;
    if (!token) {
        return res.status(401).json({
            message: 'Token requerido'
        });
    }

    try {
        const user = jwt.verify(
            token,
            process.env.JWT_SECRET
        );
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({
            message: 'Token inválido o expirado'
        });
    }
};

module.exports = authenticateToken;