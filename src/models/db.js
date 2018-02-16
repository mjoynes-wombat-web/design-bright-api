import Sequelize from 'sequelize';
import dotenv from 'dotenv';

const { DB_NAME, DB_USER, DB_PASS, DB_HOST, DB_SCHEMA, DB_PORT } = dotenv.config().parsed;

export const sequelize = new Sequelize(
  DB_NAME,
  DB_USER,
  DB_PASS,
  {
    host: DB_HOST,
    dialect: DB_SCHEMA,
    port: DB_PORT,
    pool: {
      max: 5,
      min: 0,
      idle: 10000,
    },
    logging: false,
    dialectOptions: {
      ssl: 0,
    },
  },
);

export const nonProfits = sequelize.define(
  'nonprofits',
  {
    nonprofitId: {
      type: Sequelize.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      field: 'nonprofit_id',
    },
    name: {
      type: Sequelize.STRING(75),
      allowNull: false,
      field: 'name',
    },
    address: {
      type: Sequelize.STRING(75),
      allowNull: false,
      field: 'address',
    },
    city: {
      type: Sequelize.STRING(75),
      allowNull: false,
      field: 'city',
    },
    state: {
      type: Sequelize.STRING(75),
      allowNull: false,
      field: 'state',
    },
    zip: {
      type: Sequelize.INTEGER(11),
      allowNull: false,
      field: 'zip',
    },
    ein: {
      type: Sequelize.INTEGER(11),
      allowNull: false,
      unique: true,
      field: 'ein',
    },
  }, {
    tableName: 'nonprofits',
  },
);

export const campaigns = sequelize.define(
  'campaigns',
  {
    campaignId: {
      type: Sequelize.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      field: 'campaign_id',
    },
    name: {
      type: Sequelize.STRING(100),
      allowNull: false,
      unique: true,
      field: 'name',
    },
    nonprofitId: {
      type: Sequelize.INTEGER(11),
      allowNull: false,
      field: 'nonprofit_id',
    },
    duration: {
      type: Sequelize.INTEGER(11),
      allowNull: false,
      field: 'duration',
    },
    fundingNeeded: {
      type: Sequelize.DECIMAL,
      allowNull: false,
      field: 'funding_needed',
    },
    donationsMade: {
      type: Sequelize.DECIMAL,
      allowNull: true,
      field: 'donations_made',
    },
    startDate: {
      type: Sequelize.DATE,
      allowNull: true,
      field: 'start_date',
    },
    endDate: {
      type: Sequelize.DATE,
      allowNull: true,
      field: 'end_date',
    },
  },
  {
    tableName: 'campaigns',
  },
);

export const campaignContent = sequelize.define(
  'campaignContent',
  {
    contentId: {
      type: Sequelize.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      field: 'content_id',
    },
    campaignId: {
      type: Sequelize.INTEGER(11),
      allowNull: false,
      field: 'campaign_id',
    },
    contentStatus: {
      type: Sequelize.STRING(75),
      allowNull: false,
      field: 'content_status',
    },
    createdDate: {
      type: Sequelize.DATE,
      allowNull: false,
      field: 'created_date',
    },
    createdAt: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: Sequelize.DATE,
      allowNull: false,
    },
  },
  {
    tableName: 'campaign_content',
  },
);

export const campaignText = sequelize.define(
  'campaignText', {
    textId: {
      type: Sequelize.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      field: 'text_id',
    },
    contentId: {
      type: Sequelize.INTEGER(11),
      allowNull: false,
      field: 'content_id',
      references: {
        model: 'campaign_content',
        key: 'content_id',
      },
    },
    position: {
      type: Sequelize.INTEGER(11),
      allowNull: false,
    },
    kind: {
      type: Sequelize.STRING(45),
      allowNull: false,
    },
    isVoid: {
      type: Sequelize.INTEGER(4),
      allowNull: false,
      field: 'is_void',
    },
    type: {
      type: Sequelize.STRING(45),
      allowNull: false,
    },
    nodes: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    createdAt: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: Sequelize.DATE,
      allowNull: false,
    },
  }, {
    tableName: 'campaign_text',
  },
);

export const campaignImages = sequelize.define(
  'campaignImages', {
    imgId: {
      type: Sequelize.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      field: 'img_id',
    },
    contentId: {
      type: Sequelize.INTEGER(11),
      allowNull: false,
      field: 'content_id',
      references: {
        model: 'campaign_content',
        key: 'content_id',
      },
    },
    position: {
      type: Sequelize.INTEGER(11),
      allowNull: false,
    },
    kind: {
      type: Sequelize.STRING(45),
      allowNull: false,
    },
    isVoid: {
      type: Sequelize.INTEGER(4),
      allowNull: false,
      field: 'is_void',
    },
    type: {
      type: Sequelize.STRING(45),
      allowNull: false,
    },
    alt: {
      type: Sequelize.STRING(45),
      allowNull: false,
    },
    src: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    imageType: {
      type: Sequelize.STRING(45),
      allowNull: false,
      field: 'image_type',
    },
    createdAt: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: Sequelize.DATE,
      allowNull: false,
    },
  }, {
    tableName: 'campaign_images',
  },
);

export const advisors = sequelize.define(
  'advisors',
  {
    advisorId: {
      type: Sequelize.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      field: 'advisor_id',
    },
    firstName: {
      type: Sequelize.STRING(75),
      allowNull: false,
      field: 'first_name',
    },
    lastName: {
      type: Sequelize.STRING(75),
      allowNull: false,
      field: 'last_name',
    },
    email: {
      type: Sequelize.STRING(100),
      allowNull: false,
      unique: true,
      field: 'email',
    },
    position: {
      type: Sequelize.STRING(75),
      allowNull: false,
      field: 'position',
    },
    yearsExperience: {
      type: Sequelize.DECIMAL,
      allowNull: false,
      field: 'years_experience',
    },
    advisorStatus: {
      type: Sequelize.STRING(75),
      allowNull: false,
      field: 'advisor_status',
    },
    nonprofitId: {
      type: Sequelize.INTEGER(11),
      allowNull: true,
      unique: true,
      field: 'nonprofit_id',
    },
  },
  {
    tableName: 'advisors',
  },
);

nonProfits.hasMany(campaigns, { foreignKey: 'nonprofit_id' });
campaigns.hasMany(campaignContent, { foreignKey: 'campaign_id' });
campaignContent.hasMany(campaignImages, { foreignKey: 'content_id' });
campaignContent.hasMany(campaignText, { foreignKey: 'content_id' });

sequelize.sync();
