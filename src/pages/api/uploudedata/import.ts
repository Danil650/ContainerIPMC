import { NextApiRequest, NextApiResponse } from "next";
import ExcelData from "../../../../lib/ExcelData"
import Container from "../../../../lib/Container"
import Substance from "../../../../lib/Substance"
import SubstCont from "../../../../lib/SubstContainer"
import { InsertSubstances } from '../../../../lib/db'
import uuid from 'react-uuid';
import { from } from 'linq-to-typescript'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        const data = req.body as ExcelData[];
        if (data[0].CAS === "CAS" && data[0].Container === "Коробка" &&
            data[0].Formula === "Формула" && data[0].Title === "Название") {
            data.shift();
        }
        else {
            res.status(405).json({ message: "Не верный формат EXCEL" });
            return;
        }
        let Containers: Container[] = [];
        let uplouded: Container;
        let Substance: Substance[] = [];
        let SubstCont: SubstCont[] = [];
        data.forEach( element => {
            if (element.Id != 0 && element.Container) {
                let cont: Container = {
                    Id: `${element.Id}${element.Container}`,
                    ExcelId: element.Id,
                    ContainsIn: element.ContainsIn,
                    Name: element.Container
                }
                Containers.push(cont);
            }
            if (element.Title) {
                let subst: Substance = {
                    Id: uuid(),
                    SubstName: element.Title,
                    Left: '1',
                    Investigated: '1',
                    CAS: element.CAS,
                    Meaning: element.Meaning,
                    Mass: element.Mass,
                    Formula: element.Formula,
                    URL: element.URL
                }
                Substance.push(subst);
                let substcont: SubstCont = {
                    Id: uuid(),
                    ContId: from(Containers).where(x => x.ExcelId == element.Id).select(x => x.Id).first(),
                    SubstId: subst.Id
                }
                SubstCont.push(substcont);
            }
        });

        InsertSubstances(Substance,Containers,SubstCont);

        //добавление контейнеров без повторений
         
        res.status(200).json({ message: "Данные импортированы" });
    }
    else {
        res.status(405).json({ message: "Метод не позволителен" });
        return;
    }
}