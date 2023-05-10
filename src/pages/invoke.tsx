import React, { useMemo } from 'react';
import MaterialReactTable, { type MRT_ColumnDef } from 'material-react-table';
import { useEffect, useState } from "react";
import styles from '@/styles/Home.module.css'
import Head from "next/head";
import Container from "lib/Container";
import Substance from "lib/Substance";
import { from } from "linq-to-typescript"
import { useRouter } from 'next/router';
import Cookies from 'js-cookie'
import User from 'lib/User';
import Nav from 'lib/Nav';
import Decimal from 'decimal.js';
import SubstCont from 'lib/SubstContainer';
import Invoce from 'lib/Invoce';

export default function Home() {
    const router = useRouter();
    const [Curuser, setCuruser] = useState<User[]>();
    const [DateInvoce, setDateInvoce] = useState("");
    const [NumInvoce, setNumInvoce] = useState("");
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

    function SaveInvoce() {
        if (Date.parse(DateInvoce) && NumInvoce.trim().length > 0) {
            const Inv: Invoce = {
                IdInvoce: NumInvoce,
                DateInvoce: DateInvoce
            };

            fetch("http://localhost:3000/api/invoce", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(Inv),
            })
                .then((res) => {
                    if (res.ok) {
                        router.push("/");
                    }
                })
                .catch((error) => {
                    console.error("Ошибка получения данных: ", error);
                    router.push("/")
                });
        }
        else {
            alert("Заполните все поля");
        }
    }
    return (
        <>
            <Head>
                <title>Окно накладной</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            {
                Curuser && Curuser[0] ? (Nav(router, Curuser[0])) : Nav(router, undefined)
            }
            <main>
                <div className={styles.edit}>
                    <div><label>Номер накладной</label><input onChange={(e) => setNumInvoce(e.target.value)}></input></div>
                    <div><label>Дата поступления накладной</label><input onChange={(e) => setDateInvoce(e.target.value)} type='date'></input></div>
                    <button onClick={() => SaveInvoce()}>Сохранить</button>
                </div>
            </main >
        </>
    );
}