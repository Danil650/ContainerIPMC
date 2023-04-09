import { NextApiHandler } from 'next'
import { query } from '../../../../lib/db'

const handler: NextApiHandler = async (req, res) => {
    try {
        const { del } = req.query;
        if (del) {
            //Поиск вещества по id
            const results = await query(
                `DELETE FROM containerdb.substcont
                WHERE SubstId = ?;`,
                [del.toString()]
            );
            res.status(200).send(results);
        }
        res.status(500);
    } catch (e) {
        if (e instanceof Error)
            res.status(500).json({ message: e.message });
    }
}
export default handler
