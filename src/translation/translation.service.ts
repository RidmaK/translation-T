import { Injectable, Logger, ForbiddenException } from '@nestjs/common';
import { TranslationRepository } from 'src/repository/translation.repository';

import * as address from 'address';
import { TranslatableContentDocument } from 'src/schemas/translatableContent.schema';
import { spawn } from 'child_process';
import { ConfigService } from '@nestjs/config';
import { Configuration, OpenAIApi } from 'openai';
import { Status } from '../interfaces/translatableContent.interface';
import * as fs from 'fs';
import * as path from 'path';
import { JSDOM } from 'jsdom';
import axios from 'axios';
import { catchError, lastValueFrom, map, Observable } from 'rxjs';
import { HttpService } from '@nestjs/axios';

const ip = address.ip();
@Injectable()
export class TranslationService {
  private readonly logger = new Logger(
    `${ip} src/user/repository/user.repository.ts`,
  );
  constructor(
    private readonly configService: ConfigService,
    private translationRepository: TranslationRepository,
    private httpService: HttpService,
  ) {}
  private readonly errorLogFilePath = path.join(
    __dirname,
    '../../translation_error_log.txt',
  );
  async transformData(comingData: any) {
    return {
      contentId: comingData.id,
      fields: [
        {
          fieldName: 'title',
          text: comingData.title,
          output: '',
          status: 'PENDING',
        },
        {
          fieldName: 'content',
          text: comingData.content,
          output: '',
          status: 'PENDING',
        },
        {
          fieldName: 'editors_note',
          text: comingData.editors_note,
          output: '',
          status: 'PENDING',
        },
      ],
      status: 'PENDING',
      locale: comingData.blog_category.locale,
    };
  }

  async createOrUpdateTranslatableContent(entry: any) {
    try {
      const saveData = await this.transformData(entry);

      const existingContent =
        await this.translationRepository.checkContentIdExisting(entry.id);

      if (!existingContent.length) {
        console.log('createTranslatableContent');

        const newContent =
          this.translationRepository.createTranslatableContent(saveData);
        this.logger.log(
          `Create Translatable Content successful, time=${new Date().getTime()}`,
        );
        return newContent;
      } else {
        console.log('updateTranslatableContent');
        const updatedContent = await this.translationRepository
          .updateTranslatableContent(saveData)
          .then(() => {
            this.logger.log(
              `Update Translatable Content successful, time=${new Date().getTime()}`,
            );
          })
          .catch((error) => {
            this.logger.error(
              `Update Translatable Content Error: ${error}, time=${new Date().getTime()}`,
            );
          });

        return updatedContent;
      }
    } catch (err) {
      this.logger.error(
        `Create or Update Translatable Content Error: ${err}, time=${new Date().getTime()}`,
      );
      throw new Error(
        `Create or Update Translatable Content Error: ${err}, time=${new Date().getTime()}`,
      );
    }
  }

  async getAllTranslatableContent(): Promise<TranslatableContentDocument[]> {
    try {
      return await this.translationRepository.findAll();
    } catch (err) {
      this.logger.error(
        `findAll Translatable Content Error: ${err}, time=${new Date().getTime()}`,
      );
      throw new Error(
        `findAll Translatable Content Error: ${err}, time=${new Date().getTime()}`,
      );
    }
  }

  async translateAllContent(): Promise<any> {
    const errorLogFilePath = path.join(
      __dirname,
      '../../ai_translation_error_log.txt',
    );
    try {
      const allContent = await this.getAllTranslatableContent();

      const pendingContent = allContent.filter(
        (content: any) => content.status === Status.PENDING,
      );

      const filteredContent = pendingContent.map((content: any) => ({
        contentId: content.contentId,
        fields: content.fields.filter(
          (field: any) => field.status === Status.PENDING,
        ),
        locale: content.locale,
      }));

      const translatedContent = await Promise.all(
        filteredContent.map(async (content) => {
          const translatedFields = await Promise.all(
            content.fields.map(async (field: any) => {
              try {
                if (
                  typeof field.text === 'string' &&
                  field.text.includes('<')
                ) {
                  const translatedOutput =
                    await this.runScriptForReplaceWithPlaceholders({
                      text: field.text,
                      contentId: content.contentId,
                      fieldName: field.fieldName,
                    });
                  const newContent =
                    await this.translationRepository.createNonTranslatableContent(
                      translatedOutput.html_object,
                    );
                  field.output = await this.translateComplexDocument(
                    translatedOutput.modified_html_content,
                    content.locale,
                    content.contentId,
                    translatedOutput.html_object,
                    field.fieldName,
                  );
                } else if (Array.isArray(field.text)) {
                  const translatedText = await Promise.all(
                    field.text.map(async (textItem: any) => {
                      if (
                        typeof textItem.answer === 'string' &&
                        textItem.answer.includes('<')
                      ) {
                        const translatedOutput =
                          await this.runScriptForReplaceWithPlaceholders({
                            text: textItem.answer,
                            contentId: content.contentId,
                            fieldName: field.fieldName,
                          });
                        textItem.question = await this.translateDocument(
                          textItem.question,
                          content.locale,
                          content.contentId,
                          field.fieldName,
                        );
                        textItem.answer = await this.translateComplexDocument(
                          translatedOutput.modified_html_content,
                          content.locale,
                          content.contentId,
                          translatedOutput.html_object,
                          field.fieldName,
                        );
                      }
                      return textItem;
                    }),
                  );
                  field.output = translatedText;
                } else if (
                  field.fieldName === 'pros_and_cons' &&
                  typeof field.text === 'object'
                ) {
                  const translatedPros = await Promise.all(
                    field.text.pros.map(async (proItem: any) => {
                      if (
                        typeof proItem.text === 'string' &&
                        proItem.text.includes('<')
                      ) {
                        const translatedOutput =
                          await this.runScriptForReplaceWithPlaceholders({
                            text: proItem.text,
                            contentId: content.contentId,
                            fieldName: field.fieldName,
                          });
                        proItem.text = await this.translateComplexDocument(
                          translatedOutput.modified_html_content,
                          content.locale,
                          content.contentId,
                          translatedOutput.html_object,
                          field.fieldName,
                        );
                      } else {
                        proItem.text = await this.translateDocument(
                          proItem.text,
                          content.locale,
                          content.contentId,
                          field.fieldName,
                        );
                      }
                      return proItem;
                    }),
                  );

                  const translatedCons = await Promise.all(
                    field.text.cons.map(async (conItem: any) => {
                      if (
                        typeof conItem.text === 'string' &&
                        conItem.text.includes('<')
                      ) {
                        const translatedOutput =
                          await this.runScriptForReplaceWithPlaceholders({
                            text: conItem.text,
                            contentId: content.contentId,
                            fieldName: field.fieldName,
                          });
                        conItem.text = await this.translateComplexDocument(
                          translatedOutput.modified_html_content,
                          content.locale,
                          content.contentId,
                          translatedOutput.html_object,
                          field.fieldName,
                        );
                      } else {
                        conItem.text = await this.translateDocument(
                          conItem.text,
                          content.locale,
                          content.contentId,
                          field.fieldName,
                        );
                      }
                      return conItem;
                    }),
                  );

                  field.output = {
                    pros: translatedPros,
                    cons: translatedCons,
                  };
                } else if (
                  typeof field.text === 'object' && // Check if the text is an object
                  !Array.isArray(field.text) && // Check if the text is not an array
                  Object.keys(field.text).length > 0 // Check if the object has keys
                ) {
                  const translatedText = {}; // Initialize an empty object to store translated text
                  // Iterate through each key-value pair in the text object
                  for (const key in field.text) {
                    if (
                      [
                        'seo_title',
                        'name',
                        'summary',
                        'tagline',
                        'description',
                        'compare_title',
                        'company_one_name',
                        'company_two_name',
                        'compare_title',
                        'seo_description',
                        'meta_social',
                        'keywords',
                        'video_structured_data',
                      ].includes(key) && // Check if the key is one of the specified keys
                      typeof field.text[key] === 'string' && // Check if the value is a string
                      field.text[key].includes('<') // Check if the value contains '<'
                    ) {
                      const translatedOutput =
                        await this.runScriptForReplaceWithPlaceholders({
                          text: field.text[key],
                          contentId: content.contentId,
                          fieldName: field.fieldName,
                        });
                      translatedText[key] = await this.translateComplexDocument(
                        translatedOutput.modified_html_content,
                        content.locale,
                        content.contentId,
                        translatedOutput.html_object,
                        field.fieldName,
                      );
                    } else if (
                      [
                        'seo_title',
                        'name',
                        'summary',
                        'tagline',
                        'description',
                        'compare_title',
                        'company_one_name',
                        'company_two_name',
                        'compare_title',
                        'seo_description',
                        'meta_social',
                        'keywords',
                        'video_structured_data',
                      ].includes(key) && // Check if the key is one of the specified keys
                      typeof field.text[key] === 'string' // Check if the value is a string
                    ) {
                      // Translate the value using translateDocument
                      translatedText[key] = await this.translateDocument(
                        field.text[key],
                        content.locale,
                        content.contentId,
                        field.fieldName,
                      );
                    } else {
                      // If the key is not in the specified keys or the value is not a string, keep it as is
                      translatedText[key] = field.text[key];
                    }
                  }
                  field.output = translatedText; // Set the output to the translated object
                } else {
                  field.output = await this.translateDocument(
                    field.text,
                    content.locale,
                    content.contentId,
                    field.fieldName,
                  );
                }
                field.status = Status.COMPLETED;
              } catch (error) {
                const errorLog = `Error translating field ${field.fieldName} for content ${content.contentId} locale : ${content.locale}: ${error}\n`;
                let errorOutput = {
                  id: content.contentId,
                  locale: content.locale,
                  fieldName: field.fieldName,
                  Error: error,
                  time: new Date().toISOString(),
                };
                this.logger.error(errorLog);
                fs.appendFileSync(
                  errorLogFilePath,
                  JSON.stringify(errorOutput) + '\n',
                ); // Log the error to the file
                field.status = Status.PENDING;
              }
              return field;
            }),
          );

          const originalFields = allContent.find(
            (c: any) =>
              c.contentId === content.contentId && c.locale === content.locale,
          )?.fields;

          const mergedFields = originalFields.map((originalField: any) => {
            const translatedField = translatedFields.find(
              (tf: any) => tf.fieldName === originalField.fieldName,
            );
            return translatedField ? translatedField : originalField;
          });

          const allFieldsComplete = mergedFields.every(
            (field) => field.status === Status.COMPLETED,
          );
          const contentStatus = allFieldsComplete
            ? Status.TRANSLATED
            : Status.PENDING;
            const updateOrCreateTranslation = await this.updateOrCreateTranslation(content.contentId, content.locale,contentStatus);

          const updatedContent =
            await this.translationRepository.updateTranslatableContent({
              ...content,
              fields: mergedFields,
              status: contentStatus,
            });

          return {
            ...content,
            fields: mergedFields,
            status: contentStatus,
          };
        }),
      );

      return translatedContent;
    } catch (err) {
      const errorLog = `findAll Translatable Content Error: ${err}, time=${new Date().toISOString()}\n`;
      this.logger.error(errorLog);
      let errorOutput = {
        time: new Date().toISOString(),
        Error: err,
      };
      fs.appendFileSync(errorLogFilePath, JSON.stringify(errorOutput) + '\n'); // Log the error to the file
      throw new Error(errorLog);
    }
  }

  async runScriptForReplaceWithPlaceholders(data: any): Promise<any> {
    try {
      return new Promise((resolve, reject) => {
        const script = spawn('python3', [
          'scripts/replace_with_placeholders.py',
        ]);

        let scriptOutput = '';

        script.stdin.write(JSON.stringify(data));
        script.stdin.end();

        script.stdout.on('data', (data) => {
          scriptOutput += data.toString();
        });

        script.stderr.on('data', (data) => {
          console.error(`stderr: ${data}`);
          reject(data.toString());
        });

        script.on('close', (code) => {
          if (code !== 0) {
            reject(`Process exited with code ${code}`);
          } else {
            try {
              const result = JSON.parse(scriptOutput);
              resolve(result);
            } catch (err) {
              reject(`Failed to parse JSON output: ${err}`);
            }
          }
        });
      });
    } catch (err) {
      this.logger.error(
        `Script run Error: ${err}, time=${new Date().getTime()}`,
      );
      throw new Error(`Script run Error: ${err}, time=${new Date().getTime()}`);
    }
  }

  async runScriptForReplaceWithOriginalTags(data: any): Promise<any> {
    try {
      return new Promise((resolve, reject) => {
        const script = spawn('python3', [
          'scripts/replace_with_original_tags.py',
        ]);

        let scriptOutput = '';

        script.stdin.write(JSON.stringify(data));
        script.stdin.end();

        script.stdout.on('data', (data) => {
          scriptOutput += data.toString();
        });

        script.stderr.on('data', (data) => {
          console.error(`stderr: ${data}`);
          reject(data.toString());
        });

        script.on('close', (code) => {
          if (code !== 0) {
            reject(`Process exited with code ${code}`);
          } else {
            try {
              const result = JSON.parse(scriptOutput);
              resolve(result);
            } catch (err) {
              reject(`Failed to parse JSON output: ${err}`);
            }
          }
        });
      });
    } catch (err) {
      this.logger.error(
        `Script run Error: ${err}, time=${new Date().getTime()}`,
      );
      throw new Error(`Script run Error: ${err}, time=${new Date().getTime()}`);
    }
  }

  async translateDocument(
    documentContent: string,
    targetLanguage: string,
    _id: string,
    fieldName: string,
  ): Promise<string> {
    try {
      const configuration = new Configuration({
        apiKey: `${this.configService.get<string>('OPENAI_API_KEY')}`,
      });
      const content = documentContent;

      const responselocale = await axios.get(
        `${this.configService.get<string>('STRAPI_URL')}i18n/locales`,
      );

      if (responselocale.status !== 200) {
        throw new Error(
          `Failed to retrieve locales, status code: ${responselocale.status}`,
        );
      }

      const locales = responselocale.data;

      // Filter locales by the specified locale code
      let filteredLocale = locales.find(
        (locale) => locale.code === targetLanguage,
      );
      const prompt = `You are a professional translator specializing in website localization. And your job is to translate it into ${
        filteredLocale.name ?? targetLanguage
      } with precision and nuance. Here is the sentence you need to translate:\n\n${content}`;

      const openai = new OpenAIApi(configuration);
      const response = await openai.createChatCompletion({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 64,
        top_p: 1,
      });

      this.logger.warn(
        `Translated Output: ${response.data.choices[0]?.message.content}`,
      );

      const outputData = {
        _id: _id,
        fieldName: fieldName,
        documentContent: documentContent,
        translatedContent: response.data.choices[0]?.message.content,
      };

      // Define the log file path
      const logFilePath = path.join(__dirname, '../../ai_translation_log.txt');
      // Write the log data to the log file
      fs.appendFileSync(logFilePath, JSON.stringify(outputData) + '\n');
      return response.data.choices[0]?.message.content;
    } catch (error) {
      this.logger.warn(`Failed to translate document: ${error}`);
      throw new Error('Failed to translate document');
    }
  }

  async translateComplexDocument(
    documentContent: string, // string
    targetLanguage: string, // string
    _id: string, // string
    html_object: any, // any
    fieldName: any, // any
  ) {
    const logFilePath = path.join(__dirname, '../../ai_translation_log.txt');

    try {
      const configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY, // Replace with your way of fetching the API key
      });
      const content = documentContent;
      // Define a maximum chunk size to ensure API limits are not exceeded
      const maxChunkSize = 10000; // Adjusted to 20,000 characters

      const chunks = [];
      let remainingContent = content;

      while (remainingContent.length > 0) {
        let chunk = remainingContent.slice(0, maxChunkSize);
        let lastTagIndex = chunk.lastIndexOf('>');

        // Ensure we do not split the tags
        if (lastTagIndex !== -1 && lastTagIndex < maxChunkSize) {
          chunk = remainingContent.slice(0, lastTagIndex + 1);
        }

        chunks.push(chunk);
        remainingContent = remainingContent.slice(chunk.length);
      }

      const response = await axios.get(
        `${this.configService.get<string>('STRAPI_URL')}i18n/locales`,
      );

      if (response.status !== 200) {
        throw new Error(
          `Failed to retrieve locales, status code: ${response.status}`,
        );
      }

      const locales = response.data;

      // Filter locales by the specified locale code
      let filteredLocale = locales.find(
        (locale) => locale.code === targetLanguage,
      );

      const translatedChunks = [];
      for (const chunk of chunks) {
        const prompt = `You are a professional translator specializing in website localization. Translate the following HTML content into ${
          filteredLocale.name ?? filteredLocale
        }, keeping the HTML tags such as <tag>, </tag>, and <tag attr="value"> intact. Do not translate the text within the tags. Only translate the content outside of the tags. Here is the text: "${chunk}"`;

        const openai = new OpenAIApi(configuration);
        const response = await openai.createChatCompletion({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 4000,
          top_p: 1,
        });

        translatedChunks.push(response.data.choices[0]?.message.content);
      }

      // Concatenate the translated chunks back into a single string
      let translatedContent = translatedChunks.join('');

      // Remove &quot; from the translated content
      translatedContent = translatedContent.replace(/&quot;/g, '"');

      // Replace placeholders in the translated content
      const regeneratedContent = await this.replacePlaceholders(
        translatedContent,
        html_object.element,
      );
      // Prepare the output data
      const outputData = {
        _id: _id,
        fieldName: fieldName,
        chunks: chunks,
        documentContent,
        html_object: html_object.element,
        translatedContent,
        modified_html_content: regeneratedContent,
      };

      // Write the log data to the log file
      fs.appendFileSync(logFilePath, JSON.stringify(outputData) + '\n');

      return regeneratedContent;
    } catch (error) {
      // Log error details to the log file
      const errorLog = {
        _id: _id,
        fieldName: fieldName,
        documentContent,
        html_object: html_object.element,
        error: error.message,
        time: new Date().toISOString(),
      };

      fs.appendFileSync(logFilePath, JSON.stringify(errorLog) + '\n');

      if (axios.isAxiosError(error) && error.response?.status === 401) {
        console.warn(`Authentication error: ${error.message}`);
      } else {
        console.warn(
          `Failed to translate complex document: ${fieldName} Error: ${error.message}`,
        );
      }

      throw new Error(`Failed to translate complex document: ${error.message}`);
    }
  }

  
  async replacePlaceholders(
    htmlContent: string,
    elements: any[],
  ): Promise<string> {
    try {
      // Preprocess elements to remove font-family from original_tag
      elements.forEach(element => {
        // Capture the entire font-family declaration including its value
        const styleMatch = element.original_tag.match(/font-family\s*:\s*([^;]+;)/);
          if (styleMatch) {
          styleMatch.forEach(fontFamilyMatch => {
            // Remove the matched font-family declaration from the original styles
            element.original_tag = element.original_tag.replace(fontFamilyMatch, '').replace(/style="\s*"/, 'style=""').trim();
          });
        }
      });
      const dom = new JSDOM(htmlContent);
      const document = dom.window.document;
      elements.sort((a, b) => b.placeholder.length - a.placeholder.length);

      const placeholderMap = new Map(
        elements.map((element) => [element.placeholder, element.original_tag]),
      );

      placeholderMap.forEach((originalTag, placeholder) => {
        document.querySelectorAll(placeholder).forEach((tag) => {
          const [tagName, ...tagAttributes] = originalTag.split(' ');
          const newTag = document.createElement(tagName);

          if (tagAttributes.length > 0) {
            const attrString = tagAttributes.join(' ');
            const styleMatch = attrString.match(/style="([^"]*)"/);

            if (styleMatch) {
              const styles = styleMatch[1];
              newTag.setAttribute('style', styles);
            }

            const otherAttrs = attrString.replace(/style="[^"]*"/, '').trim();
            if (otherAttrs) {
              const attrParts = otherAttrs.match(
                /(\S+="[^"]*"|\S+=[^\s"]+|\S+)/g,
              );

              if (attrParts) {
                attrParts.forEach((attrPart) => {
                  const [attrName, ...attrValueParts] = attrPart.split('=');
                  if (attrName) {
                    const attrValue = attrValueParts
                      .join('=')
                      .replace(/(^"|"$)/g, '')
                      .trim();
                    newTag.setAttribute(attrName.trim(), attrValue);
                  }
                });
              }
            }
          }

          // Move all child nodes, including <figcaption>
          while (tag.firstChild) {
            newTag.appendChild(tag.firstChild);
          }
          tag.replaceWith(newTag);
        });
      });

      const modifiedHTML = document.body.innerHTML.replace(/\n/g, '');
      return modifiedHTML;
    } catch (error) {
      this.logger.error(`Error in replacePlaceholders: ${error}`);
      await this.logErrorToFile(`Error in replacePlaceholders: ${error}`);
      throw error;
    }
  }


  // async replacePlaceholders(
  //   htmlContent: string,
  //   elements: any[],
  // ): Promise<string> {
  //   try {
  //     const dom = new JSDOM(htmlContent);
  //     const document = dom.window.document;
  //     elements.sort((a, b) => b.placeholder.length - a.placeholder.length);
  
  //     const placeholderMap = new Map(
  //       elements.map((element) => [element.placeholder, element.original_tag]),
  //     );
  
  //     placeholderMap.forEach((originalTag, placeholder) => {
  //       document.querySelectorAll(placeholder).forEach((tag) => {
  //         const [tagName, ...tagAttributes] = originalTag.split(' ');
  //         const newTag = document.createElement(tagName);
  
  //         // Copy attributes from original tag
  //         tagAttributes.forEach(attr => {
  //           const attrParts = attr.split('=');
  //           if (attrParts.length === 2) {
  //             const attrName = attrParts[0].trim();
  //             const attrValue = attrParts[1].replace(/"/g, ''); // Remove double quotes
  //             newTag.setAttribute(attrName, attrValue);
  //           }
  //         });
  
  //         // Copy style attribute
  //         if (tag.hasAttribute('style')) {
  //           newTag.setAttribute('style', tag.getAttribute('style'));
  //         }
  //         console.log(tag)
  //         // Move all child nodes
  //         while (tag.firstChild) {
  //           newTag.appendChild(tag.firstChild);
  //         }
  
  //         // Replace original tag with new tag
  //         tag.replaceWith(newTag);
  //       });
  //     });
  
  //     const modifiedHTML = document.body.innerHTML.replace(/\n/g, '');
  //     return modifiedHTML;
  //   } catch (error) {
  //     this.logger.error(`Error in replacePlaceholders: ${error}`);
  //     await this.logErrorToFile(`Error in replacePlaceholders: ${error}`);
  //     throw error;
  //   }
  // }

  private async logErrorToFile(error: string) {
    const errorLog = `Error: ${error}, time=${new Date().getTime()}\n`;
    fs.appendFileSync(this.errorLogFilePath, errorLog);
  }

  async updateOrCreateTranslation(contentId: string, locale: string, status: string) {

    let getResponse;
    const configurations = {
      headers: {
        Authorization: `Bearer ${this.configService.get<string>(
          'STRAPI_API_TOKEN',
        )}`,
      },
    };

    const strapiData = {
      "blog": [contentId],
      "status" : status,
      "locale" : locale,
      "content_id" : contentId,
    }

    // Fetch existing localization
    const getRequest = this.httpService
      .get(
        `${this.configService.get<string>('STRAPI_URL')}translations?filters[content_id][$eq]=${contentId}&filters[locale][$eq]=${locale}&populate[blog][populate]=*`,
      )
      .pipe(
        map((res) => res.data),
        catchError((error) => {
          throw new Error('Strapi API not available: ' + error);
        }),
      );
    try {
      getResponse = await lastValueFrom(getRequest);
      
    } catch (error) {
      console.error(`Error fetching detailed translations data from Strapi API`, error);
      return { success: false, message: 'Error fetching existing localization', error };
    }

    if (getResponse.data && getResponse.data.length > 0)  {
      // Update existing localization
      const updateRequest = this.httpService
        .put(
          `${this.configService.get<string>('STRAPI_URL')}translations/${getResponse.data[0].id}`,
          { data: strapiData },
          configurations,
        )
        .pipe(
          map((res) => {
            return res.data;
          }),
        );

      try {
        getResponse = await lastValueFrom(updateRequest);
      } catch (error) {
        console.error('Error updating strapiData in Strapi API', error);
        return { success: false, message: 'Error updating translation', error };
      }
    } else {
      // Create new localization
      const createRequest = this.httpService
        .post(
          `${this.configService.get<string>('STRAPI_URL')}translations`,
          { data: strapiData },
          configurations,
        )
        .pipe(
          map((res) => {
            return res.data;
          }),
        );

      try {
        getResponse = await lastValueFrom(createRequest);
      } catch (error) {
        console.error('Error creating strapiData in Strapi API', error);
        return { success: false, message: 'Error creating translation', error };
      }
    }

    return { success: true, data: getResponse };
  }
}