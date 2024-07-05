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
import { TranslationService } from './translation.service';
import { Response } from 'express';
export declare class TranslationController {
    private translationService;
    constructor(translationService: TranslationService);
    createTranslatableContent(createTranslatableContentDto: any): Promise<void | (import("mongoose").Document<unknown, {}, import("../schemas/translatableContent.schema").TranslatableContentDocument> & import("../schemas/translatableContent.schema").TranslatableContent & Document & {
        _id: import("mongoose").Types.ObjectId;
    })>;
    getAllTranslatableContent(): Promise<import("../schemas/translatableContent.schema").TranslatableContentDocument[]>;
    translateAllContent(): Promise<any>;
    getLogs(res: Response): void;
    getTranslations(res: Response): void;
}
