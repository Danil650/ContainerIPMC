import React, { useMemo } from 'react';
import MaterialReactTable, { type MRT_ColumnDef } from 'material-react-table';
import { useEffect, useState } from "react";
import styles from '@/styles/Home.module.css'
import Head from "next/head";
import { useRouter } from 'next/router';
import User from 'lib/User';
import Nav from 'lib/Nav';
import { ListItemIcon, MenuItem, ThemeProvider, createTheme } from '@mui/material'
import { MRT_Localization_RU } from 'material-react-table/locales/ru';
import { Send } from '@mui/icons-material';
import TurnoveRequest from 'lib/TurnoveRequest';
import Decimal from 'decimal.js';

export async function getServerSideProps(context: { req: { cookies: { [x: string]: any; }; }; }) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_URL}api/roles`);
    let Role = await response.json();
    if (context.req.cookies["user"]) {
        console.log(context.req.cookies["user"]);
        return fetch(`${process.env.NEXT_PUBLIC_URL}api/checkuser/${context.req.cookies["user"]}`)
            .then(async (res) => await res.json())
            .then((data) => {
                if (data && data.length !== 0) {
                    let CurUserBd: User[] = data;
                    if (CurUserBd[0].RoleId != 1) {
                        return {
                            redirect: {
                                destination: '/',
                                permanent: false
                            }
                        };
                    }
                    else {
                        return {
                            props: { Role, CurUserBd }, // будет передано в компонент страницы как props
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
    const router = useRouter();
    const [Curuser, setCuruser] = useState<User[]>(CurUserBd);
    const [TurnoveRequests, setTurnoveRequests] = useState<TurnoveRequest[]>([]);
    const [SelectTurnReq, setSelectTurnReq] = useState("-1");
    const [Users, setUsers] = useState<User[]>([]);

    function MaterialTable() {
        //should be memoized or stable
        const darkTheme = createTheme({
            palette: {
                mode: 'light',
            },
        });
        const columns = useMemo<MRT_ColumnDef<TurnoveRequest>[]>(
            () => [
                { accessorKey: 'StatusTitle', header: 'Оборот', },
                { accessorKey: 'ActionTitle', header: 'Действие', },
                { accessorKey: 'SubstName', header: 'Название хим. вещества', },
                {
                    accessorKey: 'Result',
                    header: 'Результат',
                    Cell: ({ row }) => {
                        if (TurnoveRequests[Number.parseInt(row.id)].ActionId == "1") {
                            return <>{new Decimal(TurnoveRequests[Number.parseInt(row.id)].Mass).minus(new Decimal(TurnoveRequests[Number.parseInt(row.id)].MassCount)).toString()} (-{TurnoveRequests[Number.parseInt(row.id)].MassCount})</>
                        }
                        else {
                            return <>{new Decimal(TurnoveRequests[Number.parseInt(row.id)].Mass).plus(new Decimal(TurnoveRequests[Number.parseInt(row.id)].MassCount)).toString()} (+{TurnoveRequests[Number.parseInt(row.id)].MassCount})</>
                        }
                    }
                },
                { accessorKey: 'Mass', header: 'Изначальная масса', },
                { accessorKey: 'UserReqFIO', header: 'ФИО запрашиваемого', },
                { accessorKey: 'UserAcceptFIO', header: 'ФИО принявшего', },
            ],
            [],
        );

        return <ThemeProvider theme={createTheme(darkTheme)}>
            <MaterialReactTable
                columns={columns}
                data={TurnoveRequests}
                localization={MRT_Localization_RU}
                enableRowActions
                initialState={{ showColumnFilters: true }}
                positionToolbarAlertBanner="bottom"
                renderRowActionMenuItems={({ closeMenu, row }) => [
                    <MenuItem
                        key={1}
                        onClick={() => {
                            closeMenu();
                            router.push(`/turnovercontroll/edit/${TurnoveRequests[Number.parseInt(row.id)].IdRequest}`)
                        }}
                        sx={{ m: 0 }}
                    >
                        <ListItemIcon>
                            <Send />
                        </ListItemIcon>
                        Открыть
                    </MenuItem>
                ]}
            />;
        </ThemeProvider>


    }

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_URL}api/TurnoveRequest/users`)
            .then(async res => await res.json())
            .then(data => {
                setUsers(data);
            });
    }, [])

    useEffect(() => {
        if (SelectTurnReq != "-1") {
            fetch(`${process.env.NEXT_PUBLIC_URL}api/TurnoveRequest/${SelectTurnReq}`)
                .then(async res => await res.json())
                .then(data => {
                    setTurnoveRequests(data);
                });
        }
        else {
            fetch(`${process.env.NEXT_PUBLIC_URL}api/TurnoveRequest/`)
                .then(async res => await res.json())
                .then(data => {
                    setTurnoveRequests(data);
                });
        }
    }, [SelectTurnReq])
    return (
        <>
            <Head>
                <title>Окно управления оборота</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            {
                Curuser && Curuser[0] ? (Nav(router, Curuser[0])) : Nav(router, undefined)
            }
            <main>
                <div className={styles.searchPanel}>
                    <label>Запрашиваемый </label>    <select onChange={(e) => setSelectTurnReq(e.target.value)}>
                        <option value={"-1"}>---</option>
                        {Users && Users.length > 0 ? (
                            Users?.map((item) => {
                                return (
                                    <option key={item.IdUsers} value={item.IdUsers}>
                                        ФИО: {item.FIO}
                                    </option>
                                );
                            })
                        ) : (
                            <></>
                        )}
                    </select>
                </div>
                <MaterialTable></MaterialTable>
            </main>
        </>
    )
}
export default App;