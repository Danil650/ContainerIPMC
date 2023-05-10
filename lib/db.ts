
import mysql from 'serverless-mysql'
import Substance from '../lib/Substance'
import Container from '../lib/Container'
import SubstCont from '../lib/SubstContainer'
import { from } from 'linq-to-typescript'

export const db = mysql({
  config: {
    host: process.env.MYSQL_HOST,
    database: process.env.MYSQL_DATABASE,
    user: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
  },
})
let uplouded: Container;

export async function query(
  q: string,
  values: (string | number)[] | string | number = []
) {
  try {
    const results = await db.query(q, values)
    await db.end()
    return results
  } catch (e) {
    if (typeof e === "string") {
      e.toUpperCase() // works, `e` narrowed to string
    } else if (e instanceof Error) {
      throw Error(e.message); // works, `e` narrowed to Error
    }
  }
}

// export async function InsertSubstances(
//   Substances: Substance[],
//   Containers: Container[],
//   SubstCont: SubstCont[]
// ) {
//   try {
//     for (const subst of Substances) {
//       query("INSERT INTO containerdb.substance (Id, SubstName, CAS, Meaning, Mass, Formula, Investigated, `Left`, URL) " +
//         "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?); ",
//         [subst.Id, subst.SubstName as string, subst.CAS as string, subst.Meaning as string, subst.Mass as string, subst.Formula as string, subst.Investigated, subst.Left, subst.URL as string]);
//     }

//     for (const cont of Containers) {

//       if (uplouded) {
//         if (uplouded.ExcelId == cont.ExcelId &&
//           uplouded.ContainsIn == cont.ContainsIn &&
//           uplouded.Name == cont.Name) {
//           uplouded = cont;
//         }
//         else {
//           uplouded = cont;
//           if (cont.ExcelId)
//             try {
//               await query("INSERT INTO containerdb.contwthcont (Id, ExcelId, ContainsIn, Name) VALUES" +
//                 "(?, ?, ?, ?);",
//                 [cont.Id, cont.ExcelId, from(Containers).where(x => x.ExcelId == cont.ContainsIn).select(x => x.Id).firstOrDefault() ?? '', cont.Name]);
//             } catch (error) {
//               console.log(error);
//             }
//         }
//       }
//       else {
//         uplouded = cont;
//         try {
//           await query("INSERT INTO containerdb.contwthcont (Id, ExcelId, ContainsIn, Name) VALUES" +
//             "(?, ?, ?, ?);",
//             [cont.Id, cont.ExcelId ?? 0, cont.ContainsIn ?? '', cont.Name]);
//         } catch (error) {
//           console.log(error);
//         }
//       }
//     }
//     for (const element of SubstCont) {
//       try {
//         await query("INSERT INTO containerdb.substcont (Id, SubstId, ContId) VALUES (?, ?, ?); ",
//           [element.Id, element.SubstId, element.ContId]);
//       } catch (error) {
//         console.log(`INSERT INTO containerdb.substcont (Id, SubstId, ContId) VALUES (${element.Id}, ${element.SubstId}, ${element.ContId}); `)
//         console.log(error);
//         console.log(element.Id, element.SubstId, element.ContId)
//         console.log(from(Substances).where(x => x.Id == element.SubstId).toArray());
//       }
//     };
//     await db.end()
//   } catch (e) {
//     if (typeof e === "string") {
//       e.toUpperCase() // works, `e` narrowed to string
//     } else if (e instanceof Error) {
//       throw Error(e.message); // works, `e` narrowed to Error
//     }
//   }
// }

// export async function GetContainers() {

// }