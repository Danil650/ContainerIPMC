import { NextApiHandler } from 'next'
import { query } from '../../../../lib/db'
import Container from 'lib/Container';
import Substance from 'lib/Substance';

const handler: NextApiHandler = async (req, res) => {
    try {
        let { search } = req.query;
        if (search) {
            let str = "%" + search + "%";
            const cont = await query(`SELECT * FROM containerdb.contwthcont where Name like ?;`, [str.toString()]);
            const subst = await query(`SELECT * FROM containerdb.substance inner join substcont on substance.Id = substcont.SubstId where SubstName like ?;`, [str.toString()]);
            return res.json({cont,subst});
        }
        res.status(500);
    } catch (e) {
        if (e instanceof Error)
            res.status(500).json({ message: e.message });
    }
}
export default handler
