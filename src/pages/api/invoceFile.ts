import { NextApiRequest, NextApiResponse } from "next";
import { query } from "lib/db";
import Invoce, { validateFile } from "lib/Invoce";
import formidable from "formidable";
import fs from 'fs';
import path from "path";
import mime from 'mime'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        const data = req.body as Invoce;

        const filePath = `${process.cwd()}\\Invoce\\${data.IdInvoce}.${data.Ext}`;
        const fileType = mime.getType(filePath);
        console.log(fileType);
        const stat = fs.statSync(filePath);

        res.writeHead(200, {
            'Content-Type': fileType || 'application/octet-stream',
            'Content-Length': stat.size
        });
        const readStream = fs.createReadStream(filePath);
        readStream.pipe(res);
    }
    else {
        return res.status(500).json("Не допустимый метод");
    }
}
