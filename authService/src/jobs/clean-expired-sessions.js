const cron = require("node-cron");
const { Session } = require("../models/index");
const { Op } = require("sequelize");

cron.schedule("0 0 * * *", async () => { // once per day

  const now = new Date();

  await Session.destroy({
    where: {
      [Op.or]: [
        { expiresAt: { [Op.lt]: now } },
        { absoluteExpiry: { [Op.lt]: now } }
      ]
    }
  });

  console.log("Expired sessions cleaned");
});