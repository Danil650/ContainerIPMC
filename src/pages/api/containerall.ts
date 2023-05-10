import { NextApiHandler } from 'next'
import { query } from '../../../lib/db'
import Container from 'lib/Container'

const handler: NextApiHandler = async (req, res) => {
  try {
    const results = await query(
        `SELECT * FROM 
        containerdb.contwthcont;`
    )
    return res.json(results as Container[])
  } catch (e) {
    if(e instanceof Error)
    res.status(500).json({ message: e.message })
  }
}

export default handler