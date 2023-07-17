import React from 'react';
import { useEffect, useState } from "react";
import styles from '@/styles/Home.module.css'
import Head from "next/head";
import { useRouter } from 'next/router';
import User from 'lib/User';
import Nav from 'lib/Nav';
import { validateFile } from 'lib/Invoce';

export async function getServerSideProps(context: { req: { cookies: { [x: string]: any; }; }; }) {
    if (context.req.cookies["user"]) {
        console.log(context.req.cookies["user"]);
        return fetch(`${process.env.NEXT_PUBLIC_URL}api/checkuser/${context.req.cookies["user"]}`)
            .then(async (res) => await res.json())
            .then((data) => {
                if (data && data.length !== 0) {
                    let CurUserBd: User[] = data;
                    if (CurUserBd && CurUserBd[0].RoleId && CurUserBd[0].RoleId >= 2) {
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
    const [Curuser, setCuruser] = useState<User[]>(CurUserBd);
    const [DateInvoce, setDateInvoce] = useState("");
    const [NumInvoce, setNumInvoce] = useState("");
    const [selectedFile, setSelectedFile] = useState<File>();

    useEffect(() => {
        if (Curuser && Curuser[0].RoleId == 1) {

        }
        else {

        }
    }, []);

    function SaveInvoce() {
        if (selectedFile && selectedFile != undefined && validateFile(selectedFile)) {
            if (Date.parse(DateInvoce) && NumInvoce.trim().length > 0) {
                console.log(selectedFile.type);
                        const formData = new FormData();
                        const newFileName = `${NumInvoce}.${selectedFile.name.substring(selectedFile.name.lastIndexOf('.') + 1, selectedFile.name.length) || selectedFile.name}`; // Новое имя файла return filename return filename.substring(filename.lastIndexOf('.')+1, filename.length) || filename;
                        formData.append("numInvoce", NumInvoce);
                        formData.append("dateInvoce", DateInvoce);
                        formData.append("curUser", Curuser[0].IdUsers);
                        formData.append("file", selectedFile, newFileName);
                        formData.append("Ext",selectedFile.name.substring(selectedFile.name.lastIndexOf('.') + 1))
                        fetch(`${process.env.NEXT_PUBLIC_URL}api/invoce`, {
                            method: "POST",
                            body: formData,
                        })
                            .then(async (res) => {
                                if (res.ok) {
                                    router.push("/");
                                } else {
                                    throw new Error(await res.json());
                                }
                            })
                            .catch((error) => {
                                alert(error);
                            });
                    }
                    else {
                        alert("Заполните необходимые  поля");
            }
        }
        else {
            alert("Файл накладной неверный");
        }
    }
    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        if (e.target.files) {
            const file = e.target.files[0];
            if (validateFile(file)) {
                setSelectedFile(file);
            } else {
                setSelectedFile(undefined);
            }
        }

    };
    return (
        <>
            <Head>
                <title>Окно накладных</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            {
                Curuser && Curuser[0] ? (Nav(router, Curuser[0])) : Nav(router, undefined)
            }
            <main>
                <div className={styles.edit}>
                    <div><label>Номер накладных</label><input onChange={(e) => setNumInvoce(e.target.value)}></input></div>
                    <div><label>Дата поступления накладной</label><input max={new Date().toISOString().split("T")[0]} onChange={(e) => setDateInvoce(e.target.value)} type='date'></input></div>
                    <label>Файл накладной:<input onChange={(e) => handleFileChange(e)} type="file" name="file" /></label>
                    <label>Файл должен быть не больше 5Мб и поддерживать формат документа или картинки</label>
                    <button onClick={() => SaveInvoce()}>Сохранить</button>
                </div>
            </main >
        </>
    );
}