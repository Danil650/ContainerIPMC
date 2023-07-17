import { useRouter } from 'next/router';
import { useEffect, useState } from "react";
import styles from '../../styles/Home.module.css';
import User from "../../../lib/User";
import React from 'react';
import Cookies from 'js-cookie';
import Head from 'next/head';
import Image from 'next/image';
import Substance from 'lib/Substance';
import Nav from 'lib/Nav';
import Role from 'lib/Role';

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
    Role: Role[],
    CurUserBd: User[]
}
function App({ Role, CurUserBd }: getServerSideProps) {

    const router = useRouter();
    const { Id } = router.query;
    const [Curuser, setCuruser] = useState<User[]>(CurUserBd);
    const [Login, setLogin] = useState("");
    const [Pasw, setPasw] = useState("");
    const [FIO, setFIO] = useState("");
    const [RoleId, setRoleId] = useState("1");
    const [Roles, _] = useState<Role[]>(Role);
    const [ChangePasw, setChangePasw] = useState(false);

    useEffect(() => {
        if (Curuser && Curuser[0].RoleId == 1) {

        }
        else {
            router.push("/");
        }
    }, []);
    useEffect(() => {
        if (Id) {
            const userId: User = {
                IdUsers: Id.toString(),
                Login: "",
                Password: "",
                RoleId: 0,
                FIO: ""
            }
            fetch(`${process.env.NEXT_PUBLIC_URL}api/getuser`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(userId),
            })
                .then((res) => {
                    if (res.ok) {
                        return res.json();
                    }
                })
                .then((data) => {
                    if (data.length > 0) {
                        setLogin(data[0].Login);
                        setFIO(data[0].FIO);
                        setRoleId(data[0].RoleId);
                    }
                })
                .catch((error) => {
                    console.error("Ошибка получения данных: ", error);
                    router.push("/")
                });
        }
    }, [Id])
    function EditUser() {
        if (ChangePasw) {
            if (Login.trim().length > 0 && Pasw.trim().length > 0 && FIO.trim().length > 0 && RoleId && Curuser && Id) {
                //updateuser
                interface SndData {
                    CurUser: User,
                    UserUpdate: User
                };

                const UserUpd: User = {
                    IdUsers: Id[0],
                    Login: Login.trim(),
                    Password: Pasw.trim(),
                    RoleId: Number(RoleId),
                    FIO: FIO
                };

                const sndData: SndData = {
                    CurUser: Curuser[0],
                    UserUpdate: UserUpd
                }
                fetch(`${process.env.NEXT_PUBLIC_URL}api/updateuser`, {
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
                        if (data[0] == "ok") {
                            alert("Пользователь изменен");
                            router.push("/");
                        }
                        else {
                            alert(data);
                        }
                    })
                    .catch((error) => {
                        console.error("Ошибка получения данных: ", error);
                        router.push("/")
                    });
            }
        }
        else {
            if (Login.trim().length > 0 && FIO.trim().length > 0 && RoleId && Curuser && Id) {
                //updateuser
                interface SndData {
                    CurUser: User,
                    UserUpdate: User
                };

                const UserUpd: User = {
                    IdUsers: Id[0],
                    Login: Login.trim(),
                    Password: "",
                    RoleId: Number(RoleId),
                    FIO: FIO
                };

                const sndData: SndData = {
                    CurUser: Curuser[0],
                    UserUpdate: UserUpd
                }
                fetch(`${process.env.NEXT_PUBLIC_URL}api/updateuser`, {
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
                        if (data[0] == "ok") {
                            alert("Пользователь изменен");
                            router.push("/");
                        }
                        else {
                            alert(data);
                        }
                    })
                    .catch((error) => {
                        console.error("Ошибка получения данных: ", error);
                        router.push("/")
                    });
            }
        }

    }


    return (
        <>
            <Head>
                <title>Окно управления пользователями</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            {
                Curuser && Curuser[0] ? (Nav(router, Curuser[0])) : Nav(router, undefined)
            }
            <div className={styles.ManagMenu}>
                <label>Логин</label>
                <input defaultValue={Login} onChange={(e) => { setLogin(e.target.value) }}></input>
                <label>Пароль</label>
                <input defaultValue={Pasw} type='password' onChange={(e) => { setPasw(e.target.value) }}></input>
                <label>Изменять пароль <input type="checkbox" checked={ChangePasw} onChange={(e) => setChangePasw(e.target.checked)}></input></label>
                <label>ФИО</label>
                <input defaultValue={FIO} onChange={(e) => { setFIO(e.target.value) }}></input>
                <label>Роль</label>
                <select defaultValue={RoleId} onChange={(e) => { setRoleId(e.target.value) }}>
                    {Roles.map((item) => {
                        return (<option value={item.IdRole} key={item.IdRole}>{item.Title}</option>);
                    })}
                </select>
                <button onClick={() => EditUser()}>Редактировать пользователя</button>
            </div>

        </>
    )
}
export default App;