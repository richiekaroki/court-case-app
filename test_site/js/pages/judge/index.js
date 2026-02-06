import './judge.css';
import { Nav } from "../../components/nav/index.js";

const Judge = () => {
    const html = String.raw;
    return html`
        ${Nav()}
        <div class="page-container">
            <h1>Judges</h1>
        </div>
    `
};

export default Judge;