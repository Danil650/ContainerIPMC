import React, { useMemo } from 'react';
import MaterialReactTable, { type MRT_ColumnDef } from 'material-react-table';
import { useEffect, useState } from "react";
import styles from '@/styles/Home.module.css'
import Head from "next/head";
import Container from "lib/Container";
import Substance from "lib/Substance";
import { from } from "linq-to-typescript"
import Link from 'next/link';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie'


function Home() {
    //Показываемые контейнеры
    let [ContList, setContList] = useState<Container[]>([]);
    //вещества открытого контейнера
    let [SubstList, setSubstList] = useState<Substance[]>([]);
    //вещества в контейнера
    let [SubstInCont, setSubstInCont] = useState<Substance[]>([]);
    //история посещения контейнера
    let [HistoryCont, setSubstHist] = useState<Container[]>([]);



    const router = useRouter()
    const Example = () => {
        //should be memoized or stable
        const columns = useMemo<MRT_ColumnDef<Substance>[]>(
            () => [
                {
                    header: 'Редактировать',
                    columnDefType: 'display',
                    enableColumnOrdering: true,
                    Cell: ({ row }) => (
                        <button onClick={() => router.push(`/editsubst/${encodeURIComponent(SubstInCont[Number.parseInt(row.id)].Id)}`)}>
                            Редактировать
                        </button>
                    ),
                },
                { accessorKey: 'SubstName', header: 'Название', },
                { accessorKey: 'CAS', header: 'CAS', },
                { accessorKey: 'Meaning', header: 'Значение', },
                { accessorKey: 'Mass', header: 'Масса', },
                { accessorKey: 'Formula', header: 'Формула', },
                { accessorKey: 'Investigated', header: 'Исследован', },
                { accessorKey: 'Left', header: 'Осталось', },
                { accessorKey: 'URL', header: 'Ссылка', },],
            [],
        );

        return <MaterialReactTable columns={columns} data={SubstInCont} />;
    };

    let [Location, SetLocation] = useState<string>('');
    
    async function InsetToCont(Id: string) {
        interface SendData {
            sub: string,
            con: string,
        }
        if (HistoryCont && HistoryCont.length != 0) {
            let ToSnd: SendData = {
                sub: Id,
                con: Location,
            }
            const response = await fetch("http://localhost:3000/api/substintocont", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(ToSnd),
            });

            if (!response.ok) {
                alert("Failed to send data to API");
            }
            else {
                let newsubstlst: Substance[] = from(SubstList).where(x => x.Id !== Id).toArray() as Substance[];
                setSubstList(newsubstlst);
                fetch(`http://localhost:3000/api/substincont/${Location}`).then(async (res) => {
                    if (res.ok) {
                        setSubstInCont(await res.json());
                    }
                });
            }
        }
        else {
            alert("Зайдите в контейнер");
        }
    }

    async function BuildChildrens(data: Container[], Id: string) {
        let Conts: Container[] = data;
        const response = await fetch(`http://localhost:3000/api/contid/${Id}`);
        let dataBd: Container = await response.json();
        setSubstHist(HistoryCont => [...HistoryCont, dataBd]);
        // Conts = Conts.filter(x => x.Id !== Id);
        setContList(Conts);
    }
    async function OpenClickHandler(Id: string) {
        SetLocation(Id);
        const response = await fetch(`http://localhost:3000/api/Contin/${Id}`);
        const data = await response.json();
        await BuildChildrens(data, Id);
        fetch(`http://localhost:3000/api/substincont/${Id}`).then(async (res) => {
            if (res.ok) {
                setSubstInCont(await res.json());
                return;
            }
        });
        setSubstInCont([]);
    }

    async function GoBack() {
        SetLocation("");
        const response = await fetch("http://localhost:3000/api/parrentcontainers")
        const data = await response.json();
        await setContList(data);
        SetLocation("");
        setSubstInCont([]);
    }
    useEffect(() => {
        // if(!Cookies.get("user"))
        // {
        //     router.push("/login");
        // }
        fetch("http://localhost:3000/api/parrentcontainers")
            .then(async res => await res.json())
            .then(data => setContList(data));
        fetch("http://localhost:3000/api/substfree")
            .then(async res => await res.json())
            .then(data => setSubstList(data));
    }, []);

    function EditContainer(Id: string) {
        router.push(`/editcont/${encodeURIComponent(Id)}`)
    }
    return (
        <>
            <Head>
                <title>Create Next App</title>
                <meta name="description" content="Generated by create next app" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <nav className={styles.menuBox}>
                <button onClick={() => router.push("/import/")}>Импорт</button>
                <button onClick={() => GoBack()}>Вернуться</button>
                <button onClick={()=> router.push(`/editsubst/AddSubst`)}>Добавить хим. вещество</button>
                <button onClick={()=> router.push(`/editcont/AddCotainer`)}>Добавить контейнер</button>
            </nav>
            {
                SubstInCont && SubstInCont.length > 0 ? (
                    <Example></Example>
                ) : <></>
            }

            <main className={styles.mainBox}>
                <div className={styles.substContFree}>
                    {SubstList && SubstList.length > 0 ? (
                        SubstList.map((item) => (
                            <div key={item.Id} className={styles.containerDiv}>
                                <button onClick={() => InsetToCont(item.Id)}>Вставить</button>
                                <h1>{item.SubstName ?? "NULL"}</h1>
                                {item.CAS ?? "NULL"}
                            </div>
                        ))
                    ) : (
                        <p>нету свободных хим. веществ</p>
                    )}
                </div>
                <div className={styles.contMain}>
                    {ContList && ContList.length > 0 ?
                        (ContList?.map((item) => {
                            return (
                                <div key={item.Id} className={styles.containerDiv}>
                                    <button onClick={() => OpenClickHandler(item.Id)}>&gt;</button>
                                    <h1>{item.Name ?? "NULL"}</h1>
                                    <button onClick={() => EditContainer(item.Id)}>Редактировать</button>
                                </div>
                            );
                        })) :
                        (<p>нету контейнеров</p>
                        )
                    }
                </div>
            </main>
        </>
    );
}

export default Home;