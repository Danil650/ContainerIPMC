import { useRouter } from 'next/router';
import { useEffect, useState } from "react";
import styles from '../styles/Home.module.css';
import User from "../../lib/User";
import React from 'react';
import Cookies from 'js-cookie';
import Head from 'next/head';
import Image from 'next/image';
import Substance from 'lib/Substance';
import Nav from 'lib/Nav';
import Role from 'lib/Role';

export async function getServerSideProps(context: { req: { cookies: { [x: string]: any; }; }; }) {
    const response = await fetch("http://localhost:3000/api/roles");
    let Role = await response.json();
    if (context.req.cookies["user"]) {
        console.log(context.req.cookies["user"]);
        return fetch(`http://localhost:3000/api/checkuser/${context.req.cookies["user"]}`)
            .then(async (res) => await res.json())
            .then((data) => {
                if (data && data.length !== 0) {
                    let CurUserBd: User[] = data;
                    return {
                        props: { Role, CurUserBd }, // будет передано в компонент страницы как props
                    };
                } else {
                    return {
                        props: { Role }, // будет передано в компонент страницы как props
                    };
                }
            })
            .catch((error) => {
                console.error('Error fetching CurUserBd:', error);
                return {
                    props: { Role }, // будет передано в компонент страницы как props
                };
            });

    }
    return {
        props: { Role }, // will be passed to the page component as props
    }
}
interface getServerSideProps {
    Role: Role[],
    CurUserBd: User[]
}
function App({ Role, CurUserBd }: getServerSideProps) {
    const router = useRouter();
    const [Curuser, setCuruser] = useState<User[]>(CurUserBd);
    const [Action, setAction] = useState("1");
    const [Login, setLogin] = useState("");
    const [Pasw, setPasw] = useState("");
    const [FIO, setFIO] = useState("");
    const [RoleId, setRoleId] = useState("1");
    const [Roles, _] = useState<Role[]>(Role);
    const [Users, setUser] = useState<User[]>([]);
    const [SelUserEdit, setSelUserEdit] = useState("");

    useEffect(() => {
        fetch("http://localhost:3000/api/usersall", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(Curuser),
        })
            .then((res) => {
                if (res.ok) {
                    return res.json();
                }
            })
            .then((data) => {
                setUser(data);
            })
            .catch((error) => {
                console.error("Ошибка получения данных: ", error);
            });
    }, [Curuser]);
    function MainWindow() {
        switch (Action) {
            case "1":
                return (<>
                    <label>Логие</label>
                    <input onChange={(e) => { setLogin(e.target.value) }}></input>
                    <label>Пароль</label>
                    <input type='password' onChange={(e) => { setPasw(e.target.value) }}></input>
                    <label>ФИО</label>
                    <input onChange={(e) => { setFIO(e.target.value) }}></input>
                    <label>Роль</label>
                    <select onChange={(e) => { setRoleId(e.target.value) }}>
                        {Roles.map((item) => {
                            return (<option key={item.IdRole}>{item.Title}</option>);
                        })}
                    </select>
                    <button onClick={() => CreateUser()}>Добавть пользователя</button>
                </>);
                break;
            case "2":
                return (<>
                    <select onChange={(e) => setSelUserEdit(e.target.value)}>
                        <option value={""}>---</option>
                        {Users.map((item) => {
                            return (<option value={item.IdUsers} key={item.IdUsers}>{item.FIO}</option>);
                        })}
                    </select>
                    <button onClick={() => EditUser()}>Редактировать</button>
                </>);
                break;
            case "3":
                return (<>
                    <select>
                        {Users.map((item) => {
                            return (<option key={item.IdUsers}>{item.FIO}</option>);
                        })}
                    </select>
                    <button>Удалить</button>
                </>)
                break;

            default:
                return <>

                </>
                break;
        }
    }

    function CreateUser() {
        if (Login.trim().length > 0 && Pasw.trim().length > 0 && FIO.trim().length > 0 && RoleId && Curuser) {
            const userCraete: User = {
                IdUsers: "0",
                Login: Login.trim(),
                Password: Pasw.trim(),
                RoleId: Number(RoleId),
                FIO: FIO.trim()
            };

            interface SndData {
                UserCreate: User,
                CurUser: User
            };

            const sndData: SndData = {
                UserCreate: userCraete,
                CurUser: Curuser[0]
            };
            fetch("http://localhost:3000/api/createuser", {
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
                    if (data == "Ok") {
                        alert("Пользователь добавлен");
                        router.reload();
                    }
                    else {
                        alert(data);
                    }
                })
                .catch((error) => {
                    console.error("Ошибка получения данных: ", error);
                });

        }
        else
        {
            alert("Заполните все поля");
        }
    }

    function EditUser() {
        if (SelUserEdit.length > 0 && Curuser) {
            router.push(`/edituser/${SelUserEdit}`);
        }
        else
        {
            alert("Выбирите пользователя");
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

            <div className={styles.SpecSelect}>
                Действие
                <select onChange={(e) => { setAction(e.target.value) }}>
                    <option value={1}>
                        Добавить пользователя
                    </option>
                    <option value={2}>
                        Редактирования пользователя
                    </option>
                </select>
            </div>
            <div className={styles.ManagMenu}>
                {MainWindow()}
            </div>
        </>
    )
}
export default App;