import Link from "next/link";
import { GithubIcon } from "./icons";

const REPO_URL = "https://github.com/pipetboy2001/retroAchievements-Download-games";

export default function Footer() {
  return (
    <footer className="site-footer">
      <a href={REPO_URL} target="_blank" rel="noopener" className="footer-repo">
        <GithubIcon size={14} />
        <span>Colaborá con el repositorio</span>
      </a>
      <p>
        Desarrollado por{" "}
        <a href="https://github.com/pipetboy2001" target="_blank" rel="noopener">
          Pipetboy
        </a>
        <span className="sep">·</span>
        <Link href="/faq">FAQ y Aviso legal</Link>
      </p>
    </footer>
  );
}
