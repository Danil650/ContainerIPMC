import React from 'react';
import { useEffect, useState } from "react";
import styles from '@/styles/Home.module.css'
import Head from "next/head";
import { useRouter } from 'next/router';
import User from 'lib/User';
import Nav from 'lib/Nav';
import Invoce, { GetInvoce, validateFile } from 'lib/Invoce';
import dateformat from 'dateformat'
import TurnoveRequest from 'lib/TurnoveRequest';
import Decimal from 'decimal.js';
import RequestStatus from 'lib/RequestStatus';

export async function getServerSideProps(context: { req: { cookies: { [x: string]: any; }; }; }) {
    if (context.req.cookies["user"]) {
        console.log(context.req.cookies["user"]);
        return fetch(`${process.env.NEXT_PUBLIC_URL}api/checkuser/${context.req.cookies["user"]}`)
            .then(async (res) => await res.json())
            .then((data) => {
                if (data && data.length !== 0) {
                    let CurUserBd: User[] = data;
                    console.log(CurUserBd);
                    if (CurUserBd && CurUserBd[0].RoleId && CurUserBd[0].RoleId <= 2) {
                        return {
                            props: { CurUserBd }, // будет передано в компонент страницы как props
                        };
                    } else {
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
    CurUserBd: User[],
}

export default function Home({ CurUserBd }: getServerSideProps) {
    const router = useRouter();
    const [Curuser, setCuruser] = useState<User[]>(CurUserBd);
    const { Id } = router.query;
    const [TurnoveReq, setTurnoveReq] = useState<TurnoveRequest>();
    const [Statuses, setStatuses] = useState<RequestStatus[]>([]);
    const [SelStatus, setSelStatus] = useState("");

    const [StatusDis, setStatusDis] = useState(false);
    function Counter() {
        if (TurnoveReq) {
            if (TurnoveReq.ActionId == "1") {
                return <label>Итого: было ({TurnoveReq.Mass} {TurnoveReq?.UnitTitle}) стало {new Decimal(TurnoveReq!.Mass).minus(new Decimal(TurnoveReq!.MassCount)).toString()} {TurnoveReq?.UnitTitle}</label>
            }
            else {
                return <label>Итого: было ({TurnoveReq.Mass} {TurnoveReq?.UnitTitle}) стало {new Decimal(TurnoveReq!.Mass).plus(new Decimal(TurnoveReq!.MassCount)).toString()} {TurnoveReq?.UnitTitle}</label>
            }
        }
        else {
            return <></>
        }
    }
    useEffect(() => {
        if (Id) {
            fetch(`${process.env.NEXT_PUBLIC_URL}api/statusreq`)
                .then(async res => await res.json())
                .then(data => {
                    setStatuses(data);
                });
            fetch(`${process.env.NEXT_PUBLIC_URL}api/TurnoveRequest/id/${Id}`)
                .then(async res => await res.json())
                .then(data => {
                    if (data && data[0]) {
                        setTurnoveReq(data[0]);
                        setSelStatus(data[0].StatusId);
                        if (data[0].StatusId != "1") {
                            setStatusDis(true);
                        }
                    }
                    else {
                        router.push("/");
                    }

                });
        }
    }, [Id])

    function Commit() {
        if (TurnoveReq) {
            interface SndData {
                TurnoveReq: TurnoveRequest,
                Status: string,
                CurUser: string,
            };
            if (TurnoveReq.ActionId == "1") {
                if (new Decimal(TurnoveReq!.Mass).minus(new Decimal(TurnoveReq!.MassCount)).isNegative()) {
                    alert("Заполните необходимые поля");
                    return;
                }
            }
            const sndData: SndData = {
                TurnoveReq: TurnoveReq,
                Status: SelStatus,
                CurUser: Curuser[0].IdUsers
            }
            fetch(`${process.env.NEXT_PUBLIC_URL}api/commitrequest`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(sndData),
            })
                .then((res) => {
                    if (res.ok) {
                        return res.json();
                    }
                })
                .then((data) => {
                    alert(data);
                    router.push("/turnovercontroll")
                })
                .catch((error) => {
                    console.error("Ошибка получения данных: ", error);
                    router.push("/")
                });
        }
        else {
            alert("Данные отсутствуют");
        }

    }
    return (
        <>
            <Head>
                <title>Окно редактирования оборота</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            {
                Curuser && Curuser[0] ? (Nav(router, Curuser[0])) : Nav(router, undefined)
            }
            <main>
                <div className={styles.edit}>
                    <label>Хим. вещество: {TurnoveReq?.SubstName} ({TurnoveReq?.SubstId})</label>
                    <label>Действие оборота: {TurnoveReq?.ActionTitle} {TurnoveReq?.MassCount} {TurnoveReq?.UnitTitle}</label>
                    <Counter></Counter>
                    <label>ФИО запрашиваемого: {TurnoveReq?.UserReqFIO}</label>
                    <label>Дата запроса: {dateformat(TurnoveReq?.ReqDate, "dd.mm.yyyy HH:MM", false).toString()}</label>
                    <label>Статус запроса</label>
                    <select disabled={StatusDis} value={SelStatus} onChange={(e) => setSelStatus(e.target.value)}>
                        {Statuses && Statuses.length > 0 ? (Statuses.map((item) => {
                            return <option key={item.StatusId} value={item.StatusId}>
                                {item.StatusTitle}
                            </option>
                        })) : <></>}
                    </select>
                    <textarea defaultValue={TurnoveReq?.RequestText} disabled={true}></textarea>
                    <button onClick={() => Commit()}>Сохранить</button>
                </div>
            </main >
        </>
    );
}