import { NextApiRequest, NextApiResponse } from "next";
import { query } from "lib/db";
import Invoce, { validateFile } from "lib/Invoce";
import formidable from "formidable";
import fs from 'fs/promises';

export const config = {
    api: {
        bodyParser: false,
    },
};
let Extension = "";
async function ReadFile(req: NextApiRequest): Promise<{ fields: formidable.Fields; files: formidable.Files }> {
    try {
        await fs.readdir(`${process.cwd()}/Invoce`);
    } catch (error) {
        await fs.mkdir(`${process.cwd()}/Invoce`);
    }
    const option: formidable.Options = {};
    option.uploadDir = `${process.cwd()}/Invoce`;
    option.filename = (name, ext, path, form) => {
        return path.originalFilename ?? "Docx";
    };
    const form = formidable(option);
    return new Promise((resolve, reject) => {
        form.parse(req, async (err, fields, files) => {
            if (err) reject(err);
            try {
                const { numInvoce, dateInvoce, curUser, Ext } = fields;
                Extension = Ext.toString();
                const result = await query(`SELECT * FROM containerdb.invoice WHERE IdInvoce = ?;`, [numInvoce.toString() ?? ""]);
                const Invoces: Invoce[] = result as Invoce[];
                if (Invoces.length == 0) {
                    resolve({ fields, files });
                } else {
                    reject("Название дублируется");
                }
            } catch (e) {
                reject(e);
            }
        });
    });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        try {
            ReadFile(req)
                .then(async ({ fields, files }) => {
                    // Обработка успешного выполнения
                    const { numInvoce, dateInvoce, curUser } = fields;
                    const DateInvoce = new Date(dateInvoce.toString()).toISOString().slice(0, 10).replace('T', ' ');
                    await query(`INSERT INTO containerdb.invoice
                    (IdInvoce,
                    DateInvoce,
                    UserId,
                    Ext)
                    VALUES
                    (?,
                    ?,
                    ?,
                    ?);
                    `, [numInvoce.toString(), DateInvoce, curUser.toString(), Extension.toString()])
                    return res.status(200).json("Ok");
                })
                .catch((error) => {
                    // Обработка ошибки
                    return res.status(400).json(error);
                });
        } catch (error) {
            return res.status(400).json(error);
        }
    } else {
        try {
            const result = await query(`SELECT invoice.*, FIO FROM containerdb.invoice 
            JOIN users on invoice.UserId = users.IdUsers;`);
            return res.status(200).json(result);
        } catch (e) {
            if (e instanceof Error) {
                return res.status(500).json(e.message);
            }
        }
    }
}
