import { Router } from 'express';

import { addNonProfit, findNonProfitByID } from '../models/nonprofits';
import { getUserInfo } from '../models/Auth0';
import { getNonprofitsCampaigns, launchCampaign, stopCampaign } from '../models/campaigns';
import jsonResponse from '../helpers/response';
import requireAuth from '../helpers/requireAuth';

const router = Router();

router.post('/create', (req, res) => {
  addNonProfit(req.body,
    (results) => {
      res.status(results.status).json(results);
    },
    (error) => {
      res.json(error);
    },
  );
});

router.get('/:accessToken', (req, res) => {
  const accessToken = req.params.accessToken;
  if (requireAuth(accessToken)) {
    getUserInfo(
      accessToken,
      (user) => {
        const nonprofitId = user.app_metadata.nonProfitID;
        findNonProfitByID(
          nonprofitId,
          results => (results === null ?
            jsonResponse(
              404,
              { nonprofitId },
              'This account belongs to a non-profit that doesn\'t exist. Please contact support.',
              res)
            : jsonResponse(
              200,
              results.dataValues,
              `You have successfully retrieved the nonprofit's info that has the id of ${user.app_metadata.nonProfitID}.`,
              res)
          ),
          error => jsonResponse(
            500,
            error,
            'There was an issue retrieving the non-profit information from the database. Please contact support.',
            res),
        );
      },
      error => jsonResponse(
        error.statusCode,
        error.original,
        'There was an error getting the user info.',
        res),
    );
  } else {
    jsonResponse(
      401,
      { accessToken },
      'The access token is not a valid access token.',
      res,
    );
  }
});

router.patch('/campaigns/launch/:campaignId', (req, res) => {
  const id = req.params.campaignId;
  const accessToken = req.body.accessToken;
  if (requireAuth(accessToken)) {
    getUserInfo(
      accessToken,
      userInfo => launchCampaign(
        id,
        userInfo.nonProfitID,
        launchResults => (launchResults[0] === 0
          ? jsonResponse(
            304,
            launchResults,
            'Could not start the campaign. Either it doesn\'t exists or is already started.',
            res)
          : jsonResponse(
            200,
            launchResults,
            'You have successfully started your campaign.',
            res)),
        launchErr => jsonResponse(
          500,
          launchErr,
          'There was an server error launching the campiagn.',
          res),
      ),
      getUserErr => jsonResponse(
        404,
        getUserErr,
        'There was an error getting the user info.',
        res),
    );
  } else {
    jsonResponse(
      401,
      { accessToken },
      'This access token is not authorized.',
      res,
    );
  }
});

router.patch('/campaigns/stop/:campaignId', (req, res) => {
  const id = req.params.campaignId;
  const accessToken = req.body.accessToken;
  if (requireAuth(accessToken)) {
    getUserInfo(
      accessToken,
      userInfo => stopCampaign(
        id,
        userInfo.nonProfitID,
        stopResults => (stopResults[0] === 0
          ? jsonResponse(
            304,
            stopResults,
            'Could not stop the campaign. Either it doesn\'t exists, hasn\'t been started or is already stopped.',
            res)
          : jsonResponse(
            200,
            stopResults,
            'You have successfully stopped your campaign.',
            res)),
        stopErr => jsonResponse(
          500,
          stopErr,
          'There was an server error stopping the campaign.',
          res),
      ),
      getUserErr => jsonResponse(
        404,
        getUserErr,
        'There was an error getting the user info.',
        res),
    );
  } else {
    jsonResponse(
      401,
      { accessToken },
      'The access token is not a valid access token.',
      res,
    );
  }
});

router.get('/campaigns/:accessToken', (req, res) => {
  const accessToken = req.params.accessToken;
  if (requireAuth(accessToken)) {
    getUserInfo(
      accessToken,
      (user) => {
        const nonprofitId = user.app_metadata.nonProfitID;
        findNonProfitByID(
          nonprofitId,
          (nonprofit) => {
            getNonprofitsCampaigns(
              nonprofitId,
              campaigns => jsonResponse(
                200,
                { nonprofit, campaigns },
                `The campaigns were successfully retrieved for the nonprofit with the id ${nonprofitId}.`,
                res,
              ),
              error => jsonResponse(
                404,
                error,
                `Could not find campaigns for the nonprofit with the id ${nonprofitId}.`,
                res,
              ),
            );
          },
          error => jsonResponse(
            404,
            error,
            `Could not find campaigns for the nonprofit with the id ${nonprofitId}.`,
            res,
          ),
        );
      },
      error => jsonResponse(
        error.statusCode,
        error.original,
        'There was an error getting the user info.',
        res,
      ),
    );
  } else {
    jsonResponse(
      401,
      { accessToken },
      'The access token is not a valid access token.',
      res,
    );
  }
});

export default router;
