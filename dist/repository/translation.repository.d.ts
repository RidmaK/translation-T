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
/// <reference types="mongoose/types/inferschematype" />
import { Model } from 'mongoose';
import { NonTranslatableContent, NonTranslatableContentDocument } from '../schemas/nonTranslatableContent.schema';
import { TranslatableContent, TranslatableContentDocument } from 'src/schemas/translatableContent.schema';
export declare class TranslationRepository {
    private translatableContentModel;
    private nonTranslatableContentDocument;
    constructor(translatableContentModel: Model<TranslatableContentDocument>, nonTranslatableContentDocument: Model<NonTranslatableContentDocument>);
    createTranslatableContent(entry: any): Promise<import("mongoose").Document<unknown, {}, TranslatableContentDocument> & TranslatableContent & Document & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    createNonTranslatableContent(entry: any): Promise<import("mongoose").Document<unknown, {}, NonTranslatableContentDocument> & NonTranslatableContent & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    findAll(): Promise<TranslatableContentDocument[]>;
    checkContentIdExisting(entryId: any): Promise<(import("mongoose").Document<unknown, {}, TranslatableContentDocument> & TranslatableContent & Document & {
        _id: import("mongoose").Types.ObjectId;
    })[]>;
    updateTranslatableContent(entry: any): Promise<import("mongoose").UpdateWriteOpResult>;
}
