import { NextApiRequest, NextApiResponse } from "next";
import uuid from 'react-uuid';
import { db, query } from "lib/db";
import cookie from 'cookie';
import TurnoveRequest from "lib/TurnoveRequest";
import Decimal from "decimal.js";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        interface SndData {
            TurnoveReq: TurnoveRequest,
            Status: string,
            CurUser: string,
        };
        const data = req.body as SndData;
        try {
            let MassRes = "";
            if (data.TurnoveReq.ActionId == "1") {
                MassRes = new Decimal(data.TurnoveReq!.Mass).minus(new Decimal(data.TurnoveReq!.MassCount)).toString()
            }
            else {
                MassRes = new Decimal(data.TurnoveReq!.Mass).plus(new Decimal(data.TurnoveReq!.MassCount)).toString()
            }
            if (data.Status == "2" && data.TurnoveReq.StatusId != "2") {
                db.transaction()
                    .query(`UPDATE containerdb.turnove_request
                    SET
                    StatusId =?,
                    UserAcceptReq = ?
                    WHERE IdRequest = ?;
                    `, [data.Status, data.CurUser, data.TurnoveReq.IdRequest]
                    )
                    .query(
                        `UPDATE containerdb.substance
                    SET
                    Mass = ?
                    WHERE Id = ?;
                    `, [MassRes, data.TurnoveReq.SubstId]
                    )
                    .rollback((e: any) => {
                        console.log(e.message)
                        return res.status(300).json("Ошибка транзакции");
                    }) // optional
                    .commit(); // execute the queries
                return res.json("Сохранено, масса изменена");
            }
            else {
                await query(`UPDATE containerdb.turnove_request
                SET
                StatusId =?
                WHERE IdRequest = ?;
                `, [data.Status, data.TurnoveReq.IdRequest])
                return res.json("Сохранено");

            }


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