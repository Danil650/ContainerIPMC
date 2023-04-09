import { NextApiHandler } from 'next'
import { query } from '../../../../lib/db'
import ISubstance from "../../../../lib/Substance"

const handler: NextApiHandler = async (req, res) => {
    try {
        const { id } = req.query;
        if (id) {
            //Поиск вещества по id
            const results = await query(
                `select * from contwthcont where Id = ?;`,
                [id.toString()]
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
