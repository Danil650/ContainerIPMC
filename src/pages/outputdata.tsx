import { useRouter } from 'next/router';
import { useEffect, useState } from "react";
import styles from '../styles/Home.module.css';
import User from "../../lib/User";
import React from 'react';
import Cookies from 'js-cookie';
import Head from 'next/head';
import Substance from 'lib/Substance';
import { AlignmentType, Document, HeadingLevel, Packer, PageOrientation, Paragraph, Table, TableCell, TableRow, TextRun } from "docx";
import { saveAs } from 'file-saver';
import Container from 'lib/Container';
import Nav from 'lib/Nav';
import TurnoveRequest from 'lib/TurnoveRequest';
import dateformat from 'dateformat';


export async function getServerSideProps(context: { req: { cookies: { [x: string]: any; }; }; }) {
    if (context.req.cookies["user"]) {
        console.log(context.req.cookies["user"]);
        return fetch(`${process.env.NEXT_PUBLIC_URL}api/checkuser/${context.req.cookies["user"]}`)
            .then(async (res) => await res.json())
            .then((data) => {
                if (data && data.length !== 0) {
                    let CurUserBd: User[] = data;
                    if (CurUserBd[0].RoleId && CurUserBd[0].RoleId <= 2) { //Проверка роли
                        return {
                            props: { CurUserBd }, // будет передано в компонент страницы как props
                        };
                    }
                    else {
                        return {
                            redirect: {
                                destination: '/',
                                permanent: false
                            }
                        };
                    }
                } else {
                    return {
                        redirect: {
                            destination: '/',
                            permanent: false
                        }
                    };
                }
            })
            .catch((error) => {
                console.error('Error fetching CurUserBd:', error);
                return {
                    redirect: {
                        destination: '/',
                        permanent: false
                    }
                };
            });

    }
    else {
        return {
            redirect: {
                destination: '/',
                permanent: false
            }
        };
    }
}
interface getServerSideProps {
    CurUserBd: User[]
}

function App({ CurUserBd }: getServerSideProps) {
    interface ToSave {
        AllSubst?: Substance[],
        AllCont?: Container[],
        SubstLeft?: Substance[],
        UserOutput?: TurnoveRequest[],
    }
    const router = useRouter();
    const [Curuser, setCuruser] = useState<User[]>(CurUserBd);
    const [Option, setOption] = useState(0);
    useEffect(() => {
        if (!Cookies.get("user") || !Curuser || !Curuser[0].RoleId) {
            router.push("/login");
        }
    }, []);
    async function MakeDock() {
        let data: ToSave;
        switch (Option) {
            case 0:
                const subst: Substance[] = await fetch(`${process.env.NEXT_PUBLIC_URL}api/allsubst`).then((res) => res.json());
                data = {
                    AllSubst: subst
                }
                generateWordFile(data);
                break;
            case 1:
                const cont: Container[] = await fetch(`${process.env.NEXT_PUBLIC_URL}api/contforexport`).then((res) => res.json());
                data = {
                    AllCont: cont
                }
                generateWordFile(data);
                break;
            case 2:
                const substEnd: Substance[] = await fetch(`${process.env.NEXT_PUBLIC_URL}api/allsubst/1`).then((res) => res.json());
                data = {
                    SubstLeft: substEnd
                }
                generateWordFile(data);
                break;
            case 3:
                let UserTurnove: TurnoveRequest[] = [];
                await fetch(`${process.env.NEXT_PUBLIC_URL}api/userturnover`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(Curuser),
                })
                    .then((res) => {
                        if (res.ok) {
                            return res.json(); // вызов метода .json() и возврат промиса с результатом
                        } else {
                            alert("Ошибка");
                            return;
                        }
                    })
                    .then(async (data) => {
                        // здесь можно использовать данные в формате JSON
                        UserTurnove = await data;
                    })
                    .catch((error) => {
                        console.error("Ошибка получения данных: ", error);
                    });
                data = {
                    UserOutput: UserTurnove
                }
                generateWordFile(data);
                break;
            default:
                break;
        }
    }
    const generateWordFile = async (data: ToSave) => {
        // Создание заголовков таблицы
        let headers;
        let rows
        if (data.AllSubst) {
            headers = new TableRow({
                children: [
                    new TableCell({
                        children: [new Paragraph({ text: "Номер хим. вещества", alignment: AlignmentType.CENTER, heading: HeadingLevel.HEADING_1, indent: { left: 100, right: 100 } })],
                    }),
                    new TableCell({
                        children: [new Paragraph({ text: "Название", alignment: AlignmentType.CENTER, heading: HeadingLevel.HEADING_1, indent: { left: 100, right: 100 } })],
                    }),
                    new TableCell({
                        children: [new Paragraph({ text: "CAS", alignment: AlignmentType.CENTER, heading: HeadingLevel.HEADING_1, indent: { left: 100, right: 100 } })],
                    }),
                    new TableCell({
                        children: [new Paragraph({ text: "Накладная", alignment: AlignmentType.CENTER, heading: HeadingLevel.HEADING_1, indent: { left: 100, right: 100 } })],
                    }),
                    new TableCell({
                        children: [new Paragraph({ text: "Значение", alignment: AlignmentType.CENTER, heading: HeadingLevel.HEADING_1, indent: { left: 100, right: 100 } })],
                    }),
                    new TableCell({
                        children: [new Paragraph({ text: "Масса", alignment: AlignmentType.CENTER, heading: HeadingLevel.HEADING_1, indent: { left: 100, right: 100 } })],
                    }),
                    new TableCell({
                        children: [new Paragraph({ text: "Формула", alignment: AlignmentType.CENTER, heading: HeadingLevel.HEADING_1, indent: { left: 100, right: 100 } })],
                    }),
                    new TableCell({
                        children: [new Paragraph({ text: "Открыто", alignment: AlignmentType.CENTER, heading: HeadingLevel.HEADING_1, indent: { left: 100, right: 100 } })],
                    }),
                    new TableCell({
                        children: [new Paragraph({ text: "Осталось", alignment: AlignmentType.CENTER, heading: HeadingLevel.HEADING_1, indent: { left: 100, right: 100 } })],
                    }),
                    new TableCell({
                        children: [new Paragraph({ text: "Ссылка", alignment: AlignmentType.CENTER, heading: HeadingLevel.HEADING_1, indent: { left: 100, right: 100 } })],
                    }),
                    new TableCell({
                        children: [new Paragraph({ text: "Находится в контейнере ", alignment: AlignmentType.CENTER, heading: HeadingLevel.HEADING_1, indent: { left: 100, right: 100 } })],
                    }),
                ],
            });

            // Создание строк таблицы
            rows = data.AllSubst?.map((substance) => {
                return new TableRow({
                    children: [
                        new TableCell({
                            children: [new Paragraph({ text: substance.Id, alignment: AlignmentType.CENTER, heading: HeadingLevel.HEADING_1, indent: { left: 100, right: 100 } })],
                        }),
                        new TableCell({
                            children: [new Paragraph({ text: substance.SubstName || "", alignment: AlignmentType.CENTER, heading: HeadingLevel.HEADING_1, indent: { left: 100, right: 100 } })],
                        }),
                        new TableCell({
                            children: [new Paragraph({ text: substance.CAS || "", alignment: AlignmentType.CENTER, heading: HeadingLevel.HEADING_1, indent: { left: 100, right: 100 } })],
                        }),
                        new TableCell({
                            children: [new Paragraph({ text: substance.Passport || "", alignment: AlignmentType.CENTER, heading: HeadingLevel.HEADING_1, indent: { left: 100, right: 100 } })],
                        }),
                        new TableCell({
                            children: [new Paragraph({ text: substance.Meaning || "", alignment: AlignmentType.CENTER, heading: HeadingLevel.HEADING_1, indent: { left: 100, right: 100 } })],
                        }),
                        new TableCell({
                            children: [new Paragraph({ text: substance.Mass.toString() || "", alignment: AlignmentType.CENTER, heading: HeadingLevel.HEADING_1, indent: { left: 100, right: 100 } })],
                        }),
                        new TableCell({
                            children: [new Paragraph({ text: substance.Formula || "", alignment: AlignmentType.CENTER, heading: HeadingLevel.HEADING_1, indent: { left: 100, right: 100 } })],
                        }),
                        new TableCell({
                            children: [new Paragraph({ text: substance.Investigated.toString(), alignment: AlignmentType.CENTER, heading: HeadingLevel.HEADING_1, indent: { left: 100, right: 100 } })],
                        }),
                        new TableCell({
                            children: [new Paragraph({ text: substance.Left.toString(), alignment: AlignmentType.CENTER, heading: HeadingLevel.HEADING_1, indent: { left: 100, right: 100 } })],
                        }),
                        new TableCell({
                            children: [new Paragraph({ text: substance.URL || "", alignment: AlignmentType.CENTER, heading: HeadingLevel.HEADING_1, indent: { left: 100, right: 100 } })],
                        }),
                        new TableCell({
                            children: [new Paragraph({ text: substance.ContId || "", alignment: AlignmentType.CENTER, heading: HeadingLevel.HEADING_1, indent: { left: 100, right: 100 } })],
                        }),
                    ],
                });
            });
        }
        else if (data.AllCont) {
            headers = new TableRow({
                children: [
                    new TableCell({
                        children: [new Paragraph({ text: "Номер контейнера" || "", alignment: AlignmentType.CENTER, heading: HeadingLevel.HEADING_1, indent: { left: 100, right: 100 } })],
                    }),
                    new TableCell({
                        children: [new Paragraph({ text: "Содержится в", alignment: AlignmentType.CENTER, heading: HeadingLevel.HEADING_1, indent: { left: 100, right: 100 } })],
                    }),
                    new TableCell({
                        children: [new Paragraph({ text: "Название контейнера", alignment: AlignmentType.CENTER, heading: HeadingLevel.HEADING_1, indent: { left: 100, right: 100 } })],
                    }),
                    new TableCell({
                        children: [new Paragraph({ text: "Название хим. вещества", alignment: AlignmentType.CENTER, heading: HeadingLevel.HEADING_1, indent: { left: 100, right: 100 } })],
                    }),
                ],
            });

            // Создание строк таблицы
            rows = data.AllCont?.map((substance) => {
                return new TableRow({
                    children: [
                        new TableCell({
                            children: [new Paragraph(substance.Id)],
                        }),
                        new TableCell({
                            children: [new Paragraph(substance.ContainsIn?.toString() || "")],
                        }),
                        new TableCell({
                            children: [new Paragraph(substance.Name || "")],
                        }),
                        new TableCell({
                            children: [new Paragraph(substance.SubstHave || "")],
                        }),

                    ],
                });
            });
        }
        else if (data.SubstLeft) {
            headers = new TableRow({
                children: [
                    new TableCell({
                        children: [new Paragraph({ text: "Номер хим. вещества", alignment: AlignmentType.CENTER, heading: HeadingLevel.HEADING_1, indent: { left: 100, right: 100 } })],
                    }),
                    new TableCell({
                        children: [new Paragraph({ text: "Накладная", alignment: AlignmentType.CENTER, heading: HeadingLevel.HEADING_1, indent: { left: 100, right: 100 } })],
                    }),
                    new TableCell({
                        children: [new Paragraph({ text: "Название", alignment: AlignmentType.CENTER, heading: HeadingLevel.HEADING_1, indent: { left: 100, right: 100 } })],

                    }),
                    new TableCell({
                        children: [new Paragraph({ text: "CAS", alignment: AlignmentType.CENTER, heading: HeadingLevel.HEADING_1, indent: { left: 100, right: 100 } })],

                    }),
                    new TableCell({
                        children: [new Paragraph({ text: "Значение", alignment: AlignmentType.CENTER, heading: HeadingLevel.HEADING_1, indent: { left: 100, right: 100 } })],
                    }),
                    new TableCell({
                        children: [new Paragraph({ text: "Масса", alignment: AlignmentType.CENTER, heading: HeadingLevel.HEADING_1, indent: { left: 100, right: 100 } })],
                    }),
                    new TableCell({
                        children: [new Paragraph({ text: "Формула", alignment: AlignmentType.CENTER, heading: HeadingLevel.HEADING_1, indent: { left: 100, right: 100 } })],
                    }),
                    new TableCell({
                        children: [new Paragraph({ text: "Открыто", alignment: AlignmentType.CENTER, heading: HeadingLevel.HEADING_1, indent: { left: 100, right: 100 } })],
                    }),
                    new TableCell({
                        children: [new Paragraph({ text: "Осталось", alignment: AlignmentType.CENTER, heading: HeadingLevel.HEADING_1, indent: { left: 100, right: 100 } })],
                    }),
                    new TableCell({
                        children: [new Paragraph({ text: "Ссылка", alignment: AlignmentType.CENTER, heading: HeadingLevel.HEADING_1, indent: { left: 100, right: 100 } })],
                    }),
                    new TableCell({
                        children: [new Paragraph({ text: "Находился в ", alignment: AlignmentType.CENTER, heading: HeadingLevel.HEADING_1, indent: { left: 100, right: 100 } })]
                    }),
                ],
            });

            // Создание строк таблицы
            rows = data.SubstLeft?.map((substance) => {
                return new TableRow({
                    children: [
                        new TableCell({
                            children: [new Paragraph({ text: substance.Id, alignment: AlignmentType.CENTER, heading: HeadingLevel.HEADING_1, indent: { left: 100, right: 100 } })],
                        }),
                        new TableCell({
                            children: [new Paragraph({ text: substance.Passport || "", alignment: AlignmentType.CENTER, heading: HeadingLevel.HEADING_1, indent: { left: 100, right: 100 } })],
                        }),
                        new TableCell({
                            children: [new Paragraph({ text: substance.SubstName || "", alignment: AlignmentType.CENTER, heading: HeadingLevel.HEADING_1, indent: { left: 100, right: 100 } })],
                        }),
                        new TableCell({
                            children: [new Paragraph({ text: substance.CAS || "", alignment: AlignmentType.CENTER, heading: HeadingLevel.HEADING_1, indent: { left: 100, right: 100 } })],
                        }),
                        new TableCell({
                            children: [new Paragraph({ text: substance.Meaning || "", alignment: AlignmentType.CENTER, heading: HeadingLevel.HEADING_1, indent: { left: 100, right: 100 } })],
                        }),
                        new TableCell({
                            children: [new Paragraph({ text: substance.Mass.toString() || "", alignment: AlignmentType.CENTER, heading: HeadingLevel.HEADING_1, indent: { left: 100, right: 100 } })],
                        }),
                        new TableCell({
                            children: [new Paragraph({ text: substance.Formula || "", alignment: AlignmentType.CENTER, heading: HeadingLevel.HEADING_1, indent: { left: 100, right: 100 } })],
                        }),
                        new TableCell({
                            children: [new Paragraph({ text: substance.Investigated.toString(), alignment: AlignmentType.CENTER, heading: HeadingLevel.HEADING_1, indent: { left: 100, right: 100 } })],
                        }),
                        new TableCell({
                            children: [new Paragraph({ text: substance.Left.toString(), alignment: AlignmentType.CENTER, heading: HeadingLevel.HEADING_1, indent: { left: 100, right: 100 } })],
                        }),
                        new TableCell({
                            children: [new Paragraph({ text: substance.URL || "", alignment: AlignmentType.CENTER, heading: HeadingLevel.HEADING_1, indent: { left: 100, right: 100 } })],
                        }),
                        new TableCell({
                            children: [new Paragraph({ text: substance.ContId || "", alignment: AlignmentType.CENTER, heading: HeadingLevel.HEADING_1, indent: { left: 100, right: 100 } })],
                        }),
                    ],
                });
            });
        }
        else if (data.UserOutput) {
            headers = new TableRow({
                children: [
                    new TableCell({
                        children: [new Paragraph({
                            text: "Номер запроса", alignment: AlignmentType.CENTER, heading: HeadingLevel.HEADING_1, indent: { left: 100, right: 100 }
                        })],
                    }),
                    new TableCell({
                        children: [new Paragraph({
                            text: "ФИО запрашиваемого", alignment: AlignmentType.CENTER, heading: HeadingLevel.HEADING_1, indent: { left: 100, right: 100 }
                        })],
                    }),
                    new TableCell({
                        children: [new Paragraph({
                            text: "Название хим. вещества", alignment: AlignmentType.CENTER, heading: HeadingLevel.HEADING_1, indent: { left: 100, right: 100 }
                        })],
                    }),
                    new TableCell({
                        children: [new Paragraph({
                            text: "Тип оборота", alignment: AlignmentType.CENTER, heading: HeadingLevel.HEADING_1, indent: { left: 100, right: 100 }
                        })],
                    }),
                    new TableCell({
                        children: [new Paragraph({
                            text: "Масса оборота", alignment: AlignmentType.CENTER, heading: HeadingLevel.HEADING_1, indent: { left: 100, right: 100 }
                        })],
                    }),
                    new TableCell({
                        children: [new Paragraph({
                            text: "Дата оборота", alignment: AlignmentType.CENTER, heading: HeadingLevel.HEADING_1, indent: { left: 100, right: 100 }
                        })],
                    }),
                    new TableCell({
                        children: [new Paragraph({
                            text: "Текст запроса", alignment: AlignmentType.CENTER, heading: HeadingLevel.HEADING_1, indent: { left: 100, right: 100 }
                        })],
                    }),
                    new TableCell({
                        children: [new Paragraph({
                            text: "ФИО одобряющего", alignment: AlignmentType.CENTER, heading: HeadingLevel.HEADING_1, indent: { left: 100, right: 100 }
                        })],
                    }),
                ],
            });

            // Создание строк таблицы
            rows = data.UserOutput?.map((substance) => {
                return new TableRow({
                    children: [
                        new TableCell({
                            children: [new Paragraph({
                                text: substance.IdRequest, alignment: AlignmentType.BOTH, heading: HeadingLevel.HEADING_1, indent: { left: 100, right: 100 }
                            })],
                        }),
                        new TableCell({
                            children: [new Paragraph({ text: substance.UserReqFIO, alignment: AlignmentType.BOTH, heading: HeadingLevel.HEADING_1, indent: { left: 100, right: 100 } })],
                        }),
                        new TableCell({
                            children: [new Paragraph({
                                text: substance.SubstName, alignment: AlignmentType.BOTH, heading: HeadingLevel.HEADING_1, indent: { left: 100, right: 100 }
                            })],
                        }),
                        new TableCell({
                            children: [new Paragraph({ text: substance.ActionTitle, alignment: AlignmentType.BOTH, heading: HeadingLevel.HEADING_1, indent: { left: 100, right: 100 } })],
                        }),
                        new TableCell({
                            children: [new Paragraph({
                                text: `${substance.MassCount.toString()} ${substance.UnitTitle} (${substance.Mass.toString()} ${substance.UnitTitle})`, alignment: AlignmentType.BOTH, heading: HeadingLevel.HEADING_1, indent: { left: 100, right: 100 }
                            })],
                        }),
                        new TableCell({
                            children: [new Paragraph({ text: dateformat(substance.ReqDate, "dd.mm.yyyy HH:MM"), alignment: AlignmentType.BOTH, heading: HeadingLevel.HEADING_1, indent: { left: 100, right: 100 } })],
                        }),
                        new TableCell({
                            children: [new Paragraph({
                                text: substance.RequestText, alignment: AlignmentType.BOTH, heading: HeadingLevel.HEADING_1, indent: { left: 100, right: 100 }
                            })],
                        }),
                        new TableCell({
                            children: [new Paragraph({ text: substance.UserAcceptFIO, alignment: AlignmentType.BOTH, heading: HeadingLevel.HEADING_1, indent: { left: 100, right: 100 } })],
                        }),
                    ],
                });
            });
        }
        // Создание таблицы
        if (rows && headers) {
            const table = new Table({

                rows: [headers, ...rows],
            });
            const locales = Intl.DateTimeFormat().resolvedOptions().timeZone;

            // создаем объекты Date
            const now = new Date().toLocaleString("ru-RU", { timeZone: locales });
            const info = new Paragraph({

                children: [
                    new TextRun("Получен: "),
                    new TextRun({
                        text: now,
                    }),

                ],
                heading: HeadingLevel.HEADING_1
            });
            // Создание документа
            const doc = new Document({
                sections: [
                    {
                        properties: {
                            page: {
                                size: {
                                    orientation: PageOrientation.LANDSCAPE,
                                },

                            },
                        },
                        children: [info, table],
                    },

                ],
                styles: {
                    default: {
                        heading1: {
                            run: {
                                size: 28,
                            },
                        }
                    }
                }
            });


            // Запись документа в файл
            Packer.toBlob(doc).then((blob) => {
                saveAs(blob, `Хим вещества ${now.slice(0, 10)}.docx`);
            });
        }


    }
    return (
        <>
            <Head>
                <title>Окно Выходной информации</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            {
                Curuser && Curuser[0] ? (Nav(router, Curuser[0])) : Nav(router, undefined)
            }

            <div className={styles.import}>
                <select onChange={(e) => setOption(e.target.selectedIndex)}>
                    <option>Вывести все хим. вещества с их место положением</option>
                    <option>Вывести все контейнеры с их содержимом</option>
                    <option>Вывести все хим. вещества, которые закончились</option>
                    <option>Вывести отчет о разницы взятия хим веществ</option>
                </select>
                <button onClick={() => MakeDock()}>Вывести в .Docx</button>
            </div>
        </>

    )

}
export default App;