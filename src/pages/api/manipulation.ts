import { NextApiRequest, NextApiResponse } from "next";
import uuid from 'react-uuid';
import { db, query } from "lib/db";
import cookie from 'cookie';
import Substance from "lib/Substance";
import User from "lib/User";
import { Transaction } from "serverless-mysql";
import Decimal from "decimal.js";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        interface SndData {
            subst: Substance,
            User: User,
            Action: string,
            Mass: number
        };
        //Забрал -1 Вернул 1 
        const data = req.body as SndData;

        if (data.Action == "-1") {
            data.Action = "1";
        }
        else {
            data.Action = "2";
        }

        if (data.Action == "1") {
            const SubstRes: Substance[] = await db.query(`SELECT * FROM containerdb.substance where Id = ?;`, [data.subst.Id]) as Substance[];
            const Subst = SubstRes[0];
            const First: Decimal = new Decimal(Subst.Mass.toString());
            const Second: Decimal = new Decimal(data.subst.Mass.toString());
            const Res: Decimal = First.minus(Second);
            console.log(First, Second);
            if (!Res.isNegative()) {
                await db.transaction()
                    .query(`INSERT INTO containerdb.subst_turnover (Idturnover, UserId, ActionId, SubstId, MassCount, DateTurnover)
                    VALUES
                    (?,
                    ?,
                    ?,
                    ?,
                    ?,
                    NOW());
                    `, [uuid(), data.User.IdUsers, data.Action, data.subst.Id, data.Mass.toString()])
                    .query(`UPDATE containerdb.substance
                    SET
                    Mass =?
                    WHERE Id = ?;`, [data.subst.Mass.toString(), data.subst.Id])
                    .rollback((e: any) => { return res.status(300).json("Ошибка транзакции"); }) // optional
                    .commit(); // execute the queries
                return res.status(200).json("Ok");
            }
        }
        else {
            await db.transaction()
                .query(`INSERT INTO containerdb.subst_turnover (Idturnover, UserId, ActionId, SubstId, MassCount)
                    VALUES
                    (?,
                    ?,
                    ?,
                    ?,
                    ?);
                    `, [uuid(), data.User.IdUsers, data.Action, data.subst.Id, data.Mass.toString()])
                .query(`UPDATE containerdb.substance
                    SET
                    Mass =?
                    WHERE Id = ?;`, [data.subst.Mass.toString(), data.subst.Id])
                .rollback((e: any) => { return res.status(300).json("Ошибка транзакции"); }) // optional
                .commit(); // execute the queries
            return res.status(200).json("Ok");
        }
    }
    else {
        res.status(405).json({ message: "Метод не позволителен" });
        return;
    }
}