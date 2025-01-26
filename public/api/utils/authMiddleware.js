import jwt from 'jsonwebtoken';

export function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization; // Authorization 헤더에서 토큰 추출
    const token = authHeader && authHeader.split(' ')[1]; // "Bearer <token>"에서 토큰만 추출

    if (!token) {
        return res.status(401).json({ message: '인증 토큰이 필요합니다.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // 토큰 검증
        req.user = decoded; // 검증된 사용자 정보 저장
        next(); // 다음 미들웨어로 이동
    } catch (error) {
        return res.status(403).json({ message: '유효하지 않은 토큰입니다.' });
    }
}
