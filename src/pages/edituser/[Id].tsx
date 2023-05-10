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

export async function getServerSideProps() {
    const response = await fetch("http://localhost:3000/api/roles");
    let Role = await response.json();
    return {
        props: { Role }
    }
}
interface getServerSideProps {
    Role: Role[]
}
function App({ Role }: getServerSideProps) {

    const router = useRouter();
    const { Id } = router.query;
    const [Curuser, setCuruser] = useState<User[]>();
    const [Login, setLogin] = useState("");
    const [Pasw, setPasw] = useState("");
    const [FIO, setFIO] = useState("");
    const [RoleId, setRoleId] = useState("1");
    const [Roles, _] = useState<Role[]>(Role);

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
    useEffect(() => {
        if (Id) {
            const userId: User = {
                IdUsers: Id[0],
                Login: "",
                Password: "",
                RoleId: 0,
                FIO: ""
            }
            fetch("http://localhost:3000/api/getuser", {
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

            const sndData : SndData = {
                CurUser: Curuser[0],
                UserUpdate: UserUpd
            }
            fetch("http://localhost:3000/api/updateuser", {
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
                    if (data[0] ==  "ok") {
                        alert("Пользователь изменен");
                        router.push("/");
                    }
                    else
                    {
                        alert(data);
                    }
                })
                .catch((error) => {
                    console.error("Ошибка получения данных: ", error);
                    router.push("/")
                });
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
                <label>Логие</label>
                <input defaultValue={Login} onChange={(e) => { setLogin(e.target.value) }}></input>
                <label>Пароль</label>
                <input defaultValue={Pasw} type='password' onChange={(e) => { setPasw(e.target.value) }}></input>
                <label>ФИО</label>
                <input defaultValue={FIO} onChange={(e) => { setFIO(e.target.value) }}></input>
                <label>Роль</label>
                <select defaultValue={RoleId} onChange={(e) => { setRoleId(e.target.value) }}>
                    {Roles.map((item) => {
                        return (<option key={item.IdRole}>{item.Title}</option>);
                    })}
                </select>
                <button onClick={() => EditUser()}>Редактировать пользователя</button>
            </div>

        </>
    )
}
export default App;