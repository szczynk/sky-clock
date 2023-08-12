function Contributor({ name, url }) {
  return (
    <li>
      <a href={url}>{name}</a>
    </li>
  );
}

export default Contributor;
