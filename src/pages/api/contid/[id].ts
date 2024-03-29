import { NextApiHandler } from 'next'
import { query } from '../../../../lib/db'
import ISubstance from "../../../../lib/Substance"

const handler: NextApiHandler = async (req, res) => {
    try {
        const { id } = req.query;
        if (id) {
            //Поиск вещества по id
            const results = await query(
                `SELECT  *,(select Name from contwthcont where Id = Cont.ContainsIn) AS ContainsInName FROM containerdb.contwthcont AS Cont
                WHERE Id = ?
                GROUP BY ContainsIn;`,
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
