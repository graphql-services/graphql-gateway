import * as express from 'express';

export const healthcheck = express.Router();

healthcheck.get(
  '/healthcheck',
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.send('OK');
  }
);
