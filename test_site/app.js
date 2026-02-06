import { HomePage, Advocate, Judge, NotFound, County } from "./js/pages/index.js";
import './styles/styles.css';

let appDiv = document.getElementById("app");

const routes = [
    { path: '/', action: () => HomePage() },
    { path: '/advocates', action: () => Advocate() },
    { path: '/judges', action: () => Judge() },
    { path: '/counties', action: () => County() },
];

const router = new UniversalRouter(routes);

function handleRouting() {
    const path = window.location.pathname || '/';
    console.log('Path is : ', path);

    console.log('Router : ', router);

    router.resolve({ pathname: path })
        .then(content => {
            appDiv.innerHTML = content;
        }).catch(error => {
            appDiv.innerHTML = NotFound();
        });
}

window.addEventListener('popstate', handleRouting);

document.addEventListener('click', function (event) {
    if (event.target.matches('a[data-link]')) { // Assuming you add data-link to your nav links
        event.preventDefault(); // Prevent default anchor behavior
        const path = event.target.getAttribute('href'); // Get the link href
        window.history.pushState({}, '', path); // Change the URL
        handleRouting(); // Call the routing handler
    }
});

handleRouting();
