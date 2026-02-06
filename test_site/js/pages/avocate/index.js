import './advocate.css';
import { Nav } from '../../components/nav';

const Advocate = () => {
    const html = String.raw;
    return html`
        ${Nav()}
        <div class="page-container">
            <h1>Advocates</h1>
        </div>    
    `
}

export default Advocate;