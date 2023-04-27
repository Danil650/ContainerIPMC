import Substance from "../../../lib/Substance"
import { useRouter } from 'next/router';
import { useEffect, useState } from "react";
import styles from '../../styles/Home.module.css';
import Cookies from "js-cookie";
import User from "lib/User";
import Image from 'next/image';
import Head from "next/head";

export async function getServerSideProps(context: { req: { cookies: { [x: string]: any; }; }; }) {
    let admin = false;
    const lang = context.req.cookies['user'];
    const response3 = await fetch(`http://localhost:3000/api/checkuser/${lang}`);
    let user: User[] = await response3.json();

    if (user[0]?.RoleId == 1) {
        admin = true;
    }

    return {
        props: { admin }, // will be passed to the page component as props
    }
}
interface Props {
    admin?: boolean,
}
function App({ admin }: Props) {
    const router = useRouter()
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
                });
        }
    }, []);

    const { Id } = router.query // получаем id из параметров маршрута
    const [SubstId, setSubstId] = useState<string>("")
    const [SubstToEdit, setSubstToEdit] = useState<Substance>()
    const [SubstName, setSubstName] = useState("")
    const [CAS, setCAS] = useState("")
    const [Meaning, setMeaning] = useState("")
    const [Mass, setMass] = useState("")
    const [Formula, setFormula] = useState("")
    const [Investigated, setInvestigated] = useState(false)
    const [Left, setLeft] = useState(false)
    const [URL, setURL] = useState("")
    const [IsEdit, setEdit] = useState(false);
    const [CanDel, setDel] = useState(false);
    function ClearCookies() {
        Cookies.remove("user");
        router.push("/login");
    }

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
                    setMass(data[0].Mass);
                    setFormula(data[0].Formula);
                    setInvestigated(Boolean(parseInt(data[0].Investigated)));
                    setLeft(Boolean(parseInt(data[0].Left)));
                    setURL(data[0].URL);
                    setEdit(true);
                }));
            }

        }
    }, [Id])

    function handleChange(event: any) {
        const name = event.target.name;
        const value = event.target.value;
        let setter: boolean;
        switch (name) {
            case "SubstName":
                setSubstName(value);
                break;
            case "CAS":
                setCAS(value);
                break;
            case "Meaning":
                setMeaning(value);
                break;
            case "Mass":
                setMass(value);
                break;
            case "Formula":
                setFormula(value);
                break;
            case "Investigated":
                setter = !Investigated;
                setInvestigated(setter);
                break;
            case "Left":
                setter = !Left;
                setLeft(setter);
                break;
            case "URL":
                setURL(value);
                break;
            default:
                break;
        }
    }

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
                    Formula: Formula,
                    Investigated: String(Number(Investigated)),
                    Left: String(Number(Left)),
                    URL: URL,
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
                    Formula: Formula,
                    Investigated: String(Number(Investigated)),
                    Left: String(Number(Left)),
                    URL: URL,
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
                        alert("Что то пошло не так");
                    }
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
            <nav className={styles.menuBox}>
                <Image width={50} height={50} src={"/atom.png"} alt='Atom' onClick={() => router.push("/")} />
                <button onClick={() => router.push("/import/")}>Импорт</button>
                <button onClick={() => router.push(`/editsubst/AddSubst`)}>Добавить хим. вещество</button>
                <button onClick={() => router.push(`/editcont/AddCotainer`)}>Добавить контейнер</button>
                {
                    admin == true ? (<button>Управление пользователями</button>)
                        : <></>
                }
                <button onClick={() => router.push(`/outputdata`)}>выходная информ-ия</button>
                <button onClick={() => ClearCookies()}>Выход</button>
            </nav>
            <div className={styles.edit}>
                <div>
                    <label>
                        Название:
                        <input type="text" name="SubstName" defaultValue={SubstName} onChange={handleChange} />
                    </label>
                </div>
                <div>
                    <label>
                        CAS:
                        <input type="text" name="CAS" defaultValue={CAS} onChange={handleChange} />
                    </label>
                </div>
                <div>
                    <label>
                        Описание:
                        <input type="text" name="Meaning" defaultValue={Meaning} onChange={handleChange} />
                    </label>
                </div>
                <div>
                    <label>
                        Масса:
                        <input type="text" name="Mass" defaultValue={Mass} onChange={handleChange} />
                    </label>
                </div>
                <div>
                    <label>
                        Формула:
                        <input type="text" name="Formula" defaultValue={Formula} onChange={handleChange} />
                    </label>
                </div>
                <div>
                    <label>
                        Изучено:
                        <input type="checkbox" name="Investigated" checked={Investigated} onChange={handleChange} />
                    </label>
                </div>
                <div>
                    <label>
                        Оставлено:
                        <input type="checkbox" name="Left" checked={Left} onChange={handleChange} />
                    </label>
                </div>
                <div>
                    <label>
                        Ссылка:
                        <input type="text" name="URL" defaultValue={URL} onChange={handleChange} />
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