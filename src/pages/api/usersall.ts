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
            const result = await query(`SELECT IdUsers, Login, FIO, RoleId, UserToken FROM containerdb.users;`);
            return res.status(200).json(result);
        }
        else {
            const User: User = {
                IdUsers: "0",
                Login: "0",
                Password: "0",
                FIO: "0",
                RoleId: 0
            }
            return res.status(300).json(User);
        }
    }
    else {
        return res.status(405).json({ message: "Метод не позволителен" });
    }
}