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
                    const SearchName = `%${data.Subst.SubstName}%`
                    const SubstNameQuery = await query(`SELECT * FROM containerdb.substance where SubstName like ? && Id != ?;`, [SearchName, data.Subst.Id]);
                    const SubstNameRep: Substance[] = SubstNameQuery as Substance[];
                    if (SubstNameRep.length == 0) {
                        await query(`UPDATE containerdb.substance SET SubstName = ?, CAS = ?, Meaning = ?, Mass = ?, Formula = ?, Investigated = ?, \`Left\` = ?, URL = ?,  UnitId = ?, Passport = ? WHERE Id = ?;`,
                            [data.Subst.SubstName, data.Subst.CAS ?? "", data.Subst.Meaning ?? "", data.Subst.Mass.toString(), data.Subst.Formula ?? "", data.Subst.Investigated, data.Subst.Left, data.Subst.URL ?? "", data.Subst.UnitId, data.Subst.Passport, data.Subst.Id]);
                        return res.status(200).json("Изменено");
                    }
                    else {
                        return res.status(300).json("Дублирование имени");
                    }
                } catch (error) {
                    console.error(error);
                    return res.status(400).json("Ошибка");
                }
            }
            else {
                try {
                    const SearchName = `%${data.Subst.SubstName}%`
                    const SubstNameQuery = await query(`SELECT * FROM containerdb.substance where SubstName like ? && Id != ?;`, [SearchName, data.Subst.Id]);
                    const SubstNameRep: Substance[] = SubstNameQuery as Substance[];
                    const now = new Date().toISOString().slice(0, 10).replace('T', ' ');
                    if (SubstNameRep.length == 0) {
                        await query(`INSERT INTO containerdb.substance (Id, SubstName, CAS, Meaning, Mass, Formula, Investigated, \`Left\`, URL, SubsCreateDate, UnitId, Passport ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
                            [uuid(), data.Subst.SubstName, data.Subst.CAS ?? "", data.Subst.Meaning ?? "", data.Subst.Mass.toString(), data.Subst.Formula ?? "", data.Subst.Investigated, data.Subst.Left, data.Subst.URL ?? "", now, data.Subst.UnitId, data.Subst.Passport]
                        );
                        return res.status(200).json("Добавлен");
                    }
                    else {
                        return res.status(300).json("Дублирование имени");
                    }
                } catch (error) {
                    console.error(error);
                    if (error instanceof Error)
                        return res.status(400).json("Измените название");
                }
            }

        }



    }
    else {
        return res.status(405).json({ message: "Метод не позволителен" });
    }
}