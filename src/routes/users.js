// Create API Users Router
import { Router } from 'express';
import multer from 'multer';

import { addNonProfit, editNonProfit } from '../models/nonprofits';
import { createNewUser, getUserInfo, editUserInfo } from '../models/Auth0';
import jsonResponse from '../helpers/response';
import { uploadProfileImage } from '../models/Cloudinary';

const upload = multer();
const router = Router();

/*
******USER ROUTES******
*/

// Accepts a new user information. Returns a confirmation message.
router.post('/create', (req, res) => {
  if (req.body.userInfo.app_metadata.userType === 'non-profit') {
    const NonProfit = ({ name, ein, address, city, state, zip }) => ({
      name,
      ein,
      address,
      city,
      state,
      zip,
    });
    const newNonProfit = NonProfit(req.body.nonProfitInfo);
    addNonProfit(
      newNonProfit,
      (nonprofit) => {
        const newUser = req.body.userInfo;
        newUser.app_metadata.nonProfitID = String(nonprofit.dataValues.nonprofitId);
        createNewUser(
          newUser,
          (createdUser) => {
            const newUserData = createdUser.data;
            return jsonResponse(201, newUserData, 'Your user was successfully created.', res);
          },
          (error) => {
            const { statusCode, message } = error.response.data;

            return jsonResponse(statusCode, newUser.email, message, res);
          },
        );
        // If user fails delete non-profit if new.
      },
      addNonProfitError => jsonResponse(500, addNonProfitError, 'There was an error adding the non-profit to the database.'),
    );
  } else {
    const newUser = req.body.userInfo;
    newUser.app_metadata.nonProfitID = '';
    createNewUser(
      newUser,
      (createdUser) => {
        const newUserData = createdUser.data;
        return jsonResponse(201, newUserData, 'Your user was successfully created.', res);
      },
      (error) => {
        const { statusCode, message } = error.response.data;

        return jsonResponse(statusCode, { email: newUser.email }, message, res);
      },
    );
  }
});

router.patch('/upload/photo', upload.single('file'), (req, res) => {
  const { accessToken } = req.body;
  const image = req.file;
  const originalName = image.originalname;

  getUserInfo(
    accessToken,
    (user) => {
      const fileName = `${originalName.substring(0, originalName.lastIndexOf('.'))}-${user.email}-${(new Date()).toISOString()}`;
      uploadProfileImage(
        image,
        {
          public_id: fileName,
          folder: `profile/${user.email}`,
          tags: [user.email, 'profile-image'],
        },
        (uploadSuccess) => {
          editUserInfo(
            user.user_id,
            {
              user_metadata: {
                picture: uploadSuccess.secure_url,
              },
            },
            editUserRes => jsonResponse(
              editUserRes.status,
              { picture: editUserRes.data.user_metadata.picture },
              'You have successfully uploaded the picture.',
              res),
            editUserErr => jsonResponse(
              500,
              editUserErr,
              'There was an error uploading the user picture.',
              res),
          );
        },
        uploadErr => jsonResponse(
          500,
          uploadErr,
          'There was an error uploading the user picture.',
          res),
      );
    },
    findUserError => jsonResponse(
      findUserError.statusCode,
      findUserError.original,
      'This access token is not authorized.',
      res),
  );
});

// Accepts new information for the user with the userId param.
// Returns the updated user information. Requires authorization.
router.patch('/edit', (req, res) => {
  const { accessToken, editData } = req.body;
  const updatedUserInfo = editData.userInfo;
  getUserInfo(
    accessToken,
    (user) => {
      editUserInfo(
        user.user_id,
        updatedUserInfo,
        (editUserResponse) => {
          const updatedUser = editUserResponse.data;
          if (updatedUser.app_metadata.userType === 'non-profit') {
            const nonprofitId = updatedUser.app_metadata.nonProfitID;
            const updatedNonProfitInfo = editData.nonProfitInfo;
            editNonProfit(
              nonprofitId,
              updatedNonProfitInfo,
              updatedNonProfit => jsonResponse(
                200,
                {
                  updatedUser,
                  updatedNonProfit,
                },
                `${updatedUser.email.charAt(0).toUpperCase()}${updatedUser.email.slice(1)} has been updated.`,
                res),
              editNonProfitError => jsonResponse(
                500,
                { editNonProfitError },
                'There was an error editing the nonprofit. Please contact support.',
                res),
            );
          }
          return jsonResponse(
            200,
            { updatedUser },
            `${updatedUserInfo.email.charAt(0).toUpperCase()}${updatedUserInfo.email.slice(1)} has been updated`,
            res);
        },
        (editUserError) => {
          if (editUserError.response.data.message === 'The specified new email already exists') {
            return jsonResponse(
              409,
              { userId: user.user_id },
              `${updatedUserInfo.email.charAt(0).toUpperCase()}${updatedUserInfo.email.slice(1)} is already in use.`,
              res);
          }
          return jsonResponse(
            editUserError.response.status,
            { userId: user.user_id },
            editUserError.response.data.message,
            res);
        },
      );
    },
    (findUserError) => {
      if (findUserError.status === 401) {
        return jsonResponse(
          findUserError.status,
          findUserError.Error,
          'This access token is not authorized.',
          res);
      }
      return jsonResponse(
        findUserError.status,
        findUserError.Error,
        'Unknown error. Please contact support.',
        res);
    },
  );
});

// Exporting router as default.
export default router;
