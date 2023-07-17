import { NextApiRequest, NextApiResponse } from "next";
import Container from "../../../lib/Container"
import uuid from 'react-uuid';
import { db, query } from "lib/db";
import User from "lib/User";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        interface SndData {
            CurUser: User,
            UserUpdate: User
        };
        const data = req.body as SndData;
        if (data.CurUser.RoleId == 1 && data.UserUpdate.Login.trim().length > 0 && data.UserUpdate.RoleId) {
            if (data.UserUpdate.Password.trim().length > 0) {
                const checkLog: User[] = await query('SELECT * FROM containerdb.users where Login = ? && IdUsers != ?;', [data.UserUpdate.Login, data.UserUpdate.IdUsers]) as User[];
                if (checkLog && checkLog.length == 0) {
                    await query(`UPDATE containerdb.users
                    SET
                    Login = ?,
                    Password = ?,
                    FIO = ?,
                    RoleId = ?
                    WHERE IdUsers = ?;
                    `, [data.UserUpdate.Login, data.UserUpdate.Password, data.UserUpdate.FIO, data.UserUpdate.RoleId.toString(), data.UserUpdate.IdUsers]);
                    return res.status(200).json("ok");
                } else {
                    return res.status(200).json("Логин занят");
                }
            }
            else {
                const checkLog: User[] = await query('SELECT Login FROM containerdb.users where Login = ?;', [data.UserUpdate.Login]) as User[];
                if (checkLog && checkLog.length == 0) {
                    await query(`UPDATE containerdb.users
                    SET
                    Login = ?,
                    FIO = ?,
                    RoleId = ?
                    WHERE IdUsers = ?;
                    `, [data.UserUpdate.Login, data.UserUpdate.FIO, data.UserUpdate.RoleId.toString(), data.UserUpdate.IdUsers]);
                    return res.status(200).json("ok");
                }
                else {
                    return res.status(200).json("Логин занят");
                }
            }
        }
    }
    else {
        res.status(405).json({ message: "Метод не позволителен" });
        return;
    }
}