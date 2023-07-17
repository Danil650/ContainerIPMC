import { NextApiHandler } from 'next'
import { query } from '../../../../../lib/db'

const handler: NextApiHandler = async (req, res) => {
    try {
        const results = await query(
            `
            SELECT DISTINCT containerdb.users.*
            FROM containerdb.users
            JOIN turnove_request ON turnove_request.UserIdReq = containerdb.users.IdUsers;
        `
        )
        return res.json(results)
    } catch (e) {
        if (e instanceof Error)
            res.status(500).json({ message: e.message })
    }
}

export default handler