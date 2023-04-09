import { NextApiHandler } from 'next'
import { query } from '../../../../lib/db'
import ISubstance from "../../../../lib/Substance"

const handler: NextApiHandler = async (req, res) => {
    try {
        const { Id } = req.query;
        if (Id) {
            //Поиск вещества по id
            const results = await query(
                `SELECT substance.* FROM substance join substcont 
                on substance.Id = substcont.SubstId where substcont.ContId = ?;`, [Id.toString()]
            ) as ISubstance[];
            return res.status(200).json(results);
        }
    } catch (e) {
        if (e instanceof Error)
            res.status(500).json({ message: e.message });
    }
}

export default handler