import { NextApiHandler } from 'next'
import { query } from '../../../../lib/db'

const handler: NextApiHandler = async (req, res) => {
    try {
        const { token } = req.query;
        if (token) {
            //Поиск вещества по id
            const results = await query(
                `SELECT IdUsers,RoleId FROM containerdb.users where UserToken = ?;`,
                [token.toString()]
            );
            res.json(results);
        }
        res.status(500);
    } catch (e) {
        if (e instanceof Error)
            res.status(500).json({ message: e.message });
    }
}
export default handler
