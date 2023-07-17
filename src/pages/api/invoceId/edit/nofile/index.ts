import { NextApiRequest, NextApiResponse } from "next";
import { query } from "lib/db";
import Invoce from "lib/Invoce";
import formidable from "formidable";
import fs from 'fs/promises';

export const config = {
    api: {
        bodyParser: false,
    },
};
let Extension = "";
async function ReadForm(req: NextApiRequest): Promise<{ fields: formidable.Fields }> {
    const form = formidable();
    return new Promise((resolve, reject) => {
        form.parse(req, async (err, fields) => {
            if (err) reject(err);
            try {
                resolve({ fields });
            } catch (e) {
                reject(e);
            }
        });
    });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        try {
            ReadForm(req)
                .then(async ({ fields }) => {
                    const { numInvoce, dateInvoce, curUser } = fields;
                    const DateInvoce = new Date(dateInvoce.toString()).toISOString().slice(0, 10).replace('T', ' ');
                    await query(`UPDATE containerdb.invoice
                    SET
                    DateInvoce = ?
                    WHERE IdInvoce = ?;`,
                        [DateInvoce, numInvoce.toString()])
                    return res.status(200).json("Ok");
                })
                .catch((error) => {
                    // Обработка ошибки
                    console.log(error);
                    return res.status(400).json(error);
                });
        } catch (error) {
            console.log(error);
            return res.status(400).json(error);
        }
    } else {
        return res.status(500).json("Не верный метод");
    }
}
