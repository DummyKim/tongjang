import connectDB from './utils/db.js';
import User from './utils/UserModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: '이메일과 비밀번호를 입력하세요.' });
        }

        try {
            await connectDB();

            // 사용자 찾기
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(401).json({ message: '이메일 또는 비밀번호가 일치하지 않습니다.' });
            }

            // 비밀번호 검증
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({ message: '이메일 또는 비밀번호가 일치하지 않습니다.' });
            }

            // JWT 생성
            const token = jwt.sign(
                { userId: user._id, email: user.email },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            res.status(200).json({ message: '로그인 성공', token });
        } catch (error) {
            console.error('로그인 오류:', error.message);
            res.status(500).json({ message: '서버 오류가 발생했습니다.' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).json({ message: '허용되지 않은 메서드입니다.' });
    }
}
