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
import { ListItemIcon, MenuItem, ThemeProvider, createTheme } from '@mui/material'
import { MRT_Localization_RU } from 'material-react-table/locales/ru';
import { Send, Edit } from '@mui/icons-material';
import SearchIcon from '@mui/icons-material/Search';
import Image from 'next/image';

export async function getServerSideProps(context: { req: { cookies: { [x: string]: any; }; }; }) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_URL}api/parrentcontainers`);
    let cont: Container = await response.json();
    const response2 = await fetch(`${process.env.NEXT_PUBLIC_URL}api/substfree`);
    let subst: Substance[] = await response2.json();
    if (context.req.cookies["user"]) {
        console.log(context.req.cookies["user"]);
        return fetch(`${process.env.NEXT_PUBLIC_URL}api/checkuser/${context.req.cookies["user"]}`)
            .then(async (res) => await res.json())
            .then((data) => {
                if (data && data.length !== 0) {
                    let CurUserBd: User[] = data;
                    return {
                        props: { cont, subst, CurUserBd }, // будет передано в компонент страницы как props
                    };
                } else {
                    return {
                        redirect: {
                            destination: '/login',
                            permanent: false
                        }
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
        redirect: {
            destination: '/login',
            permanent: false
        }
    };
}


interface Props {
    cont: Container[],
    subst: Substance[],
    CurUserBd: User[],
}
export default function Home({ cont: dataBd, subst: dataBd2, CurUserBd }: Props) {
    const router = useRouter();
    //Показываемые контейнеры
    // const [SelectCont, setSelectCont] = useState<Container[]>(dataBd);
    const [ContList, setContList] = useState<Container[]>(dataBd);
    //вещества открытого контейнера
    const [SubstList, setSubstList] = useState<Substance[]>(dataBd2);
    //вещества в контейнера
    const [SubstInCont, setSubstInCont] = useState<Substance[]>([]);

    const [Location, SetLocation] = useState<string>('');

    const [CurCont, setCurCont] = useState<Container>();
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
            fetch(`${process.env.NEXT_PUBLIC_URL}api/checkuser/${Cookies.get("user")}`)
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

    function MaterialTable() {
        //should be memoized or stable
        const darkTheme = createTheme({
            palette: {
                mode: 'light',
            },
        });
        const columns = useMemo<MRT_ColumnDef<Substance>[]>(
            () => [
                { accessorKey: 'SubstName', header: 'Название', },
                { accessorKey: 'CAS', header: 'CAS', },
                { accessorKey: 'Meaning', header: 'Значение', },
                // { accessorKey: 'Mass', header: 'Масса', },
                {
                    accessorKey: 'Mass',
                    header: 'Масса',
                    Cell: ({ row }) => <>{SubstInCont[Number.parseInt(row.id)].Mass} {SubstInCont[Number.parseInt(row.id)].UnitName}</>,
                },
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

        return <ThemeProvider theme={createTheme(darkTheme)}>
            <MaterialReactTable
                columns={columns}
                data={SubstInCont}
                localization={MRT_Localization_RU}
                enableRowActions
                initialState={{ showColumnFilters: true }}
                positionToolbarAlertBanner="bottom"
                muiTableHeadCellProps={{
                    sx: {
                        fontWeight: 'normal',
                        fontSize: '14px',
                    },
                }}
                renderRowActionMenuItems={({ closeMenu, row }) => [
                    <MenuItem
                        key={1}
                        onClick={() => {
                            closeMenu();
                            // GetInvoce(Invoces[Number.parseInt(row.id)]);
                            router.push(`/editsubst/${encodeURIComponent(SubstInCont[Number.parseInt(row.id)].Id)}`)
                        }}
                        sx={{ m: 0 }}
                    >
                        <ListItemIcon>
                            <Send />
                        </ListItemIcon>
                        Редактировать
                    </MenuItem>,
                    <MenuItem
                        key={2}
                        onClick={() => {
                            closeMenu();
                            // DelFromCont
                            DelFromCont(SubstInCont[Number.parseInt(row.id)]);
                        }}
                        sx={{ m: 0 }}
                    >
                        <ListItemIcon>
                            <Edit />
                        </ListItemIcon>
                        Удалить из контейнера
                    </MenuItem>,
                    <MenuItem
                        key={3}
                        onClick={() => {
                            closeMenu();
                            // DelFromCont
                            // https://pubchem.ncbi.nlm.nih.gov/#query=123
                            window.open(`https://pubchem.ncbi.nlm.nih.gov/#query=${SubstInCont[Number.parseInt(row.id)].SubstName}`, '_blank');
                        }}
                        sx={{ m: 0 }}
                    >
                        <ListItemIcon>
                            <SearchIcon />
                        </ListItemIcon>
                        Найти на PubChem
                    </MenuItem>,
                ]}
            />;
        </ThemeProvider>


    }

    async function Search() {
        if (searchTerm.trim().length > 0) {
            let res = await fetch(`${process.env.NEXT_PUBLIC_URL}api/search/${searchTerm}`);
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

        if (cookieValue) {
            let ToSnd: SendData = {
                sub: Id,
                con: Location,
                cookieValue: cookieValue,
            }
            const response = await fetch(`${process.env.NEXT_PUBLIC_URL}api/substintocont`, {
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
                fetch(`${process.env.NEXT_PUBLIC_URL}api/substincont/${Location}`).then(async (res) => {
                    if (res.ok) {
                        setSubstInCont(await res.json());
                    }
                });
            }
        }
    }

    async function BuildChildrens(data: Container[], Id: string) {
        let Conts: Container[] = data;
        fetch(`${process.env.NEXT_PUBLIC_URL}api/contid/${Id}`).then((response) => response.json()).then((data) => {
            if (data && data[0]) {
                setCurCont(data[0]);
            }
        });
        setContList(Conts);
    }

    async function OpenClickHandler(Id: string) {
        if (Id != "-1") {
            SetLocation(Id);
            const response = await fetch(`${process.env.NEXT_PUBLIC_URL}api/Contin/${Id}`);
            const data = await response.json();
            await BuildChildrens(data, Id);
            fetch(`${process.env.NEXT_PUBLIC_URL}api/substincont/${Id}`).then(async (res) => {
                if (res.ok) {
                    await setSubstInCont(await res.json());
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
        const response = await fetch(`${process.env.NEXT_PUBLIC_URL}api/parrentcontainers`)
        const data = await response.json();
        await setContList(data);
        SetLocation("");
        setSubstInCont([]);
        setCurCont(undefined);
    }

    function EditContainer(Id: string) {
        router.push(`/editcont/${encodeURIComponent(Id)}`)
    }

    async function DelFromCont(Subst: Substance) {
        interface SndDate {
            del: string,
            user: string
        }
        let SndDate: SndDate = {
            del: Subst.Id,
            user: Cookies.get("user") ?? ""
        }
        if (confirm(`Хотите удалить ${Subst.SubstName} из контейнера?`)) {
            await fetch(`${process.env.NEXT_PUBLIC_URL}api/delsubstfromcont`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(SndDate),
            }).then(() => {
                // let newsubstlst: Substance[] = from(SubstList).where(x => x.Id !== Subst).toArray() as Substance[];
                setSubstInCont(from(SubstInCont).where(x => x.Id !== Subst.Id).toArray() as Substance[]);
                let newsubstlst: Substance[] = [...SubstList, Subst];
                setSubstList(newsubstlst);
                fetch(`${process.env.NEXT_PUBLIC_URL}api/substincont/${Location}`).then(async (res) => {
                    if (res.ok) {
                        setSubstInCont(await res.json());
                    }
                });
            }
            )
        }
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
                    onChange={(e) => setSearchTerm(e.target.value)}
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
            <main className={styles.mainBox}>
                <div className={styles.substContFree}>
                    <h1>Список Хим. веществ</h1>
                    {SubstList && SubstList.length > 0 ? (
                        SubstList.map((item) => (
                            <div key={item.Id} className={styles.containerDiv}>
                                {Location && Location.length != 0 ? (<button onClick={() => InsetToCont(item.Id)}>Добавить в таблицу хим. веществ</button>) : <></>}
                                <h1>{item.SubstName ?? "NULL"}</h1>
                                CAS: {item.CAS ?? "NULL"}
                                <button onClick={() => { router.push(`editsubst/${encodeURIComponent(item.Id)}`) }}>Редактировать</button>
                            </div>
                        ))
                    ) : (
                        <p>Нет свободных хим. веществ</p>
                    )}
                </div>
                <div className={styles.contMain}>
                    <button className={styles.backBtn} onClick={() => GoBack()}>На главную</button>

                    <button className={styles.backBtn} onClick={() => {
                        if (CurCont && CurCont.ContainsIn) {
                            OpenClickHandler(CurCont.ContainsIn)
                        }
                        else {
                            GoBack();
                        }
                    }}>Назад</button>
                    {/* <button className={styles.backBtn} onClick={() => GoBackOne()}>Назад</button>  */}
                    <h1>Список контейнеров</h1>
                    {CurCont ? (<label>Место нахождение: {CurCont.ContainsInName ?? ""}/{CurCont.Name}</label>) : <></>}

                    <select onChange={(e) => OpenClickHandler(e.target.value)}>
                        <option value={-1}>---Главные контейнеры---</option>
                        {ContList && ContList.length > 0 ? (
                            ContList?.map((item) => {
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
                            <></>
                        )}
                    </select>
                    {ContList && ContList.length > 0 ?
                        (ContList?.map((item) => {
                            return (
                                <div key={item.Id} className={styles.containerDiv}>
                                    <Image
                                        onClick={() => OpenClickHandler(item.Id)}
                                        src="/box.svg"
                                        width={75}
                                        className={styles.Image}
                                        height={75}
                                        alt="Open Container"
                                    />
                                    <h1>{item.Name ?? "NULL"} <u>|содержит {item.ContQauntIn} контейнеров</u></h1>
                                    <button onClick={() => EditContainer(item.Id)}>Редактировать</button>
                                </div>
                            );
                        })) :
                        (<p>Нет контейнеров</p>
                        )
                    }
                </div>

            </main >
            <h1 className={styles.TableText}>Таблица хим. веществ</h1>
            {
                <MaterialTable></MaterialTable>
            }
        </>
    );
}