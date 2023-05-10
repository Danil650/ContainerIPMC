import { NextApiHandler } from 'next'
import { query } from '../../../lib/db'

const handler: NextApiHandler = async (req, res) => {
  try {
    const results = await query(
      `SELECT c1.*, COUNT(c2.Id) AS ContQauntIn
        FROM contwthcont c1
        LEFT JOIN contwthcont c2 ON c2.ContainsIn = c1.Id
        WHERE c1.ContainsIn = ""
        GROUP BY c1.Id;`
    )
    return res.json(results)
  } catch (e) {
    if (e instanceof Error)
      res.status(500).json({ message: e.message })
  }
}

export default handler