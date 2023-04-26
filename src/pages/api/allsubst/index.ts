import { NextApiHandler } from 'next'
import { query } from '../../../../lib/db'

const handler: NextApiHandler = async (req, res) => {
  try {
    const results = await query(
        `SELECT substance.*, contwthcont.Name AS ContId 
        FROM containerdb.substance 
        left join substcont ON substance.Id = substcont.SubstId 
        left join contwthcont ON contwthcont.Id = substcont.ContId;
        `
    )
    return res.json(results)
  } catch (e) {
    if(e instanceof Error)
    res.status(500).json({ message: e.message })
  }
}

export default handler