import { useRouter } from 'next/router';
import { useEffect, useState } from "react";
import styles from '../styles/Home.module.css';
import uuid from 'react-uuid';
import React from 'react';

const App = () => {
    function EnterUser()
    {

    }
    return (
        <div className={styles.edit}>
            <div>
                <label>
                    Логин:
                    <input type="text" name="ContName"/>
                </label>
                <label>
                    Пароль:
                    <input type="text" name="ContName"/>
                </label>
            </div>
            <button onClick={()=>EnterUser}>Войти</button>

        </div>
    )

}
export default App;