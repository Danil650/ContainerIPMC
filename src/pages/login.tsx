import { useRouter } from 'next/router';
import { useEffect, useState } from "react";
import styles from '../styles/Home.module.css';
import User from "../../lib/User";
import uuid from 'react-uuid';
import React from 'react';
import Cookies from 'js-cookie';
import Head from 'next/head';

const App = () => {
    let router = useRouter();
    let [Log, setLog] = useState("");
    let [Pswrd, setPswrd] = useState("");
    function EnterUser() {
        if (Log.trim().length > 0 && Pswrd.trim().length > 0) {
            let User: User =
            {
                IdUsers: "0",
                Login: Log.trim(),
                Password: Pswrd,
                RoleId: 0,
                FIO: ""
            }
            fetch(`${process.env.NEXT_PUBLIC_URL}api/getuser`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(User),
            })
                .then((res) => {
                    if (res.ok) {
                        return res.json(); // вызов метода .json() и возврат промиса с результатом
                    }
                })
                .then((data) => {
                    // здесь можно использовать данные в формате JSON
                    if(data && data.length > 0)
                    {
                        Cookies.set("user", data);
                        router.push('/');
                    }
                    else
                    {
                        alert("Нет такого пользователя");
                    }

                })
                .catch((error) => {
                    console.error("Ошибка получения данных: ", error);
                });
        }
        else {
            alert("Заполните все строки");
        }
    }

    function handleChange(event: any) {
        const name = event.target.name;
        const value = event.target.value;
        let setter: boolean;
        switch (name) {
            case "Login":
                setLog(value);
                break;
            case "Password":
                setPswrd(value);
                break;
            default:
                break;
        }
    }
    return (
        <>
            <Head>
                <title>Авторизация</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div className={styles.edit}>
                <div>
                    <label>
                        Логин:
                        <input type="text" name="Login" onChange={handleChange} />
                    </label>
                    <label>
                        Пароль:
                        <input type="password" name="Password" onChange={handleChange} />
                    </label>
                </div>
                <button onClick={() => EnterUser()}>Войти</button>

            </div>
        </>

    )

}
export default App;