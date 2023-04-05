import { NextApiHandler } from 'next'
import { query } from '../../../lib/db'

const handler: NextApiHandler = async (req, res) => {
  try {
    const results = await query(
        `SELECT * FROM containerdb.contwthcont where ContainsIn = "";`
    )
    return res.json(results)
  } catch (e) {
    if(e instanceof Error)
    res.status(500).json({ message: e.message })
  }
}

export default handler