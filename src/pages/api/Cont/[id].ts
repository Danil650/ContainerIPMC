import { NextApiHandler } from 'next'
import { query } from '../../../../lib/db'
import ISubstance from "../../../../lib/Substance"

const handler: NextApiHandler = async (req, res) => {
    try {
        const { id } = req.query;
        if (id) {
            //Поиск вещества по id
            const results = await query(
                `with recursive cte (Id, Name, ContainsIn) as (
                    select     Id,
                               Name,
                               ContainsIn
                    from       contwthcont
                    where      ContainsIn = ?
                    union all
                    select     p.Id,
                               p.Name,
                               p.ContainsIn
                    from       contwthcont p
                    inner join cte
                            on p.ContainsIn = cte.Id
                  )
                  select * from cte;`,
                [id.toString()]

            );
            res.json(results);
        }
        res.status(500);
    } catch (e) {
        if (e instanceof Error)
            res.status(500).json({ message: e.message });
    }
}
export default handler
