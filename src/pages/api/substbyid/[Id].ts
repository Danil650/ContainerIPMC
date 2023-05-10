import { NextApiHandler } from 'next'
import { query } from '../../../../lib/db'
import ISubstance from "../../../../lib/Substance"

const handler: NextApiHandler = async (req, res) => {
    try {
        const { Id } = req.query;
        if (Id) {
            //Поиск вещества по id
            const results = await query(
                `SELECT * FROM 
            containerdb.substance
            Where id = ? ;`, [Id.toString()]
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