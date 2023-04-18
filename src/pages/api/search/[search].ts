import { NextApiHandler } from 'next'
import { query } from '../../../../lib/db'
import Container from 'lib/Container';
import Substance from 'lib/Substance';

const handler: NextApiHandler = async (req, res) => {
    try {
        interface SendData {
            cont : Container[],
            subst: Substance[]
        }
        const { search } = req.query;
        if (search) {
            //Поиск вещества по id
            let Cont;
            const Subst = await query(
                `SELECT * FROM containerdb.contwthcont where Name like "%?%";`,
                [search.toString()]
            ).then(async (Cont) => {
                Cont = await query(
                    `SELECT * FROM containerdb.contwthcont where Name like "%?%";`,
                    [search.toString()])
            });
            let sndDate = {
                Cont: Cont,
                Subst : Subst
            };
            return res.json(sndDate);
        }
        res.status(500);
    } catch (e) {
        if (e instanceof Error)
            res.status(500).json({ message: e.message });
    }
}
export default handler
