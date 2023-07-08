import React from "react";
import "./contributors.css";
import contributors from "../../contributors";
import Contributor from "./Contributor";

export default function Contributors() {
    const renderContributors = () =>
        contributors.map((contributor) => <Contributor key={contributor.url} data={contributor} />);

    return (
        <footer id="contributors">
            <h3>Thank you to all who have contributed to this project!</h3>
            <ul>{renderContributors()}</ul>
            <div>
                Sky Clock originally created by <a href="https://github.com/cmstead">Chris Stead</a>. Project source is{" "}
                <a href="https://github.com/cmstead/sky-clock">available on GitHub</a>.
            </div>
        </footer>
    );
}
