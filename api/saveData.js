import connectDB from './utils/db.js';
import Data from './utils/DataModel.js';
import { authenticateToken } from './utils/authMiddleware.js';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            authenticateToken(req, res, async () => {
                const { data } = req.body;
                const userId = req.user.userId; // JWT에서 추출

                if (!userId || !data || !Array.isArray(data)) {
                    return res.status(400).json({ message: '필수 데이터가 누락되었습니다.' });
                }

                const invalidData = data.filter((item) => !item.name || item.name.trim() === '');
                if (invalidData.length > 0) {
                    return res.status(400).json({ message: '항목 이름(name)은 필수입니다.' });
                }

                await connectDB();

                // 기존 데이터를 모두 삭제하고 새로 저장
                await Data.deleteMany({ userId });
                const savedData = await Data.insertMany(
                    data.map((item) => ({ ...item, userId }))
                );

                res.status(201).json({ message: '데이터가 저장되었습니다.', data: savedData });
            });
        } catch (error) {
            console.error('데이터 저장 오류:', error);
            res.status(500).json({ message: '서버 오류가 발생했습니다.' });
        }
    } else {
        res.status(405).json({ message: '허용되지 않은 메서드입니다.' });
    }
}
