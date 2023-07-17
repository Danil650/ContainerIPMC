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
    switch (Curuser?.RoleId) {
        case 1:
            return (<>
                <nav className={styles.menuBox}>
                    <Image width={50} height={50} src={"/atom.png"} alt='Atom' onClick={() => {
                        if (router.asPath == "/") {
                            router.reload();
                        }
                        else {
                            router.push("/")
                        }

                    }
                    } />
                    <button onClick={() => router.push(`/turnovercontroll`)}>Контроль оборота</button>
                    <button onClick={() => router.push(`/outputdata`)}>Вывод документов</button>
                    <button onClick={() => router.push("/usermanag")}>Управление пользователями</button>
                    <button onClick={() => ClearCookies()}>Выход</button>
                    <label>{Curuser.FIO} ({Curuser.RoleName})</label>
                </nav>
            </>)
            break;
        case 2:
            return (<>
                <nav className={styles.menuBox}>
                    <Image width={50} height={50} src={"/atom.png"} alt='Atom' onClick={() => {
                        if (router.asPath == "/") {
                            router.reload();
                        }
                        else {
                            router.push("/")
                        }

                    }
                    } />
                    <button onClick={() => router.push(`/editsubst/AddSubst`)}>Добавить хим. вещество</button>
                    <button onClick={() => router.push(`/editcont/AddCotainer`)}>Добавить контейнер</button>
                    <button onClick={() => router.push("/invoceControl")}>Управление накладными</button>
                    <button onClick={() => router.push("/invoce")}>Накладная прибытия</button>
                    <button onClick={() => router.push("/manipulation")}>Запросить хим. вещество</button>
                    <button onClick={() => router.push(`/myturnover`)}>Мои запросы</button>
                    <button onClick={() => ClearCookies()}>Выход</button>
                    <label>{Curuser.FIO} ({Curuser.RoleName})</label>

                </nav>
            </>)
            break;
        case 3:
            return (<>
                <nav className={styles.menuBox}>
                    <Image width={50} height={50} src={"/atom.png"} alt='Atom' onClick={() => {
                        if (router.asPath == "/") {
                            router.reload();
                        }
                        else {
                            router.push("/")
                        }

                    }
                    } />
                    <button onClick={() => router.push(`/editsubst/AddSubst`)}>Добавить хим. вещество</button>
                    <button onClick={() => router.push(`/editcont/AddCotainer`)}>Добавить контейнер</button>
                    <button onClick={() => router.push("/manipulation")}>Запросить хим. вещество</button>
                    <button onClick={() => router.push(`/myturnover`)}>Мои запросы</button>
                    <button onClick={() => ClearCookies()}>Выход</button>
                    <label>{Curuser.FIO} ({Curuser.RoleName})</label>

                </nav>
            </>)
            break;
        default:
            break;
    }
}
export default App;
