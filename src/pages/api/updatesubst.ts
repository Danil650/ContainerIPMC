import { NextApiRequest, NextApiResponse } from "next";
import Substance from "../../../lib/Substance"
import uuid from 'react-uuid';
import { db, query } from "lib/db";
import { json } from "stream/consumers";
import Decimal from "decimal.js";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        interface SendDate {
            Subst: Substance,
            user: string
        }
        const data = req.body as SendDate;
        if (data.Subst.SubstName && data.Subst.SubstName != "") {
            if (data.Subst.Id != "0") {
                try {
                    await query(`UPDATE containerdb.substance SET SubstName = ?, CAS = ?, Meaning = ?, Mass = ?, Formula = ?, Investigated = ?, \`Left\` = ?, URL = ?,  UnitId = ?, Passport = ? WHERE Id = ?;`,
                        [data.Subst.SubstName, data.Subst.CAS ?? "", data.Subst.Meaning ?? "", data.Subst.Mass.toString(), data.Subst.Formula ?? "", data.Subst.Investigated, data.Subst.Left, data.Subst.URL ?? "", data.Subst.UnitId, data.Subst.Passport, data.Subst.Id]);

                    res.status(200).json({ success: true });


                } catch (error) {
                    console.error(error);
                    res.status(300).json({ success: false, error: "Internal server error" });
                }
            }
            else {
                try {
                    const now = new Date().toISOString().slice(0, 10).replace('T', ' ');
                    await query(`INSERT INTO containerdb.substance (Id, SubstName, CAS, Meaning, Mass, Formula, Investigated, \`Left\`, URL, SubsCreateDate, UnitId ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
                        [uuid(), data.Subst.SubstName, data.Subst.CAS ?? "", data.Subst.Meaning ?? "", data.Subst.Mass.toString(), data.Subst.Formula ?? "", data.Subst.Investigated, data.Subst.Left, data.Subst.URL ?? "", now, data.Subst.UnitId]
                    );
                    res.status(200).json({ success: true });
                } catch (error) {
                    console.error(error);
                    if (error instanceof Error)
                        res.status(300).json("Измените название");
                }
            }

        }



    }
    else {
        res.status(405).json({ message: "Метод не позволителен" });
        return;
    }
}