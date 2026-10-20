const ctx = document.getElementById("teamChart");

new Chart(ctx, {
  type: "bar",
  data: {
    labels: ["2021年", "2022年", "2023年", "2024年", "2025年"],
    datasets: [
      {
        type: "bar",
        label: "安打数",
        data: [1200, 1250, 1180, 1300, 1280],
        yAxisID: "y"
      },
      {
        type: "line",
        label: "打率",
        data: [0.250, 0.265, 0.258, 0.275, 0.268],
        yAxisID: "y1"
      }
    ]
  },
  options: {
    responsive: true,
    scales: {
      y: {
        type: "linear",
        position: "left",
        title: {
          display: true,
          text: "安打数"
        }
      },
      y1: {
        type: "linear",
        position: "right",
        title: {
          display: true,
          text: "打率"
        },
        min: 0,
        max: 0.4,
        grid: {
          drawOnChartArea: false
        }
      }
    }
  }
});


