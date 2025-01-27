import connectDB from './utils/db.js';
import Data from './utils/DataModel.js';
import { authenticateToken } from './utils/authMiddleware.js';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            authenticateToken(req, res, async () => {
                const userId = req.user.userId; // JWT에서 userId 가져오기

                if (!userId) {
                    return res.status(400).json({ message: '유효하지 않은 사용자입니다.' });
                }

                await connectDB();

                const data = await Data.find({ userId });

                if (data.length === 0) {
                    return res.status(404).json({ message: '저장된 데이터가 없습니다.' });
                }
                
                console.log('불러온 데이터:', data);
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
