const NotFound = () => {
    const html = String.raw;
    return html`
        <div style="display: flex; justify-content: center; align-items: center; width: 100%; height: 100vh; flex-direction: column">
            <h1>404 - Page Not Found</h1>
            <button style="margin-top: 16px; cursor: pointer; background: transparent; border: 0px solid transparent" onclick="history.back()">
                <img src="./assets/back-icon.svg" width="24px" height="24px" style=""/>
            </button>
        </div>
    `
};

export default NotFound;