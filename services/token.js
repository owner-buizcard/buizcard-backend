
const JWT = require('jsonwebtoken');
const responser = require("../core/responser");

const accessTokenSecret = process.env.TOKEN_SECRET;

function generateTokens(userId) {
    const accessToken = JWT.sign({ sub: userId }, accessTokenSecret, { expiresIn: '7d' });
    const refreshToken = JWT.sign({ sub: userId }, accessTokenSecret, { expiresIn: '7d' });

    return { accessToken, refreshToken };
}

function generateResetToken(userId) {
  const token = JWT.sign({ sub: userId }, accessTokenSecret, { expiresIn: '1h' });
  return token;
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
      const token = generateTokens(userId);
      return responser.success(res, token, "AUTH_S001");
    } catch (error) {
      return responser.error(res, error, "AUTH_E001");
    }
}

module.exports = {
    generateTokens,
    verifyToken,
    getAccessToken,
    generateResetToken
}