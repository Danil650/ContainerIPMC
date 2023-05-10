import { NextApiHandler } from 'next'
import { query } from '../../../lib/db'
import Container from 'lib/Container'

const handler: NextApiHandler = async (req, res) => {
  try {
    const results = await query(
        `SELECT contwthcont.*, substance.SubstName as SubstHave
        FROM containerdb.contwthcont 
        LEFT JOIN containerdb.substcont ON contwthcont.Id = substcont.ContId 
        LEFT JOIN containerdb.substance ON substcont.SubstId = substance.Id`
    )
    return res.json(results as Container[])
  } catch (e) {
    if(e instanceof Error)
    res.status(500).json({ message: e.message })
  }
}

export default handler