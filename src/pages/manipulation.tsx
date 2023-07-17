import React from 'react';
import { useEffect, useState } from "react";
import styles from '@/styles/Home.module.css'
import Head from "next/head";
import Substance from "lib/Substance";
import { useRouter } from 'next/router';
import Cookies from 'js-cookie'
import User from 'lib/User';
import Nav from 'lib/Nav';
import Decimal from 'decimal.js';


export async function getServerSideProps(context: { req: { cookies: { [x: string]: any; }; }; }) {
    if (context.req.cookies["user"]) {
        console.log(context.req.cookies["user"]);
        return fetch(`${process.env.NEXT_PUBLIC_URL}api/checkuser/${context.req.cookies["user"]}`)
            .then(async (res) => await res.json())
            .then((data) => {
                if (data && data.length !== 0) {
                    let CurUserBd: User[] = data;
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
    CurUserBd: User[]
}
export default function Home({ CurUserBd }: getServerSideProps) {
    const router = useRouter();

    const [SubstList, setSubstList] = useState<Substance[]>();

    const [SelectSubst, setSelectSubst] = useState("");

    const [CurSubst, setCurSubst] = useState<Substance>();

    const [Curuser, setCuruser] = useState<User[]>(CurUserBd);

    const [SubstAction, setSubstAction] = useState("-1");

    const [ActNumb, setActNumb] = useState(0);

    const [RequestText, setRequestText] = useState("");

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
                if (Number(result) >= 0 && Number(ActNumb) > 0) {
                    if (CurSubst) {
                        if (RequestText.trim().length > 0) {
                            let subst: Substance = CurSubst;
                            subst.Mass = Number(result);
                            interface SndData {
                                subst: Substance,
                                User: User,
                                Action: string,
                                Mass: number
                                RequestText: string,
                            };
                            if (Curuser && Curuser[0]) {
                                const sndData: SndData = {
                                    subst: subst,
                                    User: Curuser[0],
                                    Action: SubstAction,
                                    Mass: ActNumb,
                                    RequestText: RequestText
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
                                            router.push("/");
                                        } else {
                                            alert("Ошибка");
                                            return;
                                        }
                                    })
                                    .catch((error) => {
                                        console.error("Ошибка получения данных: ", error);
                                    });
                            }
                        }
                        else {
                            alert("Заполните необходимые поля")
                        }
                    }
                }
                else {
                    alert("Результат должен быть положительным");
                }
            }
            else {
                alert("Число после запятой не должно превышать 4 'ДЕСЯТИТЫСЯЧНЫЕ'");
            }
        }
        else {
            alert("Недопустимое значение");
        }
    }
    return (
        <>
            <Head>
                <title>Окно запроса хим. веществ</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            {
                Curuser && Curuser[0] ? (Nav(router, Curuser[0])) : Nav(router, undefined)
            }
            <main>
                <div className={styles.edit}>
                    <label>Выберите хим. вещество</label>
                    <select onChange={(e) => setSelectSubst(e.target.value)}>
                        <option value={""} >---</option>
                        {SubstList && SubstList.length > 0 ? (
                            SubstList?.map((item) => {
                                let DateCreate = ""
                                if (item.SubsCreateDate) {
                                    DateCreate = `Создан ${new Date(item.SubsCreateDate).toLocaleDateString()}`;
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
                        Масса ({CurSubst?.UnitName ?? ""}):
                        <input className={styles.AutoMass} disabled={true} type="number" step="any" name="Mass" defaultValue={CurSubst?.Mass.toString()} onChange={(e) => { CurSubst?.Mass ? (e.target.valueAsNumber) : 0 }} />
                    </label>
                    <select onChange={(e) => setSubstAction(e.target.value)}>
                        <option value={-1}>
                            Убавил
                        </option>
                        <option value={1}>
                            Пополнил
                        </option>
                    </select>
                    <input onChange={(e) => onChangeActNumber(e.target.value)} defaultValue={ActNumb.toString()} type="number" id="name" name="name" maxLength={8} size={10} />
                    <label>Результат: {Counting()} {CurSubst?.UnitName ?? ""}</label>
                    <label>Текст запроса</label>
                    <textarea onChange={(e) => setRequestText(e.target.value.trim())} className={styles.ReqText}></textarea>
                    <button onClick={() => Commit()}>Подтвердить</button>
                </div>
            </main >
        </>
    );
}