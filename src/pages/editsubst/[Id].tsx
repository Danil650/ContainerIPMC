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

function App() {
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
    const [Curuser, setCuruser] = useState<User[]>();
    const [Invoce, setInvoce] = useState("");
    const [InvoceList, setInvoceList] = useState<Invoce[]>([])
    useEffect(() => {
        if (Id) {
            if (Id != "AddSubst") {
                fetch(`http://localhost:3000/api/substincontbyid/${Id}`)
                    .then(async res => await res.json())
                    .then(data => {
                        if (data.length == 0) {
                            setDel(true);
                        }
                    });
                fetch(`http://localhost:3000/api/substbyid/${Id}`).then((response) => response.json().then((data) => {
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
            fetch(`http://localhost:3000/api/checkuser/${Cookies.get("user")}`)
                .then(async res => await res.json())
                .then(data => {
                    if (data.length == 0) {
                        router.push("/login");
                        Cookies.remove("user");
                    }
                    else {
                        if (data[0].RoleId == 3) {
                            router.push("/login");
                            Cookies.remove("user");
                        }
                        else {
                            setCuruser(data);
                        }
                    }
                });
        }
        fetch(`http://localhost:3000/api/unitall`)
            .then(async res => await res.json())
            .then(data => {
                setUnit(data);
            });

        fetch(`http://localhost:3000/api/invoce`)
            .then(async res => await res.json())
            .then(data => {
                setInvoceList(data);
            });

    }, []);

    async function EditSubst() {
        // Обработка сохранения данных
        if (Id && SubstName.trim().length != 0) {
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
                fetch("http://localhost:3000/api/updatesubst", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(SndDate),
                }).then((res) => {
                    if (res.ok) {
                        router.push('/');
                    } else {
                        alert("Название должно быть уникальным");
                    }
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
                fetch("http://localhost:3000/api/updatesubst", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(SndDate),
                }).then((res) => {
                    if (res.ok) {
                        router.push('/');
                    } else {
                        return res.json()
                    }
                })
                    .then((data) => {
                        alert(data);
                    });
            }


        }
        else {
            alert("Заполните все поля");
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
            await fetch("http://localhost:3000/api/delsubstfromcont", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(SndDate),
            }).then(() => router.push('/')
            )
        }
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
                    <label>
                        Накладная прибытия:
                        <select value={Invoce} onChange={(e) => setInvoce(e.target.value)}>
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
                    <Link href={"/invoke"}>Добавить накладную</Link>
                </div>
                <div>
                    <label>
                        Название:
                        <input type="text" name="SubstName" defaultValue={SubstName} onChange={(e) => setSubstName(e.target.value)} />
                    </label>
                </div>
                <div>
                    <label>
                        CAS:
                        <input type="text" name="CAS" defaultValue={CAS} onChange={(e) => setCAS(e.target.value)} />
                    </label>
                </div>
                <div>
                    <label>
                        Описание:
                        <input type="text" name="Meaning" defaultValue={Meaning} onChange={(e) => setMeaning(e.target.value)} />
                    </label>
                </div>
                <div>
                    <label>
                        Масса:
                        <input type="number" step="any" name="Mass" value={Mass} onChange={(e) => setMass(e.target.valueAsNumber)} />
                    </label>
                </div>
                <div>
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
                    </label>
                </div>
                <div>
                    <label>
                        Формула:
                        <input type="text" name="Formula" defaultValue={Formula} onChange={(e) => setFormula(e.target.value)} />
                    </label>
                </div>
                <div>
                    <label>
                        Изучено:
                        <input type="checkbox" name="Investigated" checked={Investigated} onChange={(e) => setInvestigated(e.target.checked)} />
                    </label>
                </div>
                <div>
                    <label>
                        Оставлено:
                        <input type="checkbox" name="Left" checked={Left} onChange={(e) => setLeft(e.target.checked)} />
                    </label>
                </div>
                <div>
                    <label>
                        Ссылка:
                        <input type="text" name="URL" defaultValue={URL} onChange={(e) => setURL(e.target.value)} />
                    </label>
                </div>
                <button onClick={EditSubst}>Сохранить</button>
                {
                    IsEdit ? (<button disabled={CanDel} onClick={DelFromCont}>Удалить из контейнера</button>) : <></>
                }
            </div>
        </>

    )

}
export default App;