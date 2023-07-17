import { NextApiHandler } from 'next'
import { db, query } from '../../../lib/db'
import uuid from 'react-uuid';
import Cookies from 'js-cookie';
import User from 'lib/User';

const handler: NextApiHandler = async (req, res) => {
    try {
        interface SndData {
            UserCreate: User,
            CurUser: User
        };
        const data = req.body as SndData;
        const checkLog: User[] = await query('SELECT Login FROM containerdb.users where Login = ?;', [data.UserCreate.Login]) as User[];
        console.log(data);

        if (checkLog && checkLog.length == 0 && data.UserCreate.RoleId) {
            await query(`INSERT INTO containerdb.users
            (IdUsers,
            Login,
            Password,
            FIO,
            RoleId
            )
            VALUES
            (?,
            ?,
            ?,
            ?,
            ?);`, [uuid(), data.UserCreate.Login, data.UserCreate.Password, data.UserCreate.FIO, data.UserCreate.RoleId]);
            return res.status(200).json('Ok');
        }
        else {
            return res.status(200).json("Логин занят");
        }

    } catch (e) {
        if (e instanceof Error) {
            console.log(e);
            return res.status(500).json({ message: e.message });
        }
    }
}
export default handler
