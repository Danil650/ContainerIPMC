import { useRouter } from 'next/router';
import { useEffect, useState } from "react";
import styles from '../../styles/Home.module.css';
import Container from 'lib/Container';
import uuid from 'react-uuid';
import Cookies from 'js-cookie';
import User from 'lib/User';
import Image from 'next/image';
import Head from 'next/head';

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
    function ClearCookies() {
        Cookies.remove("user");
        router.push("/login");
    }
    const router = useRouter()
    const { Id } = router.query; // получаем id из параметров маршрута
    let [ContId, setContId] = useState<string>("");
    let [ContName, setContName] = useState("");
    let [IsEdit, setEdit] = useState(false);
    let [ContsInList, setContsInList] = useState<Container[]>([]);
    let [ContInSelect, setContInSelect] = useState("");
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
    useEffect(() => {
        if (Id) {
            if (Id != "AddCotainer") {
                fetch(`http://localhost:3000/api/contid/${Id}`).then((response) => response.json()).then((data) => {
                    setContId(data[0].Id);
                    setContName(data[0].Name);
                    setEdit(true);
                });
            }
            else {
                buildConts();
            }
        }


    }, [Id])

    function buildConts() {
        fetch("http://localhost:3000/api/containerall")
            .then(async res => await res.json())
            .then(data => setContsInList(data));
    }

    function handleChange(event: any) {
        const name = event.target.name;
        const value = event.target.value;
        let setter: boolean;
        switch (name) {
            case "ContName":
                setContName(value);
                break;
            default:
                break;
        }
    }

    async function EditCont() {
        // Обработка сохранения данных
        interface SendData {
            cont: Container,
            user: string
        }
        if (Id && ContName.trim().length != 0) {
            if (IsEdit) {
                let newCont: Container = {
                    Id: ContId,
                    ExcelId: 0,
                    Name: ContName,
                }
                let sndData: SendData = {
                    cont: newCont,
                    user: Cookies.get("user") ?? ""
                };

                fetch("http://localhost:3000/api/updatecont", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(sndData),
                }).then((res) => {
                    if (res.ok) {
                        router.push('/');
                    } else {
                        alert("Что то пошло не так");
                    }
                });
            }
            else {
                //add
                let newCont: Container = {
                    Id: "0",
                    ExcelId: 0,
                    Name: ContName,
                    ContainsIn: ContInSelect
                }
                let sndData: SendData = {
                    cont: newCont,
                    user: Cookies.get("user") ?? ""
                };
                fetch("http://localhost:3000/api/updatecont", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(sndData),
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
    function DelFromCont() {
        if (confirm(`Хотите удалить ${ContName}?`)) {
            fetch(`http://localhost:3000/api/delcont/${ContId}`).then(
                () => router.push('/')
            )
        }
    }

    return (
        <>
            <Head>
                <title>Добавление контйенера</title>
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
                        <input type="text" name="ContName" defaultValue={ContName} onChange={handleChange} />
                    </label>
                    {
                        IsEdit ? (
                            <></>
                        ) : (
                            <div>
                                <select value={ContInSelect} onChange={(e) => setContInSelect(e.target.value)}>
                                    <option>Не содержится в контейнере</option>
                                    {
                                        ContsInList?.map((item) => {
                                            return (
                                                <option key={item.Id} value={item.Id}>{item.Name}</option>
                                            );
                                        })
                                    }
                                </select>
                                <button onClick={() => console.log(ContInSelect)}>Выбрать</button>
                            </div>
                        )
                    }
                </div>
                <button onClick={EditCont}>Сохранить</button>
            </div>
        </>

    )

}
export default App;