import connectDB from './utils/db.js';
import Data from './utils/DataModel.js';
import { authenticateToken } from './utils/authMiddleware.js';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            authenticateToken(req, res, async () => {
                const userId = req.user.userId;

                await connectDB();

                const data = await Data.find({ userId });
                res.status(200).json({ message: '데이터가 불러와졌습니다.', data });
            });
        } catch (error) {
            console.error('데이터 불러오기 오류:', error);
            res.status(500).json({ message: '서버 오류가 발생했습니다.' });
        }
    } else {
        res.status(405).json({ message: '허용되지 않은 메서드입니다.' });
    }
}
