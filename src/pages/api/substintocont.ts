import { NextApiRequest, NextApiResponse } from "next";
import uuid from 'react-uuid';
import { query } from "lib/db";
import cookie from 'cookie';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        interface SendData {
            sub: string;
            con: string;
            cookieValue: string;
        }
        const data = req.body as SendData;
        try {
            const results = await query(
                `INSERT INTO containerdb.substcont (Id, SubstId, ContId)
                VALUES (?, ?, ?);`, [uuid(), data.sub, data.con]
            );
            return res.json(results)
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