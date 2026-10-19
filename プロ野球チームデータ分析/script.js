const startYearSelect = document.getElementById("start_Year");
const endYearSelect = document.getElementById("end_Year");

console.log("セレクトボックスを取得出来たよ！", startYearSelect);
console.log("終了年度:", endYearSelect);

for (let year = 2005; year <= 2026; year++) {


const option1 = document.getElementById("option");
option1.value = year;
option1.textContent = year;
startYearSelect.appendChild(option1);

const option2 = document.getElementById("option");
option2.value = year;
option2.textContent = year; 
endYearSelect.appendChild(option2);
}
