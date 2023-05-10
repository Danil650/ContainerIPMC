import { NextApiHandler } from 'next'
import { db, query } from '../../../lib/db'
import uuid from 'react-uuid';
import Cookies from 'js-cookie';

const handler: NextApiHandler = async (req, res) => {
    try {
        interface SndDate {
            del: string,
            user: string
        }

        const data = req.body as SndDate;
        if (data.del) {
            //Поиск вещества по id

            await query(`DELETE FROM containerdb.substcont WHERE SubstId = ?;`, [data.del.toString()]);

            return res.status(200).json({ message: 'Ok' });
        }
        return res.status(500).json({ message: 'Не удаление' });
    } catch (e) {
        if (e instanceof Error)
            return res.status(500).json({ message: e.message });
    }
}
export default handler
