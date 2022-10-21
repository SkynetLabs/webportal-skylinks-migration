import chalk from "chalk";
import got from "got";
import inquirer from "inquirer";
import validator from "validator";
import db from "./db.js";
import { getPortalApi, getAccountAuthApi } from "./endpoints.js";

const defaultPortals = {
  source: "https://skynetfree.net",
  destination: "https://web3portal.com",
};

export default async function authenticate(type) {
  await db.read();

  db.data = await inquirer.prompt(
    {
      name: `${type}.continue`,
      message: () => {
        const progressWarning = db.data?.destination?.migration ? "Current progress will be lost if you don't!" : "";
        const portal = chalk.magenta(getPortalApi(db.data[type].portal));
        const email = chalk.magenta(db.data[type].email);

        return `Continue using ${type} portal ${portal} as ${email} ? ${progressWarning}`.trim();
      },
      type: "confirm",
      askAnswered: true,
      when: () => Boolean(db.data && db.data[type] && "portal" in db.data[type] && "email" in db.data[type]),
    },
    db.data
  );

  if (db.data && db.data[type] && db.data[type].continue === false) {
    db.data.source = {};
    db.data.destination = {};
  }

  db.data = await inquirer.prompt(
    {
      name: `${type}.portal`,
      message: () => `Input ${type} portal address`,
      type: "input",
      askAnswered: () => db.data[type].continue === false,
      validate: (input) => validator.isURL(input) || "Portal address needs to be valid!",
      default: defaultPortals[type],
    },
    db.data
  );

  db.data = await inquirer.prompt(
    {
      name: `${type}.email`,
      message: () => `Input ${getPortalApi(db.data[type].portal)} email`,
      askAnswered: () => db.data[type].continue === false,
      validate: (input) => validator.isEmail(input) || "Email has to be valid!",
      type: "input",
    },
    db.data
  );

  delete db.data[type].continue; // do not store continue variable

  await db.write();

  db.data = await inquirer.prompt(
    {
      name: `${type}.password`,
      message: () => `Input ${getPortalApi(db.data[type].portal)} password`,
      askAnswered: true,
      validate: (input) => input.length > 0 || "Password is required!",
      type: "password",
    },
    db.data
  );

  try {
    const response = await got.post(getAccountAuthApi(db.data[type].portal), {
      json: { email: db.data[type].email, password: db.data[type].password },
    });

    db.data[type].cookie = response.headers["set-cookie"];

    console.log(
      chalk.green(
        `🔐 Authenticated ${type} portal ${chalk.magenta(getPortalApi(db.data[type].portal))} as ${chalk.magenta(
          db.data[type].email
        )} succesfully!`
      )
    );
  } catch (error) {
    console.log(chalk.red("🔐 Authentication failed!"), chalk.gray(error.message));

    return authenticate(type);
  }

  delete db.data[type].password; // do not store user password

  await db.write();

  console.log(chalk.gray("------------------------------"));
}
