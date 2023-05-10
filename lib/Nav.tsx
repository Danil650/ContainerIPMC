import React from 'react';
import styles from '@/styles/Home.module.css'
import { NextRouter } from 'next/router';
import Cookies from 'js-cookie'
import Image from 'next/image';
import User from './User';

const App = (router: NextRouter, Curuser?: User) => {
    function ClearCookies() {
        Cookies.remove("user");
        router.push("/login");
    }
    return (
        <>
            <nav className={styles.menuBox}>
                <Image width={50} height={50} src={"/atom.png"} alt='Atom' onClick={() => router.push("/")} />
                {Curuser && Curuser.RoleId && Curuser?.RoleId < 3 ? (<><button onClick={() => router.push(`/editsubst/AddSubst`)}>Добавить хим. вещество</button>
                    <button onClick={() => router.push(`/editcont/AddCotainer`)}>Добавить контейнер</button>
                    {
                        Curuser?.RoleId == 1 ? (<button onClick={() => router.push("/usermanag")}>Управление пользователями</button>)
                            : <></>
                    }
                    <button onClick={() => router.push(`/outputdata`)}>выходная информ-ия</button></>) : <></>}
                <button onClick={() => router.push("/manipulation")}>Взять/Вернуть хим. вещество</button>
                <button onClick={() => ClearCookies()}>Выход</button>
                {/* <button onClick={() => router.push("/import/")}>Импорт</button> */}
            </nav>
        </>
    )
}
export default App;
