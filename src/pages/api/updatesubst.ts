import { NextApiRequest, NextApiResponse } from "next";
import Substance from "../../../lib/Substance"
import uuid from 'react-uuid';
import { query } from "lib/db";
import { json } from "stream/consumers";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        interface SendDate {
            Subst: Substance,
            user:string
        }
        const data = req.body as SendDate;
        
        if (data.Subst.SubstName && data.Subst.SubstName != "") {
            if (data.Subst.Id != "0") {
                try {
                    let subst = await query("SELECT * FROM containerdb.substance where Id = ?;",data.Subst.Id) as string;
                    const results = await query(
                        `UPDATE containerdb.substance
                          SET
                          SubstName = ?,
                          CAS = ?,
                          Meaning = ?,
                          Mass = ?,
                          Formula = ?,
                          Investigated = ?,
                          \`Left\` = ?,
                          URL = ?
                          WHERE Id = ?;`, [data.Subst.SubstName, data.Subst.CAS ?? "", data.Subst.Meaning ?? "", data.Subst.Mass ?? "", data.Subst.Formula ?? "", data.Subst.Investigated, data.Subst.Left, data.Subst.URL ?? "", data.Subst.Id]
                    ).then(()=>{
                        query(`INSERT INTO containerdb.substjournal (idSubstJournal, UserId, \`Description\`, DataChange, ActionType)
                        VALUES (?, 
                        (SELECT users.IdUsers FROM users WHERE users.UserToken = ?),
                        concat("изменил хим. вещество с ? на ?"),
                        NOW(),
                        2);`, [uuid(), data.user, subst[0],JSON.stringify(data.Subst)])
                    })
                    res.status(200).json({ success: true});
                } catch (error) {
                    console.error(error);
                    res.status(500).json({ success: false, error: "Internal server error" });
                }
            }
            else {
                try {
                    const results = await query(
                        `INSERT INTO containerdb.substance (Id, SubstName, CAS, Meaning, Mass, Formula, Investigated, \`Left\`, URL)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`, [uuid(), data.Subst.SubstName, data.Subst.CAS ?? "", data.Subst.Meaning ?? "", data.Subst.Mass ?? "", data.Subst.Formula ?? "", data.Subst.Investigated, data.Subst.Left, data.Subst.URL ?? ""]
                    ).then(()=>{
                        query(`INSERT INTO containerdb.substjournal (idSubstJournal, UserId, \`Description\`, DataChange, ActionType)
                        VALUES (?, 
                        (SELECT users.IdUsers FROM users WHERE users.UserToken = ?),
                        concat("добавил хим. вещество ?"),
                        NOW(),
                        1);`, [uuid(), data.user,JSON.stringify(data.Subst)])
                    })
                    res.status(200).json({ success: true, data: results });
                } catch (error) {
                    console.error(error);
                    if (error instanceof Error)
                        res.status(500).json({ message: error.message })
                }
            }

        }



    }
    else {
        res.status(405).json({ message: "Метод не позволителен" });
        return;
    }
}