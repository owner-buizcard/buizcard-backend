
const JWT = require('jsonwebtoken');
const responser = require("../core/responser");

const accessTokenSecret = 'e913335d263a473e3d822d5c59b2f4116ea683d66660a7d2aa874c78bda03c0d';

function generateTokens(userId) {
    const accessToken = JWT.sign({ sub: userId }, accessTokenSecret, { expiresIn: '7d' });
    const refreshToken = JWT.sign({ sub: userId }, accessTokenSecret, { expiresIn: '7d' });

    return { accessToken, refreshToken };
}

function verifyToken(token) {
    try {
      const decoded = JWT.verify(token, accessTokenSecret);
      return decoded;
    } catch (error) {
      return null; 
    }
}

function getAccessToken(req, res) {
    const refreshToken = req.body.refreshToken;
    try {
      const decoded = verifyToken(refreshToken, accessTokenSecret);
      if (!decoded) {
        return responser.success(res, null, "AUTH_E001");
      } 
      const userId = decoded.sub;
      const { accessToken, refreshToken: newRefreshToken } = generateTokens(userId);
      return responser.success(res, {accessToken, newRefreshToken}, "AUTH_S001");
    } catch (error) {
      return responser.error(res, error, "AUTH_E001");
    }
}

module.exports = {
    generateTokens,
    verifyToken,
    getAccessToken
}