import { NextApiHandler } from 'next'
import { query } from '../../../../lib/db'

const handler: NextApiHandler = async (req, res) => {
    const { Id } = req.query;
    try {
        const results = await query(
            `
            SELECT 
            unit_type.Title as UnitTitle,
            StatusTitle,
            substance.SubstName,
            substance.Mass,
            subst_turnover.*,
            action.ActionTitle,
            turnove_request.*,
            (SELECT 
                    FIO
                FROM
                    users AS UserReq
                WHERE
                    UserReq.IdUsers = UserIdReq) AS UserReqFIO,
            (SELECT 
                    FIO
                FROM
                    users AS UserReq
                WHERE
                    UserReq.IdUsers = UserAcceptReq) AS UserAcceptFIO
        FROM
            containerdb.turnove_request
                JOIN
            subst_turnover ON subst_turnover.Idturnover = turnove_request.TurnoverId
                JOIN
            action ON action.ActionId = subst_turnover.ActionId
                JOIN
            substance ON substance.Id = subst_turnover.SubstId
                JOIN
            request_status ON turnove_request.StatusId = request_status.StatusId
            JOIN 
            unit_type on unit_type.Id = substance.UnitId
WHERE
    UserIdReq = ?
        `
            , [Id?.toString()!])
        return res.json(results)
    } catch (e) {
        if (e instanceof Error)
            res.status(500).json({ message: e.message })
    }
}

export default handler