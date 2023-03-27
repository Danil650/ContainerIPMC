import { NextApiHandler } from 'next'
import { query } from '../../../../lib/db'
import ISubstance from "../../../../lib/Substance"

const handler: NextApiHandler = async (req, res) => {
    try {
        const { del } = req.query;
        if (del) {
            //Поиск вещества по id
            const results = await query(
                `DELETE FROM containerdb.substance WHERE Id = ?;`,
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
