import { NextApiHandler } from 'next'
import { query } from '../../../../lib/db'

const handler: NextApiHandler = async (req, res) => {
    try {
        const { Id } = req.query;
        if (Id) {
            //Поиск вещества по id
            const results = await query(
                `SELECT substance.* FROM substance join substcont 
                on substance.Id = substcont.SubstId where substcont.SubstId = ?;`, [Id.toString()]
            );
            return res.status(200).json(results);
        }
        else {
            return res.status(300);
        }
    } catch (e) {
        if (e instanceof Error)
            res.status(500).json({ message: e.message });
    }
}
export default handler