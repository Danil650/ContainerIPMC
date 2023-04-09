import { NextApiRequest, NextApiResponse } from "next";
import User from "lib/User";
import { query } from "lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        const data = req.body as User;
        try {
            const results = await query(
                `SELECT * FROM containerdb.users where Login = ? && \`Password\` = ?;`,[data.Login,data.Password]
            ) as User[];
            if (results.length == 1)
            {
                return res.status(200).json(results)
            }
            else
            {
                return res.status(405).json("Нету такого пользователя");
            }
          } catch (e) {
            if(e instanceof Error)
            res.status(500).json({ message: e.message })
          }
    }
    else {
        res.status(405).json({ message: "Метод не позволителен" });
        return;
    }
}