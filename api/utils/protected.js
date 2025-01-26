import { authenticateToken } from './utils/authMiddleware.js';

export default async function handler(req, res) {
    authenticateToken(req, res, () => {
        // 인증 성공 후 실행할 코드
        res.status(200).json({
            message: '인증된 사용자만 접근 가능합니다.',
            user: req.user, // 디코딩된 사용자 정보
        });
    });
}
