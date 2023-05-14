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

export default function Home() {
    const router = useRouter();

    const [SubstList, setSubstList] = useState<Substance[]>();

    const [SelectSubst, setSelectSubst] = useState("");

    const [CurSubst, setCurSubst] = useState<Substance>();

    const [Curuser, setCuruser] = useState<User[]>();

    const [SubstAction, setSubstAction] = useState("-1");

    const [ActNumb, setActNumb] = useState(0);

    useEffect(() => {
        if (!Cookies.get("user")) {
            router.push("/login");
        }
        else {
            fetch(`${process.env.NEXT_PUBLIC_URL}api/checkuser/${Cookies.get("user")}`)
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
        fetch(`${process.env.NEXT_PUBLIC_URL}api/allsubst/`)
            .then(async res => await res.json())
            .then(data => {
                setSubstList(data);
            })
    }, []);

    useEffect(() => {
        if (SelectSubst != "") {
            fetch(`${process.env.NEXT_PUBLIC_URL}api/substbyid/${SelectSubst}`)
                .then(async res => await res.json())
                .then(data => {
                    setCurSubst(data[0]);
                })
        }
        else {
            setCurSubst(undefined);
        }
    }, [SelectSubst])

    function Counting() {
        if (CurSubst && Number(ActNumb)) {
            let num: Number = ActNumb * Number(SubstAction);
            return new Decimal(CurSubst.Mass.toString()).plus(new Decimal(num.toString())).toString();
        }
        else {
            return "";
        }

    }

    function onChangeActNumber(e: string) {
        if (Number(e) && e.length < 10) {
            setActNumb(Number(e));
        }
        else {
            setActNumb(0);
        }
    }
    function numDigitsAfterDecimal(x: string) {
        var afterDecimalStr = x.toString().split('.')[1] || ''
        return afterDecimalStr.length
    }
    function Commit() {
        let result = Counting();
        if (result != "") {
            if (numDigitsAfterDecimal(result.toString()) <= 4) {
                if (Number(result) >= 0) {
                    if (CurSubst) {
                        let subst: Substance = CurSubst;
                        subst.Mass = Number(result);
                        interface SndData {
                            subst: Substance,
                            User: User,
                            Action: string,
                            Mass: number
                        };
                        if (Curuser && Curuser[0]) {
                            const sndData: SndData = {
                                subst: subst,
                                User: Curuser[0],
                                Action: SubstAction,
                                Mass: ActNumb
                            };

                            fetch(`${process.env.NEXT_PUBLIC_URL}api/manipulation`, {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                },
                                body: JSON.stringify(sndData),
                            })
                                .then((res) => {
                                    if (res.ok) {
                                        return res.json(); // вызов метода .json() и возврат промиса с результатом
                                    } else {
                                        alert("Ошибка");
                                        return;
                                    }
                                })
                                .then((data) => {
                                    // здесь можно использовать данные в формате JSON
                                    alert("Изменено");
                                    router.push("/");
                                })
                                .catch((error) => {
                                    console.error("Ошибка получения данных: ", error);
                                });
                        }

                    }
                }
                else {
                    alert("Результат должен быть положительным");
                }
            }
            else {
                alert("Число после запятой не должно превишать 4 'ДЕСЯТИТЫСЯЧНЫЕ'");
            }
        }
        else {
            alert("Недопустимое значение");
        }
    }
    return (
        <>
            <Head>
                <title>Окно контейнеров</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            {
                Curuser && Curuser[0] ? (Nav(router, Curuser[0])) : Nav(router, undefined)
            }
            <main>
                <div className={styles.import}>
                    <select onChange={(e) => setSelectSubst(e.target.value)}>
                        <option value={""} >---</option>
                        {SubstList && SubstList.length > 0 ? (
                            SubstList?.map((item) => {
                                let DateCreate = ""
                                if (item.SubsCreateDate) {
                                    DateCreate = `Создан в ${new Date(item.SubsCreateDate).toLocaleDateString()}`;
                                }
                                return (
                                    <option key={item.Id} value={item.Id}>
                                        {item.SubstName}|| {DateCreate}
                                    </option>
                                );
                            })
                        ) : (
                            <option>---</option>
                        )}
                    </select>
                    <label>
                        Масса:
                        <input disabled={true} type="number" step="any" name="Mass" defaultValue={CurSubst?.Mass.toString()} onChange={(e) => { CurSubst?.Mass ? (e.target.valueAsNumber) : 0 }} />
                    </label>
                    <select onChange={(e) => setSubstAction(e.target.value)}>
                        <option value={-1}>
                            Забрал
                        </option>
                        <option value={1}>
                            Вернул
                        </option>
                    </select>
                    <input onChange={(e) => onChangeActNumber(e.target.value)} defaultValue={ActNumb.toString()} type="number" id="name" name="name" maxLength={8} size={10} />
                    <label>Результат: {Counting()}</label>
                    <button onClick={() => Commit()}>Потвердить</button>
                </div>
            </main >
        </>
    );
}