document.addEventListener('alpine:init', () => {
    Alpine.data('chartData', () => ({
        chart: null,
        data: [],
        init() {
            this.fetchData().then(() => this.createChart());
        },
        async fetchData() {
            try {
                const response = await fetch('http://localhost:3001/api/case/caseCountByDate', {
                    headers: { 'content-type': 'application/json' },
                });
                if (response.ok) {
                    this.data = await response.json();
                } else {
                    console.error('Failed to fetch data');
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        },
        createChart() {
            const ctx = document.getElementById('caseByDateCountChart');
            this.chart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: this.data.map(row => row.date_delivered),
                    datasets: [{
                        label: 'Case Count By Date',
                        data: this.data.map(row => row.case_count),
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        y: { beginAtZero: true }
                    }
                }
            });
        },
        async refreshData() {
            await this.fetchData();
            this.updateChart();
        },
        updateChart() {
            if (this.chart) {
                this.chart.data.labels = this.data.map(row => row.date_delivered);
                this.chart.data.datasets[0].data = this.data.map(row => row.case_count);
                this.chart.update();
            }
        }
    }));
});