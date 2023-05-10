import { NextApiRequest, NextApiResponse } from "next";
import User from "lib/User";
import { query } from "lib/db";
import cookie from 'cookie';
import uuid from "react-uuid";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        const data = req.body as User;
        try {
            if (data.Login.length > 0 && data.Password.length > 0) {
                console.log(true);
                const results = await query(
                    `SELECT * FROM containerdb.users where Login = ? && \`Password\` = ?;`, [data.Login, data.Password]
                ) as User[];
                console.log(results);
                if (results != null && results != undefined && results.length === 1) {
                    const sessionId = uuid();
                    await query(`UPDATE containerdb.users SET UserToken = ? WHERE IdUsers = ?;`, [sessionId, results[0].IdUsers]);
                    return res.status(200).json(sessionId)
                }
                else {
                    return res.status(300).json("Нету такого пользователя");
                }
            }
            else {
                console.log(data.IdUsers);
                const foundId = await query(`SELECT IdUsers, Login, FIO, RoleId FROM containerdb.users where IdUsers = ?;`, [data.IdUsers]);
                return res.status(200).json(foundId);
            }
        } catch (e) {
            if (e instanceof Error) {
                console.log(e);
                res.status(500).json({ message: e.message })
            }
        }
    }
    else {
        res.status(405).json({ message: "Метод не позволителен" });
        return;
    }
}