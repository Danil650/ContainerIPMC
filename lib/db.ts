import mysql from 'serverless-mysql'

export const db = mysql({
  config: {
    host: process.env.MYSQL_HOST,
    database: process.env.MYSQL_DATABASE,
    user: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
  },
})

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
