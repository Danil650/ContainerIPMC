import { useRouter } from 'next/router';
import { useEffect, useState } from "react";
import styles from '../../styles/Home.module.css';
import Container from 'lib/Container';
import uuid from 'react-uuid';
import Cookies from 'js-cookie';
import User from 'lib/User';
import Head from 'next/head';
import Nav from 'lib/Nav';


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

function App({ CurUserBd }: getServerSideProps) {
    const router = useRouter()
    const { Id } = router.query; // получаем id из параметров маршрута
    let [ContId, setContId] = useState<string>("");
    let [ContName, setContName] = useState("");
    let [IsEdit, setEdit] = useState(false);
    let [ContsInList, setContsInList] = useState<Container[]>([]);
    let [ContInSelect, setContInSelect] = useState("");
    const [Curuser, setCuruser] = useState<User[]>(CurUserBd);

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
    }, []);

    useEffect(() => {
        if (Id) {
            if (Id != "AddCotainer") {
                fetch(`${process.env.NEXT_PUBLIC_URL}api/contid/${Id}`).then((response) => response.json()).then((data) => {
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
        fetch(`${process.env.NEXT_PUBLIC_URL}api/containerall`)
            .then(async res => await res.json())
            .then(data => setContsInList(data));
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
                    Name: ContName,
                    DateCreate: new Date(),
                }
                let sndData: SendData = {
                    cont: newCont,
                    user: Cookies.get("user") ?? ""
                };

                fetch(`${process.env.NEXT_PUBLIC_URL}api/updatecont`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(sndData),
                }).then((res) => {
                    if (res.ok) {
                        alert("Обновлено");
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
                    Name: ContName,
                    ContainsIn: ContInSelect
                }
                let sndData: SendData = {
                    cont: newCont,
                    user: Cookies.get("user") ?? ""
                };
                fetch(`${process.env.NEXT_PUBLIC_URL}api/updatecont`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(sndData),
                }).then((res) => {
                    if (res.ok) {
                        alert("Добавлено");
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
    
    // function DelFromCont() {
    //     if (confirm(`Хотите удалить ${ContName}?`)) {
    //         fetch(`${process.env.NEXT_PUBLIC_URL}api/delcont/${ContId}`).then(
    //             () => router.push('/')
    //         )
    //     }
    // }

    return (
        <>
            <Head>
                <title>Добавление контйенера</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            {
                Curuser && Curuser[0] ? (Nav(router, Curuser[0])) : Nav(router, undefined)
            }
            <div className={styles.edit}>
                <div>
                    <label>
                        Название контейнера:
                        <input type="text" name="ContName" defaultValue={ContName} onChange={(e) => setContName(e.target.value)} />
                    </label>
                   
                    {
                        IsEdit ? (
                            <></>
                        ) : (
                            <div>
                                 <label>Положение в контейнере</label>
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