import { NextApiRequest, NextApiResponse } from "next";
import ExcelData from "../../../lib/ExcelData"
import Container from "../../../lib/Container"
import Substance from "../../../lib/Substance"
import SubstCont from "../../../lib/SubstContainer"
import uuid from 'react-uuid';
import { from } from 'linq-to-typescript'
import { query } from "lib/db";
import Cookies from "js-cookie";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        const data = req.body as Container;
        console.log(data);
        if (data.Name && data.Name != "") {
            if (data.Id != "0") {
                try {
                    const results = await query(
                        `UPDATE containerdb.contwthcont
                        SET
                        \`Name\` = ?
                        WHERE Id = ?;`, [data.Name, data.Id]
                    )
                    res.status(200).json({ success: true, data: results });
                } catch (error) {
                    console.error(error);
                    res.status(500).json({ success: false, error: "Internal server error" });
                }
            }
            else {
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
                        ?);`, [uuid(), data.ExcelId, data.ContainsIn ?? "", data.Name]
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