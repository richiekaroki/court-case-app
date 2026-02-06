import { Nav } from "../../components/nav/index.js";

const HomePage = () => {
  const html = String.raw;
  return html`
    ${Nav()}
    <div class="page-container">
      <img src="./assets/scales-balanced.svg" width="32px" height="32px" />
      <div class="page-statistics" x-data="{
        stats: [
          { label: 'Total Cases', statistics: 45000 },
          { label: 'Total Courts', statistics: 113 },
          { label: 'Total Judges', statistics: 90 },
          { label: 'Total Advocates', statistics: 1000 }
        ]
      }">
        <template x-for="stat in stats" :key="stat.label">
          <div class="stat-item">
            <h4 x-text="stat.label"></h4>
            <p x-text="stat.statistics"></p>
          </div>
        </template>
      </div>
    </div>
  `;
};

export default HomePage;
taylerhillssxo