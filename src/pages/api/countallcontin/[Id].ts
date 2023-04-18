import { NextApiHandler } from 'next'
import { query } from '../../../../lib/db'
import ISubstance from "../../../../lib/Substance"

const handler: NextApiHandler = async (req, res) => {
    try {
        const { id } = req.query;
        if (id) {
            //Поиск вещества по id
            const results = await query(
                `WITH RECURSIVE container_tree AS (
                    SELECT Id, ContainsIn
                    FROM contwthcont
                    WHERE Id = ?
                    UNION ALL
                    SELECT c.Id, c.ContainsIn
                    FROM contwthcont c
                    JOIN container_tree ct ON c.ContainsIn = ct.Id
                  )
                  SELECT COUNT(*) - 1 AS total_containers
                  FROM container_tree;`,
                [id.toString()]
            );
           return res.json(results);
        }
        res.status(500);
    } catch (e) {
        if (e instanceof Error)
            res.status(500).json({ message: e.message });
    }
}
export default handler



