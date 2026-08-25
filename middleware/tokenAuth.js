const jwt = require('jsonwebtoken');
const secretKey = process.env.JWT_SECRET;

const verifyToken = (req, res, next) => {
    const authHeader = req.header('Authorization');

    if (!authHeader) {
        return res.status(401).json({
            message: 'Odmowa dostępu, brak tokenu'
        });
    }

    const token = authHeader.startsWith('Bearer ') 
        ? authHeader.split(' ')[1] 
        : authHeader;

    if (!token) {
        return res.status(401).json({
            message: 'Odmowa dostępu, błędna struktura tokenu'
        });
    }

    try {
        const decoded = jwt.verify(token, secretKey);
        req.user = decoded;

        next();
    } catch (err) {
        res.status(401).json({
            message: 'Niepoprawny lub wygasły token'
        });
    }
};

module.exports = verifyToken;