const jwt = require('jsonwebtoken');
const { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } = process.env;
// Access Token 생성
function createAccessToken(user) {
	return jwt.sign({ id: user._id }, ACCESS_TOKEN_SECRET, { expiresIn: '15m', issuer: 'sofa', subject: 'auth' });
}

// Refresh Token 생성
function createRefreshToken(user) {
	return jwt.sign({ id: user._id }, REFRESH_TOKEN_SECRET, { expiresIn: '7d', issuer: 'sofa', subject: 'auth' });
}

// 토큰 검증 함수
function verifyToken(token, secretKey) {
	return new Promise((resolve, reject) => {
		jwt.verify(token, secretKey, (err, decoded) => {
			if (err) return reject(err);
			resolve(decoded);
		});
	});
}

module.exports = {
	createAccessToken,
	createRefreshToken,
	verifyToken,
};
