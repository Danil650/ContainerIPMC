import { useRouter } from 'next/router';
import { useEffect, useState } from "react";
import styles from '../styles/Home.module.css';
import User from "../../lib/User";
import uuid from 'react-uuid';
import React from 'react';
import Cookies from 'js-cookie';

const App = () => {
    let router = useRouter();
    let [Log, setLog] = useState("");
    let [Pswrd, setPswrd] = useState("");
    function EnterUser() {
        if(Log.trim().length > 0 && Pswrd.trim().length > 0)
        {
            let User: User =
            {
                IdUsers: "0",
                Login: Log.trim(),
                Password: Pswrd,
                RoleId: 0,
                FIO: ""
            }
            fetch("http://localhost:3000/api/getuser", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(User),
            }).then((res) => {
                if (res.ok) {
                    Cookies.set("user",Log);
                    router.push('/');
                } else {
                    alert("нет такого пользователя");
                }
            });
        }
        else
        {
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
    )

}
export default App;