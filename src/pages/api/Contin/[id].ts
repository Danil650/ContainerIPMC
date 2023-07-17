import { NextApiHandler } from 'next'
import { query } from '../../../../lib/db'
import ISubstance from "../../../../lib/Substance"

const handler: NextApiHandler = async (req, res) => {
    try {
        const { id } = req.query;
        if (id) {
            //Поиск вещества по id
            const results = await query(
                `SELECT c.*, COUNT(c2.ContainsIn) AS ContQauntIn
                FROM containerdb.contwthcont c
                LEFT JOIN containerdb.contwthcont c2 ON c.Id = c2.ContainsIn
                WHERE c.ContainsIn = ?
                GROUP BY c.Id`,
                [id.toString()]
            );
            return res.json(results);
        }
        res.status(500);
    } catch (e) {
        if (e instanceof Error)
            res.status(500).json({ message: e.message });
    }
}
export default handler
