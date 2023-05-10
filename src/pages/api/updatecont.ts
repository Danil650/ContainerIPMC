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
        if (data.cont.Name && data.cont.Name != "") {
            if (data.cont.Id != "0") {
                try {
                    await query(`UPDATE containerdb.contwthcont SET \`Name\` = ? WHERE Id = ?;`, [data.cont.Name, data.cont.Id]);
                    res.status(200).json({ success: true });

                } catch (error) {
                    console.error(error);
                    res.status(500).json({ success: false, error: "Internal server error" });
                }
            }
            else {
                try {
                    const now = new Date().toISOString().slice(0, 10).replace('T', ' ');
                    await query(
                        `INSERT INTO containerdb.contwthcont (Id, ExcelId, ContainsIn, \`Name\`, DateCreate) 
                        VALUES (?, ?, ?, ?, ?);`, [uuid(), data.cont.ExcelId, data.cont.ContainsIn ?? "", data.cont.Name, now ]
                    )
                    res.status(200).json({ success: true });
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