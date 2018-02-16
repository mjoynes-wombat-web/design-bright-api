import * as db from './db';

export const createAdvisor = ({ email, firstName, lastName, position, yearsExperience }, success, error) => {
  db.advisors.create(
    {
      email,
      firstName,
      lastName,
      position,
      advisorStatus: 'pending',
      yearsExperience,
    },
  )
    .then(createAdvisorResults => success(
      {
        statusCode: 200,
        createAdvisorResults,
        message: 'You request to become an advisor has been submitted.',
      },
    ))
    .catch((createAdvisorErr) => {
      if (createAdvisorErr.errors[0].type === 'unique violation') {
        return error(
          {
            statusCode: 409,
            error: createAdvisorErr,
            message: 'The email you provided has already been used.',
          },
        );
      }
      return error(
        {
          statusCode: 500,
          error: createAdvisorErr,
          message: 'There was an error submitting your request. Please try again.',
        },
      );
    });
};

export default createAdvisor;
