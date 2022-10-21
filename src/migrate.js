import chalk from "chalk";
import got from "got";
import db from "./db.js";
import { getSkylinkPinEndpoint } from "./endpoints.js";

export default async function migrate() {
  for (let i = 0; i < db.data.source.skylinks.length; i++) {
    const { skylink } = db.data.source.skylinks[i];

    if (!db.data.destination.migration) {
      db.data.destination.migration = {};
    }

    const record = db.data.destination.migration[skylink];

    if (!record || !record.pinned) {
      try {
        await got.post(getSkylinkPinEndpoint(db.data.destination.portal, skylink), {
          headers: { cookie: db.data.destination.cookie },
        });

        db.data.destination.migration[skylink] = { pinned: true };

        console.log(chalk.green(`✅ Successfully migrated ${skylink}`));
      } catch (error) {
        db.data.destination.migration[skylink] = { pinned: false, error: error.message };

        console.log(chalk.red(`❌ Failed to migrate ${skylink}`), chalk.gray(error.message));
      }

      await db.write();
    }
  }

  console.log(chalk.gray("------------------------------"));
  console.log(chalk.green("🏆 Skylinks migration completed!"));

  const migration = Object.values(db.data.destination.migration);
  const pinned = migration.filter(({ pinned }) => pinned);
  const failed = migration.filter(({ pinned }) => !pinned);

  if (failed.length) {
    console.log(chalk.green(`✅ ${pinned.length} skylinks pinned!`));
    console.log(chalk.red(`❌ ${failed.length} skylinks failed with errors:`));

    const errors = {};

    for (let i = 0; i < failed.length; i++) {
      const { error } = failed[i];

      if (error in errors) {
        errors[error]++;
      } else {
        errors[error] = 1;
      }
    }

    Object.entries(errors).forEach(([error, count]) => {
      console.log(chalk.gray(`\t ${count} skylinks failed with: ${error}`));
    });

    console.log(chalk.magenta("🌺 You can run this script again to retry failed skylinks"));
  } else {
    console.log(chalk.green(`✅ All ${pinned.length} skylinks pinned!`));
  }
}
