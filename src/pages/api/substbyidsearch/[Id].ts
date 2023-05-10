import { NextApiHandler } from 'next'
import { query } from '../../../../lib/db'
import SubstCont from "../../../../lib/SubstContainer"

const handler: NextApiHandler = async (req, res) => {
    try {
        const { Id } = req.query;
        if (Id) {
            const results = await query(
                `SELECT ContId FROM containerdb.substcont where SubstId = ?;`, [Id.toString()]
            ) as SubstCont[];
            return res.json(results);

        }
    } catch (e) {
        if (e instanceof Error)
            res.status(500).json({ message: e.message });
    }
}

export default handler