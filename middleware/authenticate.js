const { verifyToken } = require('../utils/jwt');
const { ACCESS_TOKEN_SECRET } = process.env;

async function authenticateToken(req, res, next) {
	const authHeader = req.headers['authorization'];
	const token = authHeader && authHeader.split(' ')[1];

	if (!token) return res.sendStatus(401); // 토큰이 없는 경우

	try {
		const user = await verifyToken(token, ACCESS_TOKEN_SECRET);
		req.user = user; // 인증된 사용자 정보 저장
		next();
	} catch (error) {
		return res.sendStatus(403); // 토큰 검증 실패
	}
}

module.exports = authenticateToken;
