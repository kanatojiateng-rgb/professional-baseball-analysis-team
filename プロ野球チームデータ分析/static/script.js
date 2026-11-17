document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('analyzeForm');
    const teamSelector = document.getElementById('teamSelector1');
    const analysisItemsSelect = document.getElementById('analysisItems');
    const startYearSelect = document.getElementById('startYear');
    const endYearSelect = document.getElementById('endYear');
    const analyzeButton = document.getElementById('analyzeButton');
    const typeRadios = document.querySelectorAll('input[name="player_type"]');

    let lastValidItems = [];

    function selectedValues(select) {
        return Array.from(select.selectedOptions).map(o => o.value);
    }

    // ボタンを押せる条件: チーム1つ以上 / 項目1〜2個 / 開始年 <= 終了年
    function validateForm() {
        const hasTeam = selectedValues(teamSelector).length >= 1;
        const itemCount = selectedValues(analysisItemsSelect).length;
        const hasItem = itemCount >= 1 && itemCount <= 2;
        const yearsOk = Number(startYearSelect.value) <= Number(endYearSelect.value);
        analyzeButton.disabled = !(hasTeam && hasItem && yearsOk);
    }

    // 打撃/投手の切り替え時に、分析項目を取得し直す
    function updateAnalysisItems(selectedType) {
        fetch(`/get_items?player_type=${encodeURIComponent(selectedType)}`)
            .then(response => response.json())
            .then(items => {
                analysisItemsSelect.innerHTML = '';
                items.forEach(item => {
                    const option = document.createElement('option');
                    option.value = item;
                    option.textContent = item;
                    analysisItemsSelect.appendChild(option);
                });
                lastValidItems = [];
                validateForm();
            })
            .catch(error => {
                console.error('項目取得エラー:', error);
            });
    }

    // 分析項目は2つまで。3つ目を選んだら直前の状態に戻す
    analysisItemsSelect.addEventListener('change', () => {
        const current = selectedValues(analysisItemsSelect);
        if (current.length > 2) {
            alert('分析項目は２つまで選択できます');
            Array.from(analysisItemsSelect.options).forEach(o => {
                o.selected = lastValidItems.includes(o.value);
            });
        } else {
            lastValidItems = current;
        }
        validateForm();
    });

    teamSelector.addEventListener('change', validateForm);
    startYearSelect.addEventListener('change', validateForm);
    endYearSelect.addEventListener('change', validateForm);

    typeRadios.forEach(radio => {
        radio.addEventListener('change', event => {
            updateAnalysisItems(event.target.value);
        });
    });

    validateForm();
});