import { useRouter } from 'next/router';
import { useEffect, useState } from "react";
import styles from '../styles/Home.module.css';
import User from "../../lib/User";
import React from 'react';
import Cookies from 'js-cookie';
import Head from 'next/head';
import Image from 'next/image';
import Substance from 'lib/Substance';
import docx, { Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun } from "docx";
import { saveAs } from 'file-saver';
import Container from 'lib/Container';

export async function getServerSideProps(context: { req: { cookies: { [x: string]: any; }; }; }) {
    let admin = false;
    const lang = context.req.cookies['user'];
    const response3 = await fetch(`http://localhost:3000/api/checkuser/${lang}`);
    let user: User[] = await response3.json();

    if (user[0]?.RoleId == 1) {
        admin = true;
    }

    return {
        props: { admin }, // will be passed to the page component as props
    }
}
interface Props {
    admin?: boolean,
}
function App({ admin }: Props) {
    interface ToSave {
        AllSubst?: Substance[],
        AllCont?: Container[],
        SubstLeft?: Substance[],
    }
    const router = useRouter();
    function ClearCookies() {
        Cookies.remove("user");
        router.push("/login");
    }
    const [Option, setOption] = useState(0);

    async function MakeDock() {
        let data: ToSave;
        switch (Option) {
            case 0:
                const subst: Substance[] = await fetch("http://localhost:3000/api/allsubst").then((res) => res.json());
                data = {
                    AllSubst: subst
                }
                generateWordFile(data);
                break;
            case 1:
                const cont: Container[] = await fetch("http://localhost:3000/api/contforexport").then((res) => res.json());
                data = {
                    AllCont: cont
                }
                generateWordFile(data);
                break;
            case 2:
                const substEnd: Substance[] = await fetch("http://localhost:3000/api/allsubst/1").then((res) => res.json());
                data = {
                    SubstLeft: substEnd
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
                        children: [new Paragraph("Id")],
                    }),
                    new TableCell({
                        children: [new Paragraph("Название")],
                    }),
                    new TableCell({
                        children: [new Paragraph("CAS")],
                    }),
                    new TableCell({
                        children: [new Paragraph("Значение")],
                    }),
                    new TableCell({
                        children: [new Paragraph("Масса")],
                    }),
                    new TableCell({
                        children: [new Paragraph("Формула")],
                    }),
                    new TableCell({
                        children: [new Paragraph("Открыто")],
                    }),
                    new TableCell({
                        children: [new Paragraph("Осталось")],
                    }),
                    new TableCell({
                        children: [new Paragraph("Ссылка")],
                    }),
                    new TableCell({
                        children: [new Paragraph("Находится в контейнере ")],
                    }),
                ],
            });

            // Создание строк таблицы
            rows = data.AllSubst?.map((substance) => {
                return new TableRow({
                    children: [
                        new TableCell({
                            children: [new Paragraph(substance.Id)],
                        }),
                        new TableCell({
                            children: [new Paragraph(substance.SubstName || "")],
                        }),
                        new TableCell({
                            children: [new Paragraph(substance.CAS || "")],
                        }),
                        new TableCell({
                            children: [new Paragraph(substance.Meaning || "")],
                        }),
                        new TableCell({
                            children: [new Paragraph(substance.Mass || "")],
                        }),
                        new TableCell({
                            children: [new Paragraph(substance.Formula || "")],
                        }),
                        new TableCell({
                            children: [new Paragraph(substance.Investigated)],
                        }),
                        new TableCell({
                            children: [new Paragraph(substance.Left)],
                        }),
                        new TableCell({
                            children: [new Paragraph(substance.URL || "")],
                        }),
                        new TableCell({
                            children: [new Paragraph(substance.ContId || "")],
                        }),
                    ],
                });
            });
        }
        else if (data.AllCont) {
            headers = new TableRow({
                children: [
                    new TableCell({
                        children: [new Paragraph("Id")],
                    }),
                    new TableCell({
                        children: [new Paragraph("Содержится в")],
                    }),
                    new TableCell({
                        children: [new Paragraph("Название контейнера")],
                    }),
                    new TableCell({
                        children: [new Paragraph("Название хим. вещества")],
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
        else if(data.SubstLeft)
        {
            headers = new TableRow({
                children: [
                    new TableCell({
                        children: [new Paragraph("Id")],
                    }),
                    new TableCell({
                        children: [new Paragraph("Название")],
                    }),
                    new TableCell({
                        children: [new Paragraph("CAS")],
                    }),
                    new TableCell({
                        children: [new Paragraph("Значение")],
                    }),
                    new TableCell({
                        children: [new Paragraph("Масса")],
                    }),
                    new TableCell({
                        children: [new Paragraph("Формула")],
                    }),
                    new TableCell({
                        children: [new Paragraph("Открыто")],
                    }),
                    new TableCell({
                        children: [new Paragraph("Осталось")],
                    }),
                    new TableCell({
                        children: [new Paragraph("Ссылка")],
                    }),
                    new TableCell({
                        children: [new Paragraph("Находился в ")],
                    }),
                ],
            });

            // Создание строк таблицы
            rows = data.SubstLeft?.map((substance) => {
                return new TableRow({
                    children: [
                        new TableCell({
                            children: [new Paragraph(substance.Id)],
                        }),
                        new TableCell({
                            children: [new Paragraph(substance.SubstName || "")],
                        }),
                        new TableCell({
                            children: [new Paragraph(substance.CAS || "")],
                        }),
                        new TableCell({
                            children: [new Paragraph(substance.Meaning || "")],
                        }),
                        new TableCell({
                            children: [new Paragraph(substance.Mass || "")],
                        }),
                        new TableCell({
                            children: [new Paragraph(substance.Formula || "")],
                        }),
                        new TableCell({
                            children: [new Paragraph(substance.Investigated)],
                        }),
                        new TableCell({
                            children: [new Paragraph(substance.Left)],
                        }),
                        new TableCell({
                            children: [new Paragraph(substance.URL || "")],
                        }),
                        new TableCell({
                            children: [new Paragraph(substance.ContId || "")],
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
                        text: now
                    }),
                ],
            });
            // Создание документа
            const doc = new Document({

                sections: [
                    {
                        children: [
                            info,
                            table
                        ],
                    },
                ],
            });

            // Запись документа в файл
            Packer.toBlob(doc).then((blob) => {
                saveAs(blob, "Хим вещества.docx");
                console.log("Document created successfully");
            });
        }


    }
    return (
        <>
            <Head>
                <title>Окно Выходной инфы</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <nav className={styles.menuBox}>
                <Image width={50} height={50} src={"/atom.png"} alt='Atom' onClick={() => router.push("/")} />
                <button onClick={() => router.push("/import/")}>Импорт</button>
                <button onClick={() => router.push(`/editsubst/AddSubst`)}>Добавить хим. вещество</button>
                <button onClick={() => router.push(`/editcont/AddCotainer`)}>Добавить контейнер</button>
                {
                    admin == true ? (<button>Управление пользователями</button>)
                        : <></>
                }
                <button onClick={() => router.push(`/outputdata`)}>выходная информ-ия</button>
                <button onClick={() => ClearCookies()}>Выход</button>
            </nav>
            <div className={styles.import}>
                <select onChange={(e) => setOption(e.target.selectedIndex)}>
                    <option>Вывести все хим. вещества с их место положением</option>
                    <option>Вывести все контейнеры с их содержимом</option>
                    <option>Вывести все хим. вещества, которые закончились</option>
                </select>
                <button onClick={() => MakeDock()}>Вывести в .Docx</button>
            </div>
        </>

    )

}
export default App;