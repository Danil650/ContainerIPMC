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
        if (data[0] && data[0].RoleId == 1) {
            const result = await query(`SELECT 
            (SELECT FIO FROM users WHERE IdUsers = t.UserId) AS FIO,
            substance.*,
            t.TotalTaken - t.TotalReturned AS Difference
        FROM
            (SELECT 
                UserId,
                    SubstId,
                    SUM(CASE
                        WHEN ActionId = 1 THEN MassCount
                        ELSE 0
                    END) AS TotalTaken,
                    SUM(CASE
                        WHEN ActionId = 2 THEN MassCount
                        ELSE 0
                    END) AS TotalReturned
            FROM
                subst_turnover
            GROUP BY UserId , SubstId) AS t
                LEFT JOIN
            substance ON substance.Id = t.SubstId;
        `);
            return res.status(200).json(result);
        }
    }
    else {
        return res.status(405).json({ message: "Метод не позволителен" });
    }
}