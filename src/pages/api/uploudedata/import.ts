import type { NextApiRequest, NextApiResponse } from "next";
import ExcelData from "../../../../lib/ExcelData"
import Container from "../../../../lib/Container"
import Substance from "../../../../lib/Substance"
import SubstCont from "../../../../lib/SubstContainer"
import { query } from '../../../../lib/db'
import uuid from 'react-uuid';
import { from } from "linq-to-typescript"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {

        const data = req.body as ExcelData[];
        let Content: Container[] = [];
        let uplouded: Container[] = [];
        //часть кода отвечающая за родительские контейнера
        data.forEach(element => {
            if (element.ContainsIn == 0 && element.Container) {
                let id = uuid();
                let elem: Container =
                {
                    Id: id,
                    ExcelId: element.Id,
                    Name: element.Container
                };
                Content.push(elem);
            }
        });
        try {
            Content.forEach(async element => {
                {
                    if (!uplouded.some(x=>x.ExcelId === element.ExcelId))
                    {
                        if (element.ExcelId) {
                            uplouded.push(element);
                            await query("INSERT INTO containerdb.contwthcont (Id, ExcelId, Name) VALUES (?, ? , ?);", [element.Id, element.ExcelId.toString(), element.Name]);
                        }
                    }        
                }
            });
        } catch (e) {
            if (e instanceof Error) {
                res.status(500).json({ message: e.message });
                return;
            }
        }
        //конец 

        //Добавление дочерних объектов
        data.forEach(element => {
            if (element.ContainsIn != 0 && element.Container) {
                let id = uuid();
                let elem: Container =
                {
                    Id: id,
                    ExcelId: element.Id,
                    Name: element.Container
                };
                Content.push(elem);
            }
        });
        res.status(200).json({ message: "Ok" });
    } else {
        res.status(405).json({ message: "Method not allowed" });
        return;
    }
}