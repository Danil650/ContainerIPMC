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


export async function getServerSideProps(context: { req: { cookies: { [x: string]: any; }; }; }) {
    let admin = false;
    const response = await fetch("http://localhost:3000/api/parrentcontainers");
    let dataBd: Container = await response.json();
    const response2 = await fetch("http://localhost:3000/api/substfree");
    let dataBd2: Substance[] = await response2.json();
    const lang = context.req.cookies['user'];
    const response3 = await fetch(`http://localhost:3000/api/checkuser/${lang}`);
    let user: User[] = await response3.json();

    if (user[0]?.RoleId == 1) {
        admin = true;
    }

    return {
        props: { dataBd, dataBd2, admin }, // will be passed to the page component as props
    }
}
interface Props {
    dataBd: Container[],
    dataBd2: Substance[],
    admin: boolean,
}
interface SendData {
    cont: Container[],
    subst: Substance[]
}
export default function Home({ dataBd, dataBd2, admin }: Props) {
    //Показываемые контейнеры
    let [ContList, setContList] = useState<Container[]>(dataBd);
    //вещества открытого контейнера
    let [SubstList, setSubstList] = useState<Substance[]>(dataBd2);
    //вещества в контейнера
    let [SubstInCont, setSubstInCont] = useState<Substance[]>([]);
    //история посещения контейнера
    let [HistoryCont, setSubstHist] = useState<Container[]>([]);
    let [Location, SetLocation] = useState<string>('');


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
                });
        }
    }, []);

    const router = useRouter()
    const MaterialTable = () => {
        //should be memoized or stable
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
    };

    function Search() {

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

    function ClearCookies() {
        Cookies.remove("user");
        router.push("/login");
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
            <nav className={styles.menuBox}>
                <button onClick={() => router.push("/import/")}>Импорт</button>
                <button onClick={() => GoBack()}>Вернуться</button>
                <button onClick={() => router.push(`/editsubst/AddSubst`)}>Добавить хим. вещество</button>
                <button onClick={() => router.push(`/editcont/AddCotainer`)}>Добавить контейнер</button>
                {
                    admin == true ? (<button>Управление пользователями</button>)
                        : <></>
                }
                <button onClick={() => ClearCookies()}>Выход</button>
            </nav>
            <div className={styles.searchPanel}>
                <div>
                    <label htmlFor="header-search">
                        <span className="visually-hidden">Поисковая строка</span>
                    </label>
                    <input
                    onClick={()=>Search()}
                        type="text"
                        id="header-search"
                        name="s"
                    />
                    <button>Поиск</button>
                </div>
                <label>Вы находитесь в "/"</label>
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
                                <button onClick={() => InsetToCont(item.Id)}>Вставить</button>
                                <h1>{item.SubstName ?? "NULL"}</h1>
                                {item.CAS ?? "NULL"}
                                <button onClick={() => { router.push(`editsubst/${encodeURIComponent(item.Id)}`) }}>
                                    Редактировать
                                </button>

                            </div>
                        ))
                    ) : (
                        <p>нету свободных хим. веществ</p>
                    )}
                </div>
                <div className={styles.contMain}>
                    <h1>Список контейнеров</h1>
                    {ContList && ContList.length > 0 ?
                        (ContList?.map((item) => {
                            return (
                                <div key={item.Id} className={styles.containerDiv}>
                                    <button onClick={() => OpenClickHandler(item.Id)}>Показать содержимое</button>
                                    <h1>{item.Name ?? "NULL"}|содержит {item.ContQauntIn} контейнеров</h1>
                                    <button onClick={() => EditContainer(item.Id)}>Редактировать</button>
                                </div>
                            );
                        })) :
                        (<p>нету контейнеров</p>
                        )
                    }
                </div>
            </main>
        </>
    );
}