import React, { useMemo } from 'react';
import MaterialReactTable, { type MRT_ColumnDef } from 'material-react-table';
import { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from 'next/router';
import User from 'lib/User';
import Nav from 'lib/Nav';
import { ThemeProvider, createTheme } from '@mui/material'
import { MRT_Localization_RU } from 'material-react-table/locales/ru';
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
                    return {
                        props: { Role, CurUserBd }, // будет передано в компонент страницы как props
                    };
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
                // { accessorKey: 'Mass', header: 'Масса', },
                {
                    accessorKey: 'Mass',
                    header: 'Масса',
                    Cell: ({ row }) => {
                        return <>{TurnoveRequests[Number.parseInt(row.id)].Mass} {TurnoveRequests[Number.parseInt(row.id)].UnitTitle}</>

                    }
                },
                { accessorKey: 'UserReqFIO', header: 'ФИО запрашиваемого', },
                {
                    accessorKey: 'MassCount',
                    header: 'Оборот массы',
                    Cell: ({ row }) => {
                        if (TurnoveRequests[Number.parseInt(row.id)].ActionId == "1") {
                            return <>-{TurnoveRequests[Number.parseInt(row.id)].MassCount} {TurnoveRequests[Number.parseInt(row.id)].UnitTitle}</>
                        }
                        else {
                            return <>+{TurnoveRequests[Number.parseInt(row.id)].MassCount} {TurnoveRequests[Number.parseInt(row.id)].UnitTitle}</>

                        }
                    }
                },
                { accessorKey: 'UserAcceptFIO', header: 'ФИО принявшего', },
            ],
            [],
        );

        return <ThemeProvider theme={createTheme(darkTheme)}>
            <MaterialReactTable
                columns={columns}
                data={TurnoveRequests}
                localization={MRT_Localization_RU}
            />
        </ThemeProvider>


    }

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_URL}api/TurnoveRequest/${Curuser[0].IdUsers}`)
            .then(async res => await res.json())
            .then(data => {
                setTurnoveRequests(data);
            });

    }, [])
    return (
        <>
            <Head>
                <title>Окно моих запросов</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            {
                Curuser && Curuser[0] ? (Nav(router, Curuser[0])) : Nav(router, undefined)
            }
            <main>
                <MaterialTable></MaterialTable>
            </main>
        </>
    )
}
export default App;