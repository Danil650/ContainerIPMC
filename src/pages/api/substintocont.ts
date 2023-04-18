import { NextApiRequest, NextApiResponse } from "next";
import uuid from 'react-uuid';
import { query } from "lib/db";
import cookie from 'cookie';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        interface SendData {
            sub: string;
            con: string;
            cookieValue: string;
        }
        const data = req.body as SendData;
        console.log(req.body);
        try {
            const results = await query(
                `INSERT INTO containerdb.substcont (Id, SubstId, ContId)
                VALUES (?, ?, ?);`, [uuid(), data.sub, data.con]
            )
            //Запись в журнал
            query(
                `INSERT INTO containerdb.substjournal
                (idSubstJournal,
                UserId,
                \`Description\`,
                DataChange,
                ActionType)
                VALUES
                (?,
                (select users.IdUsers from users where users.UserToken = ?),
                CONCAT('Вставил свободное вещество ', (select substance.SubstName from substance where Id = ?), ' в контейнер ', (select contwthcont.Name from contwthcont where Id = ?)),
                NOW(),
                1);`, [uuid(), data.cookieValue, data.sub, data.con]
            )
            return res.json(results)
        } catch (e) {
            if (e instanceof Error)
                res.status(500).json({ message: e.message })
        }
    }
    else {
        res.status(405).json({ message: "Метод не позволителен" });
        return;
    }
}