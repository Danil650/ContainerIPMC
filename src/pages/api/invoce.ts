import { NextApiRequest, NextApiResponse } from "next";
import User from "lib/User";
import { query } from "lib/db";
import cookie from 'cookie';
import uuid from "react-uuid";
import Invoke from "lib/Invoce";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        let data = req.body as Invoke;
        data.IdInvoce.trim();
        if(Date.parse(data.DateInvoce) && data.IdInvoce.length > 0)
        {
            await query(`INSERT INTO containerdb.invoice
            (IdInvoce,
            DateInvoce)
            VALUES
            (?,
            ?);
            `,[data.IdInvoce, data.DateInvoce]);

            return res.status(200).json("Ok");
        }
    }
    else {
        try {
            const result = await query(`SELECT * FROM containerdb.invoice;`);
            return res.status(200).json(result);
        }
        catch (e) {
            if (e instanceof Error) {
                console.log(e);
                res.status(500).json({ message: e.message })
            }

        }
    }
}