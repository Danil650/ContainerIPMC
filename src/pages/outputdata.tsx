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
import Nav from 'lib/Nav';
import UserOutput from 'lib/UserOutput';

function App() {
    interface ToSave {
        AllSubst?: Substance[],
        AllCont?: Container[],
        SubstLeft?: Substance[],
        UserOutput?: UserOutput[],
    }
    const router = useRouter();
    const [Curuser, setCuruser] = useState<User[]>();
    const [Option, setOption] = useState(0);
    useEffect(() => {
        if (!Cookies.get("user")) {
            router.push("/login");
        }
        else {
            fetch(`http://localhost:3000/api/checkuser/${Cookies.get("user")}`)
                .then(async res => await res.json())
                .then(data => {
                    if (data.length == 0) {
                        router.push("/login");
                        Cookies.remove("user");
                    }
                    else {
                        setCuruser(data);
                    }
                });
        }
    }, []);
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
            case 3:
                let UserTurnove: UserOutput[] = [];
                await fetch("http://localhost:3000/api/userturnover", {
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
                        children: [new Paragraph("Номер хим. вещества")],
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
                            children: [new Paragraph(substance.Mass.toString() || "")],
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
                        children: [new Paragraph("Номер контейнера")],
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
        else if (data.SubstLeft) {
            headers = new TableRow({
                children: [
                    new TableCell({
                        children: [new Paragraph("Номер хим. вещества")],
                    }),
                    new TableCell({
                        children: [new Paragraph("Пасп")],
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
                            children: [new Paragraph(substance.Mass.toString() || "")],
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
        else if (data.UserOutput) {
            headers = new TableRow({
                children: [
                    new TableCell({
                        children: [new Paragraph("ФИО пользователя")],
                    }),
                    new TableCell({
                        children: [new Paragraph("Номер хим. веществыа")],
                    }),
                    new TableCell({
                        children: [new Paragraph("Пасп")],
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
                        children: [new Paragraph("Разница взятея веществ")],
                    }),
                ],
            });

            // Создание строк таблицы
            rows = data.UserOutput?.map((substance) => {
                return new TableRow({
                    children: [
                        new TableCell({
                            children: [new Paragraph(substance.FIO)],
                        }),
                        new TableCell({
                            children: [new Paragraph(substance.Id)],
                        }),
                        new TableCell({
                            children: [new Paragraph(substance.SubstName || "")],
                        }),
                        new TableCell({
                            children: [new Paragraph(substance.Passport || "")],
                        }),
                        new TableCell({
                            children: [new Paragraph(substance.CAS || "")],
                        }),
                        new TableCell({
                            children: [new Paragraph(substance.Meaning || "")],
                        }),
                        new TableCell({
                            children: [new Paragraph(substance.Mass.toString() || "")],
                        }),
                        new TableCell({
                            children: [new Paragraph(substance.Formula || "")],
                        }),
                        new TableCell({
                            children: [new Paragraph(substance.Investigated.toString())],
                        }),
                        new TableCell({
                            children: [new Paragraph(substance.Left.toString())],
                        }),
                        new TableCell({
                            children: [new Paragraph(substance.URL || "")],
                        }),
                        new TableCell({
                            children: [new Paragraph(substance.Difference.toString() || "0")],
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