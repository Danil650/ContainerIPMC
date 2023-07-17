import Substance from "../../../lib/Substance"
import { useRouter } from 'next/router';
import { useEffect, useState } from "react";
import styles from '../../styles/Home.module.css';
import Cookies from "js-cookie";
import User from "lib/User";
import Image from 'next/image';
import Head from "next/head";
import Nav from "lib/Nav";
import UnitType from "lib/Unit";
import Invoce from "lib/Invoce";
import Link from "next/link";

export async function getServerSideProps(context: { req: { cookies: { [x: string]: any; }; }; }) {
    if (context.req.cookies["user"]) {
        return fetch(`${process.env.NEXT_PUBLIC_URL}api/checkuser/${context.req.cookies["user"]}`)
            .then(async (res) => await res.json())
            .then((data) => {
                if (data && data.length !== 0) {
                    let CurUserBd: User[] = data;

                    return {
                        props: { CurUserBd }, // будет передано в компонент страницы как props
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
    CurUserBd: User[]
}

function App({ CurUserBd }: getServerSideProps) {
    const router = useRouter()
    const { Id } = router.query // получаем id из параметров маршрута;
    const [SubstId, setSubstId] = useState<string>("");
    const [SubstToEdit, setSubstToEdit] = useState<Substance>();
    const [SubstName, setSubstName] = useState("");
    const [CAS, setCAS] = useState("");
    const [Meaning, setMeaning] = useState("");
    const [Mass, setMass] = useState(0);
    const [Formula, setFormula] = useState("");
    const [Investigated, setInvestigated] = useState(false);
    const [Left, setLeft] = useState(false);
    const [URL, setURL] = useState("");
    const [IsEdit, setEdit] = useState(false);
    const [CanDel, setDel] = useState(false);
    const [Unit, setUnit] = useState<UnitType[]>([]);
    const [UnitIndex, setUnitIndex] = useState(1);
    const [Curuser, setCuruser] = useState<User[]>(CurUserBd);
    const [Invoce, setInvoce] = useState("");
    const [InvoceList, setInvoceList] = useState<Invoce[]>([])
    const [BlockBtn, setBlockBtn] = useState(false);

    useEffect(() => {
        if (Id) {
            if (Id != "AddSubst") {
                fetch(`${process.env.NEXT_PUBLIC_URL}api/substincontbyid/${Id}`)
                    .then(async res => await res.json())
                    .then(data => {
                        if (data.length == 0) {
                            setDel(true);
                        }
                    });
                fetch(`${process.env.NEXT_PUBLIC_URL}api/substbyid/${Id}`).then(async (response) => await response.json().then((data) => {
                    setSubstId(data[0].Id);
                    setSubstToEdit(data[0]);
                    setSubstName(data[0].SubstName);
                    setCAS(data[0].CAS);
                    setMeaning(data[0].Meaning);
                    setMass(Number(data[0].Mass));
                    setFormula(data[0].Formula);
                    setInvestigated(Boolean(parseInt(data[0].Investigated)));
                    setLeft(Boolean(parseInt(data[0].Left)));
                    setURL(data[0].URL);
                    setUnitIndex(Number(data[0].UnitId))
                    setEdit(true);
                    setInvoce(data[0].Passport);
                }));
            }

        }
    }, [Id]);

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
        fetch(`${process.env.NEXT_PUBLIC_URL}api/unitall`)
            .then(async res => await res.json())
            .then(data => {
                setUnit(data);
            });

        fetch(`${process.env.NEXT_PUBLIC_URL}api/invoce`)
            .then(async res => await res.json())
            .then(data => {
                setInvoceList(data);
            });

    }, []);

    async function EditSubst() {
        // Обработка сохранения данных
        if (numDigitsAfterDecimal(Mass.toString()) <= 4) {
            if (Number(Mass) > 0) {
                if (Id && SubstName.trim().length != 0 && Invoce && Invoce.length > 0) {
                    interface SendDate {
                        Subst: Substance,
                        user: string
                    }
                    if (IsEdit) {
                        let newSubst: Substance = {
                            Id: SubstId,
                            SubstName: SubstName,
                            CAS: CAS,
                            Meaning: Meaning,
                            Mass: Mass,
                            UnitId: UnitIndex,
                            Formula: Formula,
                            Investigated: String(Number(Investigated)),
                            Left: String(Number(Left)),
                            URL: URL,
                            Passport: Invoce,
                        }
                        let SndDate: SendDate = {
                            Subst: newSubst,
                            user: Cookies.get("user") ?? ""
                        }
                        fetch(`${process.env.NEXT_PUBLIC_URL}api/updatesubst`, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify(SndDate),
                        })
                            .then((res) => {
                                if (res.ok) {
                                    alert("Изменено");
                                    router.push("/");
                                }
                                else {
                                    setBlockBtn(false);
                                    alert("Неверные данные");
                                }
                            })
                            .catch((error) => {
                                console.error("Ошибка получения данных: ", error);
                            });
                    }
                    else {
                        let newSubst: Substance = {
                            Id: "0",
                            SubstName: SubstName,
                            CAS: CAS,
                            Meaning: Meaning,
                            Mass: Mass,
                            UnitId: UnitIndex,
                            Formula: Formula,
                            Investigated: String(Number(Investigated)),
                            Left: String(Number(Left)),
                            URL: URL,
                            Passport: Invoce,
                        }
                        let SndDate: SendDate = {
                            Subst: newSubst,
                            user: Cookies.get("user") ?? ""
                        }
                        fetch(`${process.env.NEXT_PUBLIC_URL}api/updatesubst`, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify(SndDate),
                        }).then(async (res) => {
                            if (res.ok) {
                                router.push('/');
                            } else {
                                alert(await res.json());
                            }
                        })
                            .catch((error) => {
                                alert(error);
                            });

                    }
                } else {
                    alert("Заполните необходимые поля");

                }
            } else {
                alert("Масса заполнена неверно");
            }

        }
        else {
            alert("Число после запятой не должно превишать 4 'ДЕСЯТИТЫСЯЧНЫЕ'");
        }

    }
    async function DelFromCont() {
        interface SndDate {
            del: string,
            user: string
        }
        let SndDate: SndDate = {
            del: SubstId,
            user: Cookies.get("user") ?? ""
        }
        if (confirm(`Хотите удалить ${SubstName} из контейнера?`)) {
            await fetch(`${process.env.NEXT_PUBLIC_URL}api/delsubstfromcont`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(SndDate),
            }).then(() => router.push('/')
            )
        }
    }

    function onChangeActNumber(e: string) {
        if (Number(e) && e.length < 10) {
            setMass(Number(e));
        }
        else {
            setMass(0);
        }
    }

    function numDigitsAfterDecimal(x: string) {
        var afterDecimalStr = x.toString().split('.')[1] || ''
        return afterDecimalStr.length
    }

    return (
        <>
            <Head>
                <title>Добавление хим вещества</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            {
                Curuser && Curuser[0] ? (Nav(router, Curuser[0])) : Nav(router, undefined)
            }
            <div className={styles.edit}>
                <div>
                    {IsEdit ? (<>
                        <label>
                            *Накладная прибытия:
                            <select disabled={true} value={Invoce} onChange={(e) => setInvoce(e.target.value)}>
                                <option value={""}>---</option>
                                {InvoceList && InvoceList.length > 0 ? (
                                    InvoceList?.map((item) => {
                                        return (
                                            <option key={item.IdInvoce} value={item.IdInvoce}>
                                                {item.IdInvoce}
                                            </option>
                                        );
                                    })
                                ) : (
                                    <option>---</option>
                                )}
                            </select>
                        </label>
                    </>) : <>
                        <label>
                            *Накладная прибытия:
                            <select value={Invoce} onChange={(e) => setInvoce(e.target.value)}>
                                <option value={""}>---</option>
                                {InvoceList && InvoceList.length > 0 ? (
                                    InvoceList?.map((item) => {
                                        return (
                                            <option key={item.IdInvoce} value={item.IdInvoce}>
                                                {item.IdInvoce}
                                            </option>
                                        );
                                    })
                                ) : (
                                    <option>---</option>
                                )}
                            </select>
                        </label>
                    </>}


                </div>
                <div>
                    <label>
                        *Название:
                        <input type="text" name="SubstName" value={SubstName} onChange={(e) => setSubstName(e.target.value)} />
                    </label>
                </div>
                <div>
                    <label>
                        CAS:
                        <input type="text" name="CAS" value={CAS} onChange={(e) => setCAS(e.target.value)} />
                    </label>
                </div>
                <div>
                    <label>
                        Описание:
                        <input type="text" name="Meaning" value={Meaning} onChange={(e) => setMeaning(e.target.value)} />
                    </label>
                </div>
                <div>
                    {
                        IsEdit ? (<label>
                            *Масса:
                            <input disabled={true} value={Mass.toString()} type="number" id="name" name="name" maxLength={8} size={10} />
                        </label>)
                            : <label>
                                *Масса:
                                <input onChange={(e) => onChangeActNumber(e.target.value)} defaultValue={Mass.toString()} type="number" id="name" name="name" maxLength={8} size={10} />
                            </label>
                    }
                    {/* <label>
                        *Масса:
                        <input onChange={(e) => onChangeActNumber(e.target.value)} value={Mass.toString()} type="number" id="name" name="name" maxLength={8} size={10} />
                    </label> */}
                </div>
                <div>
                    {IsEdit ? (<label>
                        Тип:
                        <select disabled={true} value={UnitIndex} onChange={(e) => setUnitIndex(Number(e.target.value))}>
                            {Unit && Unit.length > 0 ? (
                                Unit?.map((item) => {
                                    return (
                                        <option key={item.Id} value={item.Id}>
                                            {item.Title}
                                        </option>
                                    );
                                })
                            ) : (
                                <option>---</option>
                            )}
                        </select>
                    </label>) :
                        <label>
                            Тип:
                            <select value={UnitIndex} onChange={(e) => setUnitIndex(Number(e.target.value))}>
                                {Unit && Unit.length > 0 ? (
                                    Unit?.map((item) => {
                                        return (
                                            <option key={item.Id} value={item.Id}>
                                                {item.Title}
                                            </option>
                                        );
                                    })
                                ) : (
                                    <option>---</option>
                                )}
                            </select>
                        </label>}

                </div>
                <div>
                    <label>
                        Формула:
                        <input type="text" name="Formula" value={Formula} onChange={(e) => setFormula(e.target.value)} />
                    </label>
                </div>
                <div>
                    <label className={styles.labelcheckbox}>
                        Изучено:
                        <input className={styles.checkbox} type="checkbox" name="Investigated" checked={Investigated} onChange={(e) => setInvestigated(e.target.checked)} />
                    </label>
                </div>
                <div>
                    <label className={styles.labelcheckbox}>
                        Оставлено:
                        <input className={styles.checkbox} type="checkbox" name="Left" checked={Left} onChange={(e) => setLeft(e.target.checked)} />
                    </label>
                </div>
                <div>
                    <label>
                        Ссылка:
                        <input type="text" name="URL" value={URL} onChange={(e) => setURL(e.target.value)} />
                    </label>
                </div>
                <button onClick={() => { EditSubst(), setBlockBtn(!BlockBtn) }}>Сохранить</button>
                {
                    IsEdit ? (<button disabled={CanDel} onClick={DelFromCont}>Удалить из контейнера</button>) : <></>
                }
            </div >
        </>

    )

}
export default App;