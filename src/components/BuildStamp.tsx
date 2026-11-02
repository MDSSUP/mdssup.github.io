// The version and commit of this copy of the app

import { build } from "../lib/build";
import "./BuildStamp.css";

export default function BuildStamp() {
  return (
    <div className="build-stamp">
      Version {build.version} ·{" "}
      <span className="build-stamp-commit">{build.commit}</span>
      {import.meta.env.DEV && <span className="build-stamp-dev">Dev build</span>}
    </div>
  );
}
