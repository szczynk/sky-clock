import "./contributors.css";
import Contributor from "./Contributor";
import contributors from "../../contributors";

function Contributors() {
  return (
    <footer id="contributors">
      <h3>Thank you to all who have contributed to this project!</h3>
      <ul>
        {contributors.map((contributor) => (
          <Contributor
            key={contributor.url}
            name={contributor.name}
            url={contributor.url}
          />
        ))}
      </ul>
      <div>
        Sky Clock originally created by{" "}
        <a href="https://github.com/cmstead">Chris Stead</a>. Project source is{" "}
        <a href="https://github.com/cmstead/sky-clock">available on GitHub</a>.
      </div>
    </footer>
  );
}

export default Contributors;
