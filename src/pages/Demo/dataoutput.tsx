import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import Isubst from "../../../lib/Substance"


function Home() {
  var [Subst, SetSubst] = useState<Isubst[]>();
  let [SelectedIndex, SetIndex] = useState(-1);
  useEffect(() => {
    fetch("http://localhost:3000/api/allsubst")
    .then(res=>res.json())
    .then(data => SetSubst(data))
  }, []);



  function DelHandler()
  {
    // console.log(SelectedIndex);
    if(SelectedIndex!= -1)
    {
      fetch(`http://localhost:3000/api/DelMe/${SelectedIndex.toString()}`);
      SetSubst(Subst?.filter(x=>
        {
          return x.Id != SelectedIndex;
        }));
    }
  }
  return (
    <div>
      <table>
        <thead>
        <tr>
          <td>Название</td>
          <td>CAS</td>
          <td>Что то</td>
        </tr>
        </thead>
        <tbody>
        {
          Subst?.map((item)=>
          {
            return (
              <tr key={item.Id} onClick={()=>SetIndex(item.Id)}>
                <td>{item?.SubstName ?? "Null"}</td>
                <td>{item?.CAS ?? "Null"}</td>
                <td>{item?.URL ?? "Null"}</td>
              </tr>
            )
          })
        }
        </tbody>
      </table>
      <button onClick={()=>DelHandler()}>Delete This</button>
    </div>
  );
}

export default Home;

