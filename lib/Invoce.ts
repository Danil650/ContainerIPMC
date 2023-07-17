interface Invoce {
  IdInvoce: string,
  DateInvoce: string,
  CurUser?: string,
  UserId: string,
  FIO?: string,
  Ext: string,
}
export default Invoce;

export function validateFile(file: File) {
  const allowedImageTypes = ["image/jpeg", "image/jpg", "image/png"];
  const allowedDocumentTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
  const maxSizeInBytes = 5 * 1024 * 1024; // 5 МБ

  // Проверка формата файла
  if (allowedImageTypes.includes(file.type)) {
    console.log("Файл является изображением.");
  } else if (allowedDocumentTypes.includes(file.type)) {
    console.log("Файл является документом.");
  } else {
    console.log("Формат файла не поддерживается.");
    return false;
  }

  // Проверка размера файла
  if (file.size > maxSizeInBytes) {
    console.log("Размер файла превышает 5 МБ.");
    return false;
  }

  return true;
}

export function GetInvoce(Inv: Invoce) {
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