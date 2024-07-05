/// <reference types="mongoose/types/aggregate" />
/// <reference types="mongoose/types/callback" />
/// <reference types="mongoose/types/collection" />
/// <reference types="mongoose/types/connection" />
/// <reference types="mongoose/types/cursor" />
/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/error" />
/// <reference types="mongoose/types/expressions" />
/// <reference types="mongoose/types/helpers" />
/// <reference types="mongoose/types/middlewares" />
/// <reference types="mongoose/types/indexes" />
/// <reference types="mongoose/types/models" />
/// <reference types="mongoose/types/mongooseoptions" />
/// <reference types="mongoose/types/pipelinestage" />
/// <reference types="mongoose/types/populate" />
/// <reference types="mongoose/types/query" />
/// <reference types="mongoose/types/schemaoptions" />
/// <reference types="mongoose/types/schematypes" />
/// <reference types="mongoose/types/session" />
/// <reference types="mongoose/types/types" />
/// <reference types="mongoose/types/utility" />
/// <reference types="mongoose/types/validation" />
/// <reference types="mongoose/types/virtuals" />
/// <reference types="mongoose" />
/// <reference types="mongoose/types/inferschematype" />
import { TranslationRepository } from 'src/repository/translation.repository';
import { TranslatableContentDocument } from 'src/schemas/translatableContent.schema';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
export declare class TranslationService {
    private readonly configService;
    private translationRepository;
    private httpService;
    private readonly logger;
    constructor(configService: ConfigService, translationRepository: TranslationRepository, httpService: HttpService);
    private readonly errorLogFilePath;
    transformData(comingData: any): Promise<{
        contentId: any;
        fields: {
            fieldName: string;
            text: any;
            output: string;
            status: string;
        }[];
        status: string;
        locale: any;
    }>;
    createOrUpdateTranslatableContent(entry: any): Promise<void | (import("mongoose").Document<unknown, {}, TranslatableContentDocument> & import("src/schemas/translatableContent.schema").TranslatableContent & Document & {
        _id: import("mongoose").Types.ObjectId;
    })>;
    getAllTranslatableContent(): Promise<TranslatableContentDocument[]>;
    translateAllContent(): Promise<any>;
    runScriptForReplaceWithPlaceholders(data: any): Promise<any>;
    runScriptForReplaceWithOriginalTags(data: any): Promise<any>;
    translateDocument(documentContent: string, targetLanguage: string, _id: string, fieldName: string): Promise<string>;
    translateComplexDocument(documentContent: string, targetLanguage: string, _id: string, html_object: any, fieldName: any): Promise<string>;
    replacePlaceholders(htmlContent: string, elements: any[]): Promise<string>;
    private logErrorToFile;
    updateOrCreateTranslation(contentId: string, locale: string, status: string): Promise<{
        success: boolean;
        message: string;
        error: any;
        data?: undefined;
    } | {
        success: boolean;
        data: any;
        message?: undefined;
        error?: undefined;
    }>;
}
