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
            let SubstFromDel = await query(
                `SELECT * FROM containerdb.substance where Id = ?;`,
                [data.del.toString()]);
            let ContFromDel = await query(
                `SELECT ContId FROM containerdb.substcont where SubstId = ?;`,
                [data.del.toString()]);
            db.transaction()
                .query(`DELETE FROM containerdb.substcont WHERE SubstId = ?;`, [data.del.toString()])
                .query(`INSERT INTO containerdb.substjournal (idSubstJournal, UserId, \`Description\`, DataChange, ActionType) VALUES (?, (SELECT users.IdUsers FROM users WHERE users.UserToken = ?), concat("удалил хим. вещество ? из контейнера ? "), NOW(), 3);`, [uuid(), data.user, JSON.stringify(SubstFromDel), JSON.stringify(ContFromDel)])
                .rollback((e: any) => { return res.status(300).send(e); })
                .commit();

            return res.status(200).json({ message: 'Ok' });
        }
        return res.status(500).json({ message: 'Не удаление' });
    } catch (e) {
        if (e instanceof Error)
            return res.status(500).json({ message: e.message });
    }
}
export default handler
