import { NextApiHandler } from 'next'
import { query } from '../../../lib/db'
import uuid from 'react-uuid';
import Cookies from 'js-cookie';

const handler: NextApiHandler = async (req, res) => {
    try {
        interface SndDate {
            del:string,
            user:string
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
            const results = await query(
                `DELETE FROM containerdb.substcont
                WHERE SubstId = ?;`,
                [data.del.toString()]
            ).then(() => {
                query(`INSERT INTO containerdb.substjournal (idSubstJournal, UserId, \`Description\`, DataChange, ActionType)
                VALUES (?, 
                (SELECT users.IdUsers FROM users WHERE users.UserToken = ?),
                concat("удалил хим. вещество ? из контейнера ? "),
                NOW(),
                3);`, [uuid(), data.user, JSON.stringify(SubstFromDel), JSON.stringify(ContFromDel)])
            });
            res.status(200).send(results);
        }
        res.status(500);
    } catch (e) {
        if (e instanceof Error)
            res.status(500).json({ message: e.message });
    }
}
export default handler
