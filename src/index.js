import authenticate from "./authenticate.js";
import migrate from "./migrate.js";
import sourceSkylinks from "./sourceSkylinks.js";

await authenticate("source");
await authenticate("destination");
await sourceSkylinks();
await migrate();
