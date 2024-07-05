import * as Joi from 'joi';

export const configValidationSchema = Joi.object({
  PORT: Joi.number().required(),
  BASE_URL: Joi.string().required(),
  STRAPI_API_TOKEN: Joi.string().required(),
  STRAPI_URL: Joi.string().required(),
  CAREERS_RECEIVER_EMAIL: Joi.string().required(),
  CONTACT_RECEIVER_EMAIL: Joi.string().required(),
  WRITE_FOR_US_RECEIVER_EMAIL: Joi.string().required(),
  SENDINBLUE_EMAIL: Joi.string().required(),
  SENDINBLUE_PASSWORD: Joi.string().required(),
  SENDGRID_API_KEY: Joi.string().required(),
  SENDGRID_SUBSCRIBE_TEMPLATE_ID: Joi.string().required(),
  SENDGRID_WELCOME_TEMPLATE_ID: Joi.string().required(),
  SENDGRID_SUBSCRIBED_LIST_ID: Joi.string().required(),
  SENDGRID_UNSUBSCRIBED_LIST_ID: Joi.string().required(),
  SENDGRID_VERIFIED_SENDER: Joi.string().required(),
  OPENAI_API_KEY: Joi.string().required(),
  MONGODB_URI: Joi.string().required(),
  CLICKUP_ID: Joi.number().required(),
  CLICKUP_AUTHORIZATION: Joi.string().required(),
  CLICKUP_field_id: Joi.string().required(),
});
