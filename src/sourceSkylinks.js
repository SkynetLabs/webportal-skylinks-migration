import process from "node:process";
import chalk from "chalk";
import got from "got";
import db from "./db.js";
import { getAccountUploadsApi } from "./endpoints.js";

export default async function sourceSkylinks() {
  await db.read();

  try {
    const { items: skylinks } = await got(getAccountUploadsApi(db.data.source.portal), {
      headers: { cookie: db.data.source.cookie },
    }).json();

    db.data.source.skylinks = skylinks;

    console.log(chalk.green(`🌐 Source portal responded with ${db.data.source.skylinks.length} skylinks`));
  } catch (error) {
    console.log(chalk.red("🌐 Source portal failed to return skylinks"), chalk.gray(error.message));

    process.exit(1);
  }

  await db.write();

  console.log(chalk.gray("------------------------------"));
}
