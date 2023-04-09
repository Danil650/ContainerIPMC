import { NextApiHandler } from 'next'
import { query } from '../../../../lib/db'
import ISubstance from "../../../../lib/Substance"

const handler: NextApiHandler = async (req, res) => {
    try {
        const { Id } = req.query;
        if (Id) {
            //Поиск вещества по id
            const results = await query(
                `SELECT substance.* from substcont join substance on substcont.SubstId = substance.Id where ContId = ?;`, [Id.toString()]
            ) as ISubstance[];
            if (results.length > 0) {
                return res.json(results);
            } else {
                res.status(404).send('Substances not found');
            }
        }
    } catch (e) {
        if (e instanceof Error)
            res.status(500).json({ message: e.message });
    }
}

export default handler