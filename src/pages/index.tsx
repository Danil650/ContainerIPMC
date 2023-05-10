import React, { useMemo } from 'react';
import MaterialReactTable, { type MRT_ColumnDef } from 'material-react-table';
import { useEffect, useState } from "react";
import styles from '@/styles/Home.module.css'
import Head from "next/head";
import Container from "lib/Container";
import Substance from "lib/Substance";
import { from } from "linq-to-typescript"
import { useRouter } from 'next/router';
import Cookies from 'js-cookie'
import User from 'lib/User';
import Nav from 'lib/Nav';

export async function getServerSideProps(context: { req: { cookies: { [x: string]: any; }; }; }) {
    const response = await fetch("http://localhost:3000/api/parrentcontainers");
    let cont: Container = await response.json();
    const response2 = await fetch("http://localhost:3000/api/substfree");
    let subst: Substance[] = await response2.json();
    if (context.req.cookies["user"]) {
        console.log(context.req.cookies["user"]);
        return fetch(`http://localhost:3000/api/checkuser/${context.req.cookies["user"]}`)
            .then(async (res) => await res.json())
            .then((data) => {
                if (data && data.length !== 0) {
                    let CurUserBd: User[] = data;
                    return {
                        props: { cont, subst, CurUserBd }, // будет передано в компонент страницы как props
                    };
                } else {
                    return {
                        props: { cont, subst }, // будет передано в компонент страницы как props
                    };
                }
            })
            .catch((error) => {
                console.error('Error fetching CurUserBd:', error);
                return {
                    props: { cont, subst }, // будет передано в компонент страницы как props
                };
            });

    }
    return {
        props: { cont, subst }, // will be passed to the page component as props
    }
}


interface Props {
    cont: Container[],
    subst: Substance[],
    CurUserBd: User[],
}
export default function Home({ cont: dataBd, subst: dataBd2, CurUserBd }: Props) {
    const router = useRouter();
    //Показываемые контейнеры
    const [SelectCont, setSelectCont] = useState<Container[]>(dataBd);
    const [ContList, setContList] = useState<Container[]>(dataBd);
    //вещества открытого контейнера
    const [SubstList, setSubstList] = useState<Substance[]>(dataBd2);
    //вещества в контейнера
    const [SubstInCont, setSubstInCont] = useState<Substance[]>([]);
    //история посещения контейнера
    const [HistoryCont, setSubstHist] = useState<Container[]>([]);

    const [Location, SetLocation] = useState<string>('');
    //Поиск
    const [searchTerm, setSearchTerm] = useState("");

    const [SearchList, setSearchList] = useState<Props>();

    const [showResults, setShowResults] = useState<boolean>();

    const [Curuser, setCuruser] = useState<User[]>(CurUserBd);

    useEffect(() => {
        setShowResults(false);
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

    const MaterialTable = () => {
        //should be memoized or stable
        if (Curuser && Curuser[0].RoleId && Curuser[0].RoleId < 3) {
            const columns = useMemo<MRT_ColumnDef<Substance>[]>(
                () => [
                    {
                        header: 'Редактировать',
                        columnDefType: 'display',
                        enableColumnOrdering: true,
                        Cell: ({ row }) => (
                            <button onClick={() => router.push(`/editsubst/${encodeURIComponent(SubstInCont[Number.parseInt(row.id)].Id)}`)}>
                                Редактировать
                            </button>
                        ),
                    },
                    { accessorKey: 'SubstName', header: 'Название', },
                    { accessorKey: 'CAS', header: 'CAS', },
                    { accessorKey: 'Meaning', header: 'Значение', },
                    { accessorKey: 'Mass', header: 'Масса', },
                    { accessorKey: 'Formula', header: 'Формула', },
                    { accessorKey: 'Investigated', header: 'Исследован', },
                    { accessorKey: 'Left', header: 'Осталось', },
                    {
                        accessorKey: 'URL',
                        header: 'Ссылка',
                        Cell: ({ row }) => <a href={SubstInCont[Number.parseInt(row.id)].URL}>{SubstInCont[Number.parseInt(row.id)].URL}</a>,
                    },
                ],
                [],
            );

            return <MaterialReactTable columns={columns} data={SubstInCont} />;
        }
        else {
            const columns = useMemo<MRT_ColumnDef<Substance>[]>(
                () => [
                    { accessorKey: 'SubstName', header: 'Название', },
                    { accessorKey: 'CAS', header: 'CAS', },
                    { accessorKey: 'Meaning', header: 'Значение', },
                    { accessorKey: 'Mass', header: 'Масса', },
                    { accessorKey: 'Formula', header: 'Формула', },
                    { accessorKey: 'Investigated', header: 'Исследован', },
                    { accessorKey: 'Left', header: 'Осталось', },
                    {
                        accessorKey: 'URL',
                        header: 'Ссылка',
                        Cell: ({ row }) => <a href={SubstInCont[Number.parseInt(row.id)].URL}>{SubstInCont[Number.parseInt(row.id)].URL}</a>,
                    },
                ],
                [],
            );

            return <MaterialReactTable columns={columns} data={SubstInCont} />;
        }

    }

    async function Search() {
        if (searchTerm.trim().length > 0) {
            let res = await fetch(`http://localhost:3000/api/search/${searchTerm}`);
            let date = await res.json();
            setSearchList(date);
            setShowResults(true);
        }

    }

    async function InsetToCont(Id: string) {
        const cookieValue = Cookies.get('user'); // получаем значение куки
        interface SendData {
            sub: string;
            con: string;
            cookieValue: string;
        }
        if (HistoryCont && HistoryCont.length != 0) {
            if (cookieValue) {
                let ToSnd: SendData = {
                    sub: Id,
                    con: Location,
                    cookieValue: cookieValue,
                }
                const response = await fetch("http://localhost:3000/api/substintocont", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(ToSnd),
                });
                if (!response.ok) {
                    alert("Failed to send data to API");
                }
                else {
                    let newsubstlst: Substance[] = from(SubstList).where(x => x.Id !== Id).toArray() as Substance[];
                    setSubstList(newsubstlst);
                    fetch(`http://localhost:3000/api/substincont/${Location}`).then(async (res) => {
                        if (res.ok) {
                            setSubstInCont(await res.json());
                        }
                    });
                }
            }
        }
        else {
            alert("Зайдите в контейнер");
        }
    }

    async function BuildChildrens(data: Container[], Id: string) {
        let Conts: Container[] = data;
        const response = await fetch(`http://localhost:3000/api/contid/${Id}`);
        let dataBd: Container = await response.json();
        setSubstHist(HistoryCont => [...HistoryCont, dataBd]);
        // Conts = Conts.filter(x => x.Id !== Id);
        setContList(Conts);
    }
    async function OpenClickHandler(Id: string) {
        if (Id != "-1") {
            SetLocation(Id);
            const response = await fetch(`http://localhost:3000/api/Contin/${Id}`);
            const data = await response.json();
            await BuildChildrens(data, Id);
            fetch(`http://localhost:3000/api/substincont/${Id}`).then(async (res) => {
                if (res.ok) {
                    setSubstInCont(await res.json());
                    return;
                }
            });
            setSubstInCont([]);
        }
        else {
            GoBack();
        }
    }

    async function GoBack() {
        SetLocation("");
        const response = await fetch("http://localhost:3000/api/parrentcontainers")
        const data = await response.json();
        await setContList(data);
        SetLocation("");
        setSubstHist([]);
        setSubstInCont([]);
    }

    function EditContainer(Id: string) {
        router.push(`/editcont/${encodeURIComponent(Id)}`)
    }
    return (
        <>
            <Head>
                <title>Окно контейнеров</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            {
                Curuser && Curuser[0] ? (Nav(router, Curuser[0])) : Nav(router, undefined)
            }

            <div className={styles.searchPanel}>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e)=>setSearchTerm(e.target.value)}
                    onFocus={() => setShowResults(true)}
                />
                <button onClick={() => Search()}>Поиск</button>
                <button onClick={() => setShowResults(false)}>Скрыть</button>
                {showResults && (
                    <ul>
                        {SearchList && SearchList.cont?.length > 0 ? (
                            SearchList?.cont.map((item) => (
                                <div key={item.Id}>
                                    <li >Контейнер: {item.Name} {item.DateCreate ? (<u>/был создан: {new Date(item.DateCreate).toLocaleDateString("ru-RU", { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone })}</u>) : <></>}</li>
                                    <button onClick={() => OpenClickHandler(item.Id)}>&gt;</button>
                                </div>
                            ))
                        ) : <></>}
                        {SearchList && SearchList.subst?.length > 0 ? (
                            SearchList?.subst.map((item) => (
                                <div key={item.Id}>
                                    <li>Хим. вещество: {item.SubstName}</li>
                                    <button onClick={() => {
                                        if (item.ContId) {
                                            OpenClickHandler(item.ContId);
                                        }
                                    }}>&gt;</button>
                                </div>

                            ))
                        ) : <></>}
                    </ul>
                )}
            </div>
            {
                SubstInCont && SubstInCont.length > 0 ? (
                    <MaterialTable></MaterialTable>
                ) : <></>
            }
            <main className={styles.mainBox}>
                <div className={styles.substContFree}>
                    <h1>Список Хим. веществ</h1>
                    {SubstList && SubstList.length > 0 ? (
                        SubstList.map((item) => (
                            <div key={item.Id} className={styles.containerDiv}>
                                {HistoryCont && HistoryCont.length != 0 ? (<button onClick={() => InsetToCont(item.Id)}>Вставить</button>) : <></>}
                                <h1>{item.SubstName ?? "NULL"}</h1>
                                {item.CAS ?? "NULL"}
                                {Curuser && Curuser[0].RoleId && Curuser[0].RoleId < 3 ? (<button onClick={() => { router.push(`editsubst/${encodeURIComponent(item.Id)}`) }}>Редактировать</button>) : <></>}

                            </div>
                        ))
                    ) : (
                        <p>Нет свободных хим. веществ</p>
                    )}
                </div>
                <div className={styles.contMain}>
                    <button className={styles.backBtn} onClick={() => GoBack()}>Вернуться</button>
                    <h1>Список контейнеров</h1>
                    <select onChange={(e) => OpenClickHandler(e.target.value)}>
                        <option value={-1}>---Главные контейнеры---</option>
                        {SelectCont && SelectCont.length > 0 ? (
                            SelectCont?.map((item) => {
                                let DateCreate = ""
                                if (item.DateCreate) {
                                    DateCreate = `Создан в ${new Date(item.DateCreate).toLocaleDateString()}`;
                                }
                                return (
                                    <option key={item.Id} value={item.Id}>
                                        {item.Name} || Количество контейнеров: {item.ContQauntIn} {DateCreate}
                                    </option>
                                );
                            })
                        ) : (
                            <option>---</option>
                        )}
                    </select>
                    {ContList && ContList.length > 0 ?
                        (ContList?.map((item) => {
                            return (
                                <div key={item.Id} className={styles.containerDiv}>
                                    <button onClick={() => OpenClickHandler(item.Id)}>Показать содержимое</button>
                                    <h1>{item.Name ?? "NULL"} <u>|содержит {item.ContQauntIn} контейнеров</u></h1>
                                    {Curuser && Curuser[0].RoleId && Curuser[0].RoleId < 3 ? (<button onClick={() => EditContainer(item.Id)}>Редактировать</button>) : <></>}
                                </div>
                            );
                        })) :
                        (<p>Нет контейнеров</p>
                        )
                    }
                </div>
            </main>
        </>
    );
}