"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TranslationService = void 0;
const common_1 = require("@nestjs/common");
const translation_repository_1 = require("../repository/translation.repository");
const address = require("address");
const child_process_1 = require("child_process");
const config_1 = require("@nestjs/config");
const openai_1 = require("openai");
const translatableContent_interface_1 = require("../interfaces/translatableContent.interface");
const fs = require("fs");
const path = require("path");
const jsdom_1 = require("jsdom");
const axios_1 = require("axios");
const rxjs_1 = require("rxjs");
const axios_2 = require("@nestjs/axios");
const ip = address.ip();
let TranslationService = class TranslationService {
    constructor(configService, translationRepository, httpService) {
        this.configService = configService;
        this.translationRepository = translationRepository;
        this.httpService = httpService;
        this.logger = new common_1.Logger(`${ip} src/user/repository/user.repository.ts`);
        this.errorLogFilePath = path.join(__dirname, '../../translation_error_log.txt');
    }
    async transformData(comingData) {
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
    async createOrUpdateTranslatableContent(entry) {
        try {
            const saveData = await this.transformData(entry);
            const existingContent = await this.translationRepository.checkContentIdExisting(entry.id);
            if (!existingContent.length) {
                console.log('createTranslatableContent');
                const newContent = this.translationRepository.createTranslatableContent(saveData);
                this.logger.log(`Create Translatable Content successful, time=${new Date().getTime()}`);
                return newContent;
            }
            else {
                console.log('updateTranslatableContent');
                const updatedContent = await this.translationRepository
                    .updateTranslatableContent(saveData)
                    .then(() => {
                    this.logger.log(`Update Translatable Content successful, time=${new Date().getTime()}`);
                })
                    .catch((error) => {
                    this.logger.error(`Update Translatable Content Error: ${error}, time=${new Date().getTime()}`);
                });
                return updatedContent;
            }
        }
        catch (err) {
            this.logger.error(`Create or Update Translatable Content Error: ${err}, time=${new Date().getTime()}`);
            throw new Error(`Create or Update Translatable Content Error: ${err}, time=${new Date().getTime()}`);
        }
    }
    async getAllTranslatableContent() {
        try {
            return await this.translationRepository.findAll();
        }
        catch (err) {
            this.logger.error(`findAll Translatable Content Error: ${err}, time=${new Date().getTime()}`);
            throw new Error(`findAll Translatable Content Error: ${err}, time=${new Date().getTime()}`);
        }
    }
    async translateAllContent() {
        const errorLogFilePath = path.join(__dirname, '../../ai_translation_error_log.txt');
        try {
            const allContent = await this.getAllTranslatableContent();
            const pendingContent = allContent.filter((content) => content.status === translatableContent_interface_1.Status.PENDING);
            const filteredContent = pendingContent.map((content) => ({
                contentId: content.contentId,
                fields: content.fields.filter((field) => field.status === translatableContent_interface_1.Status.PENDING),
                locale: content.locale,
            }));
            const translatedContent = await Promise.all(filteredContent.map(async (content) => {
                var _a;
                const translatedFields = await Promise.all(content.fields.map(async (field) => {
                    try {
                        if (typeof field.text === 'string' &&
                            field.text.includes('<')) {
                            const translatedOutput = await this.runScriptForReplaceWithPlaceholders({
                                text: field.text,
                                contentId: content.contentId,
                                fieldName: field.fieldName,
                            });
                            const newContent = await this.translationRepository.createNonTranslatableContent(translatedOutput.html_object);
                            field.output = await this.translateComplexDocument(translatedOutput.modified_html_content, content.locale, content.contentId, translatedOutput.html_object, field.fieldName);
                        }
                        else if (Array.isArray(field.text)) {
                            const translatedText = await Promise.all(field.text.map(async (textItem) => {
                                if (typeof textItem.answer === 'string' &&
                                    textItem.answer.includes('<')) {
                                    const translatedOutput = await this.runScriptForReplaceWithPlaceholders({
                                        text: textItem.answer,
                                        contentId: content.contentId,
                                        fieldName: field.fieldName,
                                    });
                                    textItem.question = await this.translateDocument(textItem.question, content.locale, content.contentId, field.fieldName);
                                    textItem.answer = await this.translateComplexDocument(translatedOutput.modified_html_content, content.locale, content.contentId, translatedOutput.html_object, field.fieldName);
                                }
                                return textItem;
                            }));
                            field.output = translatedText;
                        }
                        else if (field.fieldName === 'pros_and_cons' &&
                            typeof field.text === 'object') {
                            const translatedPros = await Promise.all(field.text.pros.map(async (proItem) => {
                                if (typeof proItem.text === 'string' &&
                                    proItem.text.includes('<')) {
                                    const translatedOutput = await this.runScriptForReplaceWithPlaceholders({
                                        text: proItem.text,
                                        contentId: content.contentId,
                                        fieldName: field.fieldName,
                                    });
                                    proItem.text = await this.translateComplexDocument(translatedOutput.modified_html_content, content.locale, content.contentId, translatedOutput.html_object, field.fieldName);
                                }
                                else {
                                    proItem.text = await this.translateDocument(proItem.text, content.locale, content.contentId, field.fieldName);
                                }
                                return proItem;
                            }));
                            const translatedCons = await Promise.all(field.text.cons.map(async (conItem) => {
                                if (typeof conItem.text === 'string' &&
                                    conItem.text.includes('<')) {
                                    const translatedOutput = await this.runScriptForReplaceWithPlaceholders({
                                        text: conItem.text,
                                        contentId: content.contentId,
                                        fieldName: field.fieldName,
                                    });
                                    conItem.text = await this.translateComplexDocument(translatedOutput.modified_html_content, content.locale, content.contentId, translatedOutput.html_object, field.fieldName);
                                }
                                else {
                                    conItem.text = await this.translateDocument(conItem.text, content.locale, content.contentId, field.fieldName);
                                }
                                return conItem;
                            }));
                            field.output = {
                                pros: translatedPros,
                                cons: translatedCons,
                            };
                        }
                        else if (typeof field.text === 'object' &&
                            !Array.isArray(field.text) &&
                            Object.keys(field.text).length > 0) {
                            const translatedText = {};
                            for (const key in field.text) {
                                if ([
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
                                ].includes(key) &&
                                    typeof field.text[key] === 'string' &&
                                    field.text[key].includes('<')) {
                                    const translatedOutput = await this.runScriptForReplaceWithPlaceholders({
                                        text: field.text[key],
                                        contentId: content.contentId,
                                        fieldName: field.fieldName,
                                    });
                                    translatedText[key] = await this.translateComplexDocument(translatedOutput.modified_html_content, content.locale, content.contentId, translatedOutput.html_object, field.fieldName);
                                }
                                else if ([
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
                                ].includes(key) &&
                                    typeof field.text[key] === 'string') {
                                    translatedText[key] = await this.translateDocument(field.text[key], content.locale, content.contentId, field.fieldName);
                                }
                                else {
                                    translatedText[key] = field.text[key];
                                }
                            }
                            field.output = translatedText;
                        }
                        else {
                            field.output = await this.translateDocument(field.text, content.locale, content.contentId, field.fieldName);
                        }
                        field.status = translatableContent_interface_1.Status.COMPLETED;
                    }
                    catch (error) {
                        const errorLog = `Error translating field ${field.fieldName} for content ${content.contentId} locale : ${content.locale}: ${error}\n`;
                        let errorOutput = {
                            id: content.contentId,
                            locale: content.locale,
                            fieldName: field.fieldName,
                            Error: error,
                            time: new Date().toISOString(),
                        };
                        this.logger.error(errorLog);
                        fs.appendFileSync(errorLogFilePath, JSON.stringify(errorOutput) + '\n');
                        field.status = translatableContent_interface_1.Status.PENDING;
                    }
                    return field;
                }));
                const originalFields = (_a = allContent.find((c) => c.contentId === content.contentId && c.locale === content.locale)) === null || _a === void 0 ? void 0 : _a.fields;
                const mergedFields = originalFields.map((originalField) => {
                    const translatedField = translatedFields.find((tf) => tf.fieldName === originalField.fieldName);
                    return translatedField ? translatedField : originalField;
                });
                const allFieldsComplete = mergedFields.every((field) => field.status === translatableContent_interface_1.Status.COMPLETED);
                const contentStatus = allFieldsComplete
                    ? translatableContent_interface_1.Status.TRANSLATED
                    : translatableContent_interface_1.Status.PENDING;
                const updateOrCreateTranslation = await this.updateOrCreateTranslation(content.contentId, content.locale, contentStatus);
                const updatedContent = await this.translationRepository.updateTranslatableContent(Object.assign(Object.assign({}, content), { fields: mergedFields, status: contentStatus }));
                return Object.assign(Object.assign({}, content), { fields: mergedFields, status: contentStatus });
            }));
            return translatedContent;
        }
        catch (err) {
            const errorLog = `findAll Translatable Content Error: ${err}, time=${new Date().toISOString()}\n`;
            this.logger.error(errorLog);
            let errorOutput = {
                time: new Date().toISOString(),
                Error: err,
            };
            fs.appendFileSync(errorLogFilePath, JSON.stringify(errorOutput) + '\n');
            throw new Error(errorLog);
        }
    }
    async runScriptForReplaceWithPlaceholders(data) {
        try {
            return new Promise((resolve, reject) => {
                const script = (0, child_process_1.spawn)('python3', [
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
                    }
                    else {
                        try {
                            const result = JSON.parse(scriptOutput);
                            resolve(result);
                        }
                        catch (err) {
                            reject(`Failed to parse JSON output: ${err}`);
                        }
                    }
                });
            });
        }
        catch (err) {
            this.logger.error(`Script run Error: ${err}, time=${new Date().getTime()}`);
            throw new Error(`Script run Error: ${err}, time=${new Date().getTime()}`);
        }
    }
    async runScriptForReplaceWithOriginalTags(data) {
        try {
            return new Promise((resolve, reject) => {
                const script = (0, child_process_1.spawn)('python3', [
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
                    }
                    else {
                        try {
                            const result = JSON.parse(scriptOutput);
                            resolve(result);
                        }
                        catch (err) {
                            reject(`Failed to parse JSON output: ${err}`);
                        }
                    }
                });
            });
        }
        catch (err) {
            this.logger.error(`Script run Error: ${err}, time=${new Date().getTime()}`);
            throw new Error(`Script run Error: ${err}, time=${new Date().getTime()}`);
        }
    }
    async translateDocument(documentContent, targetLanguage, _id, fieldName) {
        var _a, _b, _c, _d;
        try {
            const configuration = new openai_1.Configuration({
                apiKey: `${this.configService.get('OPENAI_API_KEY')}`,
            });
            const content = documentContent;
            const responselocale = await axios_1.default.get(`${this.configService.get('STRAPI_URL')}i18n/locales`);
            if (responselocale.status !== 200) {
                throw new Error(`Failed to retrieve locales, status code: ${responselocale.status}`);
            }
            const locales = responselocale.data;
            let filteredLocale = locales.find((locale) => locale.code === targetLanguage);
            const prompt = `You are a professional translator specializing in website localization. And your job is to translate it into ${(_a = filteredLocale.name) !== null && _a !== void 0 ? _a : targetLanguage} with precision and nuance. Here is the sentence you need to translate:\n\n${content}`;
            const openai = new openai_1.OpenAIApi(configuration);
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
            this.logger.warn(`Translated Output: ${(_b = response.data.choices[0]) === null || _b === void 0 ? void 0 : _b.message.content}`);
            const outputData = {
                _id: _id,
                fieldName: fieldName,
                documentContent: documentContent,
                translatedContent: (_c = response.data.choices[0]) === null || _c === void 0 ? void 0 : _c.message.content,
            };
            const logFilePath = path.join(__dirname, '../../ai_translation_log.txt');
            fs.appendFileSync(logFilePath, JSON.stringify(outputData) + '\n');
            return (_d = response.data.choices[0]) === null || _d === void 0 ? void 0 : _d.message.content;
        }
        catch (error) {
            this.logger.warn(`Failed to translate document: ${error}`);
            throw new Error('Failed to translate document');
        }
    }
    async translateComplexDocument(documentContent, targetLanguage, _id, html_object, fieldName) {
        var _a, _b, _c;
        const logFilePath = path.join(__dirname, '../../ai_translation_log.txt');
        try {
            const configuration = new openai_1.Configuration({
                apiKey: process.env.OPENAI_API_KEY,
            });
            const content = documentContent;
            const maxChunkSize = 10000;
            const chunks = [];
            let remainingContent = content;
            while (remainingContent.length > 0) {
                let chunk = remainingContent.slice(0, maxChunkSize);
                let lastTagIndex = chunk.lastIndexOf('>');
                if (lastTagIndex !== -1 && lastTagIndex < maxChunkSize) {
                    chunk = remainingContent.slice(0, lastTagIndex + 1);
                }
                chunks.push(chunk);
                remainingContent = remainingContent.slice(chunk.length);
            }
            const response = await axios_1.default.get(`${this.configService.get('STRAPI_URL')}i18n/locales`);
            if (response.status !== 200) {
                throw new Error(`Failed to retrieve locales, status code: ${response.status}`);
            }
            const locales = response.data;
            let filteredLocale = locales.find((locale) => locale.code === targetLanguage);
            const translatedChunks = [];
            for (const chunk of chunks) {
                const prompt = `You are a professional translator specializing in website localization. Translate the following HTML content into ${(_a = filteredLocale.name) !== null && _a !== void 0 ? _a : filteredLocale}, keeping the HTML tags such as <tag>, </tag>, and <tag attr="value"> intact. Do not translate the text within the tags. Only translate the content outside of the tags. Here is the text: "${chunk}"`;
                const openai = new openai_1.OpenAIApi(configuration);
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
                translatedChunks.push((_b = response.data.choices[0]) === null || _b === void 0 ? void 0 : _b.message.content);
            }
            let translatedContent = translatedChunks.join('');
            translatedContent = translatedContent.replace(/&quot;/g, '"');
            const regeneratedContent = await this.replacePlaceholders(translatedContent, html_object.element);
            const outputData = {
                _id: _id,
                fieldName: fieldName,
                chunks: chunks,
                documentContent,
                html_object: html_object.element,
                translatedContent,
                modified_html_content: regeneratedContent,
            };
            fs.appendFileSync(logFilePath, JSON.stringify(outputData) + '\n');
            return regeneratedContent;
        }
        catch (error) {
            const errorLog = {
                _id: _id,
                fieldName: fieldName,
                documentContent,
                html_object: html_object.element,
                error: error.message,
                time: new Date().toISOString(),
            };
            fs.appendFileSync(logFilePath, JSON.stringify(errorLog) + '\n');
            if (axios_1.default.isAxiosError(error) && ((_c = error.response) === null || _c === void 0 ? void 0 : _c.status) === 401) {
                console.warn(`Authentication error: ${error.message}`);
            }
            else {
                console.warn(`Failed to translate complex document: ${fieldName} Error: ${error.message}`);
            }
            throw new Error(`Failed to translate complex document: ${error.message}`);
        }
    }
    async replacePlaceholders(htmlContent, elements) {
        try {
            elements.forEach(element => {
                const styleMatch = element.original_tag.match(/font-family\s*:\s*([^;]+;)/);
                if (styleMatch) {
                    styleMatch.forEach(fontFamilyMatch => {
                        element.original_tag = element.original_tag.replace(fontFamilyMatch, '').replace(/style="\s*"/, 'style=""').trim();
                    });
                }
            });
            const dom = new jsdom_1.JSDOM(htmlContent);
            const document = dom.window.document;
            elements.sort((a, b) => b.placeholder.length - a.placeholder.length);
            const placeholderMap = new Map(elements.map((element) => [element.placeholder, element.original_tag]));
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
                            const attrParts = otherAttrs.match(/(\S+="[^"]*"|\S+=[^\s"]+|\S+)/g);
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
                    while (tag.firstChild) {
                        newTag.appendChild(tag.firstChild);
                    }
                    tag.replaceWith(newTag);
                });
            });
            const modifiedHTML = document.body.innerHTML.replace(/\n/g, '');
            return modifiedHTML;
        }
        catch (error) {
            this.logger.error(`Error in replacePlaceholders: ${error}`);
            await this.logErrorToFile(`Error in replacePlaceholders: ${error}`);
            throw error;
        }
    }
    async logErrorToFile(error) {
        const errorLog = `Error: ${error}, time=${new Date().getTime()}\n`;
        fs.appendFileSync(this.errorLogFilePath, errorLog);
    }
    async updateOrCreateTranslation(contentId, locale, status) {
        let getResponse;
        const configurations = {
            headers: {
                Authorization: `Bearer ${this.configService.get('STRAPI_API_TOKEN')}`,
            },
        };
        const strapiData = {
            "blog": [contentId],
            "status": status,
            "locale": locale,
            "content_id": contentId,
        };
        const getRequest = this.httpService
            .get(`${this.configService.get('STRAPI_URL')}translations?filters[content_id][$eq]=${contentId}&filters[locale][$eq]=${locale}&populate[blog][populate]=*`)
            .pipe((0, rxjs_1.map)((res) => res.data), (0, rxjs_1.catchError)((error) => {
            throw new Error('Strapi API not available: ' + error);
        }));
        try {
            getResponse = await (0, rxjs_1.lastValueFrom)(getRequest);
        }
        catch (error) {
            console.error(`Error fetching detailed translations data from Strapi API`, error);
            return { success: false, message: 'Error fetching existing localization', error };
        }
        if (getResponse.data && getResponse.data.length > 0) {
            const updateRequest = this.httpService
                .put(`${this.configService.get('STRAPI_URL')}translations/${getResponse.data[0].id}`, { data: strapiData }, configurations)
                .pipe((0, rxjs_1.map)((res) => {
                return res.data;
            }));
            try {
                getResponse = await (0, rxjs_1.lastValueFrom)(updateRequest);
            }
            catch (error) {
                console.error('Error updating strapiData in Strapi API', error);
                return { success: false, message: 'Error updating translation', error };
            }
        }
        else {
            const createRequest = this.httpService
                .post(`${this.configService.get('STRAPI_URL')}translations`, { data: strapiData }, configurations)
                .pipe((0, rxjs_1.map)((res) => {
                return res.data;
            }));
            try {
                getResponse = await (0, rxjs_1.lastValueFrom)(createRequest);
            }
            catch (error) {
                console.error('Error creating strapiData in Strapi API', error);
                return { success: false, message: 'Error creating translation', error };
            }
        }
        return { success: true, data: getResponse };
    }
};
TranslationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        translation_repository_1.TranslationRepository,
        axios_2.HttpService])
], TranslationService);
exports.TranslationService = TranslationService;
//# sourceMappingURL=translation.service.js.map