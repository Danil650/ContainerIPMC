import React, { useMemo } from 'react';
import MaterialReactTable, { type MRT_ColumnDef } from 'material-react-table';
import { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from 'next/router';
import User from 'lib/User';
import Nav from 'lib/Nav';
import Invoce from 'lib/Invoce';
import { ListItemIcon, MenuItem, ThemeProvider, createTheme } from '@mui/material';
import { Edit, Send } from '@mui/icons-material';
//Date Picker Imports
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { MRT_Localization_RU } from 'material-react-table/locales/ru';
import { ruRU } from '@mui/material/locale';
import 'dayjs/locale/ru';

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
    const [Invoces, setInvoces] = useState<Invoce[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const filteredInvoces = useMemo(() => {
        if (selectedDate && Date.parse(selectedDate.toString())) {
            return Invoces.filter((inv) => new Date(inv.DateInvoce) <= selectedDate);
        }
        return Invoces;
    }, [Invoces, selectedDate]);

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_URL}api/invoce`)
            .then(async (res) => await res.json())
            .then((data) => setInvoces(data));
    }, []);

    function GetInvoce(Inv: Invoce) {
        fetch(`${process.env.NEXT_PUBLIC_URL}api/invoceFile`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(Inv),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Ошибка получения файла');
                }
                return response.blob();
            })
            .then((blob) => {
                // Создаем ссылку для скачивания файла
                const downloadLink = document.createElement('a');
                const objectURL = URL.createObjectURL(blob);
                downloadLink.href = objectURL;

                // Устанавливаем имя файла
                downloadLink.download = `${Inv.IdInvoce}.${Inv.Ext}`;

                // Кликаем по ссылке для начала скачивания файла
                downloadLink.click();

                // Освобождаем объект URL после скачивания
                URL.revokeObjectURL(objectURL);
            })
            .catch((error) => {
                console.error(error);
            });

    }
    function MaterialTable() {

        const darkTheme = createTheme({
            palette: {
                mode: 'light',
            },
        });
        const columns = useMemo<MRT_ColumnDef<Invoce>[]>(
            () => [
                { accessorKey: 'IdInvoce', header: 'Номер накладной' },
                {
                    accessorFn: (row) => new Date(row.DateInvoce), //convert to Date for sorting and filtering
                    id: 'startDate',
                    header: 'Дата прибытия',
                    filterFn: 'lessThanOrEqualTo',
                    sortingFn: 'datetime',
                    Cell: ({ cell }) => cell.getValue<Date>()?.toLocaleDateString(), //render Date as a string
                    Header: ({ column }) => <em>{column.columnDef.header}</em>, //custom header markup
                    //Custom Date Picker Filter from @mui/x-date-pickers
                    Filter: ({ column }) => (
                        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ru">
                            <DatePicker
                                onChange={(newValue) => {
                                    setSelectedDate(newValue); // обновите состояние с выбранной датой
                                    column.setFilterValue(newValue); // установите значение фильтра
                                }}
                                slotProps={{
                                    textField: {
                                        helperText: 'Режим фильтрации: Равен',
                                        sx: { minWidth: '120px' },
                                        variant: 'standard',
                                    },
                                }}
                                value={selectedDate} // используйте состояние в качестве значения DatePicker
                            />
                        </LocalizationProvider>
                    ),
                },
                { accessorKey: 'FIO', header: 'ФИО принявшего' },
                { accessorKey: 'Ext', header: 'Расширение файла накладной' },
            ],
            [],
        );
        return (
            <ThemeProvider theme={createTheme(darkTheme, ruRU)}>
                <MaterialReactTable
                    columns={columns}
                    data={filteredInvoces}

                    // localization={MRT_Localization_RU}
                    localization={MRT_Localization_RU}
                    enableRowActions
                    initialState={{ showColumnFilters: true }}
                    positionToolbarAlertBanner="bottom"

                    renderRowActionMenuItems={({ closeMenu, row }) => [
                        <MenuItem
                            key={1}
                            onClick={() => {
                                closeMenu();
                                GetInvoce(Invoces[Number.parseInt(row.id)]);
                            }}
                            sx={{ m: 0 }}
                        >
                            <ListItemIcon>
                                <Send />
                            </ListItemIcon>
                            Получить накладную
                        </MenuItem>,
                        <MenuItem
                            key={2}
                            onClick={() => {
                                console.log(row.id);
                                router.push(`/invoce/${Invoces[Number.parseInt(row.id)].IdInvoce}`);
                                closeMenu();
                            }}
                            sx={{ m: 0 }}
                        >
                            <ListItemIcon>
                                <Edit />
                            </ListItemIcon>
                            Редактировать
                        </MenuItem>,
                    ]}
                />
            </ThemeProvider>

        );
    }
    return (
        <>
            <Head>
                <title>Окно контроля накладных</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            {
                Curuser && Curuser[0] ? (Nav(router, Curuser[0])) : Nav(router, undefined)
            }
            <main>
                <MaterialTable></MaterialTable>

            </main >
        </>
    );
}