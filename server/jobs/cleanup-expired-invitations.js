import 'dotenv/config';
import { createLogger } from '../../common/logger.js';
import db from '../../db/models/index.js';
import { Op } from 'sequelize';

const log = createLogger(`job:cleanup-expired-invitations`);

try {
  const [count] = await db.Invitation.update(
    { status: `expired` },
    {
      where: {
        status: `pending`,
        expiresAt: { [Op.lt]: new Date() },
      },
    },
  );

  if (count > 0) {
    log.info({ count }, `Expired ${count} pending invitation(s)`);
  } else {
    log.info(`No expired invitations found`);
  }

  await db.sequelize.close();
  process.exit(0);
} catch (err) {
  log.error({ err }, `Job failed`);
  process.exit(1);
}
