import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import ExcelData from "../../lib/ExcelData"
import { from } from "linq-to-typescript";
import Cookies from "js-cookie";
import router, { useRouter } from "next/router";
import styles from '@/styles/Home.module.css'
import Image from 'next/image';
import User from "lib/User";
import Head from "next/head";

function App() {
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
            <Head>
                <title>Импорт</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div className={styles.import}>
                <input type="file" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} />
            </div>
        </>

    );
}

export default App;