// visualization.js
const canvas = document.getElementById('myChart');
const ctx = canvas.getContext('2d');

const itemLeft = selectedItems[0] || "項目１";
const itemRight = selectedItems[1] || "項目２";

const lineColors = [
  '#004488',
  '#D4A373',
  '#2A9D8F'
];

const barColors = [
  'rgba(142, 154, 175, 0.5)',
  'rgba(163, 177, 138, 0.5)',
  'rgba(202, 210, 197, 0.5)'
];

const isSingleItem = selectedItems.length === 1;

// グラフを表示するスクロール領域
const scrollArea = canvas.parentElement;

// 最初のグラフ幅：年度数に応じて確保
const baseWidth = Math.max(
  scrollArea.clientWidth,
  chartLabels.length * 90
);

let currentWidth = baseWidth;

Chart.defaults.font.size = 16;
Chart.defaults.font.family = "'Meiryo', 'Yu Gothic', sans-serif";

const chart = new Chart(ctx, {
  type: isSingleItem ? 'line' : 'bar',

  data: {
    labels: chartLabels,

    datasets: chartDatasets.map((ds, index) => {
      const isRightAxis =
        selectedItems.length > 1 && ds.item === itemRight;

      const isLine = isSingleItem || isRightAxis;
      const colorIndex =
        Math.floor(index / selectedItems.length) % 3;

      return {
        label: ds.label,
        data: ds.data,
        teamList: ds.teamList,

        type: isLine ? 'line' : 'bar',
        yAxisID: isSingleItem
          ? 'y'
          : (isRightAxis ? 'y1' : 'y'),

        borderColor: isLine
          ? lineColors[colorIndex]
          : 'transparent',

        backgroundColor: isLine
          ? lineColors[colorIndex]
          : barColors[colorIndex],

        tension: 0.15,
        borderWidth: isLine ? 3 : 0,
        pointRadius: isLine ? 4 : 0,
        pointHoverRadius: 8,
        pointBackgroundColor: isLine
          ? lineColors[colorIndex]
          : 'transparent',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        order: isLine ? 1 : 2
      };
    })
  },

  options: {
    layout: {
      padding: { bottom: 20 }
    },
    responsive: false,
    maintainAspectRatio: false,

     interaction: {
    mode: 'index',      // 同じ年のデータをまとめて表示
    intersect: false    // 点にぴったり合わせなくても反応する
  },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          align: 'center',
          color: '#666666',

          // 年度を省略せずに表示
          autoSkip: false,

          minRotation: 0,
          maxRotation: 45,


          font: {size :18 }
        },
        offset: true
      },

      y: {
        type: 'linear',
        position: 'left',
        grace: '10%',
        border: { display: false },
        grid: {
          display: true,
          color: 'rgba(0,0,0, 0.05)'
        },
        
        ticks: {
          color: '#6B7A99',
          font:{ size: 16 }
        },
        title: {
      display: true,
      text: itemLeft,
      color: '#6B7A99',
      font: { size: 18, weight: 'bold' }   
      }
    },

      y1: {
        type: 'linear',
        position: 'right',
        grace: '10%',
        display: selectedItems.length > 1,
        border: { display: false },
        grid: { display: false },
        title: {
          display: true,
          text: itemRight,
          color: lineColors[0],
          font: { size: 14, weight: 'bold' }
        },
        ticks: { color: lineColors[0] }
      }
    },

    plugins: {
      legend: {
        position: 'top',
        labels: {
          boxWidth: 20,
          font: { size: 16 }
        }
      },

            tooltip: {
        callbacks: {
          label: function(context) {
            const dataset = context.dataset;
            const dataIndex = context.dataIndex;

            const teamName = dataset.teamList
              ? dataset.teamList[dataIndex]
              : '';

            let label = dataset.label || '';

            if (label) {
              label += ': ';
            }

            if (context.parsed.y !== null) {
              label += context.parsed.y;
            }

            return label;
          }
        }
      }
    }
  }   
      });
   
 
// グラフの幅を変更する関数
function updateCanvasWidth() {
  const minWidth = scrollArea.clientWidth;
  const maxWidth = baseWidth * 4;

  // 最小幅・最大幅を設定
  currentWidth = Math.min(
    maxWidth,
    Math.max(minWidth, currentWidth)
  );

  canvas.style.width = currentWidth + 'px';
  canvas.style.height = '400px';

  chart.resize(currentWidth, 400);
}

// 初期表示
updateCanvasWidth();

// 拡大ボタン
document.getElementById('zoomIn').addEventListener('click', () => {
  currentWidth *= 1.2;
  updateCanvasWidth();
});

// 縮小ボタン
document.getElementById('zoomOut').addEventListener('click', () => {
  currentWidth *= 0.8;
  updateCanvasWidth();
});

// リセットボタン
document.getElementById('zoomReset').addEventListener('click', () => {
  currentWidth = baseWidth;
  updateCanvasWidth();

  // 横スクロールも先頭に戻す
  scrollArea.scrollLeft = 0;
});

// 2本指のピンチ操作
let pinchStartDistance = 0;
let pinchStartWidth = 0;

function getTouchDistance(touches) {
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;

  return Math.sqrt(dx * dx + dy * dy);
}

scrollArea.addEventListener('touchstart', (e) => {
  if (e.touches.length === 2) {
    pinchStartDistance = getTouchDistance(e.touches);
    pinchStartWidth = currentWidth;
  }
}, { passive: true });

scrollArea.addEventListener('touchmove', (e) => {
  if (e.touches.length === 2 && pinchStartDistance > 0) {
    e.preventDefault();

    const currentDistance = getTouchDistance(e.touches);
    const scale = currentDistance / pinchStartDistance;

    currentWidth = pinchStartWidth * scale;
    updateCanvasWidth();
  }
}, { passive: false });

scrollArea.addEventListener('touchend', (e) => {
  if (e.touches.length < 2) {
    pinchStartDistance = 0;
  }
});
  
