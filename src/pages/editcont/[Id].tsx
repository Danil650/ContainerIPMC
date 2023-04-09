import { useRouter } from 'next/router';
import { useEffect, useState } from "react";
import styles from '../../styles/Home.module.css';
import Container from 'lib/Container';
import uuid from 'react-uuid';

const App = () => {

    const router = useRouter()
    const { Id } = router.query; // получаем id из параметров маршрута
    let [ContId, setContId] = useState<string>("");
    let [ContName, setContName] = useState("");
    let [IsEdit, setEdit] = useState(false);
    let [ContsInList, setContsInList] = useState<Container[]>([]);
    let [ContInSelect, setContInSelect] = useState("");
    useEffect(() => {
        if (Id) {
            if (Id != "AddCotainer") {

                fetch(`http://localhost:3000/api/contid/${Id}`).then((response) => response.json().then((data) => {
                    setContId(data[0].Id);
                    setContName(data[0].Name);
                    setEdit(true);
                }));
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
        if (Id && ContName.trim().length != 0) {
            if (IsEdit) {
                let newCont: Container = {
                    Id: ContId,
                    ExcelId: 0,
                    Name: ContName,
                }
                fetch("http://localhost:3000/api/updatecont", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(newCont),
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
                fetch("http://localhost:3000/api/updatecont", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(newCont),
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
            {
                IsEdit ? (<button onClick={DelFromCont}>удалить</button>) : <></>
            }
        </div>
    )

}
export default App;