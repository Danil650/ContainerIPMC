import { NextApiRequest, NextApiResponse } from "next";
import ExcelData from "../../../lib/ExcelData"
import Container from "../../../lib/Container"
import Substance from "../../../lib/Substance"
import SubstCont from "../../../lib/SubstContainer"
import uuid from 'react-uuid';
import { from } from 'linq-to-typescript'
import { query } from "lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        const data = req.body as Substance;
        if (data.SubstName && data.SubstName != "") {
            if (data.Id != "0") {
                try {
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
                          WHERE Id = ?;`, [data.SubstName, data.CAS ?? "", data.Meaning ?? "", data.Mass ?? "", data.Formula ?? "", data.Investigated, data.Left, data.URL ?? "", data.Id]
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
                        `INSERT INTO containerdb.substance
                        (Id,
                        SubstName,
                        CAS,
                        Meaning,
                        Mass,
                        Formula,
                        Investigated,
                        \`Left\`,
                        URL)
                        VALUES
                        (?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?);`, [uuid(), data.SubstName, data.CAS ?? "", data.Meaning ?? "", data.Mass ?? "", data.Formula ?? "", data.Investigated, data.Left, data.URL ?? ""]
                    )
                    res.status(200).json({ success: true, data: results });
                } catch (error) {
                    console.error(error);
                    if(error instanceof Error)
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