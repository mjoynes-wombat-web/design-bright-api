// Create API Users Router
import { Router } from 'express';

import jsonResponse from '../helpers/response';
import createAdvisor from '../models/advisor';

const router = Router();

/*
******ADVISOR ROUTES******
*/

// Accepts a new advisor request. Returns a confirmation message.
router.post('/create', (req, res) => {
  createAdvisor(
    req.body,
    createAdvisorResults => jsonResponse(
      createAdvisorResults.statusCode,
      createAdvisorResults,
      createAdvisorResults.message,
      res),
    createAdvisorErr => jsonResponse(
      createAdvisorErr.statusCode,
      createAdvisorErr,
      createAdvisorErr.message,
      res),
  );
});

// Exporting router as default.
export default router;
