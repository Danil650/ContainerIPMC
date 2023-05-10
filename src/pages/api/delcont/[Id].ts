import { NextApiHandler } from 'next'
import { query } from '../../../../lib/db'
import uuid from 'react-uuid';
import Cookies from 'js-cookie';

const handler: NextApiHandler = async (req, res) => {
    try {
        const { Id } = req.query;
        if (Id) {
            //Поиск вещества по id
            const results = await query(
                `DELETE FROM containerdb.contwthcont
                WHERE ?;`,
                [Id.toString()]
            );
            res.status(200).send(results);
        }
        res.status(500);
    } catch (e) {
        if (e instanceof Error)
            res.status(500).json({ message: e.message });
    }
}
export default handler
