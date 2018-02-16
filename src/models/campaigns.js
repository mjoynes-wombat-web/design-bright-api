import Fuse from 'fuse.js';

import * as db from './db';

export const getCampaignById = (getCampaignId, success, error) => {
  db.campaigns.find({
    where: { campaignId: getCampaignId },
  })
    .then((results) => {
      if (results === null) {
        return error({ message: `There isn't a campaign with the id ${getCampaignId}.`, error: results, code: 404 });
      }
      const {
        campaignId,
        nonprofitId,
        name,
        duration,
        fundingNeeded,
        donationsMade,
        startDate,
        endDate } = results;

      return success({
        nonprofitId,
        campaignId,
        name,
        duration,
        fundingNeeded,
        donationsMade,
        startDate,
        endDate,
      });
    }).catch((findErr => error({ message: `There was a database error finding the campaign with the id ${getCampaignId}.`, error: findErr, code: 500 })));
};

export const getCampaignContent = (campaignId, success, error) => {
  db.campaigns.find({
    where: { campaignId },
    include: [
      {
        model: db.campaignContent,
        where: {
          campaignId,
          contentStatus: 'current',
        },
        include: [
          {
            model: db.campaignText,
          },
          {
            model: db.campaignImages,
          },
        ],
      },
    ],
  })
    .then((results) => {
      const {
        nonprofitId,
        name,
        duration,
        fundingNeeded,
        donationsMade,
        startDate,
        endDate } = results;
      const campaignInfo = {
        nonprofitId,
        campaignId,
        name,
        duration,
        fundingNeeded,
        donationsMade,
        startDate,
        endDate,
      };
      const {
        contentId,
        contentStatus,
        createdDate,
        updatedAt,
        campaignTexts,
        campaignImages } = results.campaignContents[0];


      const contentInfo = {
        contentId,
        campaignId,
        contentStatus,
        createdDate,
        updatedAt,
      };

      const campaignTextBlocks = campaignTexts.reduce(
        (parsedCampaignText, block) => {
          const parsedBlock = {
            textId: block.textId,
            contentId: block.contentId,
            position: block.position,
            kind: block.kind,
            isVoid: block.isVoid,
            type: block.type,
            nodes: JSON.parse(block.nodes),
            createdAt: block.createdAt,
            updatedAt: block.updatedAt,
          };
          parsedCampaignText.push(parsedBlock);
          return parsedCampaignText;
        },
        [],
      );

      const campaignImagesBlocks = campaignImages.reduce(
        (cleanedImageData, block) => {
          const cleanedBlock = {
            imgId: block.imgId,
            contentId: block.contentId,
            position: block.position,
            kind: block.kind,
            isVoid: block.isVoid,
            type: block.type,
            data: {
              alt: block.alt,
              src: block.src,
              imageType: block.imageType,
            },
            createdAt: block.createdAt,
            updatedAt: block.updatedAt,
          };

          cleanedImageData.push(cleanedBlock);
          return cleanedImageData;
        },
        [],
      );
      const unsortedCampaignContent = [
        ...campaignImagesBlocks,
        ...campaignTextBlocks,
      ];
      const campaignContent = unsortedCampaignContent.sort(
        (a, b) => a.position - b.position);
      success({
        campaignInfo,
        contentInfo,
        campaignContent,
      });
    })
    .catch(findErr => error(findErr));
};

export const getNonprofitsCampaigns = (nonprofitId, success, error) => {
  db.campaigns.findAll({
    where: { nonprofitId },
  })
    .then((findResults) => {
      const campaigns = [];
      for (let i = 0; i < findResults.length; i += 1) {
        campaigns.push(findResults[i].dataValues);
      }
      success(campaigns);
    })
    .catch(findErr => error(findErr));
};

export const launchCampaign = (campaignId, nonprofitId, success, error) => {
  db.campaigns.find({
    where: { campaignId },
  })
    .then((campaign) => {
      const startDate = new Date();
      const endDate = new Date(Date.parse(startDate));
      endDate.setDate(endDate.getDate() + campaign.duration);

      db.campaigns.update(
        { startDate, endDate },
        { where: { campaignId, nonprofitId, startDate: null, endDate: null } },
      )
        .then(updateResults => success(updateResults))
        .catch(updateErr => error(updateErr));
    })
    .catch(findErr => error(findErr));
};

export const stopCampaign = (campaignId, nonprofitId, success, error) => {
  db.campaigns.update(
    { endDate: new Date() },
    {
      where: {
        campaignId,
        nonprofitId,
        startDate: {
          $ne: null,
        },
      },
    },
  )
    .then(updateResults => success(updateResults))
    .catch(updateErr => error(updateErr));
};

export const createContent = (campaignId, content, success, error) => {
  db.campaignContent.update(
    { contentStatus: 'previous' },
    {
      where: {
        campaignId,
        contentStatus: 'current',
      },
    },
  )
    .then(() => {
      db.campaignContent.create(
        {
          campaignId,
          contentStatus: 'current',
          createdDate: new Date(),
        },
      )
        .then((newContent) => {
          const contentId = newContent.contentId;
          const rawContent = content.document.nodes;
          const blocks = rawContent.reduce(
            (formattedBlocks, block, index) => {
              const newBlocks = formattedBlocks;
              const formattedBlock = {
                contentId,
                position: index + 1,
                kind: block.kind,
                isVoid: block.isVoid,
                type: block.type,
              };
              if (['paragraph', 'header', 'numberedList', 'bulletedList'].includes(block.type)) {
                formattedBlock.nodes = JSON.stringify(block.nodes);
                newBlocks.text.push(formattedBlock);
                return newBlocks;
              } else if (block.type === 'image') {
                formattedBlock.alt = block.data.alt;
                formattedBlock.src = block.data.src;
                formattedBlock.imageType = block.data.imageType;
                newBlocks.images.push(formattedBlock);
                return newBlocks;
              }
              return newBlocks;
            },
            {
              text: [],
              images: [],
            },
          );
          db.campaignText.bulkCreate(
            blocks.text,
          )
            .then(() => {
              db.campaignImages.bulkCreate(
                blocks.images,
              )
                .then(() => {
                  success(
                    {
                      statusCode: 200,
                      message: `The content for the campaign with the id ${campaignId} was saved.`,
                      campaignId,
                    },
                  );
                })
                .catch(createImagesErr => error(
                  {
                    statusCode: 500,
                    message: 'There was an error creating the image content.',
                    error: createImagesErr,
                  },
                ));
            })
            .catch(createTextErr => error(
              {
                statusCode: 500,
                message: 'There was an error creating the text content.',
                error: createTextErr,
              },
            ));
        })
        .catch(createContentErr => error(
          {
            statusCode: 500,
            message: 'There was an error creating the content information.',
            error: createContentErr,
          },
        ));
    })
    .catch(updateStatusErr => error(
      {
        statusCode: 500,
        message: 'There was an error changing the previous content\'s status.',
        error: updateStatusErr,
      },
    ));
};

export const createCampaign = (
  nonprofitId,
  { name, fundingNeeded, duration, content },
  success,
  error) => {
  db.campaigns.create(
    {
      nonprofitId,
      name,
      duration,
      fundingNeeded,
    },
  )
    .then((newCampaign) => {
      const { campaignId } = newCampaign;
      createContent(campaignId, content, success, error);
    })
    .catch((createCampaignErr) => {
      if (createCampaignErr.errors[0].type === 'unique violation') {
        return error(
          {
            statusCode: 409,
            error: createCampaignErr,
            message: 'That campaign name has already been taken. Please try another name.',
          },
        );
      }
      return error(
        {
          statusCode: 500,
          message: 'There was an error creating the campaign information.',
          error: createCampaignErr,
        },
      )
    });
};

export const updateCampaignInfo = (
  nonprofitId,
  { campaignId, name, fundingNeeded, duration },
  success,
  error,
) => {
  db.campaigns.update(
    {
      name,
      fundingNeeded,
      duration,
    },
    {
      where: {
        nonprofitId,
        campaignId,
      },
    },
  )
    .then((updatedCampaignInfo) => {
      if (updatedCampaignInfo[0] === 0) {
        return error({
          statusCode: 404,
          message: `The nonprofit with the id ${nonprofitId} doesn't exists or the campaign with the id ${campaignId} doesn't exists or belong to that nonprofit.`,
          error: updatedCampaignInfo,
        });
      }
      return success({
        statusCode: 200,
        message: `The campaign info was saved for campaign id ${campaignId}.`,
        updatedCampaignInfo,
      });
    })
    .catch((updateCampaignErr) => {
      if (updateCampaignErr.errors[0].type === 'unique violation') {
        return error(
          {
            statusCode: 409,
            error: updateCampaignErr,
            message: 'That campaign name has already been taken. Please try another name.',
          },
        );
      }
      return error({
        statusCode: 500,
        message: 'There was an error saving the campaign information.',
        error: updateCampaignErr,
      });
    });
};

export const donateToCampaign = (campaignId, amount, success, error) => {
  db.campaigns.find({
    where: { campaignId },
  })
    .then((findCampaignResults) => {
      if (findCampaignResults.startDate) {
        const donationsMade = (
          parseFloat(findCampaignResults.donationsMade)
          + (parseFloat(amount) / 100)
        );

        return db.campaigns.update(
          { donationsMade },
          { where: { campaignId } },
        ).then((updateDonationResults) => {
          if (updateDonationResults[0] > 0) {
            return success({
              code: 200,
              data: {
                results: updateDonationResults,
                donationsMade,
              },
              message: `The donations for the campaign with the id ${campaignId} were updated to $${donationsMade}`,
            });
          }
          return error({
            code: 404,
            error: updateDonationResults,
            message: `We could not find the campaign with the id ${campaignId}`,
          });
        }).catch(updateDonationErr => error({
          code: 500,
          error: updateDonationErr,
          message: `The donations made for the campaign with the id ${campaignId} were not updated.`,
        }));
      }
      return error({
        code: 401,
        error: findCampaignResults,
        message: `The campaign with the id of ${campaignId} hasn't been started yet.`,
      });
    })
    .catch(findCampaignErr => error({
      code: 404,
      error: findCampaignErr,
      message: `We could not find the campaign with the id ${campaignId}`,
    }));
};

export const getCampaigns = ({ page, search, sort }, success, error) => {
  db.campaigns.findAll(
    {
      where: {
        startDate: {
          $ne: null,
        },
        endDate: {
          $gt: new Date(),
        },
      },
      include: [
        {
          model: db.campaignContent,
          where: {
            contentStatus: 'current',
          },
          include: [
            {
              model: db.campaignText,
            },
            {
              model: db.campaignImages,
            },
          ],
        },
      ],
    },
  )
    .then((findCampaignsResults) => {
      const allCampaigns = findCampaignsResults.reduce(
        (cleanedCampaigns, campaign) => {
          const {
            campaignId,
            name,
            duration,
            fundingNeeded,
            donationsMade,
            startDate,
            endDate,
            campaignContents,
          } = campaign;
          const cleanedCampaign = {
            campaignId,
            name,
            duration,
            fundingNeeded,
            donationsMade,
            startDate,
            endDate,
          };

          const campaignParagraphs = campaignContents[0].campaignTexts.reduce(
            (paragraphs, block) => {
              const reducedBlock = block;
              if (reducedBlock.type === 'paragraph') {
                reducedBlock.nodes = JSON.parse(block.nodes);
                paragraphs.push(reducedBlock);
              }
              return paragraphs;
            },
            [],
          );
          const firstParagraph = campaignParagraphs[0].nodes.reduce(
            (text, node) => {
              if (node.type === 'link') {
                const newText = text + node.nodes[0].ranges[0].text;
                return newText;
              }
              const newText = text + node.ranges[0].text;
              return newText;
            },
            '',
          );
          cleanedCampaign.description = firstParagraph;

          const campaignMainImgs = campaignContents[0].campaignImages.reduce(
            (images, img) => {
              if (img.imageType === 'main') {
                const { alt, src } = img;
                images.push(
                  {
                    alt,
                    src,
                  },
                );
                return images;
              }
              return images;
            },
            [],
          );
          cleanedCampaign.image = campaignMainImgs[0];

          cleanedCampaigns.push(cleanedCampaign);
          return cleanedCampaigns;
        },
        [],
      );

      const options = {
        shouldSort: true,
        maxPatternLength: 48,
        minMatchCharLength: 2,
        tokenize: true,
        matchAllTokens: true,
        threshold: 0.3,
        keys: [
          {
            name: 'name',
            weight: 0.7,
          },
          {
            name: 'description',
            weight: 0.4,
          },
        ],
      };

      const fuse = new Fuse(allCampaigns, options);
      const searchedCampaigns = search ? fuse.search(search) : allCampaigns;

      const sortCampaigns = () => {
        switch (sort) {
          case 'Percent Funded':
            return searchedCampaigns.sort(
              (a, b) => (b.donationsMade / b.fundingNeeded) - (a.donationsMade / a.fundingNeeded));
          case 'Days Remaining':
            return searchedCampaigns.sort(
              (a, b) => (Date.parse(a.endDate)) - Date.parse(b.endDate));
          case 'Funding Needed':
            return searchedCampaigns.sort(
              (a, b) => (a.fundingNeeded - a.donationsMade)
                - (b.fundingNeeded - b.donationsMade));
          case 'Newest':
            return searchedCampaigns.sort(
              (a, b) => Date.parse(b.startDate)
                - Date.parse(a.startDate));
          case 'Relevance':
          default:
            return searchedCampaigns;
        }
      };

      const sortedCampaigns = sortCampaigns();

      const paginatedCampaigns = (page
        ? sortedCampaigns.slice(((page - 1) * 6), (page * 6))
        : sortedCampaigns.slice(0, 6));

      const pages = Math.ceil(sortedCampaigns.length / 6);

      if (paginatedCampaigns.length) {
        const message = (search
          ? `Page ${page} of ${pages} for the campaign results filtered by "${search}", sorted by ${sort}`
          : `Page ${page} of ${pages} for the campaign results sorted by ${sort}`);
        return success({
          statusCode: 200,
          campaigns: paginatedCampaigns,
          search,
          sort,
          page,
          pages,
          message,
        });
      } else if (pages === 0) {
        return error({
          statusCode: 404,
          campaigns: paginatedCampaigns,
          search,
          sort,
          page,
          pages,
          message: `The are no campaigns for "${search}"`,
        });
      } else if (page > pages) {
        return error({
          statusCode: 404,
          campaigns: paginatedCampaigns,
          search,
          sort,
          page,
          pages,
          message: `There are only ${pages} pages of results. You are trying to access page ${page}.`,
        });
      }
      return error({
        statusCode: 404,
        campaigns: paginatedCampaigns,
        search,
        sort,
        page,
        pages,
        message: `The are no campaigns for "${search}".`,
      });
    })
    .catch(findCampaignsErr => error({
      statusCode: 500,
      error: findCampaignsErr,
      search,
      sort,
      page,
      message: 'The are was an error retrieving the campaigns. Please try refreshing. If this doesn\'t fix the problem got to Need Help? at the bottom of this page.',
    }));
};
