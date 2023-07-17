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
            RequestText: string,
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
            const UID = uuid();

            if (!Res.isNegative()) {
                await db.transaction()
                    .query(`INSERT INTO containerdb.subst_turnover
                    (Idturnover,
                    UserId,
                    ActionId,
                    SubstId,
                    MassCount)
                    VALUES
                    (?,
                    ?,
                    ?,
                    ?,
                    ?);                    
                    `, [UID, data.User.IdUsers, data.Action, data.subst.Id, data.Mass.toString()])
                    .query(`INSERT INTO containerdb.turnove_request
                    (IdRequest,
                    TurnoverId,
                    UserIdReq,
                    ReqDate,
                    StatusId,
                    RequestText)
                    VALUES
                    (?,
                    ?,
                    ?,
                    now(),
                    '1',
                    ?);`, [uuid(), UID, data.User.IdUsers, data.RequestText])
                    .rollback((e: any) => {
                        console.log(e.message)
                        return res.status(300).json("Ошибка транзакции");
                    }) // optional
                    .commit(); // execute the queries
                return res.status(200).json("Ok");
            }
            else {
                return res.status(300).json("Отрицательное значение");

            }
        }
        else {
            const UID = uuid();
            await db.transaction()
                .query(`INSERT INTO containerdb.subst_turnover (Idturnover, UserId, ActionId, SubstId, MassCount)
                    VALUES
                    (?,
                    ?,
                    ?,
                    ?,
                    ?);
                    `, [UID, data.User.IdUsers, data.Action, data.subst.Id, data.Mass.toString()])
                .query(`INSERT INTO containerdb.turnove_request
                    (IdRequest,
                    TurnoverId,
                    UserIdReq,
                    ReqDate,
                    StatusId,
                    RequestText)
                    VALUES
                    (?,
                    ?,
                    ?,
                    now(),
                    '1',
                    ?);`, [uuid(), UID, data.User.IdUsers, data.RequestText])
                .rollback((e: any) => {
                    console.log(e.message)
                    return res.status(300).json("Ошибка транзакции");
                }) // optional
                .commit(); // execute the queries
            return res.status(200).json("Ok");
        }
    }
    else {
        res.status(405).json({ message: "Метод не позволителен" });
        return;
    }
}