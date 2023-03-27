import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import ExcelData from "../../lib/ExcelData"
import { from } from "linq-to-typescript"


function Home() {
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const binaryString = event?.target?.result as string;
      const workbook = XLSX.read(binaryString, { type: "binary" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval : null}) as any[][];

      // Map the array of arrays to an array of ExcelData objects
       const excelData: ExcelData[] = data.map(row => ({
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
      excelData.shift();
      console.log(excelData);
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
      throw new Error("Failed to send data to API");
    }
    else {
      alert("ok");
    }
  };
  //test
  let a: ExcelData[] = [{Id : 1},{Id:2}];

  let b: ExcelData = {Id : 3};

  console.log(a.some(x=>x.Id === 3))

  a.push(b);

  console.log(a.some(x=>x.Id === b.Id));
  //
  return (
    <div>
      <input type="file" onChange={handleFileUpload} />
    </div>
  );
}

export default Home;

