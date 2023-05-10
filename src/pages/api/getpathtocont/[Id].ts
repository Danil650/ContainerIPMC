import { NextApiHandler } from 'next'
import { query } from '../../../../lib/db'
import ISubstance from "../../../../lib/Substance"

const handler: NextApiHandler = async (req, res) => {
    try {
        const { id } = req.query;
        if (id) {
            
            //Поиск вещества по id
            const results = await query(
                `WITH RECURSIVE tree_path (Id, path) AS (
                    SELECT Id, CAST(Name AS CHAR(200)) AS path
                    FROM contwthcont
                    WHERE Id = ?
                    UNION ALL
                    SELECT c.Id, CONCAT(cp.path, ' > ', c.Name) AS path
                    FROM contwthcont c
                    JOIN tree_path cp ON cp.Id = c.ContainsIn
                )
                SELECT path FROM tree_path;`, [id.toString()]
            ) as ISubstance[];

            if (results.length > 0) {
                return res.json(results);
            } else {
                res.status(404).send('Substances not found');
            }
        }
    } catch (e) {
        if (e instanceof Error)
            res.status(500).json({ message: e.message });
    }
}

export default handler