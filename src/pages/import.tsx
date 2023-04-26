import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import ExcelData from "../../lib/ExcelData"
import { from } from "linq-to-typescript";
import Cookies from "js-cookie";
import router, { useRouter } from "next/router";
import styles from '@/styles/Home.module.css'
import Image from 'next/image';
import User from "lib/User";

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
    function ClearCookies() {
        Cookies.remove("user");
        router.push("/login");
    }
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
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        //Чтение excel
        reader.onload = async (event) => {
            const binaryString = event?.target?.result as string;

            const workbook = XLSX.read(binaryString, { type: "binary" });

            const worksheet = workbook.Sheets[workbook.SheetNames[0]];

            const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null }) as any[][];

            let meanings: string[] = []

            //Проверка на содержание столбцов
            //есть ли столбцы ваобще
            if (data.length == 0) {
                alert("Файл пустой");
                return;
            }

            meanings.push(from(data).select(x => x[1]).first());
            meanings.push(from(data).select(x => x[2]).first());
            meanings.push(from(data).select(x => x[3]).first());

            if (meanings[0] !== "Коробка" && meanings[1] !== "Содержится в" && meanings[2] !== "Название") {
                alert("Неверный шаблон excel");
                return;
            }
            // Map the array of arrays to an array of ExcelData objects
            const excelData: ExcelData[] = data.map(row => (

                {
                    Id: Number(row[0]),
                    Container: row[1],
                    ContainsIn: Number(row[2]),
                    Title: row[3],
                    CAS: row[4],
                    Meaning: row[5],
                    Mass: row[6],
                    Formula: row[7],
                    Investigate: row[8],
                    Lefted: row[9],
                    URL: row[10],
                    Struct: row[11],
                    purity: row[12]
                }));

            await sendDataToApi(excelData);
        };

        reader.readAsBinaryString(file);

    };

    const sendDataToApi = async (data: ExcelData[]) => {
        const response = await fetch("http://localhost:3000/api/uploudedata/import", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            alert("Failed to send data to API");
        }
        else {
            alert("ok");
        }
    };

    return (
        <>
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
            <div className={styles.import}>
                <input type="file" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} />
            </div>
        </>

    );
}

export default App;