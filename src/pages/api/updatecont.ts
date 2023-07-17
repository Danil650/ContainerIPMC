import { NextApiRequest, NextApiResponse } from "next";
import Container from "../../../lib/Container"
import uuid from 'react-uuid';
import { db, query } from "lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        interface SendData {
            cont: Container,
            user: string
        }
        const data = req.body as SendData;
        if (data.cont.Name && data.cont.Name != "") {
            if (data.cont.Id != "0") {
                try {
                    const SearchName = `%${data.cont.Name}%`
                    const ContainertNameQuery = await query(`SELECT * FROM containerdb.contwthcont where Name like ? && Id != ?;`, [SearchName, data.cont.Id]);
                    const ContainerNameRep: Container[] = ContainertNameQuery as Container[];
                    if (ContainerNameRep.length == 0) {
                        await query(`UPDATE containerdb.contwthcont SET \`Name\` = ? WHERE Id = ?;`, [data.cont.Name, data.cont.Id]);
                        res.status(200).json({ success: true });
                    }
                    else {
                        const NewName = `${data.cont.Name}(${ContainerNameRep.length + 1})`;
                        await query(`UPDATE containerdb.contwthcont SET \`Name\` = ? WHERE Id = ?;`, [NewName, data.cont.Id]);
                        res.status(200).json({ success: true });
                    }
                } catch (error) {
                    console.error(error);
                    res.status(500).json({ success: false, error: "Internal server error" });
                }
            }
            else {
                try {
                    const SearchName = `%${data.cont.Name}%`
                    const ContainertNameQuery = await query(`SELECT * FROM containerdb.contwthcont where Name like ? && Id != ?;`, [SearchName, data.cont.Id]);
                    const ContainerNameRep: Container[] = ContainertNameQuery as Container[];
                    if (ContainerNameRep.length == 0) {
                        await query(
                            `INSERT INTO containerdb.contwthcont (Id, ContainsIn, \`Name\`, DateCreate) 
                            VALUES (?, ?, ?, now());`, [uuid(), data.cont.ContainsIn ?? "", data.cont.Name]
                        )
                        res.status(200).json({ success: true });
                    }
                    else {
                        const NewName = `${data.cont.Name}(${ContainerNameRep.length + 1})`;
                        await query(
                            `INSERT INTO containerdb.contwthcont (Id, ContainsIn, \`Name\`, DateCreate) 
                            VALUES (?, ?, ?, now());`, [uuid(), data.cont.ContainsIn ?? "", NewName]
                        )
                        res.status(200).json({ success: true });
                    }


                } catch (error) {
                    console.error(error);
                    res.status(500).json({ success: false, error: "Internal server error" });
                }
            }
        }
    }
    else {
        res.status(405).json({ message: "Метод не позволителен" });
        return;
    }
}