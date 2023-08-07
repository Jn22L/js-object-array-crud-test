const MY_ITEM_LIST = [
  { seq: 1, title: "제목", content: "내용" },
  { seq: 2, title: "제목2", content: "내용2" },
  { seq: 3, title: "제목3", content: "내용3" },
];
const MY_ITEM_LIST_PK = ["seq"];

document.querySelector("#select").addEventListener("click", function (e) {
  select();
});

document.querySelector("#insert").addEventListener("click", function (e) {
  let newItem = { seq: 4, title: "제목4", content: "내용4" };
  modOriArr(MY_ITEM_LIST, MY_ITEM_LIST_PK, newItem, "I");
  select();
});

document.querySelector("#update").addEventListener("click", function (e) {
  let updItem = { seq: 2, content: "내용 수정합니다.2" };
  modOriArr(MY_ITEM_LIST, MY_ITEM_LIST_PK, updItem, "U");
  select();
});

document.querySelector("#delete").addEventListener("click", function (e) {
  let delItem = { seq: 3 };
  modOriArr(MY_ITEM_LIST, MY_ITEM_LIST_PK, delItem, "D");
  select();
});

function select() {
  MY_ITEM_LIST.forEach((element) => console.log(element));
}

function modOriArr(oriArr, PK, rowData, IUD) {
  switch (IUD) {
    case "I":
      oriArr.push(rowData);
      break;
    case "U":
      for (let i = 0; i < oriArr.length; i++) {
        let oriArrPk = Object.entries(oriArr[i]).filter(([key, val]) => PK.indexOf(key) > -1);
        let rowDataPk = Object.entries(rowData).filter(([key, val]) => PK.indexOf(key) > -1);
        if (oriArrPk.toString() === rowDataPk.toString()) {
          const keys = Object.keys(oriArr[i]);
          const tempItem = { ...oriArr[i], ...rowData };
          for (let j = 0; j < keys.length; j++) {
            oriArr[i][keys[j]] = tempItem[keys[j]];
          }
        }
      }
      break;
    case "D":
      for (let i = 0; i < oriArr.length; i++) {
        let oriArrPk = Object.entries(oriArr[i]).filter(([key, val]) => PK.indexOf(key) > -1);
        let rowDataPk = Object.entries(rowData).filter(([key, val]) => PK.indexOf(key) > -1);
        if (oriArrPk.toString() === rowDataPk.toString()) {
          oriArr.splice(i, 1);
        }
      }
      break;
    default:
      console.log("IUD 값이 아님");
  }
}
