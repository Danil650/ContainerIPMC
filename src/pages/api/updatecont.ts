import { NextApiRequest, NextApiResponse } from "next";
import Container from "../../../lib/Container"
import uuid from 'react-uuid';
import { db, query } from "lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        interface SendData {
            cont: Container,
            user: string
        }
        const data = req.body as SendData;
        console.log(data);
        if (data.cont.Name && data.cont.Name != "") {
            if (data.cont.Id != "0") {
                try {
                    let OldCont = await query(`SELECT Name FROM containerdb.contwthcont where contwthcont.Id = ?;`, [data.cont.Id]) as string;
                    await db.transaction().
                        query(`UPDATE containerdb.contwthcont
                    SET
                    \`Name\` = ?
                    WHERE Id = ?;`, [data.cont.Name, data.cont.Id]).commit().then(async () => await query(`INSERT INTO containerdb.substjournal (idSubstJournal, UserId, \`Description\`, DataChange, ActionType)
                    VALUES (?, 
                    (SELECT users.IdUsers FROM users WHERE users.UserToken = ?),
                    concat("изменил контейнер с ? на контейнер " , (SELECT Name FROM contwthcont WHERE Id = ?)),
                    NOW(),
                    2);`, [uuid(), data.user, OldCont[0], data.cont.Id]))

                    res.status(200).json({ success: true });

                } catch (error) {
                    console.error(error);
                    res.status(500).json({ success: false, error: "Internal server error" });
                }
            }
            else {
                let IdToPut = uuid();
                try {
                    const results = await query(
                        `INSERT INTO containerdb.contwthcont
                        (Id,
                        ExcelId,
                        ContainsIn,
                        \`Name\`)
                        VALUES
                        (?,
                        ?,
                        ?,
                        ?);`, [IdToPut, data.cont.ExcelId, data.cont.ContainsIn ?? "", data.cont.Name]

                    )

                    //Запись в журнал
                    await query(
                        `INSERT INTO containerdb.substjournal
                                    (idSubstJournal,
                                    UserId,
                                    \`Description\`,
                                    DataChange,
                                    ActionType)
                                    VALUES
                                    (?,
                                    (select users.IdUsers from users where users.UserToken = ?),
                                    "добавил контейнер с Id = ? и названием = ?",
                                    NOW(),1);`, [uuid(), data.user, IdToPut, data.cont.Name]
                    )

                    res.status(200).json({ success: true, data: results });
                } catch (error) {
                    console.error(error);
                    res.status(500).json({ success: false, error: "Internal server error" });
                }
            }
        }
    }
    else {
        res.status(405).json({ message: "Метод не позволителен" });
        return;
    }
}