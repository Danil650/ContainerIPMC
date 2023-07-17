import { NextApiRequest, NextApiResponse } from "next";
import Substance from "../../../lib/Substance"
import uuid from 'react-uuid';
import { db, query } from "lib/db";
import { json } from "stream/consumers";
import Decimal from "decimal.js";
import User from "lib/User";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        const data = req.body as User[];
        console.log(data)
        if (data[0] && data[0].RoleId && data[0].RoleId <= 2) {
            try {
                const result = await query(`SELECT 
                unit_type.Title as UnitTitle,
                StatusTitle,
                substance.SubstName,
                substance.Mass,
                subst_turnover.*,
                action.ActionTitle,
                turnove_request.*,
                (SELECT 
                        FIO
                    FROM
                        users AS UserReq
                    WHERE
                        UserReq.IdUsers = UserIdReq) AS UserReqFIO,
                (SELECT 
                        FIO
                    FROM
                        users AS UserReq
                    WHERE
                        UserReq.IdUsers = UserAcceptReq) AS UserAcceptFIO
            FROM
                containerdb.turnove_request
                    JOIN
                subst_turnover ON subst_turnover.Idturnover = turnove_request.TurnoverId
                    JOIN
                action ON action.ActionId = subst_turnover.ActionId
                    JOIN
                substance ON substance.Id = subst_turnover.SubstId
                    JOIN
                request_status ON turnove_request.StatusId = request_status.StatusId
                JOIN 
                unit_type on unit_type.Id = substance.UnitId
                WHERE turnove_request.StatusId = "2"
            `);
                return res.status(200).json(result);
            } catch (e) {
                if (e instanceof Error) {
                    console.log(e);
                    res.status(500).json({ message: e.message })
                }

            }
        }
        else {
            return res.status(405).json({ message: "Метод не позволителен" });
        }
    }
}